import type { Metadata } from 'next';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';

export const metadata: Metadata = {
  title: {
    default: 'Sign In',
    template: '%s | Sapphire',
  },
};

/**
 * Auth layout — full-screen split design with animated gem background.
 * Left panel: brand story + animated gem orbs
 * Right panel: the auth form (children)
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen overflow-hidden" style={{ background: 'hsl(224 40% 5%)' }}>

      {/* ── Animated gem background orbs ─────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {/* Sapphire orb — top left */}
        <div
          className="gem-float absolute -left-32 -top-32 h-96 w-96 rounded-full opacity-20 gem-pulse"
          style={{ background: 'radial-gradient(circle, hsl(217 91% 60%) 0%, hsl(230 80% 40%) 50%, transparent 80%)', filter: 'blur(40px)' }}
        />
        {/* Amethyst orb — top right */}
        <div
          className="gem-float-slow absolute -right-24 top-16 h-80 w-80 rounded-full opacity-20 gem-pulse"
          style={{ background: 'radial-gradient(circle, hsl(270 67% 65%) 0%, hsl(280 60% 40%) 50%, transparent 80%)', filter: 'blur(50px)', animationDelay: '2s' }}
        />
        {/* Ruby orb — bottom left */}
        <div
          className="gem-float absolute bottom-0 left-1/4 h-72 w-72 rounded-full opacity-15 gem-pulse"
          style={{ background: 'radial-gradient(circle, hsl(350 89% 60%) 0%, hsl(340 70% 35%) 50%, transparent 80%)', filter: 'blur(45px)', animationDelay: '4s' }}
        />
        {/* Emerald orb — bottom right */}
        <div
          className="gem-float-slow absolute -bottom-16 right-1/3 h-64 w-64 rounded-full opacity-15 gem-pulse"
          style={{ background: 'radial-gradient(circle, hsl(152 76% 48%) 0%, hsl(160 70% 28%) 50%, transparent 80%)', filter: 'blur(40px)', animationDelay: '1s' }}
        />
        {/* Gold orb — center */}
        <div
          className="gem-float absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-10 gem-pulse"
          style={{ background: 'radial-gradient(circle, hsl(43 96% 65%) 0%, transparent 70%)', filter: 'blur(30px)', animationDelay: '3s' }}
        />

        {/* Diagonal grid lines — subtle crystal lattice */}
        <svg className="absolute inset-0 h-full w-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="gem-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 60 M 0 0 L 60 60" stroke="hsl(217 91% 60%)" strokeWidth="0.5" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#gem-grid)" />
        </svg>
      </div>

      {/* ── Left panel — brand (hidden on mobile) ─────────────────────── */}
      <div className="relative hidden w-1/2 flex-col justify-between p-12 lg:flex xl:p-16">
        {/* Logo */}
        <Link href={ROUTES.LOGIN} className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
            style={{ background: 'linear-gradient(135deg, hsl(230 80% 45%), hsl(217 91% 60%))' }}
          >
            <GemIcon />
          </div>
          <span className="text-xl font-black tracking-tight text-white">Sapphire</span>
        </Link>

        {/* Tagline block */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-px w-8 bg-gradient-to-r from-transparent" style={{ background: 'linear-gradient(90deg, transparent, hsl(43 96% 58%))' }} />
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'hsl(43 96% 65%)' }}>Premium Platform</span>
            </div>
            <h1 className="text-4xl font-black leading-tight text-white xl:text-5xl">
              Crafted with
              <br />
              <span className="text-shimmer">rare precision.</span>
            </h1>
            <p className="max-w-sm text-base leading-relaxed" style={{ color: 'hsl(215 20% 60%)' }}>
              Sapphire brings enterprise-grade tools to your team — refined, secure, and built to last.
            </p>
          </div>

          {/* Gem collection badges */}
          <div className="flex flex-wrap gap-2">
            {[
              { name: 'Sapphire', color: 'hsl(217 91% 60%)' },
              { name: 'Ruby', color: 'hsl(350 89% 60%)' },
              { name: 'Emerald', color: 'hsl(152 76% 48%)' },
              { name: 'Amethyst', color: 'hsl(270 67% 65%)' },
            ].map((gem) => (
              <span
                key={gem.name}
                className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                style={{
                  background: `${gem.color}18`,
                  border: `1px solid ${gem.color}40`,
                  color: gem.color,
                }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: gem.color }} />
                {gem.name}
              </span>
            ))}
          </div>
        </div>

        {/* Footer quote */}
        <p className="text-xs" style={{ color: 'hsl(215 20% 35%)' }}>
          &copy; {new Date().getFullYear()} Sapphire. All rights reserved.
        </p>
      </div>

      {/* ── Right panel — auth form ───────────────────────────────────── */}
      <div className="relative flex w-full flex-col items-center justify-center px-4 py-12 sm:px-8 lg:w-1/2 lg:px-12 xl:px-20">
        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-3 lg:hidden">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white"
            style={{ background: 'linear-gradient(135deg, hsl(230 80% 45%), hsl(217 91% 60%))' }}
          >
            <GemIcon size={16} />
          </div>
          <span className="text-lg font-black tracking-tight text-white">Sapphire</span>
        </div>

        {/* Glass card */}
        <div className="glass-card w-full max-w-md rounded-2xl p-8 sm:p-10">
          {children}
        </div>

        {/* Bottom links */}
        {/* <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs" style={{ color: 'hsl(215 20% 45%)' }}>
          <span>Don&apos;t have an account?</span>
          <Link
            href={ROUTES.REGISTER}
            className="font-medium transition-colors hover:text-white"
            style={{ color: 'hsl(217 91% 65%)' }}
          >
            Create account
          </Link>
        </div> */}
      </div>
    </div>
  );
}

function GemIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L22 9L12 22L2 9L12 2Z" fill="currentColor" fillOpacity="0.3" />
      <path d="M12 2L22 9L12 22L2 9L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M2 9H22" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 2L7 9L12 22L17 9L12 2Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" strokeOpacity="0.5" />
    </svg>
  );
}
