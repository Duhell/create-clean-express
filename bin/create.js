#!/usr/bin/env node

/**
 * Entry point for: npx create-clean-express <project-name>
 */
import enquirer from 'enquirer';
import { newCommand } from '../src/commands/new.js';

const args = process.argv.slice(2);
const projectName = args[0];

if (!projectName) {
  console.error('Usage: npx create-clean-express <project-name>');
  process.exit(1);
}

const isInteractive = Boolean(process.stdin.isTTY && !process.env.CI);

let database = 'none';
let typescript = false;

if (isInteractive) {
  try {
    const dbResponse = await enquirer.prompt({
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
    database = dbResponse.database;

    const tsResponse = await enquirer.prompt({
      type: 'confirm',
      name: 'typescript',
      message: 'Would you like to use TypeScript?',
      initial: true,
    });
    typescript = tsResponse.typescript;
  } catch {
    database = 'none';
    typescript = false;
  }
}

await newCommand(projectName, {
  database,
  typescript,
  validation: 'none',
  install: true,
  git: true,
});
