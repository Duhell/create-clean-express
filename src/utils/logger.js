'use strict';

const chalk = require('chalk');

const icons = {
  success: chalk.green('✔'),
  error: chalk.red('✖'),
  info: chalk.cyan('ℹ'),
  warn: chalk.yellow('⚠'),
  arrow: chalk.cyan('→'),
};

function success(msg) {
  console.log(`  ${icons.success} ${chalk.green(msg)}`);
}

function error(msg) {
  console.log(`  ${icons.error} ${chalk.red(msg)}`);
}

function info(msg) {
  console.log(`  ${icons.info} ${chalk.cyan(msg)}`);
}

function warn(msg) {
  console.log(`  ${icons.warn} ${chalk.yellow(msg)}`);
}

function step(msg) {
  console.log(`  ${icons.arrow} ${msg}`);
}

function section(title) {
  console.log('\n' + chalk.bold.underline(title));
}

function newline() {
  console.log('');
}

module.exports = { success, error, info, warn, step, section, newline };
