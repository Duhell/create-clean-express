/**
 * Database connection and BaseModel templates
 */

export function baseModel(isTs = false, database = 'none') {
  const idType = isTs ? ': string | number' : '';
  const recType = isTs ? ': Record<string, any>' : '';
  const promAny = isTs ? ': Promise<any>' : '';
  const promArr = isTs ? ': Promise<any[]>' : '';
  const promBool = isTs ? ': Promise<boolean>' : '';

  if (database === 'sqlite') {
    return `import { db } from '../database/index.js';

export class BaseModel {
  static tableName${isTs ? ': string' : ''} = '';
  static primaryKey${isTs ? ': string' : ''} = 'id';

  static getTableName()${isTs ? ': string' : ''} {
    if (!this.tableName) throw new Error(\`tableName must be defined on \${this.name}\`);
    return this.tableName;
  }

  static async find(id${idType})${promAny} {
    return db.prepare(\`SELECT * FROM \${this.getTableName()} WHERE \${this.primaryKey} = ? LIMIT 1\`).get(id) || null;
  }

  static async findAll(where${recType} = {})${promArr} {
    const keys = Object.keys(where);
    if (keys.length === 0) {
      return db.prepare(\`SELECT * FROM \${this.getTableName()}\`).all();
    }
    const clauses = keys.map((k) => \`\${k} = ?\`).join(' AND ');
    return db.prepare(\`SELECT * FROM \${this.getTableName()} WHERE \${clauses}\`).all(...keys.map((k) => where[k]));
  }

  static async where(conditions${recType})${promArr} {
    return this.findAll(conditions);
  }

  static async create(data${recType})${promAny} {
    const keys = Object.keys(data);
    const cols = keys.join(', ');
    const placeholders = keys.map(() => '?').join(', ');
    const info = db.prepare(\`INSERT INTO \${this.getTableName()} (\${cols}) VALUES (\${placeholders})\`).run(...keys.map((k) => data[k]));
    return this.find(info.lastInsertRowid);
  }

  static async update(id${idType}, data${recType})${promAny} {
    const keys = Object.keys(data);
    const setClause = keys.map((k) => \`\${k} = ?\`).join(', ');
    db.prepare(\`UPDATE \${this.getTableName()} SET \${setClause} WHERE \${this.primaryKey} = ?\`).run(...keys.map((k) => data[k]), id);
    return this.find(id);
  }

  static async delete(id${idType})${promBool} {
    db.prepare(\`DELETE FROM \${this.getTableName()} WHERE \${this.primaryKey} = ?\`).run(id);
    return true;
  }

  static async query(sql${isTs ? ': string' : ''}, params${isTs ? ': any[]' : ''} = [])${promAny} {
    return db.prepare(sql).all(...params);
  }
}

export default BaseModel;
`;
  }

  if (database === 'mysql') {
    return `import { pool } from '../database/index.js';

export class BaseModel {
  static tableName${isTs ? ': string' : ''} = '';
  static primaryKey${isTs ? ': string' : ''} = 'id';

  static getTableName()${isTs ? ': string' : ''} {
    if (!this.tableName) throw new Error(\`tableName must be defined on \${this.name}\`);
    return this.tableName;
  }

  static async find(id${idType})${promAny} {
    const [rows]${isTs ? ': any' : ''} = await pool.execute(
      \`SELECT * FROM \${this.getTableName()} WHERE \${this.primaryKey} = ? LIMIT 1\`,
      [id]
    );
    return rows[0] || null;
  }

  static async findAll(where${recType} = {})${promArr} {
    const keys = Object.keys(where);
    if (keys.length === 0) {
      const [rows]${isTs ? ': any' : ''} = await pool.execute(\`SELECT * FROM \${this.getTableName()}\`);
      return rows;
    }
    const clauses = keys.map((k) => \`\${k} = ?\`).join(' AND ');
    const [rows]${isTs ? ': any' : ''} = await pool.execute(
      \`SELECT * FROM \${this.getTableName()} WHERE \${clauses}\`,
      keys.map((k) => where[k])
    );
    return rows;
  }

  static async where(conditions${recType})${promArr} {
    return this.findAll(conditions);
  }

  static async create(data${recType})${promAny} {
    const keys = Object.keys(data);
    const cols = keys.join(', ');
    const placeholders = keys.map(() => '?').join(', ');
    const [result]${isTs ? ': any' : ''} = await pool.execute(
      \`INSERT INTO \${this.getTableName()} (\${cols}) VALUES (\${placeholders})\`,
      keys.map((k) => data[k])
    );
    return this.find(result.insertId);
  }

  static async update(id${idType}, data${recType})${promAny} {
    const keys = Object.keys(data);
    const setClause = keys.map((k) => \`\${k} = ?\`).join(', ');
    await pool.execute(
      \`UPDATE \${this.getTableName()} SET \${setClause} WHERE \${this.primaryKey} = ?\`,
      [...keys.map((k) => data[k]), id]
    );
    return this.find(id);
  }

  static async delete(id${idType})${promBool} {
    await pool.execute(\`DELETE FROM \${this.getTableName()} WHERE \${this.primaryKey} = ?\`, [id]);
    return true;
  }

  static async query(sql${isTs ? ': string' : ''}, params${isTs ? ': any[]' : ''} = [])${promAny} {
    const [rows] = await pool.execute(sql, params);
    return rows;
  }
}

export default BaseModel;
`;
  }

  if (database === 'prisma') {
    return `import { prisma } from '../database/index.js';

export class BaseModel {
  static modelName${isTs ? ': string' : ''} = '';
  static primaryKey${isTs ? ': string' : ''} = 'id';

  static getModel()${isTs ? ': any' : ''} {
    if (!this.modelName) throw new Error(\`modelName must be defined on \${this.name}\`);
    return (prisma${isTs ? ' as any' : ''})[this.modelName];
  }

  static async find(id${idType})${promAny} {
    return this.getModel().findUnique({ where: { [this.primaryKey]: id } });
  }

  static async findAll(where${recType} = {})${promArr} {
    return this.getModel().findMany({ where });
  }

  static async where(conditions${recType})${promArr} {
    return this.findAll(conditions);
  }

  static async create(data${recType})${promAny} {
    return this.getModel().create({ data });
  }

  static async update(id${idType}, data${recType})${promAny} {
    return this.getModel().update({ where: { [this.primaryKey]: id }, data });
  }

  static async delete(id${idType})${promBool} {
    await this.getModel().delete({ where: { [this.primaryKey]: id } });
    return true;
  }
}

export default BaseModel;
`;
  }

  return `import { db } from '../database/index.js';

export class BaseModel {
  static tableName${isTs ? ': string' : ''} = '';
  static primaryKey${isTs ? ': string' : ''} = 'id';

  static getTableName()${isTs ? ': string' : ''} {
    return this.tableName || this.name.toLowerCase().replace(/model$/, '') + 's';
  }

  static async find(id${idType})${promAny} {
    if (typeof (db${isTs ? ' as any' : ''})?.query === 'function') {
      const rows = await (db${isTs ? ' as any' : ''}).query(\`SELECT * FROM \${this.getTableName()} WHERE \${this.primaryKey} = ? LIMIT 1\`, [id]);
      return rows[0] || null;
    }
    return null;
  }

  static async findAll(where${recType} = {})${promArr} {
    if (typeof (db${isTs ? ' as any' : ''})?.query === 'function') {
      const keys = Object.keys(where);
      if (keys.length === 0) {
        return await (db${isTs ? ' as any' : ''}).query(\`SELECT * FROM \${this.getTableName()}\`);
      }
      const clauses = keys.map((k) => \`\${k} = ?\`).join(' AND ');
      return await (db${isTs ? ' as any' : ''}).query(\`SELECT * FROM \${this.getTableName()} WHERE \${clauses}\`, keys.map((k) => where[k]));
    }
    return [];
  }

  static async where(conditions${recType})${promArr} {
    return this.findAll(conditions);
  }

  static async create(data${recType})${promAny} {
    return { [this.primaryKey]: Date.now(), ...data };
  }

  static async update(id${idType}, data${recType})${promAny} {
    return { [this.primaryKey]: id, ...data };
  }

  static async delete(id${idType})${promBool} {
    return true;
  }

  static async query(sql${isTs ? ': string' : ''}, params${isTs ? ': any[]' : ''} = [])${promAny} {
    if (typeof (db${isTs ? ' as any' : ''})?.query === 'function') {
      return await (db${isTs ? ' as any' : ''}).query(sql, params);
    }
    return [];
  }
}

export default BaseModel;
`;
}

