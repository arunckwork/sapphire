import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from './Card';

export interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: string | number;
    isPositive?: boolean;
    label?: string;
  };
  accentColor?: 'sapphire' | 'ruby' | 'emerald' | 'gold' | 'amethyst';
  className?: string;
}

const accentGradients: Record<string, string> = {
  sapphire: 'from-[hsl(var(--gem-sapphire)/0.15)] to-transparent text-[hsl(var(--gem-sapphire))]',
  ruby: 'from-[hsl(var(--gem-ruby)/0.15)] to-transparent text-[hsl(var(--gem-ruby))]',
  emerald: 'from-[hsl(var(--gem-emerald)/0.15)] to-transparent text-[hsl(var(--gem-emerald))]',
  gold: 'from-[hsl(var(--gem-gold)/0.15)] to-transparent text-[hsl(var(--gem-gold))]',
  amethyst: 'from-[hsl(var(--gem-amethyst)/0.15)] to-transparent text-[hsl(var(--gem-amethyst))]',
};

export function StatCard({
  title,
  value,
  icon,
  trend,
  accentColor = 'sapphire',
  className,
}: StatCardProps) {
  return (
    <Card variant="gem" className={cn('relative overflow-hidden p-5', className)}>
      {/* Top ambient color glow */}
      <div
        className={cn(
          'pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br blur-2xl',
          accentGradients[accentColor],
        )}
        aria-hidden="true"
      />

      <div className="relative flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
          {title}
        </span>
        {icon && (
          <div
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-xl border border-current/20 bg-current/10',
              accentGradients[accentColor].split(' ').pop(),
            )}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="text-2xl font-black tracking-tight text-[hsl(var(--foreground))]">
          {value}
        </div>
      </div>

      {trend && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          <span
            className={cn(
              'inline-flex items-center font-bold',
              trend.isPositive ? 'text-emerald-500' : 'text-rose-500',
            )}
          >
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
          {trend.label && (
            <span className="text-[hsl(var(--muted-foreground))]">{trend.label}</span>
          )}
        </div>
      )}
    </Card>
  );
}
