import { apiClient } from './client';
import { API_BASE_URL } from './config';
import {
  EngineRequest,
  EngineSuccessResponse,
} from '../types/engine';

/**
 * Invokes the C++ execution engine via POST /api/visualize.
 * Returns the verified algorithm visualization trace and final result.
 */
export async function visualizeAlgorithm<TInput = Record<string, any>, TResult = Record<string, any>>(
  request: EngineRequest<TInput>
): Promise<EngineSuccessResponse<TResult>> {
  const url = `${API_BASE_URL}/visualize`;
  return apiClient<EngineSuccessResponse<TResult>>(url, {
    method: 'POST',
    body: JSON.stringify(request),
  });
}
