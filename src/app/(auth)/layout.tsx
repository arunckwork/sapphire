import type { Metadata } from 'next';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';

export const metadata: Metadata = {
  title: {
    default: 'Sign In',
    template: '%s | Trove System',
  },
};

/**
 * Auth layout — full-screen design with animated navy/gold gem background.
 * Left panel: brand story + animated orbs
 * Right panel: the auth form (children) in a navy card
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen overflow-hidden" style={{ background: 'hsl(213 71% 7%)' }}>

      {/* ── Animated background orbs ─────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {/* Gold primary orb — top left */}
        <div
          className="gem-float absolute -left-24 -top-24 h-80 w-80 rounded-full gem-pulse"
          style={{ background: 'radial-gradient(circle, hsl(47 65% 52%) 0%, hsl(47 62% 35%) 40%, transparent 75%)', filter: 'blur(50px)', opacity: 0.22 }}
        />
        {/* Navy-blue accent orb — top right */}
        <div
          className="gem-float-slow absolute -right-16 top-12 h-72 w-72 rounded-full gem-pulse"
          style={{ background: 'radial-gradient(circle, hsl(213 71% 40%) 0%, hsl(213 71% 22%) 45%, transparent 75%)', filter: 'blur(55px)', opacity: 0.28, animationDelay: '2s' }}
        />
        {/* Deep gold orb — bottom left */}
        <div
          className="gem-float absolute bottom-0 left-1/4 h-64 w-64 rounded-full gem-pulse"
          style={{ background: 'radial-gradient(circle, hsl(47 65% 45%) 0%, hsl(42 58% 28%) 50%, transparent 80%)', filter: 'blur(45px)', opacity: 0.18, animationDelay: '4s' }}
        />
        {/* Navy mid orb — bottom right */}
        <div
          className="gem-float-slow absolute -bottom-8 right-1/4 h-60 w-60 rounded-full gem-pulse"
          style={{ background: 'radial-gradient(circle, hsl(213 71% 35%) 0%, hsl(213 71% 18%) 50%, transparent 80%)', filter: 'blur(40px)', opacity: 0.2, animationDelay: '1s' }}
        />
        {/* Warm gold glow — center bottom */}
        <div
          className="gem-float absolute left-1/2 bottom-1/4 h-48 w-48 -translate-x-1/2 rounded-full gem-pulse"
          style={{ background: 'radial-gradient(circle, hsl(47 65% 60%) 0%, transparent 70%)', filter: 'blur(35px)', opacity: 0.1, animationDelay: '3s' }}
        />

        {/* Crystal lattice grid */}
        <svg className="absolute inset-0 h-full w-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="gem-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 60 M 0 0 L 60 60" stroke="hsl(47 65% 60%)" strokeWidth="0.5" fill="none" />
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
            className="flex h-10 w-10 items-center justify-center rounded-xl shadow-lg"
            style={{
              background: 'linear-gradient(135deg, hsl(47 62% 40%), hsl(47 65% 58%))',
              boxShadow: '0 0 20px hsl(47 65% 52% / 0.5)',
            }}
          >
            <GemIcon />
          </div>
          <span className="text-xl font-black tracking-tight text-white">Trove</span>
        </Link>

        {/* Tagline block */}
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div
                className="h-px w-8"
                style={{ background: 'linear-gradient(90deg, transparent, hsl(47 65% 58%))' }}
              />
              <span
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: 'hsl(47 65% 65%)' }}
              >
                Premium Platform
              </span>
            </div>
            <h1 className="text-4xl font-black leading-tight text-white xl:text-5xl">
              Crafted with
              <br />
              <span className="text-shimmer">rare precision.</span>
            </h1>
            <p className="max-w-sm text-base leading-relaxed" style={{ color: 'hsl(220 20% 58%)' }}>
              Trove brings enterprise-grade tools to your team — refined, secure, and built to last.
            </p>
          </div>

          {/* Gem collection badges */}
          <div className="flex flex-wrap gap-2">
            {[
              { name: 'Sapphire', color: 'hsl(213 71% 60%)' },
              { name: 'Ruby', color: 'hsl(350 89% 60%)' },
              { name: 'Emerald', color: 'hsl(152 76% 48%)' },
              { name: 'Gold', color: 'hsl(47 65% 60%)' },
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
        <p className="text-xs" style={{ color: 'hsl(215 20% 32%)' }}>
          &copy; {new Date().getFullYear()} Trove. All rights reserved.
        </p>
      </div>

      {/* ── Right panel — auth form ───────────────────────────────────── */}
      <div className="relative flex w-full flex-col items-center justify-center px-4 py-12 sm:px-8 lg:w-1/2 lg:px-12 xl:px-20">
        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-3 lg:hidden">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl shadow-lg"
            style={{
              background: 'linear-gradient(135deg, hsl(47 62% 40%), hsl(47 65% 58%))',
              boxShadow: '0 0 16px hsl(47 65% 52% / 0.5)',
            }}
          >
            <GemIcon size={16} />
          </div>
          <span className="text-lg font-black tracking-tight text-white">Trove</span>
        </div>

        {/* Glass card with navy/gold theme */}
        <div className="glass-card w-full max-w-md rounded-2xl p-8 sm:p-10">
          {children}
        </div>
      </div>
    </div>
  );
}

function GemIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L22 9L12 22L2 9L12 2Z" fill="hsl(213 71% 10%)" fillOpacity="0.4" />
      <path d="M12 2L22 9L12 22L2 9L12 2Z" stroke="hsl(213 71% 10%)" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M2 9H22" stroke="hsl(213 71% 10%)" strokeWidth="1.8" />
      <path d="M12 2L7 9L12 22L17 9L12 2Z" stroke="hsl(213 71% 10%)" strokeWidth="1" strokeLinejoin="round" strokeOpacity="0.5" />
    </svg>
  );
}
