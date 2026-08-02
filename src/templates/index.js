/**
 * Scaffolding Templates (ESM & TypeScript Support)
 */

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
// ─────────────────────────────────────────────────────────────────────────────
export function baseModel(isTs = false) {
  if (isTs) {
    return `import { db } from '../database/index.js';

export class BaseModel {
  static tableName: string = '';
  static primaryKey: string = 'id';

  /**
   * Find a single record by primary key
   */
  static async find(id: string | number): Promise<any> {
    if (typeof db?.query === 'function') {
      const rows = await db.query(\`SELECT * FROM \${this.getTableName()} WHERE \${this.primaryKey} = ? LIMIT 1\`, [id]);
      return rows[0] || null;
    }
    if (typeof db?.select === 'function') {
      const rows = await db.select().from(this.getTableName()).where({ [this.primaryKey]: id }).limit(1);
      return rows[0] || null;
    }
    return null;
  }

  /**
   * Find all records matching optional conditions
   */
  static async findAll(where: Record<string, any> = {}): Promise<any[]> {
    if (typeof db?.select === 'function') {
      return await db.select().from(this.getTableName()).where(where);
    }
    if (typeof db?.query === 'function') {
      const keys = Object.keys(where);
      if (keys.length === 0) {
        return await db.query(\`SELECT * FROM \${this.getTableName()}\`);
      }
      const clauses = keys.map(k => \`\${k} = ?\`).join(' AND ');
      const values = keys.map(k => where[k]);
      return await db.query(\`SELECT * FROM \${this.getTableName()} WHERE \${clauses}\`, values);
    }
    return [];
  }

  /**
   * Alias for findAll with criteria
   */
  static async where(conditions: Record<string, any>): Promise<any[]> {
    return this.findAll(conditions);
  }

  /**
   * Create a new record
   */
  static async create(data: Record<string, any>): Promise<any> {
    if (typeof db?.insert === 'function') {
      return await db.insert(data).into(this.getTableName());
    }
    if (typeof db?.query === 'function') {
      const keys = Object.keys(data);
      const cols = keys.join(', ');
      const placeholders = keys.map(() => '?').join(', ');
      const values = keys.map(k => data[k]);
      return await db.query(\`INSERT INTO \${this.getTableName()} (\${cols}) VALUES (\${placeholders})\`, values);
    }
    return { [this.primaryKey]: Date.now(), ...data };
  }

  /**
   * Update an existing record
   */
  static async update(id: string | number, data: Record<string, any>): Promise<any> {
    if (typeof db?.where === 'function') {
      return await db(this.getTableName()).where({ [this.primaryKey]: id }).update(data);
    }
    if (typeof db?.query === 'function') {
      const keys = Object.keys(data);
      const setClause = keys.map(k => \`\${k} = ?\`).join(', ');
      const values = [...keys.map(k => data[k]), id];
      return await db.query(\`UPDATE \${this.getTableName()} SET \${setClause} WHERE \${this.primaryKey} = ?\`, values);
    }
    return { [this.primaryKey]: id, ...data };
  }

  /**
   * Delete a record by primary key
   */
  static async delete(id: string | number): Promise<boolean> {
    if (typeof db?.where === 'function') {
      await db(this.getTableName()).where({ [this.primaryKey]: id }).del();
      return true;
    }
    if (typeof db?.query === 'function') {
      await db.query(\`DELETE FROM \${this.getTableName()} WHERE \${this.primaryKey} = ?\`, [id]);
      return true;
    }
    return true;
  }

  /**
   * Execute raw SQL query
   */
  static async query(sql: string, params: any[] = []): Promise<any> {
    if (typeof db?.query === 'function') {
      return await db.query(sql, params);
    }
    if (typeof db?.raw === 'function') {
      return await db.raw(sql, params);
    }
    return null;
  }

  protected static getTableName(): string {
    if (this.tableName) return this.tableName;
    return this.name.toLowerCase() + 's';
  }
}

export default BaseModel;
`;
  }

  return `import { db } from '../database/index.js';

export class BaseModel {
  static tableName = '';
  static primaryKey = 'id';

  /**
   * Find a single record by primary key
   */
  static async find(id) {
    if (typeof db?.query === 'function') {
      const rows = await db.query(\`SELECT * FROM \${this.getTableName()} WHERE \${this.primaryKey} = ? LIMIT 1\`, [id]);
      return rows[0] || null;
    }
    if (typeof db?.select === 'function') {
      const rows = await db.select().from(this.getTableName()).where({ [this.primaryKey]: id }).limit(1);
      return rows[0] || null;
    }
    return null;
  }

  /**
   * Find all records matching optional conditions
   */
  static async findAll(where = {}) {
    if (typeof db?.select === 'function') {
      return await db.select().from(this.getTableName()).where(where);
    }
    if (typeof db?.query === 'function') {
      const keys = Object.keys(where);
      if (keys.length === 0) {
        return await db.query(\`SELECT * FROM \${this.getTableName()}\`);
      }
      const clauses = keys.map(k => \`\${k} = ?\`).join(' AND ');
      const values = keys.map(k => where[k]);
      return await db.query(\`SELECT * FROM \${this.getTableName()} WHERE \${clauses}\`, values);
    }
    return [];
  }

  /**
   * Alias for findAll with criteria
   */
  static async where(conditions) {
    return this.findAll(conditions);
  }

  /**
   * Create a new record
   */
  static async create(data) {
    if (typeof db?.insert === 'function') {
      return await db.insert(data).into(this.getTableName());
    }
    if (typeof db?.query === 'function') {
      const keys = Object.keys(data);
      const cols = keys.join(', ');
      const placeholders = keys.map(() => '?').join(', ');
      const values = keys.map(k => data[k]);
      return await db.query(\`INSERT INTO \${this.getTableName()} (\${cols}) VALUES (\${placeholders})\`, values);
    }
    return { [this.primaryKey]: Date.now(), ...data };
  }

  /**
   * Update an existing record
   */
  static async update(id, data) {
    if (typeof db?.where === 'function') {
      return await db(this.getTableName()).where({ [this.primaryKey]: id }).update(data);
    }
    if (typeof db?.query === 'function') {
      const keys = Object.keys(data);
      const setClause = keys.map(k => \`\${k} = ?\`).join(', ');
      const values = [...keys.map(k => data[k]), id];
      return await db.query(\`UPDATE \${this.getTableName()} SET \${setClause} WHERE \${this.primaryKey} = ?\`, values);
    }
    return { [this.primaryKey]: id, ...data };
  }

  /**
   * Delete a record by primary key
   */
  static async delete(id) {
    if (typeof db?.where === 'function') {
      await db(this.getTableName()).where({ [this.primaryKey]: id }).del();
      return true;
    }
    if (typeof db?.query === 'function') {
      await db.query(\`DELETE FROM \${this.getTableName()} WHERE \${this.primaryKey} = ?\`, [id]);
      return true;
    }
    return true;
  }

  /**
   * Execute raw SQL query
   */
  static async query(sql, params = []) {
    if (typeof db?.query === 'function') {
      return await db.query(sql, params);
    }
    if (typeof db?.raw === 'function') {
      return await db.raw(sql, params);
    }
    return null;
  }

  static getTableName() {
    if (this.tableName) return this.tableName;
    return this.name.toLowerCase() + 's';
  }
}

export default BaseModel;
`;
}

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

