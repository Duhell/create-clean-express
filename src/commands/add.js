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
  mail: addMail,
  audit: addAudit,
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
  await PLUGINS[plugin](root, isTs, config.database || 'none');
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

function addMail(root, isTs = false) {
  const ext = isTs ? 'ts' : 'js';
  const pkgs = ['nodemailer'];
  if (isTs) {
    pkgs.push('@types/nodemailer');
  }
  installPackages(root, pkgs);

  fs.outputFileSync(
    path.join(root, `src/config/mail.${ext}`),
    `import nodemailer from 'nodemailer';

export const mailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth:
    process.env.SMTP_USER && process.env.SMTP_PASS
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
      : undefined,
});

export default mailTransporter;
`
  );

  fs.outputFileSync(
    path.join(root, `src/services/MailService.${ext}`),
    `import fs from 'fs';
import mailTransporter from '../config/mail.js';

${isTs ? 'export interface SendMailOptions {\n  to: string;\n  subject: string;\n  html?: string;\n  text?: string;\n}\n\n' : ''}export class MailService {
  ${isTs ? 'private mailQueue: any = null;\n  private mailWorker: any = null;\n\n  ' : ''}async sendMail(${isTs ? '{ to, subject, html, text }: SendMailOptions' : '{ to, subject, html, text }'}) {
    const from = process.env.MAIL_FROM || 'no-reply@example.com';
    return mailTransporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });
  }

  queue(jobOptions${isTs ? ': Record<string, any>' : ''} = {}) {
    return {
      sendMail: async (mailOptions${isTs ? ': SendMailOptions' : ''}) => {
        const queueUrl = new URL('../config/queue.js', import.meta.url);
        if (!fs.existsSync(queueUrl)) {
          return this.sendMail(mailOptions);
        }

        if (!this.mailQueue) {
          const { createQueue, createWorker } = await import('../config/queue.js');
          this.mailQueue = createQueue('mail');
          this.mailWorker = createWorker('mail', async (job${isTs ? ': any' : ''}) => {
            await this.sendMail(job.data);
          });
        }

        return this.mailQueue.add('send-mail', mailOptions, jobOptions);
      },
    };
  }

  async verifyConnection() {
    return mailTransporter.verify();
  }
}

export default new MailService();
`
  );

  logger.success(`Created src/config/mail.${ext}`);
  logger.success(`Created src/services/MailService.${ext}`);
  logger.info('Add SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, MAIL_FROM to your .env');
}

