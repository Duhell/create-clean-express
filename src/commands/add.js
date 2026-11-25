import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import ora from 'ora';
import * as logger from '../utils/logger.js';
import { findProjectRoot, loadConfig } from '../utils/project.js';

const PLUGINS = {
  swagger: addSwagger,
  docker: addDocker,
  redis: addRedis,
  bullmq: addBullMQ,
  socketio: addSocketIO,
};

export async function addCommand(plugin) {
  const root = findProjectRoot();
  const config = loadConfig(root);
  const isTs = config.language === 'typescript';

  if (!PLUGINS[plugin]) {
    logger.error(`Unknown plugin: ${plugin}`);
    logger.info(`Available plugins: ${Object.keys(PLUGINS).join(', ')}`);
    process.exit(1);
  }

  logger.section(`Adding plugin: ${plugin}`);
  await PLUGINS[plugin](root, isTs);
  logger.newline();
  logger.success(chalk.bold(`Plugin ${plugin} added!`));
  logger.newline();
}

// ─────────────────────────────────────────────────────────────────────────────
// Plugin implementations
// ─────────────────────────────────────────────────────────────────────────────

function addSwagger(root, isTs = false) {
  const ext = isTs ? 'ts' : 'js';
  const pkgs = ['swagger-ui-express', 'swagger-jsdoc'];
  if (isTs) {
    pkgs.push('@types/swagger-ui-express', '@types/swagger-jsdoc');
  }
  installPackages(root, pkgs);

  fs.outputFileSync(path.join(root, `src/config/swagger.${ext}`), `
import swaggerJsdoc from 'swagger-jsdoc';

const options${isTs ? ': swaggerJsdoc.Options' : ''} = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'Auto-generated API docs',
    },
    servers: [{ url: '/api/v1' }],
  },
  apis: ['./src/routes/*.${ext}'],
};

const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
`.trimStart());

  logger.success(`Created src/config/swagger.${ext}`);
  logger.info('Swagger UI is auto-mounted at /api-docs when src/config/swagger exists.');
}

function addDocker(root, isTs = false) {
  const buildStep = isTs ? 'RUN npm run build\n' : '';
  const cmdTarget = isTs ? 'dist/server.js' : 'src/server.js';

  fs.outputFileSync(path.join(root, 'Dockerfile'), `
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
${buildStep}RUN chown -R node:node /app
USER node
EXPOSE 3000
CMD ["node", "${cmdTarget}"]
`.trimStart());

  fs.outputFileSync(path.join(root, 'docker-compose.yml'), `
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: \${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD:?POSTGRES_PASSWORD is required}
      POSTGRES_DB: \${POSTGRES_DB:-mydb}
    ports:
      - "127.0.0.1:5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
`.trimStart());

  fs.outputFileSync(path.join(root, '.dockerignore'), `
node_modules
.env
*.log
logs/
.git
`.trimStart());

  logger.success('Created Dockerfile');
  logger.success('Created docker-compose.yml');
  logger.success('Created .dockerignore');
}

function addRedis(root, isTs = false) {
  const ext = isTs ? 'ts' : 'js';
  installPackages(root, ['ioredis']);

  fs.outputFileSync(path.join(root, `src/config/redis.${ext}`), `
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
});

redis.on('connect', () => console.log('Redis connected'));
redis.on('error', (err${isTs ? ': Error' : ''}) => console.error('Redis error:', err));

export default redis;
`.trimStart());

  logger.success(`Created src/config/redis.${ext}`);
  logger.info('Add REDIS_HOST, REDIS_PORT, REDIS_PASSWORD to your .env');
}

function addBullMQ(root, isTs = false) {
  const ext = isTs ? 'ts' : 'js';
  installPackages(root, ['bullmq', 'ioredis']);

  fs.outputFileSync(path.join(root, `src/config/queue.${ext}`), `
import { Queue, Worker${isTs ? ', Processor' : ''} } from 'bullmq';
import Redis from 'ioredis';

const connection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  maxRetriesPerRequest: null,
});

export function createQueue(name${isTs ? ': string' : ''}) {
  return new Queue(name, { connection });
}

export function createWorker(name${isTs ? ': string' : ''}, processor${isTs ? ': Processor' : ''}) {
  return new Worker(name, processor, { connection });
}
`.trimStart());

  logger.success(`Created src/config/queue.${ext}`);
}

function addSocketIO(root, isTs = false) {
  const ext = isTs ? 'ts' : 'js';
  installPackages(root, ['socket.io']);

  fs.outputFileSync(path.join(root, `src/config/socket.${ext}`), `
import { Server } from 'socket.io';${isTs ? "\nimport type { Server as HttpServer } from 'http';" : ''}

export function initSocket(httpServer${isTs ? ': HttpServer' : ''}) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim()) : false,
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}
`.trimStart());

  logger.success(`Created src/config/socket.${ext}`);
  logger.info("In server: import { initSocket } from './config/socket.js';");
  logger.info('Then: const io = initSocket(server);');
}

// ─────────────────────────────────────────────────────────────────────────────

function installPackages(root, packages) {
  const spinner = ora({ text: `Installing ${packages.join(', ')}...`, color: 'cyan' }).start();
  try {
    execSync(`npm install ${packages.join(' ')}`, { cwd: root, stdio: 'ignore' });
    spinner.succeed(chalk.green(`Installed: ${packages.join(', ')}`));
  } catch {
    spinner.fail(chalk.yellow(`npm install failed — run: npm install ${packages.join(' ')}`));
  }
}
