export interface SafeAdmin {
  email: string;
  role: 'admin';
}

export interface AdminAuthResponse {
  success: true;
  admin: SafeAdmin;
}

export interface AdminMeResponse {
  success: true;
  admin: SafeAdmin;
}

export interface AdminLogoutResponse {
  success: true;
  message: string;
}
