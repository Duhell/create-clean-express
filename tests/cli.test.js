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
