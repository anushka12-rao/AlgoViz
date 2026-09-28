export interface UserRecord {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  created_at: string;
}

export interface SafeUser {
  id: string;
  email: string;
  username: string;
  created_at?: string;
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  username: string;
}

export interface AuthSuccessResponse {
  success: true;
  user: SafeUser;
  message?: string;
}