export function dbTemplate(database, isTs = false) {
  if (database === 'sqlite') {
    return `import Database from 'better-sqlite3';
import path from 'path';

const dbPath = process.env.DATABASE_URL || path.resolve(process.cwd(), 'database.sqlite');
export const db = new Database(dbPath);

console.log(\`Connected to SQLite database at \${dbPath}\`);
export default db;
`;
  }

  if (database === 'mysql') {
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

  if (database === 'prisma') {
    return `import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
export const db = prisma;
export default prisma;
`;
  }

  if (database === 'mongoose') {
    return `import mongoose from 'mongoose';

const uri = process.env.DATABASE_URL || 'mongodb://localhost:27017/app';

export async function connectDB() {
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');
  return mongoose;
}

export const db = mongoose;
export default mongoose;
`;
  }

  if (database === 'sequelize') {
    return `import { Sequelize } from 'sequelize';

const uri = process.env.DATABASE_URL || 'sqlite::memory:';
export const sequelize = new Sequelize(uri, { logging: false });
export const db = sequelize;
export default sequelize;
`;
  }

  if (database === 'drizzle') {
    return `// Drizzle ORM connection — configure your driver (pg, mysql2, better-sqlite3)
import { drizzle } from 'drizzle-orm/node-postgres';

export const db = drizzle(process.env.DATABASE_URL || '');
export default db;
`;
  }

  return `// Database connection placeholder
export const db = {};
export default db;
`;
}
