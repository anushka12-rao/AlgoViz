import { Router } from 'express';
import { visualizeController } from '../controllers/visualize.controller';

export const visualizeRouter = Router();

visualizeRouter.post('/', visualizeController.handleVisualize);
