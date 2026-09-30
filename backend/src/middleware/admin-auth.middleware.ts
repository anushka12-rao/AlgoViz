import { Request, Response, NextFunction } from 'express';
import { AdminAuthService, AdminForbiddenError } from '../services/admin-auth.service';
import { SafeAdmin } from '../types/admin';
import { parseCookies } from './auth.middleware';
import { ADMIN_COOKIE_NAME } from '../config/constants';

declare global {
  namespace Express {
    interface Request {
      admin?: SafeAdmin;
    }
  }
}

export function createAdminAuthMiddleware(adminAuthService: AdminAuthService = new AdminAuthService()) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies[ADMIN_COOKIE_NAME];

    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Admin authentication required. Please log in as administrator.',
        },
      });
      return;
    }

    try {
      const payload = adminAuthService.verifyAdminToken(token);
      req.admin = {
        email: payload.email,
        role: 'admin',
      };
      next();
    } catch (err) {
      if (err instanceof AdminForbiddenError) {
        res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: err.message,
          },
        });
        return;
      }

      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired admin authentication session. Please log in again.',
        },
      });
    }
  };
}

export const requireAdmin = createAdminAuthMiddleware();
