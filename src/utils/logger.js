import chalk from 'chalk';

const icons = {
  success: chalk.green('✔'),
  error: chalk.red('✖'),
  info: chalk.cyan('ℹ'),
  warn: chalk.yellow('⚠'),
  arrow: chalk.cyan('→'),
};

export function success(msg) {
  console.log(`  ${icons.success} ${chalk.green(msg)}`);
}

export function error(msg) {
  console.log(`  ${icons.error} ${chalk.red(msg)}`);
}

export function info(msg) {
  console.log(`  ${icons.info} ${chalk.cyan(msg)}`);
}

export function warn(msg) {
  console.log(`  ${icons.warn} ${chalk.yellow(msg)}`);
}

export function step(msg) {
  console.log(`  ${icons.arrow} ${msg}`);
}

export function section(title) {
  console.log('\n' + chalk.bold.underline(title));
}

export function newline() {
  console.log('');
}
