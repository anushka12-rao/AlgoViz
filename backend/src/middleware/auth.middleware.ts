import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { SafeUser } from '../types/user';
import { USER_COOKIE_NAME } from '../config/constants';

declare global {
  namespace Express {
    interface Request {
      user?: SafeUser;
    }
  }
}

export function parseCookies(cookieHeader?: string): Record<string, string> {
  if (!cookieHeader) return {};
  const cookies: Record<string, string> = {};
  const pairs = cookieHeader.split(';');
  for (const pair of pairs) {
    const idx = pair.indexOf('=');
    if (idx < 0) continue;
    const key = pair.substring(0, idx).trim();
    const val = pair.substring(idx + 1).trim();
    try {
      cookies[key] = decodeURIComponent(val);
    } catch {
      cookies[key] = val;
    }
  }
  return cookies;
}

export function createAuthMiddleware(authService: AuthService = new AuthService()) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies[USER_COOKIE_NAME];

    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required. Please log in.',
        },
      });
      return;
    }

    try {
      const payload = authService.verifyToken(token);
      req.user = {
        id: payload.userId,
        email: payload.email,
        username: payload.username,
      };
      next();
    } catch {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired authentication session. Please log in again.',
        },
      });
    }
  };
}

export const requireAuth = createAuthMiddleware();
