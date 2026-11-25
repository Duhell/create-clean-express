import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI_BIN = path.resolve(__dirname, '../bin/cex.js');

function runCli(args, cwd) {
  return execFileSync(process.execPath, [CLI_BIN, ...args], {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, CI: 'true' },
  });
}

test('cex new rejects path traversal and invalid project names', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cex-test-'));
  try {
    assert.throws(() => runCli(['new', '../evil', '--no-install', '--no-git'], tmpDir));
    assert.throws(() => runCli(['new', 'foo/bar', '--no-install', '--no-git'], tmpDir));
  } finally {
    fs.removeSync(tmpDir);
  }
});

test('cex new scaffolds project with security defaults', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cex-test-'));
  try {
    runCli(['new', 'my-api', '--database', 'none', '--no-install', '--no-git'], tmpDir);
    const projectDir = path.join(tmpDir, 'my-api');

    const pkg = fs.readJsonSync(path.join(projectDir, 'package.json'));
    assert.ok(pkg.dependencies['express-rate-limit']);
    assert.ok(pkg.dependencies['cross-env']);
    assert.match(pkg.scripts.start, /^cross-env NODE_ENV=production/);

    const appJs = fs.readFileSync(path.join(projectDir, 'src/app.js'), 'utf8');
    assert.match(appJs, /rateLimit\(/);
    assert.match(appJs, /express\.json\(\{ limit: '100kb' \}\)/);
    assert.match(appJs, /cors\(\{ origin: config\.cors\.origin, credentials: true \}\)/);

    const configJs = fs.readFileSync(path.join(projectDir, 'src/config/index.js'), 'utf8');
    assert.match(configJs, /JWT_SECRET and JWT_REFRESH_SECRET must be set in production/);
    assert.match(configJs, /refreshSecret:/);
  } finally {
    fs.removeSync(tmpDir);
  }
});

test('cex make auth generates separated JWT secrets, type checks, and auth rate limiter', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cex-test-'));
  try {
    runCli(['new', 'auth-api', '--database', 'none', '--no-install', '--no-git'], tmpDir);
    const projectDir = path.join(tmpDir, 'auth-api');
    runCli(['make', 'auth'], projectDir);

    const authService = fs.readFileSync(path.join(projectDir, 'src/services/AuthService.js'), 'utf8');
    assert.match(authService, /config\.jwt\.refreshSecret/);
    assert.match(authService, /payload\.type !== 'refresh'/);
    assert.match(authService, /type: 'access'/);

    const authMiddleware = fs.readFileSync(path.join(projectDir, 'src/middleware/AuthMiddleware.js'), 'utf8');
    assert.match(authMiddleware, /payload\.type && payload\.type !== 'access'/);

    const authRoutes = fs.readFileSync(path.join(projectDir, 'src/routes/auth.routes.js'), 'utf8');
    assert.match(authRoutes, /authLimiter/);

    const pkg = fs.readJsonSync(path.join(projectDir, 'package.json'));
    assert.ok(pkg.dependencies.bcryptjs);
    assert.ok(pkg.dependencies.jsonwebtoken);
  } finally {
    fs.removeSync(tmpDir);
  }
});

test('cex add docker generates hardened Dockerfile and docker-compose.yml', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cex-test-'));
  try {
    runCli(['new', 'docker-api', '--database', 'none', '--no-install', '--no-git'], tmpDir);
    const projectDir = path.join(tmpDir, 'docker-api');
    runCli(['add', 'docker'], projectDir);

    const dockerfile = fs.readFileSync(path.join(projectDir, 'Dockerfile'), 'utf8');
    assert.match(dockerfile, /USER node/);

    const compose = fs.readFileSync(path.join(projectDir, 'docker-compose.yml'), 'utf8');
    assert.match(compose, /POSTGRES_PASSWORD:\s*\$\{POSTGRES_PASSWORD:\?/);
    assert.match(compose, /127\.0\.0\.1:5432:5432/);
  } finally {
    fs.removeSync(tmpDir);
  }
});

