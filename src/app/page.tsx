import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

/**
 * Root page — immediately redirects to /collection (the primary workspace feature).
 * The proxy.ts will intercept and redirect unauthenticated users to /login.
 */
export default function RootPage() {
  redirect(ROUTES.COLLECTION);
}
