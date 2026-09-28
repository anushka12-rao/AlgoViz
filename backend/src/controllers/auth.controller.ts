import { Request, Response, NextFunction, CookieOptions } from 'express';
import { AuthService } from '../services/auth.service';
import { signupSchema, loginSchema } from '../schemas/auth.schema';
import { env } from '../config/env';
import { JWT_COOKIE_MAX_AGE_MS } from '../config/constants';

const COOKIE_NAME = 'token';

function getSessionCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: JWT_COOKIE_MAX_AGE_MS,
    path: '/',
  };
}

function getClearCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  };
}

export class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService = new AuthService()) {
    this.authService = authService;
  }

  public signup = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parseResult = signupSchema.safeParse(req.body);
      if (!parseResult.success) {
        const firstIssue = parseResult.error.issues[0];
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: firstIssue?.message || 'Invalid signup input provided.',
          },
        });
        return;
      }

      const { user, token } = await this.authService.signup(parseResult.data);

      res.cookie(COOKIE_NAME, token, getSessionCookieOptions());

      res.status(201).json({
        success: true,
        user,
      });
    } catch (error) {
      next(error);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parseResult = loginSchema.safeParse(req.body);
      if (!parseResult.success) {
        const firstIssue = parseResult.error.issues[0];
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: firstIssue?.message || 'Invalid login credentials format.',
          },
        });
        return;
      }

      const { user, token } = await this.authService.login(parseResult.data);

      res.cookie(COOKIE_NAME, token, getSessionCookieOptions());

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      next(error);
    }
  };

  public me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required. Please log in.',
          },
        });
        return;
      }

      const freshUser = this.authService.getSafeUserById(req.user.id) || req.user;

      res.status(200).json({
        success: true,
        user: freshUser,
      });
    } catch (error) {
      next(error);
    }
  };

  public logout = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.clearCookie(COOKIE_NAME, getClearCookieOptions());

      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}