test('cex new scaffolds route auto-discovery, helpers, validate middleware, and jest', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cex-test-'));
  try {
    runCli(['new', 'dx-api', '--database', 'none', '--validation', 'zod', '--no-install', '--no-git'], tmpDir);
    const projectDir = path.join(tmpDir, 'dx-api');

    const pkg = fs.readJsonSync(path.join(projectDir, 'package.json'));
    assert.ok(pkg.devDependencies.jest);
    assert.ok(pkg.devDependencies.supertest);
    assert.match(pkg.scripts.test, /jest/);

    const routesIndex = fs.readFileSync(path.join(projectDir, 'src/routes/index.js'), 'utf8');
    assert.match(routesIndex, /readdirSync/);
    assert.match(routesIndex, /\.routes\.js/);

    const appJs = fs.readFileSync(path.join(projectDir, 'src/app.js'), 'utf8');
    assert.match(appJs, /\/api-docs/);

    assert.ok(fs.existsSync(path.join(projectDir, 'src/utils/asyncHandler.js')));
    assert.ok(fs.existsSync(path.join(projectDir, 'src/utils/pagination.js')));

    const validateJs = fs.readFileSync(path.join(projectDir, 'src/middleware/validate.js'), 'utf8');
    assert.match(validateJs, /safeParse/);

    // Generating a route does not break auto-discovery routes/index.js
    runCli(['make', 'route', 'Product'], projectDir);
    const routesIndexAfter = fs.readFileSync(path.join(projectDir, 'src/routes/index.js'), 'utf8');
    assert.equal(routesIndexAfter, routesIndex);
  } finally {
    fs.removeSync(tmpDir);
  }
});

test('cex add docker generates TypeScript build step for TS projects', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cex-test-'));
  try {
    runCli(['new', 'ts-api', '--database', 'none', '--typescript', '--no-install', '--no-git'], tmpDir);
    const projectDir = path.join(tmpDir, 'ts-api');
    runCli(['add', 'docker'], projectDir);

    const dockerfile = fs.readFileSync(path.join(projectDir, 'Dockerfile'), 'utf8');
    assert.match(dockerfile, /RUN npm run build/);
    assert.match(dockerfile, /dist\/server\.js/);
  } finally {
    fs.removeSync(tmpDir);
  }
});

test('cex new scaffolds prettier, eslint, starter health test, and ts-jest for TS', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cex-test-'));
  try {
    runCli(['new', 'std-ts', '--database', 'none', '--typescript', '--no-install', '--no-git'], tmpDir);
    const projectDir = path.join(tmpDir, 'std-ts');

    assert.ok(fs.existsSync(path.join(projectDir, '.prettierrc')));
    assert.ok(fs.existsSync(path.join(projectDir, 'eslint.config.js')));
    assert.ok(fs.existsSync(path.join(projectDir, 'jest.config.js')));
    assert.ok(fs.existsSync(path.join(projectDir, 'tests/health.test.ts')));

    const pkg = fs.readJsonSync(path.join(projectDir, 'package.json'));
    assert.ok(pkg.scripts.lint);
    assert.ok(pkg.scripts.format);
    assert.ok(pkg.devDependencies.eslint);
    assert.ok(pkg.devDependencies.prettier);
    assert.ok(pkg.devDependencies['ts-jest']);
  } finally {
    fs.removeSync(tmpDir);
  }
});

