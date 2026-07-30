'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// Controller template
// ─────────────────────────────────────────────────────────────────────────────
function controller(pascal, camel) {
  return `'use strict';

const ${pascal}Service = require('../services/${pascal}Service');
const { sendSuccess, sendPaginated } = require('../utils/response');
const { NotFoundError } = require('../errors/AppError');

class ${pascal}Controller {
  /**
   * GET /api/v1/${camel}s
   * List all ${camel}s (paginated)
   */
  async index(req, res, next) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;

      const { data, total } = await ${pascal}Service.findAll({ page, limit });

      return sendPaginated(res, data, {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/${camel}s/:id
   * Get a single ${camel}
   */
  async show(req, res, next) {
    try {
      const { id } = req.params;
      const item = await ${pascal}Service.findById(id);

      if (!item) throw new NotFoundError('${pascal} not found');

      return sendSuccess(res, item);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/${camel}s
   * Create a new ${camel}
   */
  async store(req, res, next) {
    try {
      const item = await ${pascal}Service.create(req.body);
      return sendSuccess(res, item, '${pascal} created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/v1/${camel}s/:id
   * Update an existing ${camel}
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const item = await ${pascal}Service.update(id, req.body);

      if (!item) throw new NotFoundError('${pascal} not found');

      return sendSuccess(res, item, '${pascal} updated successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/v1/${camel}s/:id
   * Delete a ${camel}
   */
  async destroy(req, res, next) {
    try {
      const { id } = req.params;
      await ${pascal}Service.delete(id);
      return sendSuccess(res, null, '${pascal} deleted successfully');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new ${pascal}Controller();
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Service template
// ─────────────────────────────────────────────────────────────────────────────
function service(pascal, camel) {
  return `'use strict';

const ${pascal}Repository = require('../repositories/${pascal}Repository');
const { NotFoundError, BadRequestError } = require('../errors/AppError');

class ${pascal}Service {
  /**
   * Get all ${camel}s with pagination
   */
  async findAll({ page = 1, limit = 10 } = {}) {
    const offset = (page - 1) * limit;
    return ${pascal}Repository.findAll({ limit, offset });
  }

  /**
   * Get a single ${camel} by id
   */
  async findById(id) {
    const item = await ${pascal}Repository.findById(id);
    if (!item) throw new NotFoundError('${pascal} not found');
    return item;
  }

  /**
   * Create a new ${camel}
   */
  async create(data) {
    // TODO: add business logic / validation here
    return ${pascal}Repository.create(data);
  }

  /**
   * Update an existing ${camel}
   */
  async update(id, data) {
    await this.findById(id); // ensure it exists
    return ${pascal}Repository.update(id, data);
  }

  /**
   * Delete a ${camel}
   */
  async delete(id) {
    await this.findById(id); // ensure it exists
    return ${pascal}Repository.delete(id);
  }
}

module.exports = new ${pascal}Service();
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Repository template
// ─────────────────────────────────────────────────────────────────────────────
function repository(pascal, camel) {
  return `'use strict';

// TODO: import and use your database client here
// Example: const { prisma } = require('../database');

class ${pascal}Repository {
  /**
   * Find all ${camel}s
   */
  async findAll({ limit = 10, offset = 0 } = {}) {
    // TODO: implement with your ORM/query builder
    // Example (Prisma):
    // const [data, total] = await Promise.all([
    //   prisma.${camel}.findMany({ take: limit, skip: offset }),
    //   prisma.${camel}.count(),
    // ]);
    // return { data, total };
    return { data: [], total: 0 };
  }

  /**
   * Find a ${camel} by id
   */
  async findById(id) {
    // TODO: implement
    // return prisma.${camel}.findUnique({ where: { id } });
    return null;
  }

  /**
   * Create a ${camel}
   */
  async create(data) {
    // TODO: implement
    // return prisma.${camel}.create({ data });
    return { id: Date.now(), ...data };
  }

  /**
   * Update a ${camel}
   */
  async update(id, data) {
    // TODO: implement
    // return prisma.${camel}.update({ where: { id }, data });
    return { id, ...data };
  }

  /**
   * Delete a ${camel}
   */
  async delete(id) {
    // TODO: implement
    // return prisma.${camel}.delete({ where: { id } });
    return true;
  }
}

module.exports = new ${pascal}Repository();
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Middleware template
// ─────────────────────────────────────────────────────────────────────────────
function middleware(pascal, camel) {
  return `'use strict';

const { UnauthorizedError } = require('../errors/AppError');

/**
 * ${pascal} Middleware
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function ${camel}Middleware(req, res, next) {
  try {
    // TODO: implement middleware logic
    // Example: validate a token, check permissions, etc.

    // throw new UnauthorizedError('Not authorized');

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { ${camel}Middleware };
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Validator template
// ─────────────────────────────────────────────────────────────────────────────
function validator(pascal, camel) {
  return `'use strict';

const { BadRequestError } = require('../errors/AppError');

// ── Schema ─────────────────────────────────────────────────────────────────
// TODO: define your validation schema here.
// Examples below for different libraries:

// ── Zod ────────────────────────────────────────────────────────────────────
// const { z } = require('zod');
// const create${pascal}Schema = z.object({
//   name: z.string().min(1).max(255),
// });

// ── Joi ────────────────────────────────────────────────────────────────────
// const Joi = require('joi');
// const create${pascal}Schema = Joi.object({
//   name: Joi.string().min(1).max(255).required(),
// });

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validate request body for creating a ${pascal}
 */
function validate${pascal}Create(req, res, next) {
  const { body } = req;

  // TODO: use your schema library of choice
  if (!body || Object.keys(body).length === 0) {
    return next(new BadRequestError('Request body is required'));
  }

  next();
}

/**
 * Validate request body for updating a ${pascal}
 */
function validate${pascal}Update(req, res, next) {
  const { body } = req;

  if (!body || Object.keys(body).length === 0) {
    return next(new BadRequestError('No fields to update'));
  }

  next();
}

module.exports = { validate${pascal}Create, validate${pascal}Update };
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Route template
// ─────────────────────────────────────────────────────────────────────────────
function route(pascal, camel, kebab) {
  return `'use strict';

const express = require('express');
const router = express.Router();
const ${pascal}Controller = require('../controllers/${pascal}Controller');
const { validate${pascal}Create, validate${pascal}Update } = require('../validators/${pascal}Validator');
// const { authMiddleware } = require('../middleware/AuthMiddleware');

/**
 * @swagger
 * tags:
 *   name: ${pascal}s
 *   description: ${pascal} management
 */

/**
 * @swagger
 * /api/v1/${kebab}s:
 *   get:
 *     summary: List all ${pascal}s
 *     tags: [${pascal}s]
 *     responses:
 *       200:
 *         description: A list of ${pascal}s
 */
router.get('/', ${pascal}Controller.index.bind(${pascal}Controller));

/**
 * @swagger
 * /api/v1/${kebab}s/{id}:
 *   get:
 *     summary: Get a ${pascal} by ID
 *     tags: [${pascal}s]
 */
router.get('/:id', ${pascal}Controller.show.bind(${pascal}Controller));

/**
 * @swagger
 * /api/v1/${kebab}s:
 *   post:
 *     summary: Create a ${pascal}
 *     tags: [${pascal}s]
 */
router.post('/', validate${pascal}Create, ${pascal}Controller.store.bind(${pascal}Controller));

/**
 * @swagger
 * /api/v1/${kebab}s/{id}:
 *   put:
 *     summary: Update a ${pascal}
 *     tags: [${pascal}s]
 */
router.put('/:id', validate${pascal}Update, ${pascal}Controller.update.bind(${pascal}Controller));

/**
 * @swagger
 * /api/v1/${kebab}s/{id}:
 *   delete:
 *     summary: Delete a ${pascal}
 *     tags: [${pascal}s]
 */
router.delete('/:id', ${pascal}Controller.destroy.bind(${pascal}Controller));

module.exports = router;
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Utility template
// ─────────────────────────────────────────────────────────────────────────────
function util(pascal) {
  return `'use strict';

/**
 * ${pascal} utility
 */
const ${pascal} = {
  // TODO: implement utility methods
};

module.exports = ${pascal};
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Error class template
// ─────────────────────────────────────────────────────────────────────────────
function error(pascal) {
  return `'use strict';

const { AppError } = require('./AppError');

/**
 * ${pascal} Error
 */
class ${pascal}Error extends AppError {
  constructor(message = '${pascal} error') {
    super(message, 400);
    this.name = '${pascal}Error';
  }
}

module.exports = { ${pascal}Error };
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Auth templates
// ─────────────────────────────────────────────────────────────────────────────
function authController() {
  return `'use strict';

const AuthService = require('../services/AuthService');
const { sendSuccess } = require('../utils/response');

class AuthController {
  /**
   * POST /api/v1/auth/register
   */
  async register(req, res, next) {
    try {
      const result = await AuthService.register(req.body);
      return sendSuccess(res, result, 'Registration successful', 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/auth/login
   */
  async login(req, res, next) {
    try {
      const result = await AuthService.login(req.body);
      return sendSuccess(res, result, 'Login successful');
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/auth/refresh
   */
  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const result = await AuthService.refresh(refreshToken);
      return sendSuccess(res, result, 'Token refreshed');
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/auth/logout
   */
  async logout(req, res, next) {
    try {
      await AuthService.logout(req.user?.id);
      return sendSuccess(res, null, 'Logged out successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/auth/me
   */
  async me(req, res, next) {
    try {
      const user = await AuthService.me(req.user.id);
      return sendSuccess(res, user);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
`;
}

function authService() {
  return `'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AuthRepository = require('../repositories/AuthRepository');
const config = require('../config');
const { UnauthorizedError, ConflictError } = require('../errors/AppError');

class AuthService {
  async register({ name, email, password }) {
    const existing = await AuthRepository.findByEmail(email);
    if (existing) throw new ConflictError('Email already in use');

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await AuthRepository.create({ name, email, password: hashedPassword });

    const token = this._generateToken(user.id);
    return { user: this._sanitize(user), token };
  }

  async login({ email, password }) {
    const user = await AuthRepository.findByEmail(email);
    if (!user) throw new UnauthorizedError('Invalid credentials');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedError('Invalid credentials');

    const token = this._generateToken(user.id);
    const refreshToken = this._generateRefreshToken(user.id);

    return { user: this._sanitize(user), token, refreshToken };
  }

  async refresh(refreshToken) {
    try {
      const payload = jwt.verify(refreshToken, config.jwt.secret);
      const token = this._generateToken(payload.sub);
      return { token };
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  async logout(userId) {
    // TODO: invalidate refresh token in DB / Redis
    return true;
  }

  async me(userId) {
    const user = await AuthRepository.findById(userId);
    if (!user) throw new UnauthorizedError('User not found');
    return this._sanitize(user);
  }

  _generateToken(userId) {
    return jwt.sign({ sub: userId }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
  }

  _generateRefreshToken(userId) {
    return jwt.sign({ sub: userId, type: 'refresh' }, config.jwt.secret, {
      expiresIn: '30d',
    });
  }

  _sanitize(user) {
    const { password, ...safe } = user;
    return safe;
  }
}

module.exports = new AuthService();
`;
}

function authRepository() {
  return `'use strict';

// TODO: import your database client
// const { prisma } = require('../database');

class AuthRepository {
  async findByEmail(email) {
    // return prisma.user.findUnique({ where: { email } });
    return null;
  }

  async findById(id) {
    // return prisma.user.findUnique({ where: { id } });
    return null;
  }

  async create(data) {
    // return prisma.user.create({ data });
    return { id: Date.now(), ...data };
  }
}

module.exports = new AuthRepository();
`;
}

function authMiddleware() {
  return `'use strict';

const jwt = require('jsonwebtoken');
const config = require('../config');
const { UnauthorizedError } = require('../errors/AppError');

/**
 * Verify JWT and attach user to req.user
 */
function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, config.jwt.secret);
    req.user = { id: payload.sub };
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Invalid or expired token'));
    }
    next(err);
  }
}

/**
 * Optional auth — attaches user if token present, but doesn't fail if not
 */
function optionalAuthMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const payload = jwt.verify(token, config.jwt.secret);
      req.user = { id: payload.sub };
    }
    next();
  } catch {
    next();
  }
}

module.exports = { authMiddleware, optionalAuthMiddleware };
`;
}

function authRoute() {
  return `'use strict';

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { authMiddleware } = require('../middleware/AuthMiddleware');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication
 */

router.post('/register', AuthController.register.bind(AuthController));
router.post('/login', AuthController.login.bind(AuthController));
router.post('/refresh', AuthController.refresh.bind(AuthController));
router.post('/logout', authMiddleware, AuthController.logout.bind(AuthController));
router.get('/me', authMiddleware, AuthController.me.bind(AuthController));

module.exports = router;
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Test templates
// ─────────────────────────────────────────────────────────────────────────────
function controllerTest(pascal, camel) {
  return `'use strict';

const request = require('supertest');
const app = require('../src/app');

describe('${pascal}Controller', () => {
  describe('GET /api/v1/${camel}s', () => {
    it('should return 200 with a list', async () => {
      const res = await request(app).get('/api/v1/${camel}s');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/v1/${camel}s', () => {
    it('should create a new ${camel}', async () => {
      const res = await request(app)
        .post('/api/v1/${camel}s')
        .send({ name: 'Test ${pascal}' });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/${camel}s/:id', () => {
    it('should return 404 for unknown id', async () => {
      const res = await request(app).get('/api/v1/${camel}s/999999');
      expect(res.status).toBe(404);
    });
  });
});
`;
}

function serviceTest(pascal, camel) {
  return `'use strict';

const ${pascal}Service = require('../src/services/${pascal}Service');

describe('${pascal}Service', () => {
  describe('findAll', () => {
    it('should return paginated results', async () => {
      const result = await ${pascal}Service.findAll({ page: 1, limit: 10 });
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('create', () => {
    it('should create a ${camel}', async () => {
      const data = { name: 'Test ${pascal}' };
      const result = await ${pascal}Service.create(data);
      expect(result).toMatchObject(data);
    });
  });
});
`;
}

module.exports = {
  controller,
  service,
  repository,
  middleware,
  validator,
  route,
  util,
  error,
  authController,
  authService,
  authRepository,
  authMiddleware,
  authRoute,
  controllerTest,
  serviceTest,
};
