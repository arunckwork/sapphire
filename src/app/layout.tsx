import type { Metadata } from 'next';
import { Providers } from '@/components/providers/Providers';
import { inter, geistMono } from '@/lib/fonts';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Trove',
    template: '%s | Trove',
  },
  description: 'Trove — a modern, secure web platform.',
};

/**
 * Inline theme initialization script — injected directly into <head> as a
 * raw HTML string BEFORE React hydrates. This runs synchronously in the
 * browser and sets the correct dark/light class on <html> before any paint,
 * preventing flash of unstyled content (FOUC).
 *
 * Because this is a dangerouslySetInnerHTML script in the SERVER component
 * layout (not inside a client component), React 19 does NOT warn about it.
 * next-themes' own script injection is disabled via `scriptProps` below.
 */
const themeInitScript = `
(function() {
  try {
    var stored = localStorage.getItem('theme');
    var theme = stored || 'system';
    if (theme === 'system') {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.classList.add(theme);
    document.documentElement.style.colorScheme = theme;
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <head>
        {/* Theme init runs before React — no FOUC, no React 19 script warning */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${inter.variable} ${geistMono.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
