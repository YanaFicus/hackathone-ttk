export interface RegisterRequest {
  username: string;
  fullName: string;
  password: string;
  confirmPassword: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface AuthResponse {
  userId: string;
  login: string;
  fullName: string;
  roles: number[];
  token: string;
  refreshToken: string;
}