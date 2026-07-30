'use strict';

const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const logger = require('../utils/logger');
const { toPascalCase, toCamelCase, toKebabCase } = require('../utils/strings');
const { findProjectRoot } = require('../utils/project');
const templates = require('../templates');

/**
 * Main dispatcher for `cex make <type> <name>`
 */
async function makeCommand(type, name) {
  const root = findProjectRoot();
  const srcDir = path.join(root, 'src');

  if (!fs.existsSync(srcDir)) {
    logger.error('No src/ directory found. Are you inside a cex project?');
    process.exit(1);
  }

  const pascal = toPascalCase(name);
  const camel = toCamelCase(name);
  const kebab = toKebabCase(name);

  logger.section(`Generating ${type}: ${pascal}`);

  switch (type) {
    case 'controller':
      generate(srcDir, 'controllers', `${pascal}Controller.js`, templates.controller(pascal, camel));
      break;

    case 'service':
      generate(srcDir, 'services', `${pascal}Service.js`, templates.service(pascal, camel));
      break;

    case 'repository':
      generate(srcDir, 'repositories', `${pascal}Repository.js`, templates.repository(pascal, camel));
      break;

    case 'middleware':
      generate(srcDir, 'middleware', `${pascal}Middleware.js`, templates.middleware(pascal, camel));
      break;

    case 'validator':
      generate(srcDir, 'validators', `${pascal}Validator.js`, templates.validator(pascal, camel));
      break;

    case 'util':
      generate(srcDir, 'utils', `${pascal}.js`, templates.util(pascal));
      break;

    case 'error':
      generate(srcDir, 'errors', `${pascal}Error.js`, templates.error(pascal));
      break;

    case 'resource':
      generateResource(srcDir, pascal, camel, kebab);
      break;

    case 'auth':
      generateAuth(srcDir);
      break;

    case 'test':
      generateTests(root, pascal, camel);
      break;

    default:
      logger.error(`Unknown type: ${type}`);
      process.exit(1);
  }

  logger.newline();
  logger.success(chalk.bold('Done!'));
  logger.newline();
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function generate(srcDir, folder, filename, content) {
  const filePath = path.join(srcDir, folder, filename);
  if (fs.existsSync(filePath)) {
    logger.warn(`Already exists: src/${folder}/${filename}`);
    return;
  }
  fs.outputFileSync(filePath, content);
  logger.success(`Created: src/${folder}/${filename}`);
}

function generateResource(srcDir, pascal, camel, kebab) {
  generate(srcDir, 'controllers', `${pascal}Controller.js`, templates.controller(pascal, camel));
  generate(srcDir, 'services', `${pascal}Service.js`, templates.service(pascal, camel));
  generate(srcDir, 'repositories', `${pascal}Repository.js`, templates.repository(pascal, camel));
  generate(srcDir, 'validators', `${pascal}Validator.js`, templates.validator(pascal, camel));
  generate(srcDir, 'routes', `${kebab}.routes.js`, templates.route(pascal, camel, kebab));

  // Auto-update routes/index.js
  updateRoutesIndex(srcDir, pascal, kebab);
}

function generateAuth(srcDir) {
  generate(srcDir, 'controllers', 'AuthController.js', templates.authController());
  generate(srcDir, 'services', 'AuthService.js', templates.authService());
  generate(srcDir, 'repositories', 'AuthRepository.js', templates.authRepository());
  generate(srcDir, 'middleware', 'AuthMiddleware.js', templates.authMiddleware());
  generate(srcDir, 'routes', 'auth.routes.js', templates.authRoute());
  updateRoutesIndexExact(srcDir, 'auth');
}

function generateTests(root, pascal, camel) {
  const testsDir = path.join(root, 'tests');
  fs.mkdirpSync(testsDir);

  const controllerTest = path.join(testsDir, `${camel}.controller.test.js`);
  const serviceTest = path.join(testsDir, `${camel}.service.test.js`);

  if (!fs.existsSync(controllerTest)) {
    fs.outputFileSync(controllerTest, templates.controllerTest(pascal, camel));
    logger.success(`Created: tests/${camel}.controller.test.js`);
  } else {
    logger.warn(`Already exists: tests/${camel}.controller.test.js`);
  }

  if (!fs.existsSync(serviceTest)) {
    fs.outputFileSync(serviceTest, templates.serviceTest(pascal, camel));
    logger.success(`Created: tests/${camel}.service.test.js`);
  } else {
    logger.warn(`Already exists: tests/${camel}.service.test.js`);
  }
}

function updateRoutesIndex(srcDir, pascal, kebab) {
  const indexPath = path.join(srcDir, 'routes', 'index.js');

  if (!fs.existsSync(indexPath)) {
    logger.warn('routes/index.js not found — skipping route registration');
    return;
  }

  let content = fs.readFileSync(indexPath, 'utf8');
  const routePath = `/${kebab}s`;
  const varName = kebab.replace(/-/g, '') + 'Routes';
  const requireLine = `const ${varName} = require('./${kebab}.routes');`;
  const useLine = `router.use('${routePath}', ${varName});`;

  if (content.includes(requireLine)) {
    logger.warn(`Route already registered: ${routePath}`);
    return;
  }

  content = content.replace(
    "// ── Register your routes here ──────────────────────────────────────────────",
    `// ── Register your routes here ──────────────────────────────────────────────\n${requireLine}\n${useLine}`
  );

  if (!content.includes(requireLine)) {
    content = content.replace(
      'module.exports = router;',
      `${requireLine}\n${useLine}\n\nmodule.exports = router;`
    );
  }

  fs.writeFileSync(indexPath, content);
  logger.success(`Updated: src/routes/index.js → registered ${routePath}`);
}

function updateRoutesIndexExact(srcDir, kebab) {
  const indexPath = path.join(srcDir, 'routes', 'index.js');

  if (!fs.existsSync(indexPath)) {
    logger.warn('routes/index.js not found — skipping route registration');
    return;
  }

  let content = fs.readFileSync(indexPath, 'utf8');
  const routePath = `/${kebab}`;
  const varName = kebab.replace(/-/g, '') + 'Routes';
  const requireLine = `const ${varName} = require('./${kebab}.routes');`;
  const useLine = `router.use('${routePath}', ${varName});`;

  if (content.includes(requireLine)) {
    logger.warn(`Route already registered: ${routePath}`);
    return;
  }

  content = content.replace(
    "// ── Register your routes here ──────────────────────────────────────────────",
    `// ── Register your routes here ──────────────────────────────────────────────\n${requireLine}\n${useLine}`
  );

  if (!content.includes(requireLine)) {
    content = content.replace(
      'module.exports = router;',
      `${requireLine}\n${useLine}\n\nmodule.exports = router;`
    );
  }

  fs.writeFileSync(indexPath, content);
  logger.success(`Updated: src/routes/index.js → registered ${routePath}`);
}


module.exports = { makeCommand };
