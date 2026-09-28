import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { UserRepository } from '../repositories/user.repository';
import { SafeUser, AuthTokenPayload } from '../types/user';
import { SignupInput, LoginInput } from '../schemas/auth.schema';
import { env } from '../config/env';
import { BCRYPT_SALT_ROUNDS, JWT_EXPIRY } from '../config/constants';

export class AuthConflictError extends Error {
  public statusCode = 409;
  public code = 'CONFLICT';
  constructor(message: string) {
    super(message);
    this.name = 'AuthConflictError';
  }
}

export class AuthUnauthorizedError extends Error {
  public statusCode = 401;
  public code = 'UNAUTHORIZED';
  constructor(message: string) {
    super(message);
    this.name = 'AuthUnauthorizedError';
  }
}

export class AuthService {
  private userRepo: UserRepository;

  constructor(userRepo?: UserRepository) {
    this.userRepo = userRepo || new UserRepository();
  }

  public async signup(input: SignupInput): Promise<{ user: SafeUser; token: string }> {
    const existingEmail = this.userRepo.findByEmail(input.email);
    if (existingEmail) {
      throw new AuthConflictError('An account with this email address already exists.');
    }

    const existingUsername = this.userRepo.findByUsername(input.username);
    if (existingUsername) {
      throw new AuthConflictError('An account with this username already exists.');
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_SALT_ROUNDS);
    const userId = randomUUID();

    const user = this.userRepo.create({
      id: userId,
      email: input.email,
      username: input.username,
      password_hash: passwordHash,
    });

    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    return { user, token };
  }

  public async login(input: LoginInput): Promise<{ user: SafeUser; token: string }> {
    const userRecord = this.userRepo.findByEmail(input.email);
    if (!userRecord) {
      throw new AuthUnauthorizedError('Invalid email or password.');
    }

    const match = await bcrypt.compare(input.password, userRecord.password_hash);
    if (!match) {
      throw new AuthUnauthorizedError('Invalid email or password.');
    }

    const user: SafeUser = {
      id: userRecord.id,
      email: userRecord.email,
      username: userRecord.username,
    };

    const token = this.generateToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    return { user, token };
  }

  public generateToken(payload: AuthTokenPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: JWT_EXPIRY });
  }

  public verifyToken(token: string): AuthTokenPayload {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as AuthTokenPayload;
      return decoded;
    } catch {
      throw new AuthUnauthorizedError('Invalid or expired authentication session.');
    }
  }

  public getSafeUserById(id: string): SafeUser | null {
    return this.userRepo.findById(id);
  }
}
