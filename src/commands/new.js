import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import { execSync } from 'child_process';
import ora from 'ora';
import chalk from 'chalk';
import * as logger from '../utils/logger.js';
import * as templates from '../templates/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cliPkg = fs.readJsonSync(path.resolve(__dirname, '../../package.json'));

export async function newCommand(projectName, options = {}) {
  const {
    database = 'none',
    validation = 'none',
    pattern = 'service-model',
    typescript = false,
    install = true,
    git = true,
  } = options;

  const SAFE_PROJECT_NAME = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/;
  if (!projectName || projectName.includes('..') || !SAFE_PROJECT_NAME.test(projectName)) {
    logger.error(
      `Invalid project name "${projectName}". Use only letters, numbers, hyphens, underscores, or dots (cannot start with a dot or contain path separators).`
    );
    process.exit(1);
  }

  const targetDir = path.resolve(process.cwd(), projectName);
  const isTs = Boolean(typescript);
  const ext = isTs ? 'ts' : 'js';

  logger.section('Creating new Express project');
  logger.info(`Project: ${chalk.bold(projectName)}`);
  logger.info(`Language: ${chalk.bold(isTs ? 'TypeScript' : 'JavaScript (ESM)')}`);
  logger.info(`Pattern: ${chalk.bold(pattern)}`);
  logger.info(`Database: ${chalk.bold(database)}`);
  logger.info(`Validation: ${chalk.bold(validation)}`);
  logger.newline();

  // ── Check target directory ──────────────────────────────────────────────
  if (fs.existsSync(targetDir)) {
    logger.error(`Directory "${projectName}" already exists.`);
    process.exit(1);
  }

  const spinner = ora({ text: 'Scaffolding project structure...', color: 'cyan' }).start();

  try {
    // ── Create directory structure ─────────────────────────────────────────
    const dirs = [
      'src/config',
      'src/constants',
      'src/controllers',
      'src/middleware',
      'src/routes',
      'src/services',
      'src/validators',
      'src/models',
      'src/utils',
      'src/errors',
      'src/database',
      'src/database/migrations',
      'tests',
      'logs',
    ];

    if (pattern === 'repository') {
      dirs.push('src/repositories');
    }

    for (const dir of dirs) {
      fs.mkdirpSync(path.join(targetDir, dir));
    }

    // ── Write project files ────────────────────────────────────────────────
    writeProjectFiles(targetDir, projectName, database, validation, isTs, ext);

    spinner.succeed(chalk.green('Project structure created'));

    // ── Write cex.config.json ──────────────────────────────────────────────
    const config = {
      cliVersion: cliPkg.version,
      language: isTs ? 'typescript' : 'javascript',
      module: 'esm',
      architecture: 'layered',
      pattern,
      database,
      validation,
      testing: 'jest',
      formatter: 'prettier',
    };
    fs.writeJsonSync(path.join(targetDir, 'cex.config.json'), config, { spaces: 2 });
    logger.success('Created cex.config.json');

    // ── Install dependencies ───────────────────────────────────────────────
    if (install) {
      const installSpinner = ora({ text: 'Installing dependencies...', color: 'cyan' }).start();
      try {
        execSync('npm install', { cwd: targetDir, stdio: 'ignore' });
        installSpinner.succeed(chalk.green('Dependencies installed'));
      } catch (e) {
        installSpinner.warn(chalk.yellow('npm install failed — run it manually'));
      }
    }

    // ── Git init ───────────────────────────────────────────────────────────
    if (git) {
      try {
        execSync('git init', { cwd: targetDir, stdio: 'ignore' });
        execSync('git add .', { cwd: targetDir, stdio: 'ignore' });
        execSync('git commit -m "chore: initial project scaffold"', { cwd: targetDir, stdio: 'ignore' });
        logger.success('Git repository initialized');
      } catch {
        logger.warn('Git not available — skipping git init');
      }
    }

    // ── Done ───────────────────────────────────────────────────────────────
    logger.newline();
    console.log(chalk.green.bold('  Project ready!'));
    logger.newline();
    console.log(chalk.dim('  Next steps:'));
    console.log(chalk.cyan(`    cd ${projectName}`));
    console.log(chalk.cyan(`    npm run dev`));
    logger.newline();
  } catch (err) {
    spinner.fail(chalk.red('Failed to scaffold project'));
    logger.error(err.message);
    process.exit(1);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// File writers
// ─────────────────────────────────────────────────────────────────────────────

function writeProjectFiles(targetDir, projectName, database, validation, isTs, ext) {
  const write = (relPath, content) =>
    fs.outputFileSync(path.join(targetDir, relPath), content.trimStart());

  // package.json
  const deps = buildDependencies(database, validation, isTs);
  
  const packageJson = {
    name: projectName,
    version: '1.0.0',
    description: `${projectName} — a clean Express.js API`,
    type: 'module',
    main: isTs ? 'dist/server.js' : `src/server.${ext}`,
    scripts: isTs
      ? {
          dev: 'ts-node-dev --respawn --transpile-only src/server.ts',
          build: 'tsc',
          start: 'cross-env NODE_ENV=production node dist/server.js',
          test: 'node --experimental-vm-modules node_modules/jest/bin/jest.js',
          lint: 'eslint src',
          format: 'prettier --write "src/**/*.ts"',
        }
      : {
          dev: 'node src/server.js',
          start: 'cross-env NODE_ENV=production node src/server.js',
          test: 'node --experimental-vm-modules node_modules/jest/bin/jest.js',
          lint: 'eslint src',
          format: 'prettier --write "src/**/*.js"',
        },
    engines: {
      node: '>=22.0.0',
    },
    dependencies: deps.prod,
    devDependencies: deps.dev,
  };

  write('package.json', JSON.stringify(packageJson, null, 2));

  // tsconfig.json if TypeScript
  if (isTs) {
    write('tsconfig.json', JSON.stringify({
      compilerOptions: {
        target: 'ES2022',
        module: 'NodeNext',
        moduleResolution: 'NodeNext',
        outDir: './dist',
        rootDir: './src',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist', 'logs', 'tests']
    }, null, 2));
  }

  // .env
  let envDbPart = `DATABASE_URL=`;
  if (database === 'sqlite') {
    envDbPart = `DATABASE_URL=./database.sqlite`;
  } else if (database === 'mysql') {
    envDbPart = `DB_HOST=localhost\nDB_PORT=3306\nDB_USER=root\nDB_PASSWORD=\nDB_NAME=${projectName.replace(/[-]/g, '_')}`;
  }

  write('.env', `
NODE_ENV=development
PORT=3000
APP_NAME=${projectName}

# Database Configuration
${envDbPart}

# CORS Configuration (comma-separated origins, e.g. http://localhost:3000,https://app.example.com)
CORS_ORIGIN=http://localhost:3000

# JWT Configuration
JWT_SECRET=change_me_in_production
JWT_REFRESH_SECRET=change_me_refresh_in_production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d
`);

  // .env.example
  write('.env.example', `
NODE_ENV=development
PORT=3000
APP_NAME=${projectName}

${envDbPart}

CORS_ORIGIN=http://localhost:3000

JWT_SECRET=
JWT_REFRESH_SECRET=
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d
`);

  // .gitignore
  write('.gitignore', `
node_modules/
.env
dist/
logs/
*.log
.DS_Store
Thumbs.db
`);

  // src/utils/logger.js or ts (File logger for errors)
  write(`src/utils/logger.${ext}`, templates.fileLoggerTemplate(isTs));

  // src/app.js or ts
  if (isTs) {
    write(`src/app.${ext}`, `
import fs from 'fs';
import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import config from './config/index.js';
import { HTTP_STATUS } from './constants/index.js';
import { globalErrorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFound.js';
import routes from './routes/index.js';

const app: Application = express();

// ── Security & Parsing ─────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// ── Logging ────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ── Health check ───────────────────────────────────────────────────────────
app.get('/health', (req: Request, res: Response) => {
  res.status(HTTP_STATUS.OK).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API Routes ─────────────────────────────────────────────────────────────
app.use('/api/v1', routes);

// ── Optional Swagger UI (auto-mounted when src/config/swagger exists) ──────
if (fs.existsSync(new URL('./config/swagger.js', import.meta.url))) {
  const [{ default: swaggerUi }, { default: swaggerSpec }] = await Promise.all([
    import('swagger-ui-express'),
    import('./config/swagger.js'),
  ]);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// ── Error handling ─────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
`);
  } else {
    write(`src/app.${ext}`, `
import fs from 'fs';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import config from './config/index.js';
import { HTTP_STATUS } from './constants/index.js';
import { globalErrorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFound.js';
import routes from './routes/index.js';

const app = express();

// ── Security & Parsing ─────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// ── Logging ────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ── Health check ───────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(HTTP_STATUS.OK).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API Routes ─────────────────────────────────────────────────────────────
app.use('/api/v1', routes);

// ── Optional Swagger UI (auto-mounted when src/config/swagger exists) ──────
if (fs.existsSync(new URL('./config/swagger.js', import.meta.url))) {
  const [{ default: swaggerUi }, { default: swaggerSpec }] = await Promise.all([
    import('swagger-ui-express'),
    import('./config/swagger.js'),
  ]);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// ── Error handling ─────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
`);
  }

  // src/server.js or ts
  if (isTs) {
    write(`src/server.${ext}`, `
import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  const env = process.env.NODE_ENV || 'development';
  console.log(\`\\n  🚀  Server running at http://localhost:\${PORT}\`);
  console.log(\`  📋  Environment: \${env}\\n\`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received — shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  server.close(() => {
    console.log('\\nServer stopped');
    process.exit(0);
  });
});

export default server;
`);
  } else {
    write(`src/server.${ext}`, `
import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  const env = process.env.NODE_ENV || 'development';
  console.log(\`\\n  🚀  Server running at http://localhost:\${PORT}\`);
  console.log(\`  📋  Environment: \${env}\\n\`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received — shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  server.close(() => {
    console.log('\\nServer stopped');
    process.exit(0);
  });
});

export default server;
`);
  }

  // src/models/BaseModel.js or ts
  write(`src/models/BaseModel.${ext}`, templates.baseModel(isTs));

  // src/routes/index.js or ts (auto-discovers *.routes.js / *.routes.ts)
  if (isTs) {
    write(`src/routes/index.${ext}`, `
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { Router, Request, Response } from 'express';
import { HTTP_STATUS } from '../constants/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = Router();

// ── Sample route ───────────────────────────────────────────────────────────
router.get('/', (req: Request, res: Response) => {
  res.status(HTTP_STATUS.OK).json({ message: 'connected to backend successfully' });
});

router.get('/sample', (req: Request, res: Response) => {
  res.status(HTTP_STATUS.OK).json({ message: 'connected to backend successfully' });
});

// ── Auto-discover *.routes.js|ts modules ───────────────────────────────────
const routeFiles = fs.readdirSync(__dirname)
  .filter((f) => /\\.routes\\.(js|ts)$/.test(f) && !f.endsWith('.d.ts'))
  .sort();

for (const file of routeFiles) {
  const base = file.replace(/\\.routes\\.(js|ts)$/, '');
  const routePath = base === 'auth' || base.endsWith('s') ? \`/\${base}\` : \`/\${base}s\`;
  const mod = await import(pathToFileURL(path.join(__dirname, file)).href);
  if (mod.default) {
    router.use(routePath, mod.default);
  }
}

export default router;
`);
  } else {
    write(`src/routes/index.${ext}`, `
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { Router } from 'express';
import { HTTP_STATUS } from '../constants/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = Router();

// ── Sample route ───────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  res.status(HTTP_STATUS.OK).json({ message: 'connected to backend successfully' });
});

router.get('/sample', (req, res) => {
  res.status(HTTP_STATUS.OK).json({ message: 'connected to backend successfully' });
});

// ── Auto-discover *.routes.js modules ──────────────────────────────────────
const routeFiles = fs.readdirSync(__dirname)
  .filter((f) => f.endsWith('.routes.js'))
  .sort();

for (const file of routeFiles) {
  const base = file.replace(/\\.routes\\.js$/, '');
  const routePath = base === 'auth' || base.endsWith('s') ? \`/\${base}\` : \`/\${base}s\`;
  const mod = await import(pathToFileURL(path.join(__dirname, file)).href);
  if (mod.default) {
    router.use(routePath, mod.default);
  }
}

export default router;
`);
  }

  // src/config/index.js or ts
  if (isTs) {
    write(`src/config/index.${ext}`, `
const env = process.env.NODE_ENV || 'development';
const jwtSecret = process.env.JWT_SECRET || (env === 'production' ? '' : 'change_me_in_production');
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || (env === 'production' ? '' : 'change_me_refresh_in_production');

if (env === 'production' && (!jwtSecret || !jwtRefreshSecret)) {
  throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be set in production');
}

export const config = {
  app: {
    name: process.env.APP_NAME || '${projectName}',
    env,
    port: parseInt(process.env.PORT || '3000', 10),
  },
  cors: {
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
      : env === 'production'
        ? false
        : true,
  },
  jwt: {
    secret: jwtSecret,
    refreshSecret: jwtRefreshSecret,
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  database: {
    url: process.env.DATABASE_URL || '',
  },
};

export default config;
`);
  } else {
    write(`src/config/index.${ext}`, `
const env = process.env.NODE_ENV || 'development';
const jwtSecret = process.env.JWT_SECRET || (env === 'production' ? '' : 'change_me_in_production');
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || (env === 'production' ? '' : 'change_me_refresh_in_production');

if (env === 'production' && (!jwtSecret || !jwtRefreshSecret)) {
  throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be set in production');
}

export const config = {
  app: {
    name: process.env.APP_NAME || '${projectName}',
    env,
    port: parseInt(process.env.PORT, 10) || 3000,
  },
  cors: {
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
      : env === 'production'
        ? false
        : true,
  },
  jwt: {
    secret: jwtSecret,
    refreshSecret: jwtRefreshSecret,
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
  database: {
    url: process.env.DATABASE_URL || '',
  },
};

export default config;
`);
  }

  // src/middleware/errorHandler.js or ts
  if (isTs) {
    write(`src/middleware/errorHandler.${ext}`, `
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError.js';
import { logErrorToFile } from '../utils/logger.js';
import { HTTP_STATUS } from '../constants/index.js';

/**
 * Global error handler — automatically logs all system errors to logs/error-YYYY-MM-DD.txt
 */
export function globalErrorHandler(err: any, req: Request, res: Response, next: NextFunction): Response | void {
  // Automatically write system error to txt file in logs/ folder
  logErrorToFile(err, req);

  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL;
  const message = err.message || 'Internal Server Error';
  const errors = err.errors || undefined;

  if (err instanceof AppError) {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(errors && { errors }),
    });
  }

  if (process.env.NODE_ENV === 'development') {
    console.error('Unhandled Error:', err);
    return res.status(HTTP_STATUS.INTERNAL).json({
      success: false,
      message: err.message,
      stack: err.stack,
    });
  }

  return res.status(HTTP_STATUS.INTERNAL).json({
    success: false,
    message: 'Something went wrong',
  });
}
`);
  } else {
    write(`src/middleware/errorHandler.${ext}`, `
import { AppError } from '../errors/AppError.js';
import { logErrorToFile } from '../utils/logger.js';
import { HTTP_STATUS } from '../constants/index.js';

/**
 * Global error handler — automatically logs all system errors to logs/error-YYYY-MM-DD.txt
 */
export function globalErrorHandler(err, req, res, next) {
  // Automatically write system error to txt file in logs/ folder
  logErrorToFile(err, req);

  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL;
  const message = err.message || 'Internal Server Error';
  const errors = err.errors || undefined;

  if (err instanceof AppError) {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(errors && { errors }),
    });
  }

  if (process.env.NODE_ENV === 'development') {
    console.error('Unhandled Error:', err);
    return res.status(HTTP_STATUS.INTERNAL).json({
      success: false,
      message: err.message,
      stack: err.stack,
    });
  }

  return res.status(HTTP_STATUS.INTERNAL).json({
    success: false,
    message: 'Something went wrong',
  });
}
`);
  }

  // src/middleware/notFound.js or ts
  if (isTs) {
    write(`src/middleware/notFound.${ext}`, `
import { Request, Response } from 'express';
import { HTTP_STATUS } from '../constants/index.js';

export function notFoundHandler(req: Request, res: Response): void {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: \`Route \${req.method} \${req.originalUrl} not found\`,
  });
}
`);
  } else {
    write(`src/middleware/notFound.${ext}`, `
import { HTTP_STATUS } from '../constants/index.js';

export function notFoundHandler(req, res) {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: \`Route \${req.method} \${req.originalUrl} not found\`,
  });
}
`);
  }

  // src/errors/AppError.js or ts
  if (isTs) {
    write(`src/errors/AppError.${ext}`, `
import { HTTP_STATUS } from '../constants/index.js';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public errors: any;

  constructor(message: string, statusCode = HTTP_STATUS.INTERNAL, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, HTTP_STATUS.NOT_FOUND);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', errors = null) {
    super(message, HTTP_STATUS.BAD_REQUEST, errors);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, HTTP_STATUS.UNAUTHORIZED);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, HTTP_STATUS.FORBIDDEN);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, HTTP_STATUS.CONFLICT);
  }
}
`);
  } else {
    write(`src/errors/AppError.${ext}`, `
import { HTTP_STATUS } from '../constants/index.js';

export class AppError extends Error {
  constructor(message, statusCode = HTTP_STATUS.INTERNAL, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, HTTP_STATUS.NOT_FOUND);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', errors = null) {
    super(message, HTTP_STATUS.BAD_REQUEST, errors);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, HTTP_STATUS.UNAUTHORIZED);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, HTTP_STATUS.FORBIDDEN);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, HTTP_STATUS.CONFLICT);
  }
}
`);
  }

  // src/utils/response.js or ts
  if (isTs) {
    write(`src/utils/response.${ext}`, `
import { Response } from 'express';
import { HTTP_STATUS } from '../constants/index.js';

export function sendSuccess(res: Response, data: any = null, message = 'Success', statusCode = HTTP_STATUS.OK): Response {
  const payload: Record<string, any> = { success: true, message };
  if (data !== null) payload.data = data;
  return res.status(statusCode).json(payload);
}

export function sendPaginated(res: Response, data: any, pagination: any): Response {
  return res.status(HTTP_STATUS.OK).json({
    success: true,
    data,
    pagination,
  });
}
`);
  } else {
    write(`src/utils/response.${ext}`, `
import { HTTP_STATUS } from '../constants/index.js';

export function sendSuccess(res, data = null, message = 'Success', statusCode = HTTP_STATUS.OK) {
  const payload = { success: true, message };
  if (data !== null) payload.data = data;
  return res.status(statusCode).json(payload);
}

export function sendPaginated(res, data, pagination) {
  return res.status(HTTP_STATUS.OK).json({
    success: true,
    data,
    pagination,
  });
}
`);
  }

  // src/utils/asyncHandler.js or ts
  if (isTs) {
    write(`src/utils/asyncHandler.${ext}`, `
import { Request, Response, NextFunction, RequestHandler } from 'express';

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
`);
  } else {
    write(`src/utils/asyncHandler.${ext}`, `
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
`);
  }

  // src/utils/pagination.js or ts
  if (isTs) {
    write(`src/utils/pagination.${ext}`, `
import { Request } from 'express';

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
`);
  } else {
    write(`src/utils/pagination.${ext}`, `
export function getPagination(req, defaultLimit = 20, maxLimit = 100) {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const rawLimit = parseInt(req.query.limit, 10) || defaultLimit;
  const limit = Math.min(Math.max(1, rawLimit), maxLimit);
  const offset = (page - 1) * limit;
  const sort = req.query.sort || '-createdAt';
  return { page, limit, offset, sort };
}
`);
  }

  // src/middleware/validate.js or ts
  write(`src/middleware/validate.${ext}`, buildValidateMiddleware(validation, isTs));

  // src/constants/index.js or ts
  write(`src/constants/index.${ext}`, `
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  INTERNAL: 500,
};
`);

  // src/database/index.js or ts
  write(`src/database/index.${ext}`, templates.dbTemplate(database, isTs));

  // .prettierrc
  write('.prettierrc', JSON.stringify({
    semi: true,
    singleQuote: true,
    tabWidth: 2,
    trailingComma: 'es5',
  }, null, 2));

  // eslint.config.js
  if (isTs) {
    write('eslint.config.js', `
import tseslint from 'typescript-eslint';

export default [
  ...tseslint.configs.recommended,
  {
    ignores: ['dist/**', 'node_modules/**', 'logs/**'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
`);
  } else {
    write('eslint.config.js', `
export default [
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
`);
  }

  // jest.config.js for TypeScript ESM
  if (isTs) {
    write('jest.config.js', `
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\\\.{1,2}/.*)\\\\.js$': '$1',
  },
  transform: {
    '^.+\\\\.tsx?$': ['ts-jest', { useESM: true }],
  },
};
`);
  }

  // tests/health.test.js or ts
  write(`tests/health.test.${ext}`, `
import request from 'supertest';
import app from '../src/app.js';

describe('GET /health', () => {
  it('should return 200 ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
`);

  // README.md
  write('README.md', buildReadme(projectName, database, validation, isTs));
}

function buildDependencies(database, validation, isTs) {
  const prod = {
    express: '^4.19.2',
    dotenv: '^16.4.5',
    helmet: '^7.1.0',
    cors: '^2.8.5',
    'express-rate-limit': '^7.4.0',
    'cross-env': '^7.0.3',
    morgan: '^1.10.0',
  };

  if (database === 'prisma') {
    prod['@prisma/client'] = '^5.0.0';
  } else if (database === 'sequelize') {
    prod['sequelize'] = '^6.37.1';
  } else if (database === 'mongoose') {
    prod['mongoose'] = '^8.4.0';
  } else if (database === 'drizzle') {
    prod['drizzle-orm'] = '^0.31.0';
  } else if (database === 'sqlite') {
    prod['better-sqlite3'] = '^9.6.0';
  } else if (database === 'mysql') {
    prod['mysql2'] = '^3.9.8';
  }

  if (validation === 'zod') {
    prod['zod'] = '^3.23.8';
  } else if (validation === 'joi') {
    prod['joi'] = '^17.13.1';
  } else if (validation === 'express-validator') {
    prod['express-validator'] = '^7.1.0';
  }

  const dev = {
    nodemon: '^3.1.4',
    jest: '^29.7.0',
    supertest: '^7.0.0',
    eslint: '^9.15.0',
    prettier: '^3.3.3',
  };

  if (isTs) {
    dev['typescript'] = '^5.4.5';
    dev['ts-node-dev'] = '^2.0.0';
    dev['ts-jest'] = '^29.2.5';
    dev['typescript-eslint'] = '^8.15.0';
    dev['@types/node'] = '^20.12.12';
    dev['@types/express'] = '^4.17.21';
    dev['@types/cors'] = '^2.8.17';
    dev['@types/morgan'] = '^1.9.9';
    dev['@types/jest'] = '^29.5.12';
    dev['@types/supertest'] = '^6.0.2';
    if (database === 'sqlite') {
      dev['@types/better-sqlite3'] = '^7.6.10';
    }
  }

  return { prod, dev };
}

export function buildValidateMiddleware(validation, isTs) {
  const types = isTs ? "import { Request, Response, NextFunction } from 'express';\n" : '';
  const reqResNext = isTs ? 'req: Request, res: Response, next: NextFunction' : 'req, res, next';

  if (validation === 'zod') {
    return `${types}import { BadRequestError } from '../errors/AppError.js';

export function validate(schema${isTs ? ': any' : ''}) {
  return (${reqResNext}) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(new BadRequestError('Validation failed', result.error.flatten()));
    }
    req.body = result.data;
    next();
  };
}
`;
  }

  if (validation === 'joi') {
    return `${types}import { BadRequestError } from '../errors/AppError.js';

export function validate(schema${isTs ? ': any' : ''}) {
  return (${reqResNext}) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      return next(new BadRequestError('Validation failed', error.details.map((d${isTs ? ': any' : ''}) => d.message)));
    }
    req.body = value;
    next();
  };
}
`;
  }

  if (validation === 'express-validator') {
    return `${types}import { validationResult } from 'express-validator';
import { BadRequestError } from '../errors/AppError.js';

export function validate(${reqResNext}) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new BadRequestError('Validation failed', errors.array()));
  }
  next();
}
`;
  }

  return `${types}import { BadRequestError } from '../errors/AppError.js';

export function validate(validatorFn${isTs ? ': (body: any) => string[] | null' : ''}) {
  return (${reqResNext}) => {
    const errors = validatorFn(req.body);
    if (errors && errors.length > 0) {
      return next(new BadRequestError('Validation failed', errors));
    }
    next();
  };
}
`;
}

function buildReadme(projectName, database, validation, isTs) {
  return `# ${projectName}

> A clean, scalable Express.js API generated by **create-clean-express**

## 🚀 Quick Start

\`\`\`bash
npm run dev
\`\`\`

Server runs on http://localhost:3000

## 📁 Project Structure

\`\`\`
src/
├── config/         # App configuration
├── constants/      # App-wide constants
├── controllers/    # Route handlers
├── middleware/     # Express middleware
├── repositories/   # Data access layer
├── routes/         # Route definitions
├── services/       # Business logic layer
├── validators/     # Input validation
├── models/         # Data models
├── utils/          # Utilities (includes logger writing to logs/)
├── errors/         # Custom error classes
├── database/       # Database connection
├── app.${isTs ? 'ts' : 'js'}          # Express app setup
└── server.${isTs ? 'ts' : 'js'}       # Server entry point
logs/               # Auto-generated error log text files (.txt format)
\`\`\`

## ⚡ Generate Code

\`\`\`bash
# Generate a full resource
cex make resource User

# Generate individual pieces
cex make controller User
cex make service User
cex make repository User
cex make route User
cex make middleware Auth
cex make validator User
cex make error NotFound

# Generate auth module
cex make auth

# Add integrations
cex add swagger
cex add docker
\`\`\`

## 🔧 Configuration

- **Language**: ${isTs ? 'TypeScript' : 'JavaScript (ESM)'}
- **Database**: ${database}
- **Validation**: ${validation}
- Config file: \`cex.config.json\`

## 🏥 Health Check

\`GET /health\` — Returns server status and timestamp.
`;
}
