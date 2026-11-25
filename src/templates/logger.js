/**
 * Structured logger & async file error logger templates
 */
export function fileLoggerTemplate(isTs = false) {
  const anyType = isTs ? ': any' : '';
  const strType = isTs ? ': string' : '';
  const metaType = isTs ? ': Record<string, any> = {}' : ' = {}';
  const voidRet = isTs ? ': void' : '';
  const promiseVoid = isTs ? ': Promise<void>' : '';

  return `import fs from 'fs';
import path from 'path';

const logsDir = path.resolve(process.cwd(), 'logs');
const isProd = process.env.NODE_ENV === 'production';

function formatLog(level${strType}, message${strType}, meta${metaType})${strType} {
  if (isProd) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      ...meta,
    });
  }
  const metaStr = Object.keys(meta).length ? \` \${JSON.stringify(meta)}\` : '';
  return \`[\${new Date().toISOString()}] \${level.toUpperCase()}: \${message}\${metaStr}\`;
}

export const logger = {
  info(message${strType}, meta${metaType})${voidRet} {
    console.log(formatLog('info', message, meta));
  },
  warn(message${strType}, meta${metaType})${voidRet} {
    console.warn(formatLog('warn', message, meta));
  },
  error(message${strType}, meta${metaType})${voidRet} {
    console.error(formatLog('error', message, meta));
  },
  debug(message${strType}, meta${metaType})${voidRet} {
    if (!isProd) {
      console.debug(formatLog('debug', message, meta));
    }
  },
};

export async function logErrorToFile(error${anyType}, req${isTs ? '?: any' : ''})${promiseVoid} {
  try {
    await fs.promises.mkdir(logsDir, { recursive: true });
    const today = new Date().toISOString().split('T')[0];
    const logFilePath = path.join(logsDir, \`error-\${today}.txt\`);
    const timestamp = new Date().toISOString();

    let message = \`[\${timestamp}]\${req?.id ? \` [req:\${req.id}]\` : ''} ERROR: \${error?.message || error}\\n\`;
    if (req) {
      message += \`Route: \${req.method} \${req.originalUrl}\\n\`;
    }
    if (error?.stack) {
      message += \`Stack: \${error.stack}\\n\`;
    }
    message += \`--------------------------------------------------\\n\\n\`;

    await fs.promises.appendFile(logFilePath, message, 'utf8');
  } catch (err) {
    console.error('Failed to write to log file:', err);
  }
}
`;
}

export function requestIdTemplate(isTs = false) {
  if (isTs) {
    return `import { randomUUID } from 'crypto';
import { Request, Response, NextFunction } from 'express';

export function requestIdMiddleware(req: Request & { id?: string }, res: Response, next: NextFunction): void {
  const existingId = req.headers['x-request-id'];
  const id = typeof existingId === 'string' && existingId.trim() ? existingId.trim() : randomUUID();
  req.id = id;
  res.setHeader('X-Request-Id', id);
  next();
}
`;
  }

  return `import { randomUUID } from 'crypto';

export function requestIdMiddleware(req, res, next) {
  const existingId = req.headers['x-request-id'];
  const id = typeof existingId === 'string' && existingId.trim() ? existingId.trim() : randomUUID();
  req.id = id;
  res.setHeader('X-Request-Id', id);
  next();
}
`;
}
