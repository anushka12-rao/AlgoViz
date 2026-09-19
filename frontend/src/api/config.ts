export const API_BASE_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined)?.trim().replace(/\/+$/, '') || '/api';

export const API_ENDPOINTS = {
  algorithms: `${API_BASE_URL}/algorithms`,
  algorithmDetail: (id: string) => `${API_BASE_URL}/algorithms/${encodeURIComponent(id)}`,
  visualize: `${API_BASE_URL}/visualize`,
} as const;
