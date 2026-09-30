import { apiClient } from './client';
import { API_ENDPOINTS } from './config';
import { SafeAdmin, AdminAuthResponse, AdminMeResponse, AdminLogoutResponse } from '../types/admin-auth';

export async function adminLoginApi(payload: {
  email: string;
  password: string;
}): Promise<AdminAuthResponse> {
  return apiClient<AdminAuthResponse>(API_ENDPOINTS.adminLogin, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function adminLogoutApi(): Promise<AdminLogoutResponse> {
  return apiClient<AdminLogoutResponse>(API_ENDPOINTS.adminLogout, {
    method: 'POST',
  });
}

export async function getAdminMeApi(): Promise<SafeAdmin | null> {
  try {
    const res = await apiClient<AdminMeResponse>(API_ENDPOINTS.adminMe);
    if (res && res.admin) {
      return res.admin;
    }
    return null;
  } catch {
    return null;
  }
}
