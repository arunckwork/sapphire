'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { MasterDataCategoryKey } from '@/features/masterdata/types/masterdata.types';

interface Option {
  label: string;
  value: string;
}

export interface AutocompleteFieldProps {
  id: string;
  label: string;
  options: ReadonlyArray<Option>;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  /**
   * When provided, a "✚ Add «query» to masterdata" row is rendered at the
   * bottom of the dropdown whenever the typed query has no exact match.
   * Must be paired with `onQuickAdd` to function.
   */
  categoryKey?: MasterDataCategoryKey;
  /**
   * Called when the user clicks the quick-add row. The third argument is a
   * callback the hook must invoke with the newly-created item's `value` so
   * this field can commit the selection automatically.
   */
  onQuickAdd?: (
    category: MasterDataCategoryKey,
    label: string,
    onSuccess: (value: string) => void,
  ) => void;
  /** Shows a spinner on the quick-add row while the creation is in-flight. */
  isAdding?: boolean;
}

/**
 * A strict-select combo-box backed by a masterdata options list.
 * Free-text input is NOT allowed; values must come from the options list
 * or be created via the "✚ Add to masterdata" quick-add row.
 */
export function AutocompleteField({
  id,
  label,
  options,
  value,
  onChange,
  placeholder = 'Select or search…',
  required,
  error,
  categoryKey,
  onQuickAdd,
  isAdding = false,
}: AutocompleteFieldProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const trimmedQuery = query.trim();

  const filtered = trimmedQuery
    ? options.filter(
        (o) =>
          o.label.toLowerCase().includes(trimmedQuery.toLowerCase()) ||
          o.value.includes(trimmedQuery.toLowerCase()),
      )
    : options;

  // Show the quick-add row when there is a query AND no exact label match
  const showQuickAdd =
    !!categoryKey &&
    !!onQuickAdd &&
    trimmedQuery.length > 0 &&
    !filtered.some((o) => o.label.toLowerCase() === trimmedQuery.toLowerCase());

  const selectedLabel = options.find((o) => o.value === value)?.label ?? value;

  const inputBase =
    'w-full rounded-lg border bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-colors';
  const borderClass = error ? 'border-rose-500/60' : 'border-slate-300 dark:border-slate-700';

  return (
    <div ref={containerRef} className="relative">
      {/* Label */}
      <div className="flex items-center justify-between mb-1">
        <label htmlFor={id} className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
          {label}
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      </div>

      {/* Trigger button */}
      <button
        id={id}
        type="button"
        onClick={() => { setOpen((prev) => !prev); setQuery(''); }}
        className={`${inputBase} ${borderClass} flex items-center justify-between cursor-pointer text-left`}
      >
        <span className={value ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'}>
          {value ? selectedLabel : placeholder}
        </span>
        {value ? (
          <span
            role="button"
            tabIndex={0}
            aria-label="Clear selection"
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onChange(''); } }}
            onClick={(e) => { e.stopPropagation(); onChange(''); setOpen(false); setQuery(''); }}
            className="ml-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <ClearIcon />
          </span>
        ) : (
          <ChevronIcon open={open} />
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
          {/* Search box */}
          <div className="px-2 py-1.5 border-b border-slate-100 dark:border-slate-800">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
            />
          </div>

          <ul className="max-h-48 overflow-y-auto py-1">
            {/* Existing options */}
            {filtered.length === 0 && !showQuickAdd && (
              <li className="px-3 py-2 text-xs text-slate-400 italic">No matches found</li>
            )}
            {filtered.map((opt) => (
              <li
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); setQuery(''); }}
                className={`px-3 py-2 text-xs cursor-pointer transition-colors ${
                  value === opt.value
                    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 font-semibold'
                    : 'text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {opt.label}
              </li>
            ))}

            {/* Quick-add row — appears when query has no exact match */}
            {showQuickAdd && (
              <li
                onClick={() => {
                  if (isAdding) return;
                  onQuickAdd!(categoryKey!, trimmedQuery, (newValue) => {
                    onChange(newValue);
                    setOpen(false);
                    setQuery('');
                  });
                }}
                className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold border-t border-dashed border-slate-200 dark:border-slate-700 transition-colors ${
                  isAdding
                    ? 'text-slate-400 dark:text-slate-500 cursor-wait'
                    : 'cursor-pointer text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                }`}
              >
                {isAdding ? <SpinnerIcon /> : <PlusIcon />}
                {isAdding ? 'Adding to masterdata…' : `Add "${trimmedQuery}" to masterdata`}
              </li>
            )}
          </ul>
        </div>
      )}

      {error && (
        <span className="mt-1 block text-[11px] text-rose-500">{error}</span>
      )}
    </div>
  );
}

/* ── Icon helpers ──────────────────────────────────────────────────────────── */

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="animate-spin h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
