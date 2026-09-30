import { z } from 'zod';

export const ALGORITHM_ID_REGEX = /^[a-z0-9_]{1,30}$/;

export const updateAlgorithmStatusSchema = z
  .object({
    enabled: z.boolean().optional(),
    is_enabled: z.boolean().optional(),
  })
  .refine(
    (data) => typeof data.enabled === 'boolean' || typeof data.is_enabled === 'boolean',
    {
      message: "A boolean 'enabled' or 'is_enabled' property is required",
    }
  );

export type UpdateAlgorithmStatusInput = z.infer<typeof updateAlgorithmStatusSchema>;
