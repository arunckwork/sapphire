'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
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
  /** The label to display for the field */
  label?: string;
}

/** Returns true when the given name/url looks like a PDF */
function isPdf(nameOrUrl: string): boolean {
  return nameOrUrl.toLowerCase().endsWith('.pdf');
}

/**
 * Single-file upload field for an optional certificate (image or PDF).
 * Shows a drop-zone when nothing is selected, and a preview card once a file
 * or an existing URL is present. Supports drag-and-drop, file picker, and
 * live device camera capture.
 */
export function CertificateUploadField({
  label,
  file,
  existingUrl,
  onFileChange,
  onRemoveExisting,
  existingRemoved = false,
}: CertificateUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

  const handleFiles = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    onFileChange(list[0]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleCameraCaptureClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      typeof navigator !== 'undefined' &&
      'mediaDevices' in navigator &&
      typeof navigator.mediaDevices.getUserMedia === 'function'
    ) {
      setIsCameraModalOpen(true);
    } else {
      // Fallback to native capture input on older browsers/devices
      cameraInputRef.current?.click();
    }
  };

  const handleCapturedFile = (capturedFile: File) => {
    onFileChange(capturedFile);
    setIsCameraModalOpen(false);
  };

  /* ── Resolved display state ────────────────────────────────────────────── */

  const showExisting = !!existingUrl && !existingRemoved && !file;
  const showNewFile = !!file;
  const showDropZone = !showExisting && !showNewFile;

  const existingFullUrl = existingUrl ? getMediaUrl(existingUrl) : '';

  return (
    <div className="space-y-2">
      {/* ── Header: label + Take Photo button ────────────────────────────── */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
          {label || 'Certificate'}
          <span className="ml-1 font-normal text-slate-400 dark:text-slate-500">
            (optional — image or PDF)
          </span>
        </label>

        <button
          type="button"
          onClick={handleCameraCaptureClick}
          className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/30 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors cursor-pointer"
          title="Take a photo using device camera"
        >
          <CameraIcon />
          Take Photo
        </button>
      </div>

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
            or drag &amp; drop, or use{' '}
            <span className="font-semibold text-amber-600 dark:text-amber-400">Camera</span>
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

      {/* Hidden native camera capture input (fallback for unsupported browsers) */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />

      {/* Live Camera Viewfinder Modal */}
      {isCameraModalOpen && (
        <CameraCaptureModal
          onCapture={handleCapturedFile}
          onClose={() => setIsCameraModalOpen(false)}
        />
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

function CameraIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}

function ShutterIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" fill="currentColor" />
    </svg>
  );
}

function SwitchCameraIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0-4.418-3.582-8-8-8s-8 3.582-8 8c0 2.21 0 4 0 4" />
      <polyline points="1 11 4 14 7 11" />
      <path d="M4 14c0 4.418 3.582 8 8 8s8-3.582 8-8c0-2.21 0-4 0-4" />
      <polyline points="23 13 20 10 17 13" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/* ── Live Camera Modal ─────────────────────────────────────────────────── */

interface CameraCaptureModalProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

function CameraCaptureModal({ onCapture, onClose }: CameraCaptureModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Stop all active stream tracks
  const stopTracks = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Start video stream
  const startCamera = useCallback(
    async (mode: 'environment' | 'user') => {
      setIsLoading(true);
      setErrorMsg(null);
      stopTracks();

      try {
        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = mediaStream;

        if (videoRef.current) {
          const video = videoRef.current;
          video.srcObject = mediaStream;
          video.onloadedmetadata = () => {
            video.play().catch((err: unknown) => {
              const errName =
                err && typeof err === 'object' && 'name' in err
                  ? (err as { name: string }).name
                  : '';
              if (errName !== 'AbortError') {
                console.warn('[CameraCaptureModal video.play]', err);
              }
            });
            setIsLoading(false);
          };
        }
      } catch (err: unknown) {
        console.error('[CameraCaptureModal startCamera]', err);
        const errName = err instanceof Error ? err.name : '';
        if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
          setErrorMsg('Camera permission was denied. Please allow camera access in your browser settings.');
        } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
          setErrorMsg('No camera device found on this system.');
        } else {
          setErrorMsg('Unable to access camera. Please check your device settings.');
        }
        setIsLoading(false);
      }
    },
    [stopTracks]
  );

  useEffect(() => {
    startCamera(facingMode);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        stopTracks();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      stopTracks();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSwitchCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const handleSnap = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        setCapturedBlob(blob);
        const previewUrl = URL.createObjectURL(blob);
        setCapturedPreview(previewUrl);
      },
      'image/jpeg',
      0.92
    );
  };

  const handleRetake = () => {
    if (capturedPreview) URL.revokeObjectURL(capturedPreview);
    setCapturedPreview(null);
    setCapturedBlob(null);
  };

  const handleConfirmUse = () => {
    if (!capturedBlob) return;
    const filename = `camera_${new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14)}.jpg`;
    const capturedFile = new File([capturedBlob], filename, { type: 'image/jpeg' });
    stopTracks();
    onCapture(capturedFile);
  };

  const handleModalClose = () => {
    if (capturedPreview) URL.revokeObjectURL(capturedPreview);
    stopTracks();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4"
    >
      {/* Backdrop */}
      <div
        onClick={handleModalClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <CameraIcon size={16} />
            </div>
            <h3 className="text-sm font-bold text-foreground">Device Camera</h3>
          </div>
          <button
            type="button"
            onClick={handleModalClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Viewfinder Body */}
        <div className="relative aspect-4/3 w-full bg-black flex items-center justify-center overflow-hidden">
          {isLoading && !capturedPreview && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/80 z-10 bg-black/70">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
              <span className="text-xs">Initializing camera…</span>
            </div>
          )}

          {errorMsg && (
            <div className="max-w-xs p-4 text-center text-rose-400 text-xs space-y-2 z-10">
              <svg className="mx-auto h-8 w-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p>{errorMsg}</p>
            </div>
          )}

          {/* Live Video Feed */}
          <video
            ref={videoRef}
            playsInline
            muted
            className={`h-full w-full object-cover transition-opacity duration-200 ${
              capturedPreview || errorMsg || isLoading ? 'opacity-0' : 'opacity-100'
            }`}
          />

          {/* Captured Still Preview */}
          {capturedPreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={capturedPreview}
              alt="Captured preview"
              className="absolute inset-0 h-full w-full object-cover animate-in fade-in duration-200 z-10"
            />
          )}

          {/* Hidden Canvas for snapshot drawing */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Camera Flip Button (Live stream only) */}
          {!capturedPreview && !errorMsg && !isLoading && (
            <button
              type="button"
              onClick={handleSwitchCamera}
              className="absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs hover:bg-black/80 transition-all cursor-pointer"
              title="Switch camera"
            >
              <SwitchCameraIcon />
            </button>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-border bg-muted/30 px-5 py-3.5">
          <button
            type="button"
            onClick={handleModalClose}
            className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
          >
            Cancel
          </button>

          {capturedPreview ? (
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleRetake}
                className="rounded-lg border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-accent transition-colors cursor-pointer"
              >
                Retake
              </button>
              <button
                type="button"
                onClick={handleConfirmUse}
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:from-amber-400 hover:to-amber-500 transition-all cursor-pointer"
              >
                <CheckIcon />
                Use Photo
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleSnap}
              disabled={isLoading || !!errorMsg}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-amber-500/25 hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ShutterIcon />
              Capture Photo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
