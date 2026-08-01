import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import ora from 'ora';
import * as logger from '../utils/logger.js';
import { findProjectRoot } from '../utils/project.js';

const PLUGINS = {
  swagger: addSwagger,
  docker: addDocker,
  redis: addRedis,
  bullmq: addBullMQ,
  socketio: addSocketIO,
};

export async function addCommand(plugin) {
  const root = findProjectRoot();

  if (!PLUGINS[plugin]) {
    logger.error(`Unknown plugin: ${plugin}`);
    logger.info(`Available plugins: ${Object.keys(PLUGINS).join(', ')}`);
    process.exit(1);
  }

  logger.section(`Adding plugin: ${plugin}`);
  await PLUGINS[plugin](root);
  logger.newline();
  logger.success(chalk.bold(`Plugin ${plugin} added!`));
  logger.newline();
}

// ─────────────────────────────────────────────────────────────────────────────
// Plugin implementations
// ─────────────────────────────────────────────────────────────────────────────

function addSwagger(root) {
  installPackages(root, ['swagger-ui-express', 'swagger-jsdoc']);

  fs.outputFileSync(path.join(root, 'src/config/swagger.js'), `
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'Auto-generated API docs',
    },
    servers: [{ url: '/api/v1' }],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
`.trimStart());

  logger.success('Created src/config/swagger.js');
  logger.info('Add to app.js:');
  logger.info("  import swaggerUi from 'swagger-ui-express';");
  logger.info("  import swaggerSpec from './config/swagger.js';");
  logger.info("  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));");
}

function addDocker(root) {
  fs.outputFileSync(path.join(root, 'Dockerfile'), `
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "src/server.js"]
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
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: mydb
    ports:
      - "5432:5432"
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

function addRedis(root) {
  installPackages(root, ['ioredis']);

  fs.outputFileSync(path.join(root, 'src/config/redis.js'), `
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
});

redis.on('connect', () => console.log('Redis connected'));
redis.on('error', (err) => console.error('Redis error:', err));

export default redis;
`.trimStart());

  logger.success('Created src/config/redis.js');
  logger.info('Add REDIS_HOST, REDIS_PORT, REDIS_PASSWORD to your .env');
}

function addBullMQ(root) {
  installPackages(root, ['bullmq', 'ioredis']);

  fs.outputFileSync(path.join(root, 'src/config/queue.js'), `
import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';

const connection = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  maxRetriesPerRequest: null,
});

export function createQueue(name) {
  return new Queue(name, { connection });
}

export function createWorker(name, processor) {
  return new Worker(name, processor, { connection });
}
`.trimStart());

  logger.success('Created src/config/queue.js');
}

function addSocketIO(root) {
  installPackages(root, ['socket.io']);

  fs.outputFileSync(path.join(root, 'src/config/socket.js'), `
import { Server } from 'socket.io';

export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: '*' },
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

  logger.success('Created src/config/socket.js');
  logger.info("In server.js: import { initSocket } from './config/socket.js';");
  logger.info("Then: const io = initSocket(server);");
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
