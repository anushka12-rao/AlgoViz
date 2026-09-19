import { Router } from 'express';
import { AlgorithmController } from '../controllers/algorithm.controller';

export function createAlgorithmRouter(controller?: AlgorithmController): Router {
  const router = Router();
  const ctrl = controller || new AlgorithmController();

  router.get('/', ctrl.getAlgorithms);
  router.get('/:id', ctrl.getAlgorithmById);

  return router;
}

export const algorithmRouter = createAlgorithmRouter();
