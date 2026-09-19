import { app } from './app';
import { env } from './config/env';

const server = app.listen(env.PORT, () => {
  console.log(`[algoviz-backend] Server listening on port ${env.PORT} (mode: ${env.NODE_ENV})`);
});

function gracefulShutdown(signal: string): void {
  console.log(`[algoviz-backend] Received ${signal}. Gracefully shutting down HTTP server...`);
  server.close(() => {
    console.log('[algoviz-backend] HTTP server closed. Exiting process.');
    process.exit(0);
  });

  // Force exit if shutdown hangs beyond 5 seconds
  setTimeout(() => {
    console.error('[algoviz-backend] Forcing server shutdown after timeout.');
    process.exit(1);
  }, 5000).unref();
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default server;
