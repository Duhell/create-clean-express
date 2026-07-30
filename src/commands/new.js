'use strict';

const path = require('path');
const fs = require('fs-extra');
const { execSync } = require('child_process');
const ora = require('ora');
const chalk = require('chalk');
const logger = require('../utils/logger');

async function newCommand(projectName, options = {}) {
  const {
    database = 'none',
    validation = 'none',
    install = true,
    git = true,
  } = options;

  const targetDir = path.resolve(process.cwd(), projectName);

  logger.section('Creating new Express project');
  logger.info(`Project: ${chalk.bold(projectName)}`);
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
    ];

    for (const dir of dirs) {
      fs.mkdirpSync(path.join(targetDir, dir));
    }

    // ── Write project files ────────────────────────────────────────────────
    writeProjectFiles(targetDir, projectName, database, validation);

    spinner.succeed(chalk.green('Project structure created'));

    // ── Write cex.config.json ──────────────────────────────────────────────
    const config = {
      language: 'javascript',
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

function writeProjectFiles(targetDir, projectName, database, validation) {
  const write = (relPath, content) =>
    fs.outputFileSync(path.join(targetDir, relPath), content.trimStart());

  // package.json
  const deps = buildDependencies(database, validation);
  write('package.json', JSON.stringify({
    name: projectName,
    version: '1.0.0',
    description: `${projectName} — a clean Express.js API`,
    main: 'src/server.js',
    scripts: {
      dev: 'node src/server.js',
      start: 'NODE_ENV=production node src/server.js',
      test: 'echo "No tests yet"',
    },
    dependencies: deps.prod,
    devDependencies: deps.dev,
  }, null, 2));

  // .env
  write('.env', `
NODE_ENV=development
PORT=3000
APP_NAME=${projectName}

# Database
DATABASE_URL=

# JWT
JWT_SECRET=change_me_in_production
JWT_EXPIRES_IN=7d
`);

  // .env.example
  write('.env.example', `
NODE_ENV=development
PORT=3000
APP_NAME=${projectName}

DATABASE_URL=

JWT_SECRET=
JWT_EXPIRES_IN=7d
`);

  // .gitignore
  write('.gitignore', `
node_modules/
.env
dist/
*.log
.DS_Store
`);

  // src/app.js
  write('src/app.js', `
'use strict';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const { globalErrorHandler } = require('./middleware/errorHandler');
const { notFoundHandler } = require('./middleware/notFound');
const routes = require('./routes');

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

module.exports = app;
`);

  // src/server.js
  write('src/server.js', `
'use strict';

require('dotenv').config();
const app = require('./app');

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

module.exports = server;
`);

  // src/routes/index.js
  write('src/routes/index.js', `
'use strict';

const express = require('express');
const router = express.Router();

// ── Register your routes here ──────────────────────────────────────────────
// Example: router.use('/users', require('./user.routes'));

module.exports = router;
`);

  // src/config/index.js
  write('src/config/index.js', `
'use strict';

const config = {
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

module.exports = config;
`);

  // src/middleware/errorHandler.js
  write('src/middleware/errorHandler.js', `
'use strict';

const { AppError } = require('../errors/AppError');

/**
 * Global error handler — must be the last middleware
 */
function globalErrorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || undefined;

  // Operational errors (trusted)
  if (err instanceof AppError) {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(errors && { errors }),
    });
  }

  // Unexpected errors
  if (process.env.NODE_ENV === 'development') {
    console.error('Unhandled Error:', err);
    return res.status(500).json({
      success: false,
      message: err.message,
      stack: err.stack,
    });
  }

  // Production — don't leak details
  return res.status(500).json({
    success: false,
    message: 'Something went wrong',
  });
}

module.exports = { globalErrorHandler };
`);

  // src/middleware/notFound.js
  write('src/middleware/notFound.js', `
'use strict';

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: \`Route \${req.method} \${req.originalUrl} not found\`,
  });
}

module.exports = { notFoundHandler };
`);

  // src/errors/AppError.js
  write('src/errors/AppError.js', `
'use strict';

class AppError extends Error {
  constructor(message, statusCode = 500, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

class BadRequestError extends AppError {
  constructor(message = 'Bad request', errors = null) {
    super(message, 400, errors);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}

module.exports = {
  AppError,
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
};
`);

  // src/utils/response.js
  write('src/utils/response.js', `
'use strict';

/**
 * Send a successful JSON response
 */
function sendSuccess(res, data = null, message = 'Success', statusCode = 200) {
  const payload = { success: true, message };
  if (data !== null) payload.data = data;
  return res.status(statusCode).json(payload);
}

/**
 * Send a paginated JSON response
 */
function sendPaginated(res, data, pagination) {
  return res.status(200).json({
    success: true,
    data,
    pagination,
  });
}

module.exports = { sendSuccess, sendPaginated };
`);

  // src/constants/index.js
  write('src/constants/index.js', `
'use strict';

const HTTP_STATUS = {
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

module.exports = { HTTP_STATUS };
`);

  // src/database/index.js
  write('src/database/index.js', `
'use strict';

// TODO: configure your database connection here
// Example for Prisma:
// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();
// module.exports = { prisma };

module.exports = {};
`);

  // README.md
  write('README.md', buildReadme(projectName, database, validation));
}

function buildDependencies(database, validation) {
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

  return { prod, dev };
}

function buildReadme(projectName, database, validation) {
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
├── utils/          # Utilities
├── errors/         # Custom error classes
├── database/       # Database connection
├── app.js          # Express app setup
└── server.js       # Server entry point
\`\`\`

## ⚡ Generate Code

\`\`\`bash
# Generate a full resource
cex make resource User

# Generate individual pieces
cex make controller User
cex make service User
cex make repository User
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

- **Database**: ${database}
- **Validation**: ${validation}
- Config file: \`cex.config.json\`

## 🏥 Health Check

\`GET /health\` — Returns server status and timestamp.
`;
}

module.exports = { newCommand };
