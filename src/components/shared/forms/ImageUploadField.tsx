'use client';

import React, { useRef } from 'react';

interface ImageUploadFieldProps {
  files: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  label?: string;
}

/**
 * Multi-image picker with drag-and-drop and thumbnail previews.
 * Stores files locally for preview only — actual upload is handled separately.
 */
export function ImageUploadField({
  files,
  onChange,
  maxFiles = 10,
  label = 'Images',
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const merged = [
      ...files,
      ...Array.from(incoming).filter(
        (f) => !files.some((existing) => existing.name === f.name)
      ),
    ].slice(0, maxFiles);
    onChange(merged);
  };

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
        {label}
        <span className="ml-1 font-normal text-slate-400 dark:text-slate-500">
          (up to {maxFiles} files)
        </span>
      </label>

      {/* Drop zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/60 px-4 py-5 transition-colors hover:border-amber-500/60 hover:bg-amber-50/30 dark:hover:bg-amber-900/10"
      >
        <UploadIcon />
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
          <span className="font-semibold text-amber-600 dark:text-amber-400">Click to upload</span>{' '}
          or drag & drop
        </p>
        <p className="text-[11px] text-slate-400">PNG, JPG, WEBP — max 10 MB each</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {/* Thumbnail grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {files.map((file, i) => (
            <div key={`${file.name}-${i}`} className="group relative aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="h-full w-full rounded-lg object-cover border border-slate-200 dark:border-slate-700"
              />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove image"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
              <div className="absolute bottom-0 left-0 right-0 rounded-b-lg bg-black/50 px-1 py-0.5 text-[9px] text-white truncate opacity-0 group-hover:opacity-100 transition-opacity">
                {file.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function UploadIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 dark:text-slate-500">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}
