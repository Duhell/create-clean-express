import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import chalk from 'chalk';
import * as logger from '../utils/logger.js';
import { findProjectRoot, loadConfig } from '../utils/project.js';
import { buildValidateMiddleware } from './new.js';
import { requestIdTemplate } from '../templates/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cliPkg = fs.readJsonSync(path.resolve(__dirname, '../../package.json'));

/**
 * Upgrade an existing cex project non-destructively after checking compatibility.
 * @param {{ dryRun?: boolean }} [options]
 */
export async function upgradeCommand(options = {}) {
  const { dryRun = false } = options;
  const root = findProjectRoot();
  const srcDir = path.join(root, 'src');
  const pkgPath = path.join(root, 'package.json');

  if (!fs.existsSync(srcDir) || !fs.existsSync(pkgPath)) {
    logger.error('No cex project found here (missing src/ or package.json).');
    process.exit(1);
  }

  const config = loadConfig(root);
  const projectPkg = fs.readJsonSync(pkgPath);
  const compat = checkCompatibility(root, config, projectPkg);

  logger.section(`Checking project compatibility (CLI v${cliPkg.version})`);
  logger.info(`Detected project CLI version: ${chalk.bold(compat.detectedVersion)}`);
  logger.info(`Language: ${chalk.bold(compat.isTs ? 'TypeScript' : 'JavaScript (ESM)')}`);

  if (!compat.compatible) {
    logger.newline();
    logger.error('Project is not compatible with cex upgrade:');
    for (const reason of compat.reasons) {
      logger.error(`  - ${reason}`);
    }
    process.exit(1);
  }

  logger.success('Project is compatible!');
  logger.newline();

  const ext = compat.isTs ? 'ts' : 'js';
  const validation = config.validation || 'none';
  const plannedFiles = getUpgradeFiles(compat.isTs, ext, validation);
  const added = [];
  const skipped = [];

  for (const file of plannedFiles) {
    const absPath = path.join(root, file.relPath);
    if (fs.existsSync(absPath)) {
      skipped.push(file.relPath);
    } else {
      added.push(file.relPath);
      if (!dryRun) {
        fs.outputFileSync(absPath, file.content.trimStart());
      }
    }
  }

  const pkgUpdated = updateProjectPackageJson(pkgPath, projectPkg, compat.isTs, dryRun);

  if (!dryRun) {
    const updatedConfig = {
      ...config,
      language: compat.isTs ? 'typescript' : 'javascript',
      module: 'esm',
      architecture: config.architecture || 'layered',
      cliVersion: cliPkg.version,
    };
    fs.writeJsonSync(path.join(root, 'cex.config.json'), updatedConfig, { spaces: 2 });
  }

  logger.section(dryRun ? 'Dry-run upgrade summary (no files modified)' : 'Upgrade summary');
  for (const rel of added) {
    logger.success(`${dryRun ? 'Would add' : 'Added'}: ${rel}`);
  }
  for (const rel of skipped) {
    logger.info(`Skipped (already exists): ${rel}`);
  }
  if (pkgUpdated) {
    logger.success(`${dryRun ? 'Would update' : 'Updated'}: package.json (missing scripts/devDependencies)`);
  }
  if (!dryRun) {
    logger.success(`Updated: cex.config.json (cliVersion: ${cliPkg.version})`);
  }
  logger.newline();
}

function checkCompatibility(root, config, projectPkg) {
  const reasons = [];
  const isTs = config.language === 'typescript';

  if (config.architecture && config.architecture !== 'layered') {
    reasons.push(`Unsupported architecture "${config.architecture}". Expected "layered".`);
  }
  if ((config.module && config.module !== 'esm') || projectPkg.type !== 'module') {
    reasons.push('Project must use ES Modules ("type": "module").');
  }
  if (config.language && config.language !== 'javascript' && config.language !== 'typescript') {
    reasons.push(`Unsupported language "${config.language}".`);
  }

  let detectedVersion = config.cliVersion || 'unknown';
  if (!config.cliVersion) {
    const ext = isTs ? 'ts' : 'js';
    if (fs.existsSync(path.join(root, `src/utils/asyncHandler.${ext}`))) {
      detectedVersion = '>=0.4.0';
    } else {
      detectedVersion = '<=0.3.0';
    }
  }

  return {
    compatible: reasons.length === 0,
    isTs,
    detectedVersion,
    reasons,
  };
}

