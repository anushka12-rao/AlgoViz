import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import { AdminAlgorithm, AdminAlgorithmsResponse, AdminAlgorithmResponse } from '../types/admin-catalog';

export async function getAdminAlgorithmsApi(): Promise<AdminAlgorithm[]> {
  const res = await apiClient<AdminAlgorithmsResponse>(API_ENDPOINTS.adminAlgorithms);
  return res.data;
}

export async function updateAlgorithmStatusApi(
  id: string,
  enabled: boolean
): Promise<AdminAlgorithm> {
  const res = await apiClient<AdminAlgorithmResponse>(API_ENDPOINTS.adminAlgorithmStatus(id), {
    method: 'PATCH',
    body: JSON.stringify({ enabled }),
  });
  return res.data;
}
