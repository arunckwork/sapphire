'use client';

import React, { useState, useRef, useEffect } from 'react';

interface Option {
  label: string;
  value: string;
}

interface AutocompleteFieldProps {
  id: string;
  label: string;
  options: ReadonlyArray<Option>;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  allowCustom?: boolean;
}

/**
 * A combo-box that shows a filtered dropdown from the options list.
 * Has a "Custom text" toggle to switch to a free-text input.
 * Submits the option's `value` (lowercase), not the display label.
 */
export function AutocompleteField({
  id,
  label,
  options,
  value,
  onChange,
  placeholder = 'Select or type…',
  required,
  error,
  allowCustom = true,
}: AutocompleteFieldProps) {
  // Determine if current value is a custom entry (not in options list)
  const isInOptions = options.some((o) => o.value === value);
  const [isCustom, setIsCustom] = useState<boolean>(!isInOptions && value !== '');
  const [query, setQuery] = useState<string>('');
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

  const filtered = query.trim()
    ? options.filter(
        (o) =>
          o.label.toLowerCase().includes(query.toLowerCase()) ||
          o.value.includes(query.toLowerCase())
      )
    : options;

  const selectedLabel = options.find((o) => o.value === value)?.label ?? value;

  const switchToCustom = () => {
    setIsCustom(true);
    setOpen(false);
    onChange('');
  };

  const switchToList = () => {
    setIsCustom(false);
    onChange(options[0]?.value ?? '');
  };

  const inputBase =
    'w-full rounded-lg border bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-colors';
  const borderClass = error
    ? 'border-rose-500/60'
    : 'border-slate-300 dark:border-slate-700';

  return (
    <div ref={containerRef} className="relative">
      {/* Label row */}
      <div className="flex items-center justify-between mb-1">
        <label htmlFor={id} className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
          {label}
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
        {allowCustom && (
          <button
            type="button"
            onClick={isCustom ? switchToList : switchToCustom}
            className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 hover:underline"
          >
            {isCustom ? 'Select from list' : 'Custom text'}
          </button>
        )}
      </div>

      {isCustom ? (
        /* Free-text input */
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${inputBase} ${borderClass}`}
        />
      ) : (
        /* Autocomplete dropdown */
        <>
          <button
            id={id}
            type="button"
            onClick={() => { setOpen((prev) => !prev); setQuery(''); }}
            className={`${inputBase} ${borderClass} flex items-center justify-between cursor-pointer text-left`}
          >
            <span className={value ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'}>
              {value ? selectedLabel : placeholder}
            </span>
            <ChevronIcon open={open} />
          </button>

          {open && (
            <div className="absolute z-50 mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
              {/* Search inside dropdown */}
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
                {filtered.length === 0 ? (
                  <li className="px-3 py-2 text-xs text-slate-400 italic">No matches</li>
                ) : (
                  filtered.map((opt) => (
                    <li
                      key={opt.value}
                      onClick={() => {
                        onChange(opt.value);
                        setOpen(false);
                        setQuery('');
                      }}
                      className={`px-3 py-2 text-xs cursor-pointer transition-colors ${
                        value === opt.value
                          ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 font-semibold'
                          : 'text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {opt.label}
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </>
      )}

      {error && (
        <span className="mt-1 block text-[11px] text-rose-500">{error}</span>
      )}
    </div>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-3.5 w-3.5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}
