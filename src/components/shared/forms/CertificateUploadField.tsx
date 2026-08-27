'use client';

import React, { useRef } from 'react';
import { getMediaUrl } from '@/utils/media';

interface CertificateUploadFieldProps {
  /** Newly chosen local file (null = none selected) */
  file: File | null;
  /** Existing remote URL from the API (shown in edit mode) */
  existingUrl?: string | null;
  /** Called when the user picks a new file */
  onFileChange: (file: File | null) => void;
  /** Called when the user requests removal of the existing remote certificate */
  onRemoveExisting?: () => void;
  /** Whether the existing certificate has been marked for removal */
  existingRemoved?: boolean;
}

/** Returns true when the given name/url looks like a PDF */
function isPdf(nameOrUrl: string): boolean {
  return nameOrUrl.toLowerCase().endsWith('.pdf');
}

/**
 * Single-file upload field for an optional certificate (image or PDF).
 * Shows a drop-zone when nothing is selected, and a preview card once a file
 * or an existing URL is present.
 */
export function CertificateUploadField({
  file,
  existingUrl,
  onFileChange,
  onRemoveExisting,
  existingRemoved = false,
}: CertificateUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    onFileChange(list[0]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  /* ── Resolved display state ────────────────────────────────────────────── */

  const showExisting = !!existingUrl && !existingRemoved && !file;
  const showNewFile  = !!file;
  const showDropZone = !showExisting && !showNewFile;

  const existingFullUrl = existingUrl ? getMediaUrl(existingUrl) : '';

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
        Certificate
        <span className="ml-1 font-normal text-slate-400 dark:text-slate-500">
          (optional — image or PDF)
        </span>
      </label>

      {/* ── Drop zone ────────────────────────────────────────────────────── */}
      {showDropZone && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/60 px-4 py-5 transition-colors hover:border-amber-500/60 hover:bg-amber-50/30 dark:hover:bg-amber-900/10"
        >
          <CertificateIcon />
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            <span className="font-semibold text-amber-600 dark:text-amber-400">Click to upload</span>{' '}
            or drag &amp; drop
          </p>
          <p className="text-[11px] text-slate-400">PNG, JPG, WEBP or PDF — max 10 MB</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      )}

      {/* ── Existing remote certificate preview ──────────────────────────── */}
      {showExisting && (
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-3">
          {isPdf(existingUrl!) ? (
            <PdfIcon />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={existingFullUrl}
              alt="Certificate"
              className="h-14 w-14 rounded-md object-cover border border-slate-200 dark:border-slate-700 shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
              {isPdf(existingUrl!) ? 'Certificate (PDF)' : 'Certificate (Image)'}
            </p>
            <a
              href={existingFullUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline"
            >
              View →
            </a>
          </div>
          <div className="flex flex-col gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-md border border-slate-300 dark:border-slate-600 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={onRemoveExisting}
              className="rounded-md border border-rose-300 dark:border-rose-700 px-2.5 py-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
            >
              Remove
            </button>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      )}

      {/* ── Newly selected local file preview ────────────────────────────── */}
      {showNewFile && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50/40 dark:bg-amber-900/10 p-3">
          {isPdf(file!.name) ? (
            <PdfIcon />
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={URL.createObjectURL(file!)}
              alt={file!.name}
              className="h-14 w-14 rounded-md object-cover border border-amber-200 dark:border-amber-800 shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
              {file!.name}
            </p>
            <p className="text-[11px] text-slate-400">
              {(file!.size / 1024).toFixed(1)} KB &mdash; ready to upload
            </p>
          </div>
          <button
            type="button"
            onClick={() => onFileChange(null)}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-white shadow-sm hover:bg-rose-700 transition-colors shrink-0"
            title="Remove selected file"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Icon helpers ─────────────────────────────────────────────────────────── */

function CertificateIcon() {
  return (
    <svg
      width="28" height="28" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      className="text-slate-400 dark:text-slate-500"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="13" y2="17" />
    </svg>
  );
}

function PdfIcon() {
  return (
    <div className="h-14 w-14 rounded-md border border-slate-200 dark:border-slate-700 bg-rose-50 dark:bg-rose-900/20 flex flex-col items-center justify-center gap-0.5 shrink-0">
      <svg
        width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        className="text-rose-500"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
      <span className="text-[9px] font-bold text-rose-500 tracking-wider">PDF</span>
    </div>
  );
}
