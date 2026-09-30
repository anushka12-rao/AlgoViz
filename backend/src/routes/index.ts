import { Router, Request, Response } from 'express';
import { SERVICE_NAME } from '../config/constants';
import { algorithmRouter } from './algorithm.routes';
import { visualizeRouter } from './visualize.routes';
import { authRouter } from './auth.routes';
import { adminRouter } from './admin.routes';

export const apiRouter = Router();

apiRouter.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    service: SERVICE_NAME,
    status: 'ok',
  });
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/admin', adminRouter);
apiRouter.use('/algorithms', algorithmRouter);
apiRouter.use('/visualize', visualizeRouter);

