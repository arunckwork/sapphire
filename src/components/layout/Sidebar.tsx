'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUIStore, useAuthStore } from '@/store';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: ROUTES.DASHBOARD,
    icon: <DashboardIcon />,
  },
  {
    label: 'Collection',
    href: '/dashboard/collection',
    icon: <GemIcon />,
  },
  {
    label: 'Registration',
    href: '/dashboard/registration',
    icon: <ClipboardIcon />,
  },
  {
    label: 'Sorting',
    href: '/dashboard/sorting',
    icon: <SortingIcon />,
  },
  {
    label: 'Packing',
    href: '/dashboard/packing',
    icon: <PackingIcon />,
  },
  {
    label: 'Relotting',
    href: '/dashboard/relotting',
    icon: <RelottingIcon />,
  },
  {
    label: 'Trade & Export',
    href: '/dashboard/trade',
    icon: <TradeIcon />,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);
  const user = useAuthStore((s) => s.user);
  const { logout } = useAuth();

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'G';
  const userName = user?.name ?? 'GemTrace Admin';
  const userRole = user?.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'Admin';

  const handleNavClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* ── Mobile Backdrop Overlay ────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-xs md:hidden"
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar Container ─────────────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-border/40 bg-background/95 backdrop-blur-xl transition-all duration-300 ${sidebarOpen
            ? 'translate-x-0 w-56 shadow-xl md:shadow-none'
            : '-translate-x-full md:translate-x-0 md:w-16'
          }`}
      >
        {/* ── Brand / Header ────────────────────────────────────────────── */}
        <div className="flex h-14 items-center px-3.5">
          <Link href={ROUTES.DASHBOARD} onClick={handleNavClick} className="flex items-center gap-2.5 overflow-hidden">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white shadow"
              style={{ background: 'linear-gradient(135deg, hsl(200 85% 50%), hsl(217 91% 60%))' }}
            >
              <GemIcon size={16} />
            </div>
            {sidebarOpen && (
              <div className="flex flex-col whitespace-nowrap transition-opacity duration-200">
                <span className="text-sm font-semibold tracking-tight text-slate-200">Sapphire</span>
                <span className="text-[10px] text-muted-foreground">GemTrace</span>
              </div>
            )}
          </Link>
        </div>

        {/* ── Navigation Links ──────────────────────────────────────────── */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-2.5 py-3">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== ROUTES.DASHBOARD && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                title={!sidebarOpen ? item.label : undefined}
                className={`group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-all duration-150 ${isActive
                    ? 'border border-amber-500/30 bg-amber-500/10 text-amber-400 font-semibold shadow-xs'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-slate-200'
                  } ${!sidebarOpen ? 'md:justify-center md:px-0' : ''}`}
              >
                <span
                  className={`shrink-0 transition-colors ${isActive ? 'text-amber-400' : 'text-muted-foreground group-hover:text-slate-200'
                    }`}
                >
                  {item.icon}
                </span>
                {sidebarOpen && (
                  <span className="truncate whitespace-nowrap">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Footer: User Profile & Logout ─────────────────────────────── */}
        <div className="border-t border-border/40 p-2.5 space-y-1.5">
          {/* User Card */}
          <div
            className={`flex items-center gap-2.5 rounded-lg bg-muted/40 p-2 transition-all ${!sidebarOpen ? 'md:justify-center md:p-1.5' : ''
              }`}
          >
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold text-white shadow-xs"
              style={{ background: 'linear-gradient(135deg, hsl(43 96% 50%), hsl(30 90% 40%))' }}
            >
              {userInitial}
            </div>
            {sidebarOpen && (
              <div className="flex flex-1 flex-col overflow-hidden text-left">
                <span className="truncate text-[11px] font-medium text-slate-200">{userName}</span>
                <span className="truncate text-[10px] text-muted-foreground">{userRole}</span>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={() => logout()}
            title="Sign out"
            className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-destructive/80 transition-colors hover:bg-destructive/10 hover:text-destructive ${!sidebarOpen ? 'md:justify-center md:px-0' : ''
              }`}
          >
            <LogoutIcon />
            {sidebarOpen && <span>Sign out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

/* ── SVG Icons (Compact 16x16) ──────────────────────────────────────── */

function DashboardIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function GemIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 22 8.5 12 22 2 8.5 12 2" />
      <line x1="2" y1="8.5" x2="22" y2="8.5" />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M12 11h4" />
      <path d="M12 16h4" />
      <path d="M8 11h.01" />
      <path d="M8 16h.01" />
    </svg>
  );
}

function SortingIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="8" height="8" rx="1" />
      <rect x="13" y="3" width="8" height="8" rx="1" />
      <path d="M4 7h6" />
      <path d="M14 7h4" />
      <path d="M4 17h16" />
    </svg>
  );
}

function PackingIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

function RelottingIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  );
}

function TradeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
