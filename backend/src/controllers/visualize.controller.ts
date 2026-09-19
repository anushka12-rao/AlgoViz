import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AlgorithmRepository } from '../repositories/algorithm.repository';
import {
  requestEnvelopeSchema,
  validateAlgorithmInput,
} from '../schemas/visualize.schema';
import { runEngine } from '../engine/engine.runner';
import {
  EngineRequest,
  EngineResponse,
  EngineTimeoutError,
  OutputLimitExceededError,
  ConcurrencyLimitExceededError,
  EngineExecutionError,
  ServiceUnavailableError,
} from '../engine/engine.types';

function formatZodError(error: ZodError): string {
  return error.issues
    .map((issue) => {
      const fieldPath = issue.path.length > 0 ? `'${issue.path.join('.')}' ` : '';
      return `${fieldPath}${issue.message}`.trim();
    })
    .join('; ');
}

export class VisualizeController {
  private repository: AlgorithmRepository;
  private runner: (payload: EngineRequest) => Promise<EngineResponse>;

  constructor(
    repository?: AlgorithmRepository,
    runner: (payload: EngineRequest) => Promise<EngineResponse> = runEngine
  ) {
    this.repository = repository || new AlgorithmRepository();
    this.runner = runner;
  }

  public handleVisualize = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // 1. Envelope validation
      const envelopeParsed = requestEnvelopeSchema.safeParse(req.body);
      if (!envelopeParsed.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: formatZodError(envelopeParsed.error),
          },
        });
        return;
      }

      const { algorithm, input, options } = envelopeParsed.data;

      // 2. Algorithm whitelist & SQLite existence check
      const entity = this.repository.findEnabledById(algorithm);
      if (!entity) {
        res.status(404).json({
          success: false,
          error: {
            code: 'ALGORITHM_NOT_FOUND',
            message: `Algorithm '${algorithm}' not found or is currently unsupported`,
          },
        });
        return;
      }

      // 3. Algorithm-specific input validation
      let validatedInput: any;
      try {
        validatedInput = validateAlgorithmInput(algorithm, input);
      } catch (err) {
        if (err instanceof ZodError) {
          res.status(400).json({
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: formatZodError(err),
            },
          });
          return;
        }
        throw err;
      }

      // 4. Assemble Engine payload
      const payload: EngineRequest = {
        algorithm,
        input: validatedInput,
        options,
      };

      // 5. Invoke C++ Engine Bridge
      const engineResponse = await this.runner(payload);

      // 6. Handle Engine domain error vs success
      if (!engineResponse.success) {
        res.status(422).json({
          success: false,
          error: {
            code: 'ENGINE_DOMAIN_ERROR',
            message: engineResponse.error,
          },
        });
        return;
      }

      res.status(200).json(engineResponse);
    } catch (err: any) {
      if (err instanceof ConcurrencyLimitExceededError) {
        res.status(429).json({
          success: false,
          error: {
            code: err.code,
            message: err.message,
          },
        });
        return;
      }

      if (err instanceof EngineTimeoutError) {
        res.status(504).json({
          success: false,
          error: {
            code: err.code,
            message: err.message,
          },
        });
        return;
      }

      if (err instanceof OutputLimitExceededError) {
        res.status(500).json({
          success: false,
          error: {
            code: err.code,
            message: err.message,
          },
        });
        return;
      }

      if (err instanceof ServiceUnavailableError) {
        res.status(503).json({
          success: false,
          error: {
            code: 'SERVICE_UNAVAILABLE',
            message: 'Visualization engine service is temporarily unavailable',
          },
        });
        return;
      }

      if (err instanceof EngineExecutionError) {
        res.status(500).json({
          success: false,
          error: {
            code: 'ENGINE_EXECUTION_ERROR',
            message: 'Algorithm visualization engine encountered an unexpected internal error',
          },
        });
        return;
      }

      next(err);
    }
  };
}

export const visualizeController = new VisualizeController();
