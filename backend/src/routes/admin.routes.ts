import { Router } from 'express';
import { AdminAuthController } from '../controllers/admin-auth.controller';
import { AdminAlgorithmController } from '../controllers/admin-algorithm.controller';
import { requireAdmin } from '../middleware/admin-auth.middleware';

export function createAdminRouter(
  authController: AdminAuthController = new AdminAuthController(),
  algorithmController: AdminAlgorithmController = new AdminAlgorithmController()
): Router {
  const router = Router();

  // Authentication
  router.post('/login', authController.login);
  router.post('/logout', authController.logout);
  router.get('/me', requireAdmin, authController.me);

  // Catalog Management
  router.get('/algorithms', requireAdmin, algorithmController.getAllAlgorithms);
  router.patch('/algorithms/:id', requireAdmin, algorithmController.updateAlgorithmStatus);
  router.put('/algorithms/:id', requireAdmin, algorithmController.updateAlgorithmStatus);

  return router;
}

export const adminRouter = createAdminRouter();

