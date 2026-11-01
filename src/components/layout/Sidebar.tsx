'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/store';
import { useAuthStore, useAuth } from '@/features/auth';
import { useRole } from '@/features/auth/hooks/useRole';
import { ROUTES } from '@/constants/routes';
import { ROLES } from '@/constants/roles';
import type { Role } from '@/constants/roles';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  /** Allowlist of roles that can see this item. Undefined = visible to all. */
  roles?: Role[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Collection',
    href: ROUTES.COLLECTION,
    icon: <GemIcon />,
    // no roles restriction — visible to all
  },
  {
    label: 'Inventory',
    href: ROUTES.INVENTORY,
    icon: <InventoryIcon />,
    roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF],
  },
  {
    label: 'Users',
    href: ROUTES.USERS,
    icon: <UsersIcon />,
    roles: [ROLES.ADMIN, ROLES.MANAGER],
  },
  {
    label: 'Sellers',
    href: ROUTES.SELLERS,
    icon: <SellerIcon />,
    roles: [ROLES.ADMIN, ROLES.MANAGER],
  },
  {
    label: 'Masterdata',
    href: ROUTES.MASTERDATA,
    icon: <DatabaseIcon />,
    roles: [ROLES.ADMIN, ROLES.MANAGER],
  },
  {
    label: 'Profile',
    href: ROUTES.PROFILE,
    icon: <UserIcon />,
    // no roles restriction — visible to all
  },
  {
    label: 'Settings',
    href: ROUTES.SETTINGS,
    icon: <SettingsIcon />,
    roles: [ROLES.ADMIN, ROLES.MANAGER],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);
  const user = useAuthStore((s) => s.user);
  const { logout } = useAuth();
  const { role } = useRole();

  const visibleNavItems = NAV_ITEMS.filter(
    (item) => !item.roles || (role !== null && item.roles.includes(role))
  );

  const userInitial = user?.first_name
    ? user.first_name.charAt(0).toUpperCase()
    : (user as { name?: string })?.name?.charAt(0).toUpperCase() || '-';
  const userName =
    [user?.first_name, user?.last_name].filter(Boolean).join(' ') ||
    (user as { name?: string })?.name ||
    '-';
  const userRole = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : '-';

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
          className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm md:hidden"
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar Container ─────────────────────────────────────────── */}
      <aside
        style={{ background: 'hsl(213 71% 11%)' }}
        className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-white/[0.06] backdrop-blur-xl transition-all duration-300 ${sidebarOpen
          ? 'translate-x-0 w-56 shadow-2xl md:shadow-none'
          : '-translate-x-full md:translate-x-0 md:w-16'
          }`}
      >
        {/* ── Brand / Header ────────────────────────────────────────────── */}
        <div className="flex h-14 items-center px-3.5" style={{ borderBottom: '1px solid rgba(212,175,55,0.12)' }}>
          <Link href={ROUTES.COLLECTION} onClick={handleNavClick} className="flex items-center gap-2.5 overflow-hidden">
            {/* Gold gem logo */}
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-lg"
              style={{
                background: 'linear-gradient(135deg, hsl(47 62% 40%) 0%, hsl(47 65% 58%) 50%, hsl(42 70% 68%) 100%)',
                boxShadow: '0 0 16px hsl(47 65% 52% / 0.5), 0 2px 8px hsl(213 71% 4% / 0.5)',
              }}
            >
              <GemIcon size={15} color="hsl(213 71% 10%)" />
            </div>
            {sidebarOpen && (
              <div className="flex flex-col whitespace-nowrap transition-opacity duration-200">
                <span className="text-sm font-bold tracking-tight" style={{ color: 'hsl(47 65% 68%)' }}>Trove</span>
                <span className="text-[10px]" style={{ color: 'hsl(220 15% 48%)' }}>GemTrace System</span>
              </div>
            )}
          </Link>
        </div>

        {/* ── Navigation Links ──────────────────────────────────────────── */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2.5 py-3">
          {visibleNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                title={!sidebarOpen ? item.label : undefined}
                className={`group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-all duration-200 ${isActive
                  ? 'font-semibold'
                  : 'hover:bg-white/[0.05]'
                  } ${!sidebarOpen ? 'md:justify-center md:px-0' : ''}`}
                style={isActive ? {
                  background: 'linear-gradient(135deg, hsl(47 65% 52% / 0.15) 0%, hsl(47 65% 52% / 0.08) 100%)',
                  borderLeft: '2px solid hsl(47 65% 52%)',
                  paddingLeft: sidebarOpen ? '0.625rem' : '',
                } : {}}
              >
                <span
                  className={`shrink-0 transition-colors ${isActive
                    ? ''
                    : 'opacity-50 group-hover:opacity-80'
                    }`}
                  style={isActive ? { color: 'hsl(47 65% 60%)' } : { color: 'hsl(220 20% 70%)' }}
                >
                  {item.icon}
                </span>
                {sidebarOpen && (
                  <span
                    className="truncate whitespace-nowrap"
                    style={isActive ? { color: 'hsl(47 65% 68%)' } : { color: 'hsl(220 20% 68%)' }}
                  >
                    {item.label}
                  </span>
                )}
                {/* Active gold dot indicator (collapsed mode) */}
                {isActive && !sidebarOpen && (
                  <span
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full"
                    style={{ background: 'hsl(47 65% 60%)' }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Footer: User Profile & Logout ─────────────────────────────── */}
        <div className="p-2.5 space-y-1.5" style={{ borderTop: '1px solid rgba(212,175,55,0.12)' }}>
          {/* User Card Link to Profile */}
          <Link
            href={ROUTES.PROFILE}
            onClick={handleNavClick}
            className={`flex items-center gap-2.5 rounded-lg p-2 transition-all hover:bg-white/[0.05] ${!sidebarOpen ? 'md:justify-center md:p-1.5' : ''
              }`}
          >
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold shadow-sm"
              style={{
                background: 'linear-gradient(135deg, hsl(47 62% 40%), hsl(47 65% 58%))',
                color: 'hsl(213 71% 10%)',
              }}
            >
              {userInitial}
            </div>
            {sidebarOpen && (
              <div className="flex flex-1 flex-col overflow-hidden text-left">
                <span className="truncate text-[11px] font-semibold" style={{ color: 'hsl(220 25% 80%)' }}>{userName}</span>
                <span className="truncate text-[10px]" style={{ color: 'hsl(220 15% 48%)' }}>{userRole}</span>
              </div>
            )}
          </Link>

          {/* Logout Button */}
          <button
            onClick={() => logout()}
            title="Sign out"
            className={`cursor-pointer flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-colors hover:bg-rose-500/10 ${!sidebarOpen ? 'md:justify-center md:px-0' : ''
              }`}
            style={{ color: 'hsl(0 70% 60%)' }}
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

function GemIcon({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L22 9L12 22L2 9L12 2Z" fill={color} fillOpacity="0.25" />
      <path d="M12 2L22 9L12 22L2 9L12 2Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M2 9H22" stroke={color} strokeWidth="1.8" />
      <path d="M12 2L7 9L12 22L17 9L12 2Z" stroke={color} strokeWidth="1" strokeLinejoin="round" strokeOpacity="0.5" />
    </svg>
  );
}

function InventoryIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="5" rx="1" />
      <rect x="2" y="10" width="20" height="5" rx="1" />
      <rect x="2" y="17" width="20" height="4" rx="1" />
      <path d="M6 5.5h.01M6 12.5h.01M6 19h.01" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2 21v-1a7 7 0 0 1 14 0v1" />
      <path d="M16 3.5a3.5 3.5 0 1 1 0 7" />
      <path d="M22 21v-1a7 7 0 0 0-5-6.71" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-1a8 8 0 0 1 16 0v1" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function DatabaseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  );
}

function SellerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l2-6h14l2 6" />
      <path d="M3 9v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9" />
      <path d="M3 9h18" />
      <path d="M9 13a3 3 0 0 0 6 0" />
    </svg>
  );
}
