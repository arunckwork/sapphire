'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { useUIStore } from '@/store';
import { useAuthStore } from '@/features/auth';

export function Header() {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const user = useAuthStore((s) => s.user);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const initial = user?.first_name
    ? user.first_name.charAt(0).toUpperCase()
    : (user as { name?: string })?.name?.charAt(0).toUpperCase() || '-';
  const fullName =
    [user?.first_name, user?.last_name].filter(Boolean).join(' ') ||
    (user as { name?: string })?.name ||
    '-';
  const isDark = resolvedTheme === 'dark';

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-border bg-[hsl(220_33%_98%/0.92)] dark:bg-[hsl(213_65%_10%/0.92)] px-4 backdrop-blur-md sm:px-6">
      {/* Left: Hamburger Toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleSidebar}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[hsl(var(--gold))] transition-all hover:bg-[hsl(47_65%_52%/0.12)] active:scale-95 cursor-pointer"
          aria-label="Toggle Sidebar"
        >
          <MenuIcon />
        </button>
      </div>

      {/* Right: Status, Theme Toggle & User Profile */}
      <div className="flex items-center gap-3">
        {/* Status Indicator */}
        <div className="flex items-center gap-1.5 rounded-full border border-[hsl(152_76%_42%/0.35)] bg-[hsl(152_76%_42%/0.1)] px-2.5 py-0.5 text-[11px] font-semibold text-[hsl(152_76%_32%)] dark:text-[hsl(152_76%_60%)]">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Online</span>
        </div>

        {/* Theme Toggle Button */}
        {mounted ? (
          <button
            type="button"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-white dark:bg-[hsl(213_65%_14%)] text-muted-foreground transition-all hover:border-[hsl(47_65%_52%/0.5)] hover:text-primary cursor-pointer"
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Theme"
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>
        ) : (
          <div className="h-8 w-8" aria-hidden="true" />
        )}

        {/* User Avatar Circle — gold gradient */}
        <div
          className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-[hsl(213_71%_10%)] shadow-sm select-none"
          style={{
            background: 'linear-gradient(135deg, hsl(47 62% 40%), hsl(47 65% 60%))',
            boxShadow: '0 0 10px hsl(47 65% 52% / 0.4)',
          }}
          title={fullName}
        >
          {initial}
        </div>
      </div>
    </header>
  );
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="14" y1="12" y2="12" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}
