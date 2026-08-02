import path from 'path';
import fs from 'fs-extra';
import { execSync } from 'child_process';
import ora from 'ora';
import chalk from 'chalk';
import * as logger from '../utils/logger.js';
import * as templates from '../templates/index.js';

export async function newCommand(projectName, options = {}) {
  const {
    database = 'none',
    validation = 'none',
    typescript = false,
    install = true,
    git = true,
  } = options;

  const targetDir = path.resolve(process.cwd(), projectName);
  const isTs = Boolean(typescript);
  const ext = isTs ? 'ts' : 'js';

  logger.section('Creating new Express project');
  logger.info(`Project: ${chalk.bold(projectName)}`);
  logger.info(`Language: ${chalk.bold(isTs ? 'TypeScript' : 'JavaScript (ESM)')}`);
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
      'src/repositories',
      'src/routes',
      'src/services',
      'src/validators',
      'src/models',
      'src/utils',
      'src/errors',
      'src/database',
      'tests',
      'logs',
    ];

    for (const dir of dirs) {
      fs.mkdirpSync(path.join(targetDir, dir));
    }

    // ── Write project files ────────────────────────────────────────────────
    writeProjectFiles(targetDir, projectName, database, validation, isTs, ext);

    spinner.succeed(chalk.green('Project structure created'));

    // ── Write cex.config.json ──────────────────────────────────────────────
    const config = {
      language: isTs ? 'typescript' : 'javascript',
      module: 'esm',
      architecture: 'layered',
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
    console.log(chalk.green.bold('  🎉 Project ready!'));
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
          start: 'NODE_ENV=production node dist/server.js',
          test: 'echo "No tests yet"',
        }
      : {
          dev: 'node src/server.js',
          start: 'NODE_ENV=production node src/server.js',
          test: 'echo "No tests yet"',
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

# JWT Configuration
JWT_SECRET=change_me_in_production
JWT_EXPIRES_IN=7d
`);

  // .env.example
  write('.env.example', `
NODE_ENV=development
PORT=3000
APP_NAME=${projectName}

${envDbPart}

JWT_SECRET=
JWT_EXPIRES_IN=7d
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
import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { globalErrorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFound.js';
import routes from './routes/index.js';

const app: Application = express();

// ── Security & Parsing ─────────────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Logging ────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ── Health check ───────────────────────────────────────────────────────────
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API Routes ─────────────────────────────────────────────────────────────
app.use('/api/v1', routes);

// ── Error handling ─────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
`);
  } else {
    write(`src/app.${ext}`, `
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { globalErrorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFound.js';
import routes from './routes/index.js';

const app = express();

// ── Security & Parsing ─────────────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Logging ────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ── Health check ───────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API Routes ─────────────────────────────────────────────────────────────
app.use('/api/v1', routes);

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

  // src/routes/index.js or ts
  if (isTs) {
    write(`src/routes/index.${ext}`, `
import { Router, Request, Response } from 'express';

const router = Router();

// ── Sample route ───────────────────────────────────────────────────────────
router.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'connected to backend successfully' });
});

router.get('/sample', (req: Request, res: Response) => {
  res.status(200).json({ message: 'connected to backend successfully' });
});

// ── Register your routes here ──────────────────────────────────────────────
// Example: router.use('/users', userRoutes);

export default router;
`);
  } else {
    write(`src/routes/index.${ext}`, `
import { Router } from 'express';

const router = Router();

// ── Sample route ───────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  res.status(200).json({ message: 'connected to backend successfully' });
});

router.get('/sample', (req, res) => {
  res.status(200).json({ message: 'connected to backend successfully' });
});

// ── Register your routes here ──────────────────────────────────────────────
// Example: router.use('/users', userRoutes);

export default router;
`);
  }

  // src/config/index.js or ts
  if (isTs) {
    write(`src/config/index.${ext}`, `
export const config = {
  app: {
    name: process.env.APP_NAME || '${projectName}',
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'change_me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  database: {
    url: process.env.DATABASE_URL || '',
  },
};

export default config;
`);
  } else {
    write(`src/config/index.${ext}`, `
export const config = {
  app: {
    name: process.env.APP_NAME || '${projectName}',
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 3000,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'change_me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
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

/**
 * Global error handler — automatically logs all system errors to logs/error-YYYY-MM-DD.txt
 */
export function globalErrorHandler(err: any, req: Request, res: Response, next: NextFunction): Response | void {
  // Automatically write system error to txt file in logs/ folder
  logErrorToFile(err, req);

  const statusCode = err.statusCode || 500;
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
    return res.status(500).json({
      success: false,
      message: err.message,
      stack: err.stack,
    });
  }

  return res.status(500).json({
    success: false,
    message: 'Something went wrong',
  });
}
`);
  } else {
    write(`src/middleware/errorHandler.${ext}`, `
import { AppError } from '../errors/AppError.js';
import { logErrorToFile } from '../utils/logger.js';

/**
 * Global error handler — automatically logs all system errors to logs/error-YYYY-MM-DD.txt
 */
export function globalErrorHandler(err, req, res, next) {
  // Automatically write system error to txt file in logs/ folder
  logErrorToFile(err, req);

  const statusCode = err.statusCode || 500;
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
    return res.status(500).json({
      success: false,
      message: err.message,
      stack: err.stack,
    });
  }

  return res.status(500).json({
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

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: \`Route \${req.method} \${req.originalUrl} not found\`,
  });
}
`);
  } else {
    write(`src/middleware/notFound.${ext}`, `
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: \`Route \${req.method} \${req.originalUrl} not found\`,
  });
}
`);
  }

  // src/errors/AppError.js or ts
  if (isTs) {
    write(`src/errors/AppError.${ext}`, `
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public errors: any;

  constructor(message: string, statusCode = 500, errors = null) {
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
    super(message, 404);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', errors = null) {
    super(message, 400, errors);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}
`);
  } else {
    write(`src/errors/AppError.${ext}`, `
export class AppError extends Error {
  constructor(message, statusCode = 500, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', errors = null) {
    super(message, 400, errors);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}
`);
  }

  // src/utils/response.js or ts
  if (isTs) {
    write(`src/utils/response.${ext}`, `
import { Response } from 'express';

export function sendSuccess(res: Response, data: any = null, message = 'Success', statusCode = 200): Response {
  const payload: Record<string, any> = { success: true, message };
  if (data !== null) payload.data = data;
  return res.status(statusCode).json(payload);
}

export function sendPaginated(res: Response, data: any, pagination: any): Response {
  return res.status(200).json({
    success: true,
    data,
    pagination,
  });
}
`);
  } else {
    write(`src/utils/response.${ext}`, `
export function sendSuccess(res, data = null, message = 'Success', statusCode = 200) {
  const payload = { success: true, message };
  if (data !== null) payload.data = data;
  return res.status(statusCode).json(payload);
}

export function sendPaginated(res, data, pagination) {
  return res.status(200).json({
    success: true,
    data,
    pagination,
  });
}
`);
  }

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

  // README.md
  write('README.md', buildReadme(projectName, database, validation, isTs));
}

function buildDependencies(database, validation, isTs) {
  const prod = {
    express: '^4.19.2',
    dotenv: '^16.4.5',
    helmet: '^7.1.0',
    cors: '^2.8.5',
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
  };

  if (isTs) {
    dev['typescript'] = '^5.4.5';
    dev['ts-node-dev'] = '^2.0.0';
    dev['@types/node'] = '^20.12.12';
    dev['@types/express'] = '^4.17.21';
    dev['@types/cors'] = '^2.8.17';
    dev['@types/morgan'] = '^1.9.9';
    if (database === 'sqlite') {
      dev['@types/better-sqlite3'] = '^7.6.10';
    }
  }

  return { prod, dev };
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
