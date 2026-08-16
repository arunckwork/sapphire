'use client';

import React, { useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

export type DrawerPosition = 'right' | 'left' | 'bottom';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  position?: DrawerPosition;
  width?: string;
  className?: string;
}

function CloseIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  position = 'right',
  width = 'max-w-md',
  className,
}: DrawerProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        className={cn(
          'fixed z-10 flex flex-col bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] shadow-2xl border-[hsl(var(--border))] transition-transform duration-300',
          position === 'right' && 'inset-y-0 right-0 w-full border-l animate-in slide-in-from-right duration-300',
          position === 'left' && 'inset-y-0 left-0 w-full border-r animate-in slide-in-from-left duration-300',
          position === 'bottom' && 'inset-x-0 bottom-0 max-h-[85vh] border-t rounded-t-2xl animate-in slide-in-from-bottom duration-300',
          position !== 'bottom' && width,
          className,
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-6 py-4">
          <div className="space-y-0.5 pr-4">
            {title && (
              <h3 className="text-lg font-bold tracking-tight text-[hsl(var(--foreground))]">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-xs text-[hsl(var(--muted-foreground))]">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--foreground))] transition-colors cursor-pointer"
            aria-label="Close drawer"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content Body */}
        <div className="grow overflow-y-auto px-6 py-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-[hsl(var(--border))] bg-[hsl(var(--secondary)/0.3)] px-6 py-3.5 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
