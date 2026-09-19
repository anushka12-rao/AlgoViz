import express, { Express } from 'express';
import { MAX_BODY_SIZE } from './config/constants';
import { corsMiddleware } from './middleware/cors.middleware';
import { apiRouter } from './routes';
import { notFoundHandler, errorHandler } from './middleware/error.middleware';

export function createApp(): Express {
  const app = express();

  // CORS handling
  app.use(corsMiddleware);

  // Parse JSON bodies with safety size limit
  app.use(express.json({ limit: MAX_BODY_SIZE }));

  // Mount API router
  app.use('/api', apiRouter);

  // 404 Handler for unmatched routes
  app.use(notFoundHandler);

  // Global Error Handler
  app.use(errorHandler);

  return app;
}

export const app = createApp();
