export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  first_name: string;
  last_name?: string;
  email: string;
  password: string;
  confirm_password?: string;
}

export interface RegisterFormErrors {
  first_name?: string;
  last_name?: string;
  email?: string;
  password?: string;
  confirm_password?: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface AuthResponse {
  user: import('@/features/profile').User;
}