function addAudit(root, isTs = false, database = 'none') {
  const ext = isTs ? 'ts' : 'js';
  const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
  const migrationRel = `src/database/migrations/${timestamp}_create_audit_logs_table.${ext}`;

  // 1. Migration
  let migrationContent;
  if (database === 'sqlite') {
    migrationContent = `import { db } from '../index.js';

export async function up() {
  db.exec(\`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event TEXT NOT NULL,
      entity TEXT,
      entity_id TEXT,
      user_id TEXT,
      old_data TEXT,
      new_data TEXT,
      ip TEXT,
      user_agent TEXT,
      request_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  \`);
}

export async function down() {
  db.exec('DROP TABLE IF EXISTS audit_logs');
}
`;
  } else if (database === 'mysql') {
    migrationContent = `import { pool } from '../index.js';

export async function up() {
  await pool.execute(\`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      event VARCHAR(100) NOT NULL,
      entity VARCHAR(100),
      entity_id VARCHAR(100),
      user_id VARCHAR(100),
      old_data JSON,
      new_data JSON,
      ip VARCHAR(64),
      user_agent TEXT,
      request_id VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  \`);
}

export async function down() {
  await pool.execute('DROP TABLE IF EXISTS audit_logs');
}
`;
  } else {
    migrationContent = `export async function up() {
  // Create audit_logs table:
  // columns: id, event, entity, entity_id, user_id, old_data, new_data, ip, user_agent, request_id, created_at
}

export async function down() {
  // Drop audit_logs table
}
`;
  }

  fs.outputFileSync(path.join(root, migrationRel), migrationContent);

  // 2. AuditService + EventEmitter
  const persistImpl =
    database === 'sqlite'
      ? `    db.prepare(\`
      INSERT INTO audit_logs (event, entity, entity_id, user_id, old_data, new_data, ip, user_agent, request_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    \`).run(
      entry.event,
      entry.entity,
      entry.entityId,
      entry.userId,
      entry.oldData,
      entry.newData,
      entry.ip,
      entry.userAgent,
      entry.requestId
    );`
      : database === 'mysql'
        ? `    await pool.execute(\`
      INSERT INTO audit_logs (event, entity, entity_id, user_id, old_data, new_data, ip, user_agent, request_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    \`, [
      entry.event,
      entry.entity,
      entry.entityId,
      entry.userId,
      entry.oldData,
      entry.newData,
      entry.ip,
      entry.userAgent,
      entry.requestId,
    ]);`
        : `    logger.info('Audit event recorded', entry);`;

  const dbImport =
    database === 'sqlite'
      ? "import { db } from '../database/index.js';\n"
      : database === 'mysql'
        ? "import { pool } from '../database/index.js';\n"
        : '';

  fs.outputFileSync(
    path.join(root, `src/services/AuditService.${ext}`),
    `import { EventEmitter } from 'events';
${dbImport}import { logger } from '../utils/logger.js';

export const auditBus = new EventEmitter();

${isTs ? `export interface AuditPayload {
  event: string;
  entity?: string | null;
  entityId?: string | number | null;
  userId?: string | number | null;
  oldData?: any;
  newData?: any;
  req?: any;
}

` : ''}function safeJson(val${isTs ? ': any' : ''}) {
  if (val === undefined || val === null) return null;
  try {
    return JSON.stringify(val);
  } catch {
    return null;
  }
}

export class AuditService {
  constructor() {
    this._registerListeners();
  }

  _registerListeners() {
    const events = ['auth.login', 'auth.logout', 'auth.register', 'crud.create', 'crud.update', 'crud.delete'];
    for (const event of events) {
      auditBus.on(event, (payload${isTs ? ': Omit<AuditPayload, "event">' : ''}) => {
        this.record({ event, ...payload }).catch((err) => {
          logger.error('Failed to record audit log', { event, error: err?.message });
        });
      });
    }
  }

  emitAuth(event${isTs ? ": 'auth.login' | 'auth.logout' | 'auth.register' | string" : ''}, payload${isTs ? ': Omit<AuditPayload, "event">' : ''} = {}) {
    auditBus.emit(event, { entity: 'auth', ...payload });
  }

  emitCrud(action${isTs ? ": 'create' | 'update' | 'delete'" : ''}, payload${isTs ? ': Omit<AuditPayload, "event">' : ''} = {}) {
    auditBus.emit(\`crud.\${action}\`, payload);
  }

  async record(payload${isTs ? ': AuditPayload' : ''}) {
    const { event, entity = null, entityId = null, userId = null, oldData = null, newData = null, req = null } = payload;
    const entry = {
      event,
      entity,
      entityId: entityId !== null && entityId !== undefined ? String(entityId) : null,
      userId: userId !== null && userId !== undefined ? String(userId) : null,
      oldData: safeJson(oldData),
      newData: safeJson(newData),
      ip: req?.ip || req?.socket?.remoteAddress || null,
      userAgent: req?.headers?.['user-agent'] || null,
      requestId: req?.id || null,
    };

${persistImpl}
    return entry;
  }
}

export default new AuditService();
`
  );

  // 3. AuditMiddleware
  fs.outputFileSync(
    path.join(root, `src/middleware/AuditMiddleware.${ext}`),
    `${isTs ? "import { Request, Response, NextFunction } from 'express';\n" : ''}import AuditService from '../services/AuditService.js';

const METHOD_ACTION${isTs ? ': Record<string, "create" | "update" | "delete">' : ''} = {
  POST: 'create',
  PUT: 'update',
  PATCH: 'update',
  DELETE: 'delete',
};

export function auditMiddleware(entity${isTs ? ': string' : ''}) {
  return (req${isTs ? ': Request & { user?: any; auditOldData?: any; auditNewData?: any; id?: string }' : ''}, res${isTs ? ': Response' : ''}, next${isTs ? ': NextFunction' : ''}) => {
    const action = METHOD_ACTION[req.method];
    if (!action) return next();

    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        AuditService.emitCrud(action, {
          entity,
          entityId: req.params?.id || null,
          userId: req.user?.id || null,
          oldData: req.auditOldData ?? null,
          newData: req.auditNewData ?? (action !== 'delete' ? req.body : null),
          req,
        });
      }
    });

    next();
  };
}
`
  );

  logger.success(`Created ${migrationRel}`);
  logger.success(`Created src/services/AuditService.${ext}`);
  logger.success(`Created src/middleware/AuditMiddleware.${ext}`);
  logger.info('Run "cex migrate" to apply the audit_logs table migration.');
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