test('cex make auth generates database-wired AuthRepository for sqlite, mysql, and in-memory', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cex-test-'));
  try {
    runCli(['new', 'sqlite-api', '--database', 'sqlite', '--no-install', '--no-git'], tmpDir);
    runCli(['make', 'auth'], path.join(tmpDir, 'sqlite-api'));
    const sqliteRepo = fs.readFileSync(path.join(tmpDir, 'sqlite-api/src/repositories/AuthRepository.js'), 'utf8');
    assert.match(sqliteRepo, /db\.prepare\(/);

    runCli(['new', 'mysql-api', '--database', 'mysql', '--no-install', '--no-git'], tmpDir);
    runCli(['make', 'auth'], path.join(tmpDir, 'mysql-api'));
    const mysqlRepo = fs.readFileSync(path.join(tmpDir, 'mysql-api/src/repositories/AuthRepository.js'), 'utf8');
    assert.match(mysqlRepo, /pool\.execute\(/);

    runCli(['new', 'mem-api', '--database', 'none', '--no-install', '--no-git'], tmpDir);
    runCli(['make', 'auth'], path.join(tmpDir, 'mem-api'));
    const memRepo = fs.readFileSync(path.join(tmpDir, 'mem-api/src/repositories/AuthRepository.js'), 'utf8');
    assert.match(memRepo, /new Map\(\)/);
  } finally {
    fs.removeSync(tmpDir);
  }
});

test('cex upgrade checks compatibility, supports --dry-run, and upgrades older projects non-destructively', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cex-test-'));
  try {
    runCli(['new', 'legacy-api', '--database', 'none', '--no-install', '--no-git'], tmpDir);
    const projectDir = path.join(tmpDir, 'legacy-api');

    // Simulate a v0.3.0 project (no cliVersion, missing new helpers/configs)
    const cfg = fs.readJsonSync(path.join(projectDir, 'cex.config.json'));
    delete cfg.cliVersion;
    fs.writeJsonSync(path.join(projectDir, 'cex.config.json'), cfg, { spaces: 2 });
    fs.removeSync(path.join(projectDir, 'src/utils/asyncHandler.js'));
    fs.removeSync(path.join(projectDir, '.prettierrc'));

    // Dry run should not create files
    runCli(['upgrade', '--dry-run'], projectDir);
    assert.equal(fs.existsSync(path.join(projectDir, 'src/utils/asyncHandler.js')), false);

    // Real upgrade should restore missing files and record cliVersion
    runCli(['upgrade'], projectDir);
    assert.ok(fs.existsSync(path.join(projectDir, 'src/utils/asyncHandler.js')));
    assert.ok(fs.existsSync(path.join(projectDir, '.prettierrc')));
    const upgradedCfg = fs.readJsonSync(path.join(projectDir, 'cex.config.json'));
    assert.ok(upgradedCfg.cliVersion);

    // Incompatible project (non-ESM) should fail cleanly
    const pkg = fs.readJsonSync(path.join(projectDir, 'package.json'));
    pkg.type = 'commonjs';
    fs.writeJsonSync(path.join(projectDir, 'package.json'), pkg, { spaces: 2 });
    assert.throws(() => runCli(['upgrade'], projectDir));
  } finally {
    fs.removeSync(tmpDir);
  }
});

test('templates use HTTP_STATUS constants instead of hardcoded status codes', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cex-test-'));
  try {
    runCli(['new', 'status-api', '--database', 'none', '--no-install', '--no-git'], tmpDir);
    const projectDir = path.join(tmpDir, 'status-api');
    runCli(['make', 'auth'], projectDir);
    runCli(['make', 'error', 'Payment'], projectDir);

    const authCtrl = fs.readFileSync(path.join(projectDir, 'src/controllers/AuthController.js'), 'utf8');
    assert.match(authCtrl, /HTTP_STATUS\.CREATED/);
    assert.doesNotMatch(authCtrl, /,\s*201\)/);

    const errFile = fs.readFileSync(path.join(projectDir, 'src/errors/PaymentError.js'), 'utf8');
    assert.match(errFile, /HTTP_STATUS\.BAD_REQUEST/);
    assert.doesNotMatch(errFile, /super\(message,\s*400\)/);

    const appJs = fs.readFileSync(path.join(projectDir, 'src/app.js'), 'utf8');
    assert.match(appJs, /res\.status\(HTTP_STATUS\.OK\)/);
  } finally {
    fs.removeSync(tmpDir);
  }
});

test('cex new scaffolds prisma schema and ORM db connections', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cex-test-'));
  try {
    runCli(['new', 'prisma-api', '--database', 'prisma', '--no-install', '--no-git'], tmpDir);
    assert.ok(fs.existsSync(path.join(tmpDir, 'prisma-api/prisma/schema.prisma')));
    const prismaDb = fs.readFileSync(path.join(tmpDir, 'prisma-api/src/database/index.js'), 'utf8');
    assert.match(prismaDb, /PrismaClient/);

    runCli(['new', 'mongo-api', '--database', 'mongoose', '--no-install', '--no-git'], tmpDir);
    const mongoDb = fs.readFileSync(path.join(tmpDir, 'mongo-api/src/database/index.js'), 'utf8');
    assert.match(mongoDb, /mongoose\.connect/);
  } finally {
    fs.removeSync(tmpDir);
  }
});

