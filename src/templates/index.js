/**
 * Scaffolding Templates (ESM & TypeScript Support)
 */

export { fileLoggerTemplate, requestIdTemplate } from './logger.js';
export { baseModel, dbTemplate } from './database.js';

// ─────────────────────────────────────────────────────────────────────────────
// Controller template
// ─────────────────────────────────────────────────────────────────────────────
export function controller(pascal, camel, isTs = false) {
  if (isTs) {
    return `import { Request, Response, NextFunction } from 'express';
import { HTTP_STATUS } from '../constants/index.js';

export class ${pascal}Controller {
  /**
   * GET /api/v1/${camel}s
   */
  async index(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(HTTP_STATUS.OK).json({ success: true, data: [] });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/${camel}s/:id
   */
  async show(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      res.status(HTTP_STATUS.OK).json({ success: true, data: { id } });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/${camel}s
   */
  async store(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(HTTP_STATUS.CREATED).json({ success: true, message: '${pascal} created successfully', data: req.body });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/v1/${camel}s/:id
   */
  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      res.status(HTTP_STATUS.OK).json({ success: true, message: '${pascal} updated successfully', data: { id, ...req.body } });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/v1/${camel}s/:id
   */
  async destroy(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(HTTP_STATUS.OK).json({ success: true, message: '${pascal} deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}

export default new ${pascal}Controller();
`;
  }

  return `import { HTTP_STATUS } from '../constants/index.js';

class ${pascal}Controller {
  /**
   * GET /api/v1/${camel}s
   */
  async index(req, res, next) {
    try {
      return res.status(HTTP_STATUS.OK).json({ success: true, data: [] });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/${camel}s/:id
   */
  async show(req, res, next) {
    try {
      const { id } = req.params;
      return res.status(HTTP_STATUS.OK).json({ success: true, data: { id } });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/${camel}s
   */
  async store(req, res, next) {
    try {
      return res.status(HTTP_STATUS.CREATED).json({ success: true, message: '${pascal} created successfully', data: req.body });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/v1/${camel}s/:id
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      return res.status(HTTP_STATUS.OK).json({ success: true, message: '${pascal} updated successfully', data: { id, ...req.body } });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/v1/${camel}s/:id
   */
  async destroy(req, res, next) {
    try {
      const { id } = req.params;
      return res.status(HTTP_STATUS.OK).json({ success: true, message: '${pascal} deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
}

export default new ${pascal}Controller();
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Service template
// ─────────────────────────────────────────────────────────────────────────────
export function service(pascal, camel, isTs = false) {
  if (isTs) {
    return `export class ${pascal}Service {
  /**
   * Execute ${camel} business logic
   */
  async execute(data: any = {}): Promise<any> {
    // TODO: implement business logic
    return data;
  }
}

export default new ${pascal}Service();
`;
  }

  return `class ${pascal}Service {
  /**
   * Execute ${camel} business logic
   */
  async execute(data = {}) {
    // TODO: implement business logic
    return data;
  }
}

export default new ${pascal}Service();
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Repository template
// ─────────────────────────────────────────────────────────────────────────────
export function repository(pascal, camel, isTs = false) {
  if (isTs) {
    return `// TODO: import your database client here
// import { db } from '../database/index.js';

export class ${pascal}Repository {
  /**
   * Find all ${camel}s
   */
  async findAll({ limit = 10, offset = 0 }: { limit?: number; offset?: number } = {}) {
    return { data: [], total: 0 };
  }

  /**
   * Find a ${camel} by id
   */
  async findById(id: string | number) {
    return null;
  }

  /**
   * Create a ${camel}
   */
  async create(data: Record<string, any>) {
    return { id: Date.now(), ...data };
  }

  /**
   * Update a ${camel}
   */
  async update(id: string | number, data: Record<string, any>) {
    return { id, ...data };
  }

  /**
   * Delete a ${camel}
   */
  async delete(id: string | number) {
    return true;
  }
}

export default new ${pascal}Repository();
`;
  }

  return `// TODO: import your database client here
// import { db } from '../database/index.js';

class ${pascal}Repository {
  /**
   * Find all ${camel}s
   */
  async findAll({ limit = 10, offset = 0 } = {}) {
    return { data: [], total: 0 };
  }

  /**
   * Find a ${camel} by id
   */
  async findById(id) {
    return null;
  }

  /**
   * Create a ${camel}
   */
  async create(data) {
    return { id: Date.now(), ...data };
  }

  /**
   * Update a ${camel}
   */
  async update(id, data) {
    return { id, ...data };
  }

  /**
   * Delete a ${camel}
   */
  async delete(id) {
    return true;
  }
}

export default new ${pascal}Repository();
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Middleware template
// ─────────────────────────────────────────────────────────────────────────────
export function middleware(pascal, camel, isTs = false) {
  if (isTs) {
    return `import { Request, Response, NextFunction } from 'express';

/**
 * ${pascal} Middleware
 */
export function ${camel}Middleware(req: Request, res: Response, next: NextFunction): void {
  try {
    // TODO: implement middleware logic
    next();
  } catch (err) {
    next(err);
  }
}
`;
  }

  return `/**
 * ${pascal} Middleware
 */
export function ${camel}Middleware(req, res, next) {
  try {
    // TODO: implement middleware logic
    next();
  } catch (err) {
    next(err);
  }
}
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Validator template
// ─────────────────────────────────────────────────────────────────────────────
export function validator(pascal, camel, isTs = false) {
  if (isTs) {
    return `import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../errors/AppError.js';

/**
 * Validate request body for creating a ${pascal}
 */
export function validate${pascal}Create(req: Request, res: Response, next: NextFunction): void {
  const { body } = req;
  if (!body || Object.keys(body).length === 0) {
    return next(new BadRequestError('Request body is required'));
  }
  next();
}

/**
 * Validate request body for updating a ${pascal}
 */
export function validate${pascal}Update(req: Request, res: Response, next: NextFunction): void {
  const { body } = req;
  if (!body || Object.keys(body).length === 0) {
    return next(new BadRequestError('No fields to update'));
  }
  next();
}
`;
  }

  return `import { BadRequestError } from '../errors/AppError.js';

/**
 * Validate request body for creating a ${pascal}
 */
export function validate${pascal}Create(req, res, next) {
  const { body } = req;
  if (!body || Object.keys(body).length === 0) {
    return next(new BadRequestError('Request body is required'));
  }
  next();
}

/**
 * Validate request body for updating a ${pascal}
 */
export function validate${pascal}Update(req, res, next) {
  const { body } = req;
  if (!body || Object.keys(body).length === 0) {
    return next(new BadRequestError('No fields to update'));
  }
  next();
}
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Route template
// ─────────────────────────────────────────────────────────────────────────────
export function route(pascal, camel, kebab, isTs = false) {
  return `import { Router } from 'express';
import ${pascal}Controller from '../controllers/${pascal}Controller.js';
import { validate${pascal}Create, validate${pascal}Update } from '../validators/${pascal}Validator.js';

const router = Router();

router.get('/', ${pascal}Controller.index.bind(${pascal}Controller));
router.get('/:id', ${pascal}Controller.show.bind(${pascal}Controller));
router.post('/', validate${pascal}Create, ${pascal}Controller.store.bind(${pascal}Controller));
router.put('/:id', validate${pascal}Update, ${pascal}Controller.update.bind(${pascal}Controller));
router.delete('/:id', ${pascal}Controller.destroy.bind(${pascal}Controller));

export default router;
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Standalone Route template (for cex make route)
// ─────────────────────────────────────────────────────────────────────────────
export function standaloneRoute(pascal, camel, kebab, isTs = false) {
  const routePath = kebab.endsWith('s') ? `/${kebab}` : `/${kebab}s`;
  if (isTs) {
    return `import { Router, Request, Response } from 'express';
import { HTTP_STATUS } from '../constants/index.js';

const router = Router();

/**
 * GET /api/v1${routePath}
 */
router.get('/', (req: Request, res: Response) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'GET ${routePath} response',
    data: [],
  });
});

/**
 * GET /api/v1${routePath}/:id
 */
router.get('/:id', (req: Request, res: Response) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: \`GET ${routePath}/\${req.params.id} response\`,
    data: { id: req.params.id },
  });
});

/**
 * POST /api/v1${routePath}
 */
router.post('/', (req: Request, res: Response) => {
  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: '${pascal} created successfully',
    data: req.body,
  });
});

/**
 * PUT /api/v1${routePath}/:id
 */
router.put('/:id', (req: Request, res: Response) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: \`${pascal} updated successfully\`,
    data: { id: req.params.id, ...req.body },
  });
});

/**
 * DELETE /api/v1${routePath}/:id
 */
router.delete('/:id', (req: Request, res: Response) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: '${pascal} deleted successfully',
  });
});

export default router;
`;
  }

  return `import { Router } from 'express';
import { HTTP_STATUS } from '../constants/index.js';

const router = Router();

/**
 * GET /api/v1${routePath}
 */
router.get('/', (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'GET ${routePath} response',
    data: [],
  });
});

/**
 * GET /api/v1${routePath}/:id
 */
router.get('/:id', (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: \`GET ${routePath}/\${req.params.id} response\`,
    data: { id: req.params.id },
  });
});

/**
 * POST /api/v1${routePath}
 */
router.post('/', (req, res) => {
  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: '${pascal} created successfully',
    data: req.body,
  });
});

/**
 * PUT /api/v1${routePath}/:id
 */
router.put('/:id', (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: \`${pascal} updated successfully\`,
    data: { id: req.params.id, ...req.body },
  });
});

/**
 * DELETE /api/v1${routePath}/:id
 */
router.delete('/:id', (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: '${pascal} deleted successfully',
  });
});

export default router;
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// BaseModel template
// BaseModel is re-exported from ./database.js

// ─────────────────────────────────────────────────────────────────────────────
// Model template
// ─────────────────────────────────────────────────────────────────────────────
export function model(pascal, camel, kebab, isTs = false) {
  const tableName = kebab.endsWith('s') ? kebab : `${kebab}s`;
  if (isTs) {
    return `import { BaseModel } from './BaseModel.js';

export class ${pascal}Model extends BaseModel {
  static override tableName = '${tableName}';
}

export default ${pascal}Model;
`;
  }

  return `import { BaseModel } from './BaseModel.js';

export class ${pascal}Model extends BaseModel {
  static tableName = '${tableName}';
}

export default ${pascal}Model;
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Migration template
// ─────────────────────────────────────────────────────────────────────────────
export function migration(name, isTs = false) {
  if (isTs) {
    return `/**
 * Migration: ${name}
 */
export async function up(db: any): Promise<void> {
  // TODO: implement migration UP logic
}

export async function down(db: any): Promise<void> {
  // TODO: implement migration DOWN logic
}
`;
  }

  return `/**
 * Migration: ${name}
 */
export async function up(db) {
  // TODO: implement migration UP logic
}

export async function down(db) {
  // TODO: implement migration DOWN logic
}
`;
}


// ─────────────────────────────────────────────────────────────────────────────
// Utility template
// ─────────────────────────────────────────────────────────────────────────────
export function util(pascal, isTs = false) {
  if (isTs) {
    return `/**
 * ${pascal} utility
 */
export const ${pascal} = {
  // TODO: implement utility methods
};

export default ${pascal};
`;
  }

  return `/**
 * ${pascal} utility
 */
export const ${pascal} = {
  // TODO: implement utility methods
};

export default ${pascal};
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Error class template
// ─────────────────────────────────────────────────────────────────────────────
export function error(pascal, isTs = false) {
  if (isTs) {
    return `import { AppError } from './AppError.js';
import { HTTP_STATUS } from '../constants/index.js';

/**
 * ${pascal} Error
 */
export class ${pascal}Error extends AppError {
  constructor(message: string = '${pascal} error') {
    super(message, HTTP_STATUS.BAD_REQUEST);
    this.name = '${pascal}Error';
  }
}
`;
  }

  return `import { AppError } from './AppError.js';
import { HTTP_STATUS } from '../constants/index.js';

/**
 * ${pascal} Error
 */
export class ${pascal}Error extends AppError {
  constructor(message = '${pascal} error') {
    super(message, HTTP_STATUS.BAD_REQUEST);
    this.name = '${pascal}Error';
  }
}
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Auth templates
// ─────────────────────────────────────────────────────────────────────────────
export function authController(isTs = false) {
  if (isTs) {
    return `import { Request, Response, NextFunction } from 'express';
import AuthService from '../services/AuthService.js';
import { sendSuccess } from '../utils/response.js';
import { HTTP_STATUS } from '../constants/index.js';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.register(req.body);
      sendSuccess(res, result, 'Registration successful', HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.login(req.body);
      sendSuccess(res, result, 'Login successful');
    } catch (err) {
      next(err);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const result = await AuthService.refresh(refreshToken);
      sendSuccess(res, result, 'Token refreshed');
    } catch (err) {
      next(err);
    }
  }

  async logout(req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> {
    try {
      await AuthService.logout(req.user?.id);
      sendSuccess(res, null, 'Logged out successfully');
    } catch (err) {
      next(err);
    }
  }

  async me(req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await AuthService.me(req.user?.id);
      sendSuccess(res, user);
    } catch (err) {
      next(err);
    }
  }
}

export default new AuthController();
`;
  }

  return `import AuthService from '../services/AuthService.js';
import { sendSuccess } from '../utils/response.js';
import { HTTP_STATUS } from '../constants/index.js';

class AuthController {
  async register(req, res, next) {
    try {
      const result = await AuthService.register(req.body);
      return sendSuccess(res, result, 'Registration successful', HTTP_STATUS.CREATED);
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const result = await AuthService.login(req.body);
      return sendSuccess(res, result, 'Login successful');
    } catch (err) {
      next(err);
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const result = await AuthService.refresh(refreshToken);
      return sendSuccess(res, result, 'Token refreshed');
    } catch (err) {
      next(err);
    }
  }

  async logout(req, res, next) {
    try {
      await AuthService.logout(req.user?.id);
      return sendSuccess(res, null, 'Logged out successfully');
    } catch (err) {
      next(err);
    }
  }

  async me(req, res, next) {
    try {
      const user = await AuthService.me(req.user.id);
      return sendSuccess(res, user);
    } catch (err) {
      next(err);
    }
  }
}

export default new AuthController();
`;
}

export function authService(isTs = false) {
  if (isTs) {
    return `import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import AuthRepository from '../repositories/AuthRepository.js';
import config from '../config/index.js';
import { UnauthorizedError, ConflictError } from '../errors/AppError.js';

export class AuthService {
  async register(data: Record<string, any>) {
    const { name, email, password } = data;
    const existing = await AuthRepository.findByEmail(email);
    if (existing) throw new ConflictError('Email already in use');

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await AuthRepository.create({ name, email, password: hashedPassword });

    const token = this._generateToken(user.id);
    return { user: this._sanitize(user), token };
  }

  async login(data: Record<string, any>) {
    const { email, password } = data;
    const user = await AuthRepository.findByEmail(email);
    if (!user) throw new UnauthorizedError('Invalid credentials');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedError('Invalid credentials');

    const token = this._generateToken(user.id);
    const refreshToken = this._generateRefreshToken(user.id);

    return { user: this._sanitize(user), token, refreshToken };
  }

  async refresh(refreshToken: string) {
    try {
      const payload: any = jwt.verify(refreshToken, config.jwt.refreshSecret);
      if (payload.type !== 'refresh') {
        throw new UnauthorizedError('Invalid refresh token');
      }
      const token = this._generateToken(payload.sub);
      return { token };
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  async logout(userId: string | number) {
    return true;
  }

  async me(userId: string | number) {
    const user = await AuthRepository.findById(userId);
    if (!user) throw new UnauthorizedError('User not found');
    return this._sanitize(user);
  }

  private _generateToken(userId: string | number) {
    return jwt.sign({ sub: userId, type: 'access' }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
  }

  private _generateRefreshToken(userId: string | number) {
    return jwt.sign({ sub: userId, type: 'refresh' }, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    });
  }

  private _sanitize(user: any) {
    const { password, ...safe } = user;
    return safe;
  }
}

export default new AuthService();
`;
  }

  return `import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import AuthRepository from '../repositories/AuthRepository.js';
import config from '../config/index.js';
import { UnauthorizedError, ConflictError } from '../errors/AppError.js';

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
      const payload = jwt.verify(refreshToken, config.jwt.refreshSecret);
      if (payload.type !== 'refresh') {
        throw new UnauthorizedError('Invalid refresh token');
      }
      const token = this._generateToken(payload.sub);
      return { token };
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  async logout(userId) {
    return true;
  }

  async me(userId) {
    const user = await AuthRepository.findById(userId);
    if (!user) throw new UnauthorizedError('User not found');
    return this._sanitize(user);
  }

  _generateToken(userId) {
    return jwt.sign({ sub: userId, type: 'access' }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
  }

  _generateRefreshToken(userId) {
    return jwt.sign({ sub: userId, type: 'refresh' }, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    });
  }

  _sanitize(user) {
    const { password, ...safe } = user;
    return safe;
  }
}

export default new AuthService();
`;
}

export function authRepository(isTs = false, database = 'none') {
  if (database === 'sqlite') {
    const typeEmail = isTs ? ': string' : '';
    const typeId = isTs ? ': string | number' : '';
    const typeData = isTs ? ': Record<string, any>' : '';
    const retAny = isTs ? ': Promise<any>' : '';
    return `import db from '../database/index.js';

export class AuthRepository {
  async findByEmail(email${typeEmail})${retAny} {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email) || null;
  }

  async findById(id${typeId})${retAny} {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id) || null;
  }

  async create(data${typeData})${retAny} {
    const stmt = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
    const info = stmt.run(data.name, data.email, data.password);
    return this.findById(info.lastInsertRowid);
  }
}

export default new AuthRepository();
`;
  }

  if (database === 'mysql') {
    const typeEmail = isTs ? ': string' : '';
    const typeId = isTs ? ': string | number' : '';
    const typeData = isTs ? ': Record<string, any>' : '';
    const retAny = isTs ? ': Promise<any>' : '';
    return `import pool from '../database/index.js';

export class AuthRepository {
  async findByEmail(email${typeEmail})${retAny} {
    const [rows]${isTs ? ': any' : ''} = await pool.execute('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
    return rows[0] || null;
  }

  async findById(id${typeId})${retAny} {
    const [rows]${isTs ? ': any' : ''} = await pool.execute('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  }

  async create(data${typeData})${retAny} {
    const [result]${isTs ? ': any' : ''} = await pool.execute(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [data.name, data.email, data.password]
    );
    return this.findById(result.insertId);
  }
}

export default new AuthRepository();
`;
  }

  if (database === 'prisma') {
    const typeEmail = isTs ? ': string' : '';
    const typeId = isTs ? ': string | number' : '';
    const typeData = isTs ? ': Record<string, any>' : '';
    const retAny = isTs ? ': Promise<any>' : '';
    return `import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AuthRepository {
  async findByEmail(email${typeEmail})${retAny} {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id${typeId})${retAny} {
    return prisma.user.findUnique({ where: { id: Number(id) } });
  }

  async create(data${typeData})${retAny} {
    return prisma.user.create({ data: { name: data.name, email: data.email, password: data.password } });
  }
}

export default new AuthRepository();
`;
  }

  if (isTs) {
    return `const users = new Map<string, Record<string, any>>();

export class AuthRepository {
  async findByEmail(email: string): Promise<any> {
    for (const user of users.values()) {
      if (user.email === email) return user;
    }
    return null;
  }

  async findById(id: string | number): Promise<any> {
    return users.get(String(id)) || null;
  }

  async create(data: Record<string, any>): Promise<any> {
    const id = String(Date.now());
    const user = { id, ...data };
    users.set(id, user);
    return user;
  }
}

export default new AuthRepository();
`;
  }

  return `const users = new Map();

class AuthRepository {
  async findByEmail(email) {
    for (const user of users.values()) {
      if (user.email === email) return user;
    }
    return null;
  }

  async findById(id) {
    return users.get(String(id)) || null;
  }

  async create(data) {
    const id = String(Date.now());
    const user = { id, ...data };
    users.set(id, user);
    return user;
  }
}

export default new AuthRepository();
`;
}

export function authMiddleware(isTs = false) {
  if (isTs) {
    return `import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { UnauthorizedError } from '../errors/AppError.js';

export function authMiddleware(req: Request & { user?: any }, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const payload: any = jwt.verify(token, config.jwt.secret);
    if (payload.type && payload.type !== 'access') {
      throw new UnauthorizedError('Invalid token type');
    }
    req.user = { id: payload.sub };
    next();
  } catch (err: any) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Invalid or expired token'));
    }
    next(err);
  }
}

export function optionalAuthMiddleware(req: Request & { user?: any }, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const payload: any = jwt.verify(token, config.jwt.secret);
      if (!payload.type || payload.type === 'access') {
        req.user = { id: payload.sub };
      }
    }
    next();
  } catch {
    next();
  }
}
`;
  }

  return `import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { UnauthorizedError } from '../errors/AppError.js';

export function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, config.jwt.secret);
    if (payload.type && payload.type !== 'access') {
      throw new UnauthorizedError('Invalid token type');
    }
    req.user = { id: payload.sub };
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Invalid or expired token'));
    }
    next(err);
  }
}

export function optionalAuthMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const payload = jwt.verify(token, config.jwt.secret);
      if (!payload.type || payload.type === 'access') {
        req.user = { id: payload.sub };
      }
    }
    next();
  } catch {
    next();
  }
}
`;
}

export function authValidator(isTs = false, validation = 'none') {
  if (validation === 'zod') {
    return `import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
`;
  }

  if (validation === 'joi') {
    return `import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
`;
  }

  if (validation === 'express-validator') {
    return `import { body } from 'express-validator';

export const registerRules = [
  body('name').isString().isLength({ min: 2 }),
  body('email').isEmail(),
  body('password').isString().isLength({ min: 8 }),
];

export const loginRules = [
  body('email').isEmail(),
  body('password').isString().notEmpty(),
];
`;
  }

  const paramType = isTs ? ': Record<string, any>' : '';
  return `export function registerSchema(body${paramType} = {}) {
  const errors${isTs ? ': string[]' : ''} = [];
  if (!body.name || String(body.name).trim().length < 2) errors.push('name must be at least 2 characters');
  if (!body.email || !String(body.email).includes('@')) errors.push('valid email is required');
  if (!body.password || String(body.password).length < 8) errors.push('password must be at least 8 characters');
  return errors;
}

export function loginSchema(body${paramType} = {}) {
  const errors${isTs ? ': string[]' : ''} = [];
  if (!body.email || !String(body.email).includes('@')) errors.push('valid email is required');
  if (!body.password) errors.push('password is required');
  return errors;
}
`;
}

export function authRoute(isTs = false, validation = 'none') {
  if (validation === 'express-validator') {
    return `import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import AuthController from '../controllers/AuthController.js';
import { authMiddleware } from '../middleware/AuthMiddleware.js';
import { validate } from '../middleware/validate.js';
import { registerRules, loginRules } from '../validators/AuthValidator.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authLimiter, ...registerRules, validate, AuthController.register.bind(AuthController));
router.post('/login', authLimiter, ...loginRules, validate, AuthController.login.bind(AuthController));
router.post('/refresh', authLimiter, AuthController.refresh.bind(AuthController));
router.post('/logout', authMiddleware, AuthController.logout.bind(AuthController));
router.get('/me', authMiddleware, AuthController.me.bind(AuthController));

export default router;
`;
  }

  return `import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import AuthController from '../controllers/AuthController.js';
import { authMiddleware } from '../middleware/AuthMiddleware.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../validators/AuthValidator.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authLimiter, validate(registerSchema), AuthController.register.bind(AuthController));
router.post('/login', authLimiter, validate(loginSchema), AuthController.login.bind(AuthController));
router.post('/refresh', authLimiter, AuthController.refresh.bind(AuthController));
router.post('/logout', authMiddleware, AuthController.logout.bind(AuthController));
router.get('/me', authMiddleware, AuthController.me.bind(AuthController));

export default router;
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Test templates
// ─────────────────────────────────────────────────────────────────────────────
export function controllerTest(pascal, camel, isTs = false) {
  return `import request from 'supertest';
import app from '../src/app.js';

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

export function serviceTest(pascal, camel, isTs = false) {
  return `import ${pascal}Service from '../src/services/${pascal}Service.js';

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

// fileLoggerTemplate and dbTemplate are re-exported from ./logger.js and ./database.js
