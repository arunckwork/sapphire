import { alovaClient } from '@/lib/alova';
import { ENDPOINTS } from '@/constants/endpoints';
import type { LoginDto, AuthResponse } from '../types/auth.types';
import type { User } from '@/features/profile';

/**
 * Authentication service.
 */
export const authService = {
  /** Authenticates user via BFF */
  login: (body: LoginDto) =>
    alovaClient.Post<AuthResponse>(ENDPOINTS.AUTH.LOGIN, body),

  /** Logs user out via BFF */
  logout: () => alovaClient.Post<void>(ENDPOINTS.AUTH.LOGOUT),

  /** Fetches current user profile */
  getMe: () => alovaClient.Get<User>(ENDPOINTS.AUTH.ME),
};
