export interface SafeAdmin {
  email: string;
  role: 'admin';
}

export interface AdminTokenPayload {
  role: 'admin';
  email: string;
  type: 'admin_session';
}

export interface AdminAuthResponse {
  success: true;
  admin: SafeAdmin;
}
