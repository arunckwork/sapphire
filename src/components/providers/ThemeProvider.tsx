'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

/**
 * ThemeProvider — wraps next-themes.
 *
 * Theme initialization (FOUC prevention) is handled by a raw <script> tag
 * in the server-component layout.tsx — NOT here. That avoids the React 19
 * "Encountered a script tag" warning that next-themes triggers when it
 * renders its own script injection inside a client component.
 *
 * `scriptProps={{ suppressHydrationWarning: true }}` is passed to suppress
 * any residual hydration mismatch warnings from next-themes' internal script.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      // Suppress next-themes' own inline script — we inject our own in layout.tsx
      scriptProps={{ suppressHydrationWarning: true }}
    >
      {children}
    </NextThemesProvider>
  );
}