function getUpgradeFiles(isTs, ext, validation) {
  const files = [
    {
      relPath: `src/utils/asyncHandler.${ext}`,
      content: isTs
        ? `import { Request, Response, NextFunction, RequestHandler } from 'express';

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
`
        : `export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
`,
    },
    {
      relPath: `src/utils/pagination.${ext}`,
      content: isTs
        ? `import { Request } from 'express';

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
  sort: string;
}

export function getPagination(req: Request, defaultLimit = 20, maxLimit = 100): PaginationParams {
  const page = Math.max(1, parseInt(String(req.query.page || '1'), 10) || 1);
  const rawLimit = parseInt(String(req.query.limit || defaultLimit), 10) || defaultLimit;
  const limit = Math.min(Math.max(1, rawLimit), maxLimit);
  const offset = (page - 1) * limit;
  const sort = String(req.query.sort || '-createdAt');
  return { page, limit, offset, sort };
}
`
        : `export function getPagination(req, defaultLimit = 20, maxLimit = 100) {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const rawLimit = parseInt(req.query.limit, 10) || defaultLimit;
  const limit = Math.min(Math.max(1, rawLimit), maxLimit);
  const offset = (page - 1) * limit;
  const sort = req.query.sort || '-createdAt';
  return { page, limit, offset, sort };
}
`,
    },
    {
      relPath: `src/middleware/validate.${ext}`,
      content: buildValidateMiddleware(validation, isTs),
    },
    {
      relPath: `src/middleware/requestId.${ext}`,
      content: requestIdTemplate(isTs),
    },
    {
      relPath: '.prettierrc',
      content: JSON.stringify(
        { semi: true, singleQuote: true, tabWidth: 2, trailingComma: 'es5' },
        null,
        2
      ),
    },
    {
      relPath: 'eslint.config.js',
      content: isTs
        ? `import tseslint from 'typescript-eslint';

export default [
  ...tseslint.configs.recommended,
  {
    ignores: ['dist/**', 'node_modules/**', 'logs/**'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
`
        : `export default [
  {
    ignores: ['node_modules/**', 'logs/**'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
];
`,
    },
    {
      relPath: `tests/health.test.${ext}`,
      content: `import request from 'supertest';
import app from '../src/app.js';

describe('GET /health', () => {
  it('should return 200 ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
`,
    },
  ];

  if (isTs) {
    files.push({
      relPath: 'jest.config.js',
      content: `export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true }],
  },
};
`,
    });
  }

  return files;
}

function updateProjectPackageJson(pkgPath, projectPkg, isTs, dryRun) {
  let changed = false;
  projectPkg.scripts = projectPkg.scripts || {};
  projectPkg.devDependencies = projectPkg.devDependencies || {};

  if (!projectPkg.scripts.lint) {
    projectPkg.scripts.lint = 'eslint src';
    changed = true;
  }
  if (!projectPkg.scripts.format) {
    projectPkg.scripts.format = `prettier --write "src/**/*.${isTs ? 'ts' : 'js'}"`;
    changed = true;
  }

  const devAdds = {
    eslint: '^9.15.0',
    prettier: '^3.3.3',
    jest: '^29.7.0',
    supertest: '^7.0.0',
  };
  if (isTs) {
    devAdds['ts-jest'] = '^29.2.5';
    devAdds['typescript-eslint'] = '^8.15.0';
  }

  for (const [dep, ver] of Object.entries(devAdds)) {
    if (!projectPkg.devDependencies[dep]) {
      projectPkg.devDependencies[dep] = ver;
      changed = true;
    }
  }

  if (changed && !dryRun) {
    fs.writeJsonSync(pkgPath, projectPkg, { spaces: 2 });
  }
  return changed;
}
