import path from 'path';
import fs from 'fs-extra';

/**
 * Find the project root by looking for cex.config.json or package.json.
 * Starts from cwd and walks up the directory tree.
 * @param {string} [cwd]
 * @returns {string}
 */
export function findProjectRoot(cwd = process.cwd()) {
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
 * @param {string} root
 * @returns {Record<string, any>}
 */
export function loadConfig(root) {
  const cfgPath = path.join(root, 'cex.config.json');
  if (fs.existsSync(cfgPath)) {
    return fs.readJsonSync(cfgPath);
  }
  return {};
}
