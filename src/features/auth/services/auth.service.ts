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

  /** Registers a new public user via BFF */
  register: (body: Omit<import('../types/auth.types').RegisterDto, 'confirm_password'>) =>
    alovaClient.Post<{ message?: string }>(ENDPOINTS.AUTH.REGISTER, body),

  /** Logs user out via BFF */
  logout: () => alovaClient.Post<void>(ENDPOINTS.AUTH.LOGOUT),

  /** Fetches current user profile — cache disabled to ensure freshness across user switches */
  getMe: () => alovaClient.Get<User>(ENDPOINTS.AUTH.ME, { cacheFor: 0 }),
};
