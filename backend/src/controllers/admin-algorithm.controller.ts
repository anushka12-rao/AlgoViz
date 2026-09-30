import { Request, Response, NextFunction } from 'express';
import { AlgorithmService } from '../services/algorithm.service';
import { ALGORITHM_ID_REGEX, updateAlgorithmStatusSchema } from '../schemas/admin-algorithm.schema';

export class AdminAlgorithmController {
  private algorithmService: AlgorithmService;

  constructor(algorithmService: AlgorithmService = new AlgorithmService()) {
    this.algorithmService = algorithmService;
  }

  public getAllAlgorithms = (_req: Request, res: Response, next: NextFunction): void => {
    try {
      const algorithms = this.algorithmService.getAllAlgorithms();
      res.status(200).json({
        success: true,
        data: algorithms,
      });
    } catch (error) {
      next(error);
    }
  };

  public updateAlgorithmStatus = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const { id } = req.params;
      if (!id || !ALGORITHM_ID_REGEX.test(id)) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: `Invalid algorithm identifier format: '${id || ''}'`,
          },
        });
        return;
      }

      const parseResult = updateAlgorithmStatusSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parseResult.error.issues[0]?.message || 'Invalid status payload',
          },
        });
        return;
      }

      const targetEnabled = parseResult.data.enabled !== undefined
        ? parseResult.data.enabled
        : parseResult.data.is_enabled!;

      const updated = this.algorithmService.setAlgorithmEnabled(id, targetEnabled);
      if (!updated) {
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
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  };
}