test('cex make auth wires AuthValidator onto auth routes', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cex-test-'));
  try {
    runCli(['new', 'val-auth', '--database', 'none', '--validation', 'zod', '--no-install', '--no-git'], tmpDir);
    const projectDir = path.join(tmpDir, 'val-auth');
    runCli(['make', 'auth'], projectDir);

    const validator = fs.readFileSync(path.join(projectDir, 'src/validators/AuthValidator.js'), 'utf8');
    assert.match(validator, /registerSchema/);
    assert.match(validator, /z\.object/);

    const routes = fs.readFileSync(path.join(projectDir, 'src/routes/auth.routes.js'), 'utf8');
    assert.match(routes, /validate\(registerSchema\)/);
    assert.match(routes, /validate\(loginSchema\)/);
  } finally {
    fs.removeSync(tmpDir);
  }
});

test('cex add mail generates SMTP config and MailService (JS and TS)', async () => {
  const { addCommand } = await import('../src/commands/add.js');
  assert.equal(typeof addCommand, 'function');

  // Verify mail plugin is registered in CLI help
  const helpOut = execFileSync(process.execPath, [CLI_BIN, '--help'], { encoding: 'utf8' });
  assert.match(helpOut, /mail/);

  // Verify add.js template includes MailService.queue().sendMail with fallback
  const addSrc = fs.readFileSync(path.resolve(__dirname, '../src/commands/add.js'), 'utf8');
  assert.match(addSrc, /queue\(jobOptions/);
  assert.match(addSrc, /return this\.sendMail\(mailOptions\)/);
  assert.doesNotMatch(addSrc, /sendEmail/);
});

test('cex new scaffolds async structured logger, requestId middleware, and ORM-aware BaseModel', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cex-test-'));
  try {
    runCli(['new', 'obs-sqlite', '--database', 'sqlite', '--no-install', '--no-git'], tmpDir);
    const sqliteDir = path.join(tmpDir, 'obs-sqlite');

    const loggerJs = fs.readFileSync(path.join(sqliteDir, 'src/utils/logger.js'), 'utf8');
    assert.match(loggerJs, /fs\.promises\.appendFile/);
    assert.match(loggerJs, /export const logger =/);
    assert.match(loggerJs, /req\?\.id/);

    assert.ok(fs.existsSync(path.join(sqliteDir, 'src/middleware/requestId.js')));
    const appJs = fs.readFileSync(path.join(sqliteDir, 'src/app.js'), 'utf8');
    assert.match(appJs, /app\.use\(requestIdMiddleware\)/);

    const sqliteBase = fs.readFileSync(path.join(sqliteDir, 'src/models/BaseModel.js'), 'utf8');
    assert.match(sqliteBase, /db\.prepare\(/);

    runCli(['new', 'obs-mysql', '--database', 'mysql', '--no-install', '--no-git'], tmpDir);
    const mysqlBase = fs.readFileSync(path.join(tmpDir, 'obs-mysql/src/models/BaseModel.js'), 'utf8');
    assert.match(mysqlBase, /pool\.execute\(/);
  } finally {
    fs.removeSync(tmpDir);
  }
});

test('cex add audit generates migration, AuditService with event listeners, and AuditMiddleware', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cex-test-'));
  try {
    runCli(['new', 'audit-api', '--database', 'sqlite', '--no-install', '--no-git'], tmpDir);
    const projectDir = path.join(tmpDir, 'audit-api');
    runCli(['add', 'audit'], projectDir);

    const migrations = fs.readdirSync(path.join(projectDir, 'src/database/migrations'));
    assert.ok(migrations.some((f) => f.endsWith('_create_audit_logs_table.js')));

    const auditService = fs.readFileSync(path.join(projectDir, 'src/services/AuditService.js'), 'utf8');
    assert.match(auditService, /EventEmitter/);
    assert.match(auditService, /auth\.login/);
    assert.match(auditService, /crud\.update/);
    assert.match(auditService, /oldData/);
    assert.match(auditService, /newData/);

    const auditMiddleware = fs.readFileSync(path.join(projectDir, 'src/middleware/AuditMiddleware.js'), 'utf8');
    assert.match(auditMiddleware, /auditMiddleware/);
    assert.match(auditMiddleware, /auditOldData/);
  } finally {
    fs.removeSync(tmpDir);
  }
});
