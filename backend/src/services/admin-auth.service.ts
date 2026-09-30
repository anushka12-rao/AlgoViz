import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { JWT_EXPIRY } from '../config/constants';
import { SafeAdmin, AdminTokenPayload } from '../types/admin';
import { AdminLoginInput } from '../schemas/admin-auth.schema';

export class AdminUnauthorizedError extends Error {
  public statusCode = 401;
  public code = 'UNAUTHORIZED';
  constructor(message: string) {
    super(message);
    this.name = 'AdminUnauthorizedError';
  }
}

export class AdminForbiddenError extends Error {
  public statusCode = 403;
  public code = 'FORBIDDEN';
  constructor(message: string) {
    super(message);
    this.name = 'AdminForbiddenError';
  }
}

export class AdminAuthService {
  public async login(input: AdminLoginInput): Promise<{ admin: SafeAdmin; token: string }> {
    if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD_HASH) {
      throw new AdminUnauthorizedError('Admin credentials are not configured.');
    }

    const emailMatch = input.email.toLowerCase() === env.ADMIN_EMAIL.toLowerCase();
    if (!emailMatch) {
      throw new AdminUnauthorizedError('Invalid email or password.');
    }

    const passwordMatch = await bcrypt.compare(input.password, env.ADMIN_PASSWORD_HASH);
    if (!passwordMatch) {
      throw new AdminUnauthorizedError('Invalid email or password.');
    }

    const admin: SafeAdmin = {
      email: env.ADMIN_EMAIL.toLowerCase(),
      role: 'admin',
    };

    const token = this.generateAdminToken({
      role: 'admin',
      email: admin.email,
      type: 'admin_session',
    });

    return { admin, token };
  }

  public generateAdminToken(payload: AdminTokenPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: JWT_EXPIRY });
  }

  public verifyAdminToken(token: string): AdminTokenPayload {
    let decoded: any;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch {
      throw new AdminUnauthorizedError('Invalid or expired admin authentication session.');
    }

    if (
      !decoded ||
      typeof decoded !== 'object' ||
      decoded.role !== 'admin' ||
      decoded.type !== 'admin_session'
    ) {
      throw new AdminForbiddenError('Forbidden. Admin privileges required.');
    }

    return {
      role: 'admin',
      email: decoded.email,
      type: 'admin_session',
    };
  }
}
