import { Request, Response, NextFunction } from 'express';
import { AlgorithmService } from '../services/algorithm.service';

const ID_VALIDATION_REGEX = /^[a-z0-9_]{1,30}$/;

export class AlgorithmController {
  private service: AlgorithmService;

  constructor(service?: AlgorithmService) {
    this.service = service || new AlgorithmService();
  }

  public getAlgorithms = (_req: Request, res: Response, next: NextFunction): void => {
    try {
      const algorithms = this.service.getPublicCatalog();
      res.status(200).json({
        success: true,
        data: algorithms,
      });
    } catch (error) {
      next(error);
    }
  };

  public getAlgorithmById = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const id = req.params.id;

      if (!id || !ID_VALIDATION_REGEX.test(id)) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Algorithm '${id || ''}' not found`,
          },
        });
        return;
      }

      const algorithm = this.service.getAlgorithmById(id);

      if (!algorithm) {
        res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Algorithm '${id}' not found`,
          },
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: algorithm,
      });
    } catch (error) {
      next(error);
    }
  };
}
