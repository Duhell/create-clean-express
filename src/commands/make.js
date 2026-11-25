import path from 'path';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import chalk from 'chalk';
import * as logger from '../utils/logger.js';
import { toPascalCase, toCamelCase, toKebabCase } from '../utils/strings.js';
import { findProjectRoot, loadConfig } from '../utils/project.js';
import * as templates from '../templates/index.js';

import { makeMigrationCommand } from './migrate.js';

/**
 * Main dispatcher for `cex make <type> <name>`
 */
export async function makeCommand(type, name) {
  const root = findProjectRoot();
  const srcDir = path.join(root, 'src');

  if (!fs.existsSync(srcDir)) {
    logger.error('No src/ directory found. Are you inside a cex project?');
    process.exit(1);
  }

  const config = loadConfig(root);
  const isTs = config.language === 'typescript';
  const ext = isTs ? 'ts' : 'js';

  const pascal = toPascalCase(name);
  const camel = toCamelCase(name);
  const kebab = toKebabCase(name);

  logger.section(`Generating ${type}: ${pascal} (${ext.toUpperCase()})`);

  switch (type) {
    case 'controller':
      generate(srcDir, 'controllers', `${pascal}Controller.${ext}`, templates.controller(pascal, camel, isTs));
      break;

    case 'service':
      generate(srcDir, 'services', `${pascal}Service.${ext}`, templates.service(pascal, camel, isTs));
      break;

    case 'repository':
      generate(srcDir, 'repositories', `${pascal}Repository.${ext}`, templates.repository(pascal, camel, isTs));
      break;

    case 'model':
      generate(srcDir, 'models', `${pascal}Model.${ext}`, templates.model(pascal, camel, kebab, isTs));
      break;

    case 'migration':
      await makeMigrationCommand(name);
      return;

    case 'middleware':
      generate(srcDir, 'middleware', `${pascal}Middleware.${ext}`, templates.middleware(pascal, camel, isTs));
      break;

    case 'validator':
      generate(srcDir, 'validators', `${pascal}Validator.${ext}`, templates.validator(pascal, camel, isTs));
      break;

    case 'util':
      generate(srcDir, 'utils', `${pascal}.${ext}`, templates.util(pascal, isTs));
      break;

    case 'error':
      generate(srcDir, 'errors', `${pascal}Error.${ext}`, templates.error(pascal, isTs));
      break;

    case 'route':
      generateRoute(srcDir, name, isTs, ext);
      break;

    case 'resource':
      generateResource(srcDir, pascal, camel, kebab, isTs, ext, config);
      break;

    case 'auth':
      generateAuth(root, srcDir, isTs, ext, config);
      break;

    case 'test':
      generateTests(root, pascal, camel, isTs, ext);
      break;

    default:
      logger.error(`Unknown type: ${type}`);
      process.exit(1);
  }

  logger.newline();
  logger.success(chalk.bold('Done!'));
  logger.newline();
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function generate(srcDir, folder, filename, content) {
  const filePath = path.join(srcDir, folder, filename);
  if (fs.existsSync(filePath)) {
    logger.warn(`Already exists: src/${folder}/${filename}`);
    return;
  }
  fs.outputFileSync(filePath, content);
  logger.success(`Created: src/${folder}/${filename}`);
}

function generateRoute(srcDir, name, isTs, ext) {
  let cleanName = name.replace(/\.(routes?|js|ts)$/i, '');
  cleanName = cleanName.replace(/[-_]routes?$/i, '');

  const pascal = toPascalCase(cleanName);
  const camel = toCamelCase(cleanName);
  const kebab = toKebabCase(cleanName);

  const controllerExists = fs.existsSync(path.join(srcDir, 'controllers', `${pascal}Controller.${ext}`));
  const routeContent = controllerExists
    ? templates.route(pascal, camel, kebab, isTs)
    : (templates.standaloneRoute ? templates.standaloneRoute(pascal, camel, kebab, isTs) : templates.route(pascal, camel, kebab, isTs));

  generate(srcDir, 'routes', `${kebab}.routes.${ext}`, routeContent);
  updateRoutesIndex(srcDir, pascal, kebab, ext);
}

function generateResource(srcDir, pascal, camel, kebab, isTs, ext, config = {}) {
  generate(srcDir, 'controllers', `${pascal}Controller.${ext}`, templates.controller(pascal, camel, isTs));
  generate(srcDir, 'services', `${pascal}Service.${ext}`, templates.service(pascal, camel, isTs));
  generate(srcDir, 'models', `${pascal}Model.${ext}`, templates.model(pascal, camel, kebab, isTs));

  if (config.pattern === 'repository') {
    generate(srcDir, 'repositories', `${pascal}Repository.${ext}`, templates.repository(pascal, camel, isTs));
  }

  generate(srcDir, 'validators', `${pascal}Validator.${ext}`, templates.validator(pascal, camel, isTs));
  generate(srcDir, 'routes', `${kebab}.routes.${ext}`, templates.route(pascal, camel, kebab, isTs));

  // Auto-update routes/index.js (or index.ts)
  updateRoutesIndex(srcDir, pascal, kebab, ext);
}

function generateAuth(root, srcDir, isTs, ext, config = {}) {
  generate(srcDir, 'controllers', `AuthController.${ext}`, templates.authController(isTs));
  generate(srcDir, 'services', `AuthService.${ext}`, templates.authService(isTs));
  generate(srcDir, 'repositories', `AuthRepository.${ext}`, templates.authRepository(isTs, config.database));
  generate(srcDir, 'middleware', `AuthMiddleware.${ext}`, templates.authMiddleware(isTs));
  generate(srcDir, 'validators', `AuthValidator.${ext}`, templates.authValidator(isTs, config.validation));
  generate(srcDir, 'routes', `auth.routes.${ext}`, templates.authRoute(isTs, config.validation));
  updateRoutesIndexExact(srcDir, 'auth', ext);
  ensureAuthDependencies(root, isTs);
}

function ensureAuthDependencies(root, isTs) {
  const pkgPath = path.join(root, 'package.json');
  if (!fs.existsSync(pkgPath)) return;

  const pkg = fs.readJsonSync(pkgPath);
  pkg.dependencies = pkg.dependencies || {};
  let changed = false;

  if (!pkg.dependencies.bcryptjs) {
    pkg.dependencies.bcryptjs = '^2.4.3';
    changed = true;
  }
  if (!pkg.dependencies.jsonwebtoken) {
    pkg.dependencies.jsonwebtoken = '^9.0.2';
    changed = true;
  }

  if (isTs) {
    pkg.devDependencies = pkg.devDependencies || {};
    if (!pkg.devDependencies['@types/bcryptjs']) {
      pkg.devDependencies['@types/bcryptjs'] = '^2.4.6';
      changed = true;
    }
    if (!pkg.devDependencies['@types/jsonwebtoken']) {
      pkg.devDependencies['@types/jsonwebtoken'] = '^9.0.7';
      changed = true;
    }
  }

  if (changed) {
    fs.writeJsonSync(pkgPath, pkg, { spaces: 2 });
    logger.success('Updated package.json with bcryptjs and jsonwebtoken');
    if (fs.existsSync(path.join(root, 'node_modules'))) {
      try {
        execSync('npm install', { cwd: root, stdio: 'ignore' });
        logger.success('Installed auth dependencies');
      } catch {
        logger.warn('Could not auto-install auth dependencies — run npm install manually');
      }
    }
  }
}

function generateTests(root, pascal, camel, isTs, ext) {
  const testsDir = path.join(root, 'tests');
  fs.mkdirpSync(testsDir);

  const controllerTest = path.join(testsDir, `${camel}.controller.test.${ext}`);
  const serviceTest = path.join(testsDir, `${camel}.service.test.${ext}`);

  if (!fs.existsSync(controllerTest)) {
    fs.outputFileSync(controllerTest, templates.controllerTest(pascal, camel, isTs));
    logger.success(`Created: tests/${camel}.controller.test.${ext}`);
  } else {
    logger.warn(`Already exists: tests/${camel}.controller.test.${ext}`);
  }

  if (!fs.existsSync(serviceTest)) {
    fs.outputFileSync(serviceTest, templates.serviceTest(pascal, camel, isTs));
    logger.success(`Created: tests/${camel}.service.test.${ext}`);
  } else {
    logger.warn(`Already exists: tests/${camel}.service.test.${ext}`);
  }
}

function updateRoutesIndex(srcDir, pascal, kebab, ext) {
  const indexPath = path.join(srcDir, 'routes', `index.${ext}`);

  if (!fs.existsSync(indexPath)) {
    logger.warn(`routes/index.${ext} not found — skipping route registration`);
    return;
  }

  let content = fs.readFileSync(indexPath, 'utf8');
  if (content.includes('readdirSync') && !content.includes('// ── Register your routes here')) {
    logger.info(`Route auto-discovered by src/routes/index.${ext}`);
    return;
  }

  const routePath = kebab.endsWith('s') ? `/${kebab}` : `/${kebab}s`;
  const varName = toCamelCase(kebab) + 'Routes';
  const importLine = `import ${varName} from './${kebab}.routes.js';`;
  const useLine = `router.use('${routePath}', ${varName});`;

  if (content.includes(importLine)) {
    logger.warn(`Route already registered: ${routePath}`);
    return;
  }

  content = content.replace(
    "// ── Register your routes here ──────────────────────────────────────────────",
    `// ── Register your routes here ──────────────────────────────────────────────\n${importLine}\n${useLine}`
  );

  if (!content.includes(importLine)) {
    content = content.replace(
      'export default router;',
      `${importLine}\n${useLine}\n\nexport default router;`
    );
  }

  fs.writeFileSync(indexPath, content);
  logger.success(`Updated: src/routes/index.${ext} → registered ${routePath}`);
}

function updateRoutesIndexExact(srcDir, kebab, ext) {
  const indexPath = path.join(srcDir, 'routes', `index.${ext}`);

  if (!fs.existsSync(indexPath)) {
    logger.warn(`routes/index.${ext} not found — skipping route registration`);
    return;
  }

  let content = fs.readFileSync(indexPath, 'utf8');
  if (content.includes('readdirSync') && !content.includes('// ── Register your routes here')) {
    logger.info(`Route auto-discovered by src/routes/index.${ext}`);
    return;
  }

  const routePath = `/${kebab}`;
  const varName = kebab.replace(/-/g, '') + 'Routes';
  const importLine = `import ${varName} from './${kebab}.routes.js';`;
  const useLine = `router.use('${routePath}', ${varName});`;

  if (content.includes(importLine)) {
    logger.warn(`Route already registered: ${routePath}`);
    return;
  }

  content = content.replace(
    "// ── Register your routes here ──────────────────────────────────────────────",
    `// ── Register your routes here ──────────────────────────────────────────────\n${importLine}\n${useLine}`
  );

  if (!content.includes(importLine)) {
    content = content.replace(
      'export default router;',
      `${importLine}\n${useLine}\n\nexport default router;`
    );
  }

  fs.writeFileSync(indexPath, content);
  logger.success(`Updated: src/routes/index.${ext} → registered ${routePath}`);
}
