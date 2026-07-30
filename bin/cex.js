#!/usr/bin/env node
'use strict';

const { program } = require('commander');
const chalk = require('chalk');
const { newCommand } = require('../src/commands/new');
const { makeCommand } = require('../src/commands/make');
const { addCommand } = require('../src/commands/add');
const { version } = require('../package.json');

console.log(chalk.cyan.bold('\n  ╔═══════════════════════════════╗'));
console.log(chalk.cyan.bold('  ║   Clean Express CLI  (cex)    ║'));
console.log(chalk.cyan.bold('  ╚═══════════════════════════════╝\n'));

program
  .name('cex')
  .description('An opinionated CLI for building clean, scalable Express.js APIs')
  .version(version, '-v, --version', 'Output the current version');

// cex new <project-name>
program
  .command('new <projectName>')
  .description('Create a new Express project with clean architecture')
  .option('--database <type>', 'Database adapter (prisma|sequelize|mongoose|drizzle|none)', 'none')
  .option('--validation <lib>', 'Validation library (zod|joi|express-validator|none)', 'none')
  .option('--no-install', 'Skip npm install')
  .option('--no-git', 'Skip git init')
  .action(newCommand);

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
