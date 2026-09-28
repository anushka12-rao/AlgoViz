export interface User {
  id: string;
  email: string;
  username: string;
  created_at?: string;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  message?: string;
}

export interface MeResponse {
  success: boolean;
  user: User;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}
