'use strict';

const path = require('path');
const fs = require('fs-extra');

/**
 * Find the project root by looking for cex.config.json or package.json
 * Starting from cwd and walking up.
 */
function findProjectRoot(cwd = process.cwd()) {
  let dir = cwd;
  while (true) {
    if (fs.existsSync(path.join(dir, 'cex.config.json'))) return dir;
    if (fs.existsSync(path.join(dir, 'package.json'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break; // reached filesystem root
    dir = parent;
  }
  return cwd;
}

/**
 * Load cex.config.json if it exists at the project root.
 */
function loadConfig(root) {
  const cfgPath = path.join(root, 'cex.config.json');
  if (fs.existsSync(cfgPath)) {
    return fs.readJsonSync(cfgPath);
  }
  return {};
}

module.exports = { findProjectRoot, loadConfig };