/**
 * ${pascal} Error
 */
export class ${pascal}Error extends AppError {
  constructor(message: string = '${pascal} error') {
    super(message, 400);
    this.name = '${pascal}Error';
  }
}
`;
  }

  return `import { AppError } from './AppError.js';

/**
 * ${pascal} Error
 */
export class ${pascal}Error extends AppError {
  constructor(message = '${pascal} error') {
    super(message, 400);
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

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.register(req.body);
      sendSuccess(res, result, 'Registration successful', 201);
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

class AuthController {
  async register(req, res, next) {
    try {
      const result = await AuthService.register(req.body);
      return sendSuccess(res, result, 'Registration successful', 201);
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
      const payload: any = jwt.verify(refreshToken, config.jwt.secret);
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
    return jwt.sign({ sub: userId }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
  }

  private _generateRefreshToken(userId: string | number) {
    return jwt.sign({ sub: userId, type: 'refresh' }, config.jwt.secret, {
      expiresIn: '30d',
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
      const payload = jwt.verify(refreshToken, config.jwt.secret);
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

export default new AuthService();
`;
}

export function authRepository(isTs = false) {
  if (isTs) {
    return `export class AuthRepository {
  async findByEmail(email: string): Promise<any> {
    return null;
  }

  async findById(id: string | number): Promise<any> {
    return null;
  }

  async create(data: Record<string, any>): Promise<any> {
    return { id: Date.now(), ...data };
  }
}

export default new AuthRepository();
`;
  }

  return `class AuthRepository {
  async findByEmail(email) {
    return null;
  }

  async findById(id) {
    return null;
  }

  async create(data) {
    return { id: Date.now(), ...data };
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
      req.user = { id: payload.sub };
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
      req.user = { id: payload.sub };
    }
    next();
  } catch {
    next();
  }
}
`;
}

export function authRoute(isTs = false) {
  return `import { Router } from 'express';
import AuthController from '../controllers/AuthController.js';
import { authMiddleware } from '../middleware/AuthMiddleware.js';

const router = Router();

router.post('/register', AuthController.register.bind(AuthController));
router.post('/login', AuthController.login.bind(AuthController));
router.post('/refresh', AuthController.refresh.bind(AuthController));
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

// ─────────────────────────────────────────────────────────────────────────────
// File Logger Template for Scaffolded Projects
// ─────────────────────────────────────────────────────────────────────────────
export function fileLoggerTemplate(isTs = false) {
  if (isTs) {
    return `import fs from 'fs';
import path from 'path';

const logsDir = path.resolve(process.cwd(), 'logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

export function logErrorToFile(error: any, req?: any): void {
  try {
    const today = new Date().toISOString().split('T')[0];
    const logFilePath = path.join(logsDir, \`error-\${today}.txt\`);
    const timestamp = new Date().toISOString();

    let message = \`[\${timestamp}] ERROR: \${error?.message || error}\\n\`;
    if (req) {
      message += \`Route: \${req.method} \${req.originalUrl}\\n\`;
    }
    if (error?.stack) {
      message += \`Stack: \${error.stack}\\n\`;
    }
    message += \`--------------------------------------------------\\n\\n\`;

    fs.appendFileSync(logFilePath, message, 'utf8');
  } catch (err) {
    console.error('Failed to write to log file:', err);
  }
}
`;
  }

  return `import fs from 'fs';
import path from 'path';

const logsDir = path.resolve(process.cwd(), 'logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

export function logErrorToFile(error, req) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const logFilePath = path.join(logsDir, \`error-\${today}.txt\`);
    const timestamp = new Date().toISOString();

    let message = \`[\${timestamp}] ERROR: \${error?.message || error}\\n\`;
    if (req) {
      message += \`Route: \${req.method} \${req.originalUrl}\\n\`;
    }
    if (error?.stack) {
      message += \`Stack: \${error.stack}\\n\`;
    }
    message += \`--------------------------------------------------\\n\\n\`;

    fs.appendFileSync(logFilePath, message, 'utf8');
  } catch (err) {
    console.error('Failed to write to log file:', err);
  }
}
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Database Driver Connection Templates (SQLite & MySQL)
// ─────────────────────────────────────────────────────────────────────────────
export function dbTemplate(database, isTs = false) {
  if (database === 'sqlite') {
    if (isTs) {
      return `import Database from 'better-sqlite3';
import path from 'path';

const dbPath = process.env.DATABASE_URL || path.resolve(process.cwd(), 'database.sqlite');
export const db = new Database(dbPath);

console.log(\`Connected to SQLite database at \${dbPath}\`);
export default db;
`;
    }
    return `import Database from 'better-sqlite3';
import path from 'path';

const dbPath = process.env.DATABASE_URL || path.resolve(process.cwd(), 'database.sqlite');
export const db = new Database(dbPath);

console.log(\`Connected to SQLite database at \${dbPath}\`);
export default db;
`;
  }

  if (database === 'mysql') {
    if (isTs) {
      return `import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'my_database',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

console.log('MySQL connection pool initialized');
export default pool;
`;
    }
    return `import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'my_database',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

console.log('MySQL connection pool initialized');
export default pool;
`;
  }

  if (isTs) {
    return `// Database connection placeholder
export const db = {};
export default db;
`;
  }

  return `// Database connection placeholder
export const db = {};
export default db;
`;
}
