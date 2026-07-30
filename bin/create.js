#!/usr/bin/env node
'use strict';

/**
 * Entry point for: npx create-clean-express <project-name>
 */
const { newCommand } = require('../src/commands/new');
const args = process.argv.slice(2);
const projectName = args[0];

if (!projectName) {
  console.error('Usage: npx create-clean-express <project-name>');
  process.exit(1);
}

newCommand(projectName, {
  database: 'none',
  validation: 'none',
  install: true,
  git: true,
});
