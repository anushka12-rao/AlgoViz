import { Request, Response, NextFunction, CookieOptions } from 'express';
import { AdminAuthService } from '../services/admin-auth.service';
import { adminLoginSchema } from '../schemas/admin-auth.schema';
import { env } from '../config/env';
import { ADMIN_COOKIE_NAME, JWT_COOKIE_MAX_AGE_MS } from '../config/constants';

function getAdminCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: JWT_COOKIE_MAX_AGE_MS,
    path: '/',
  };
}

function getClearAdminCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  };
}

export class AdminAuthController {
  private adminAuthService: AdminAuthService;

  constructor(adminAuthService: AdminAuthService = new AdminAuthService()) {
    this.adminAuthService = adminAuthService;
  }

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parseResult = adminLoginSchema.safeParse(req.body);
      if (!parseResult.success) {
        const firstIssue = parseResult.error.issues[0];
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: firstIssue?.message || 'Invalid admin login credentials format.',
          },
        });
        return;
      }

      const { admin, token } = await this.adminAuthService.login(parseResult.data);

      res.cookie(ADMIN_COOKIE_NAME, token, getAdminCookieOptions());

      res.status(200).json({
        success: true,
        admin,
      });
    } catch (error) {
      next(error);
    }
  };

  public me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.admin) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Admin authentication required. Please log in as administrator.',
          },
        });
        return;
      }

      res.status(200).json({
        success: true,
        admin: req.admin,
      });
    } catch (error) {
      next(error);
    }
  };

  public logout = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.clearCookie(ADMIN_COOKIE_NAME, getClearAdminCookieOptions());

      res.status(200).json({
        success: true,
        message: 'Admin logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
