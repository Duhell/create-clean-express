import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import * as logger from '../utils/logger.js';
import { findProjectRoot, loadConfig } from '../utils/project.js';
import { toKebabCase } from '../utils/strings.js';
import * as templates from '../templates/index.js';

/**
 * Generate a new database migration file
 */
export async function makeMigrationCommand(name) {
  const root = findProjectRoot();
  const srcDir = path.join(root, 'src');

  if (!fs.existsSync(srcDir)) {
    logger.error('No src/ directory found. Are you inside a cex project?');
    process.exit(1);
  }

  const config = loadConfig(root);
  const isTs = config.language === 'typescript';
  const ext = isTs ? 'ts' : 'js';

  const kebab = toKebabCase(name);
  const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
  const filename = `${timestamp}_${kebab}.${ext}`;

  const migrationsDir = path.join(srcDir, 'database', 'migrations');
  fs.mkdirpSync(migrationsDir);

  const filePath = path.join(migrationsDir, filename);
  fs.outputFileSync(filePath, templates.migration(name, isTs));

  logger.success(`Created migration: src/database/migrations/${filename}`);
}

/**
 * Run pending database migrations
 */
export async function migrateCommand() {
  const root = findProjectRoot();
  const srcDir = path.join(root, 'src');

  if (!fs.existsSync(srcDir)) {
    logger.error('No src/ directory found. Are you inside a cex project?');
    process.exit(1);
  }

  const config = loadConfig(root);
  const isTs = config.language === 'typescript';
  const ext = isTs ? 'ts' : 'js';

  const migrationsDir = path.join(srcDir, 'database', 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    logger.warn('No migrations directory found in src/database/migrations');
    return;
  }

  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith(`.js`) || f.endsWith(`.ts`))
    .sort();

  if (files.length === 0) {
    logger.info('No migration files found.');
    return;
  }

  const stateFile = path.join(srcDir, 'database', '.migrations.json');
  let executed = [];
  if (fs.existsSync(stateFile)) {
    try {
      executed = fs.readJsonSync(stateFile);
    } catch {
      executed = [];
    }
  }

  const pending = files.filter(f => !executed.includes(f));
  if (pending.length === 0) {
    logger.info('Database is up to date. No pending migrations.');
    return;
  }

  logger.section(`Running ${pending.length} pending migration(s)...`);

  for (const file of pending) {
    try {
      logger.info(`Migrating: ${file}`);
      const filePath = path.join(migrationsDir, file);
      const mod = await import(`file://${filePath}`);
      if (typeof mod.up === 'function') {
        await mod.up();
      }
      executed.push(file);
      logger.success(`Migrated:  ${file}`);
    } catch (err) {
      logger.error(`Migration failed on ${file}: ${err.message}`);
      break;
    }
  }

  fs.writeJsonSync(stateFile, executed, { spaces: 2 });
  logger.newline();
  logger.success(chalk.bold('Migration run completed.'));
}
