export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface User {
  id: number;
  email: string;
  name?: string;
  roles?: string[];
}
