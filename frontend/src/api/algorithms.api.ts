import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import {
  AlgorithmDTO,
  AlgorithmCatalogResponse,
  AlgorithmDetailResponse,
} from '../types/algorithm';

export async function fetchAlgorithms(): Promise<AlgorithmDTO[]> {
  const response = await apiClient<AlgorithmCatalogResponse>(API_ENDPOINTS.algorithms);
  return response.data.sort((a, b) => a.display_order - b.display_order);
}

export async function fetchAlgorithmById(id: string): Promise<AlgorithmDTO> {
  const response = await apiClient<AlgorithmDetailResponse>(API_ENDPOINTS.algorithmDetail(id));
  return response.data;
}
