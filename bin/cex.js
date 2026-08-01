#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import enquirer from 'enquirer';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { newCommand } from '../src/commands/new.js';
import { makeCommand } from '../src/commands/make.js';
import { addCommand } from '../src/commands/add.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pkg = fs.readJsonSync(path.join(__dirname, '../package.json'));

console.log(chalk.cyan.bold('\n  ╔═══════════════════════════════╗'));
console.log(chalk.cyan.bold('  ║   Clean Express CLI  (cex)    ║'));
console.log(chalk.cyan.bold('  ╚═══════════════════════════════╝\n'));

program
  .name('cex')
  .description('An opinionated CLI for building clean, scalable Express.js APIs')
  .version(pkg.version, '-v, --version', 'Output the current version');

// cex new <project-name>
program
  .command('new <projectName>')
  .description('Create a new Express project with clean architecture')
  .option('--database <type>', 'Database adapter (sqlite|mysql|prisma|sequelize|mongoose|drizzle|none)')
  .option('--typescript', 'Use TypeScript for the scaffolded project')
  .option('--validation <lib>', 'Validation library (zod|joi|express-validator|none)', 'none')
  .option('--no-install', 'Skip npm install')
  .option('--no-git', 'Skip git init')
  .action(async (projectName, options) => {
    let database = options.database;
    let typescript = options.typescript;

    // Ask for Database if not specified via flag
    if (!database) {
      const response = await enquirer.prompt({
        type: 'select',
        name: 'database',
        message: 'Select a database adapter:',
        choices: [
          { name: 'sqlite', message: 'SQLite (better-sqlite3)' },
          { name: 'mysql', message: 'MySQL (mysql2)' },
          { name: 'prisma', message: 'Prisma ORM' },
          { name: 'sequelize', message: 'Sequelize ORM' },
          { name: 'mongoose', message: 'Mongoose (MongoDB)' },
          { name: 'drizzle', message: 'Drizzle ORM' },
          { name: 'none', message: 'None' },
        ],
      });
      database = response.database;
    }

    // Ask for TypeScript option if not specified via flag
    if (typescript === undefined) {
      const response = await enquirer.prompt({
        type: 'confirm',
        name: 'typescript',
        message: 'Would you like to use TypeScript?',
        initial: true,
      });
      typescript = response.typescript;
    }

    await newCommand(projectName, {
      ...options,
      database,
      typescript,
    });
  });

// cex make <type> <name>
const make = program
  .command('make')
  .description('Generate a project component');

make
  .command('controller <name>')
  .description('Generate a controller')
  .action((name) => makeCommand('controller', name));

make
  .command('service <name>')
  .description('Generate a service')
  .action((name) => makeCommand('service', name));

make
  .command('repository <name>')
  .description('Generate a repository')
  .action((name) => makeCommand('repository', name));

make
  .command('middleware <name>')
  .description('Generate a middleware')
  .action((name) => makeCommand('middleware', name));

make
  .command('validator <name>')
  .description('Generate a validator')
  .action((name) => makeCommand('validator', name));

make
  .command('util <name>')
  .description('Generate a utility')
  .action((name) => makeCommand('util', name));

make
  .command('error <name>')
  .description('Generate a custom error class')
  .action((name) => makeCommand('error', name));

make
  .command('resource <name>')
  .description('Generate a full resource (controller, service, repository, validator, route)')
  .action((name) => makeCommand('resource', name));

make
  .command('auth')
  .description('Generate a complete authentication module')
  .action(() => makeCommand('auth', 'Auth'));

make
  .command('test <name>')
  .description('Generate test files for a resource')
  .action((name) => makeCommand('test', name));

// cex add <plugin>
program
  .command('add <plugin>')
  .description('Add an optional integration (swagger|docker|redis|bullmq|socketio)')
  .action(addCommand);

program.parse(process.argv);
