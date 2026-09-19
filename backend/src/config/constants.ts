import path from 'path';

export const DEFAULT_PORT = 5000;
export const MAX_BODY_SIZE = '100kb';
export const SERVICE_NAME = 'algoviz-backend';
export const DEFAULT_DATABASE_PATH = 'data/algoviz.db';

export const ENGINE_BINARY_NAME = process.platform === 'win32' ? 'algoviz-engine.exe' : 'algoviz-engine';
export const DEFAULT_ENGINE_PATH = path.resolve(__dirname, '../../../', ENGINE_BINARY_NAME);

export const ENGINE_TIMEOUT_MS = 3000;
export const MAX_STDOUT_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_CONCURRENT_PROCESSES = 20;
