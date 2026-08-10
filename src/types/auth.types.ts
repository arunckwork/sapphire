export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface ForgotPasswordDto {
  email: string;
}

/** Shape of successful auth response (tokens managed via httpOnly cookies by BFF) */
export interface AuthResponse {
  user: import('./user.types').User;
}
