import React, { useState } from 'react';
import { cn } from '@/lib/utils';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  status?: 'online' | 'offline' | 'busy' | 'away';
}

const sizeStyles: Record<AvatarSize, string> = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

const statusStyles: Record<string, string> = {
  online: 'bg-emerald-500',
  offline: 'bg-zinc-500',
  busy: 'bg-rose-500',
  away: 'bg-amber-500',
};

export function Avatar({
  src,
  alt = 'Avatar',
  name = '',
  size = 'md',
  status,
  className,
  ...props
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  const getInitials = (text: string) => {
    if (!text) return '?';
    const parts = text.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="relative inline-block shrink-0">
      <div
        className={cn(
          'relative flex items-center justify-center overflow-hidden rounded-full font-semibold select-none',
          'bg-[hsl(var(--gem-sapphire)/0.15)] text-[hsl(var(--gem-sapphire))] border border-[hsl(var(--gem-sapphire)/0.3)]',
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        {src && !imageError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt || name}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <span>{getInitials(name || alt)}</span>
        )}
      </div>

      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 block rounded-full ring-2 ring-[hsl(var(--background))]',
            size === 'xs' || size === 'sm' ? 'h-2 w-2' : 'h-3 w-3',
            statusStyles[status],
          )}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
}
