import dotenv from 'dotenv';
import path from 'path';
import { DEFAULT_PORT, DEFAULT_DATABASE_PATH, DEFAULT_ENGINE_PATH } from './constants';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export interface EnvConfig {
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  DATABASE_PATH: string;
  ENGINE_PATH: string;
  CORS_ORIGIN?: string;
  JWT_SECRET: string;
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD_HASH: string;
}

export const env: EnvConfig = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : DEFAULT_PORT,
  NODE_ENV: (process.env.NODE_ENV as EnvConfig['NODE_ENV']) || 'development',
  DATABASE_PATH: process.env.DATABASE_PATH || DEFAULT_DATABASE_PATH,
  ENGINE_PATH: process.env.ENGINE_PATH ? path.resolve(process.env.ENGINE_PATH) : DEFAULT_ENGINE_PATH,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  JWT_SECRET: process.env.JWT_SECRET || (process.env.NODE_ENV === 'test' ? 'test_jwt_secret_dev_only_not_for_prod' : ''),
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || '',
  ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH || '',
};

if (env.NODE_ENV === 'production') {
  if (!env.JWT_SECRET) {
    throw new Error('Fatal: JWT_SECRET environment variable is required in production.');
  }
  if (!env.ADMIN_EMAIL) {
    throw new Error('Fatal: ADMIN_EMAIL environment variable is required in production.');
  }
  if (!env.ADMIN_PASSWORD_HASH) {
    throw new Error('Fatal: ADMIN_PASSWORD_HASH environment variable is required in production.');
  }
}
