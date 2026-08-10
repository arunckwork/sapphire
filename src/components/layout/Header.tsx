'use client';

import { useUIStore } from '@/store';
import { useAuthStore } from '@/store';

export function Header() {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const user = useAuthStore((s) => s.user);

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'A';

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-border/40 bg-background/80 px-4 backdrop-blur-md sm:px-6">
      {/* Left: Hamburger Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary/40"
          aria-label="Toggle Sidebar"
        >
          <MenuIcon />
        </button>
      </div>

      {/* Right: Status & User Profile */}
      <div className="flex items-center gap-3">
        {/* Status Indicator */}
        <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Online</span>
        </div>

        {/* User Avatar Circle */}
        <div
          className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white shadow-xs"
          style={{ background: 'linear-gradient(135deg, hsl(43 96% 50%), hsl(30 90% 40%))' }}
          title={user?.name ?? 'Admin User'}
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
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}
