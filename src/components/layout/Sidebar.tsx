'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/store';
import { useAuthStore, useAuth } from '@/features/auth';
import { ROUTES } from '@/constants/routes';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Collection',
    href: ROUTES.COLLECTION,
    icon: <GemIcon />,
  },
  {
    label: 'Inventory',
    href: ROUTES.INVENTORY,
    icon: <InventoryIcon />,
  },
  {
    label: 'Users',
    href: ROUTES.USERS,
    icon: <UsersIcon />,
  },
  {
    label: 'Profile',
    href: ROUTES.PROFILE,
    icon: <UserIcon />,
  },
  {
    label: 'Settings',
    href: ROUTES.SETTINGS,
    icon: <SettingsIcon />,
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
  const userRole = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Admin';

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
          <Link href={ROUTES.COLLECTION} onClick={handleNavClick} className="flex items-center gap-2.5 overflow-hidden">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white shadow"
              style={{ background: 'linear-gradient(135deg, hsl(200 85% 50%), hsl(217 91% 60%))' }}
            >
              <GemIcon size={16} />
            </div>
            {sidebarOpen && (
              <div className="flex flex-col whitespace-nowrap transition-opacity duration-200">
                <span className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-200">Trove</span>
                <span className="text-[10px] text-muted-foreground">GemTrace System</span>
              </div>
            )}
          </Link>
        </div>

        {/* ── Navigation Links ──────────────────────────────────────────── */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-2.5 py-3">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                title={!sidebarOpen ? item.label : undefined}
                className={`group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-all duration-150 ${isActive
                  ? 'border border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-400 font-semibold shadow-xs'
                  : 'text-muted-foreground hover:bg-muted/70 hover:text-slate-900 dark:hover:text-slate-200'
                  } ${!sidebarOpen ? 'md:justify-center md:px-0' : ''}`}
              >
                <span
                  className={`shrink-0 transition-colors ${isActive
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-muted-foreground group-hover:text-slate-900 dark:group-hover:text-slate-200'
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
          {/* User Card Link to Profile */}
          <Link
            href={ROUTES.PROFILE}
            onClick={handleNavClick}
            className={`flex items-center gap-2.5 rounded-lg bg-muted/40 p-2 transition-all hover:bg-muted/70 ${!sidebarOpen ? 'md:justify-center md:p-1.5' : ''
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
                <span className="truncate text-[11px] font-medium text-slate-900 dark:text-slate-200">{userName}</span>
                <span className="truncate text-[10px] text-muted-foreground">{userRole}</span>
              </div>
            )}
          </Link>

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

/* ── SVG Icons ──────────────────────────────────────────────────────── */

function GemIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 22 8.5 12 22 2 8.5 12 2" />
      <line x1="2" y1="8.5" x2="22" y2="8.5" />
    </svg>
  );
}

function InventoryIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
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
