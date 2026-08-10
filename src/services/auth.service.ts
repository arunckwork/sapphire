import { alovaClient } from '@/lib/alova';
import { ENDPOINTS } from '@/constants/endpoints';
import type { LoginDto, RegisterDto, AuthResponse, User } from '@/types';

/**
 * Authentication service.
 *
 * login() and logout() call Next.js Route Handlers (BFF) which manage
 * httpOnly cookies. The Alova client forwards cookies automatically via
 * credentials: 'include'.
 *
 * getMe() calls the backend API directly — the cookie is forwarded by
 * the browser on client-side requests, or by the Route Handler on
 * server-side requests.
 */
export const authService = {
  /**
   * Authenticates a user. The BFF route handler sets httpOnly cookies
   * and returns the user object.
   */
  login: (body: LoginDto) =>
    alovaClient.Post<AuthResponse>('/api/auth/login', body),

  /**
   * Logs the user out. The BFF route handler clears the auth cookies.
   */
  logout: () => alovaClient.Post<void>('/api/auth/logout'),

  /**
   * Fetches the current user's profile from the backend.
   * Used to hydrate the auth store on initial load.
   */
  getMe: () => alovaClient.Get<User>(ENDPOINTS.AUTH.ME),
};
