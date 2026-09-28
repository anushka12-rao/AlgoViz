import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export function corsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const origin = req.headers.origin;

  // Determine allowed origins from environment
  const configuredOrigins = env.CORS_ORIGIN
    ? env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter((o) => o.length > 0)
    : [];

  let isAllowed = false;

  if (origin) {
    if (configuredOrigins.length > 0) {
      isAllowed = configuredOrigins.includes(origin);
    } else if (env.NODE_ENV !== 'production') {
      // In development / test, permit local frontend development origins by default
      isAllowed =
        origin === 'http://localhost:3000' ||
        origin === 'http://127.0.0.1:3000' ||
        origin === 'http://localhost:5173' ||
        origin === 'http://127.0.0.1:5173';
    }

    if (isAllowed) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
      res.setHeader('Access-Control-Max-Age', '86400');
    }
  }

  // Intercept and resolve preflight OPTIONS requests immediately
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  next();
}
