'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface ImageUploadFieldProps {
  files: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  label?: string;
}

/**
 * Multi-image picker with drag-and-drop, thumbnail previews, and device camera capture.
 * Stores files locally for preview only — actual upload is handled separately.
 */
export function ImageUploadField({
  files,
  onChange,
  maxFiles = 10,
  label = 'Images',
}: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

  const isMaxReached = files.length >= maxFiles;

  const addFiles = (incoming: FileList | File[] | null) => {
    if (!incoming) return;
    const incomingArr = Array.from(incoming);
    const merged = [
      ...files,
      ...incomingArr.filter(
        (f) => !files.some((existing) => existing.name === f.name && existing.size === f.size)
      ),
    ].slice(0, maxFiles);
    onChange(merged);
  };

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (isMaxReached) return;
    addFiles(e.dataTransfer.files);
  };

  const handleCameraCaptureClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMaxReached) return;

    // If mediaDevices is supported, open live interactive camera modal
    if (typeof navigator !== 'undefined' && 'mediaDevices' in navigator && typeof navigator.mediaDevices.getUserMedia === 'function') {
      setIsCameraModalOpen(true);
    } else {
      // Fallback to native capture input on older browsers/devices
      cameraInputRef.current?.click();
    }
  };

  const handleCapturedFile = (capturedFile: File) => {
    addFiles([capturedFile]);
    setIsCameraModalOpen(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
          {label}
          <span className="ml-1 font-normal text-slate-400 dark:text-slate-500">
            ({files.length}/{maxFiles} files)
          </span>
        </label>

        {/* Quick Camera Action in Header */}
        <button
          type="button"
          onClick={handleCameraCaptureClick}
          disabled={isMaxReached}
          className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/30 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          title="Take a photo using device camera"
        >
          <CameraIcon />
          Take Photo
        </button>
      </div>

      {/* Drop zone & Action Area */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => !isMaxReached && fileInputRef.current?.click()}
        className={`group relative flex flex-col items-center justify-center gap-2.5 rounded-xl border-2 border-dashed px-4 py-5 transition-all ${
          isMaxReached
            ? 'border-slate-200 dark:border-slate-800 bg-slate-100/40 dark:bg-slate-900/40 opacity-60 cursor-not-allowed'
            : 'cursor-pointer border-slate-300 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-950/60 hover:border-amber-500/60 hover:bg-amber-50/30 dark:hover:bg-amber-900/10'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <UploadIcon />
          </div>
          <button
            type="button"
            onClick={handleCameraCaptureClick}
            disabled={isMaxReached}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-500/40 bg-card text-amber-600 dark:text-amber-400 shadow-xs hover:scale-105 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-all cursor-pointer"
            title="Open camera to capture image"
          >
            <CameraIcon size={20} />
          </button>
        </div>

        <div className="text-center space-y-0.5">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            <span className="font-semibold text-amber-600 dark:text-amber-400">Click to upload</span>{' '}
            or drag &amp; drop files, or use{' '}
            <span className="font-semibold text-amber-600 dark:text-amber-400">Camera</span>
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            PNG, JPG, WEBP — up to 10 MB each
          </p>
        </div>

        {/* Hidden standard file picker */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = '';
          }}
        />

        {/* Hidden native camera capture input (fallback) */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {/* Thumbnail grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-5 pt-1">
          {files.map((file, i) => (
            <ThumbnailItem
              key={`${file.name}-${file.size}-${i}`}
              file={file}
              onRemove={() => removeFile(i)}
            />
          ))}
        </div>
      )}

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

/* ── Thumbnail Item with Memoized Object URL ────────────────────────────── */

function ThumbnailItem({ file, onRemove }: { file: File; onRemove: () => void }) {
  const [objectUrl, setObjectUrl] = useState<string>('');

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className="group relative aspect-square rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-100 dark:bg-slate-900 shadow-xs">
      {objectUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={objectUrl}
          alt={file.name}
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
        />
      )}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-white shadow-md transition-transform hover:scale-110 cursor-pointer"
        title="Remove image"
        aria-label="Remove image"
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
      <div className="absolute bottom-0 left-0 right-0 rounded-b-lg bg-black/60 backdrop-blur-xs px-1.5 py-0.5 text-[9px] text-white truncate">
        {file.name}
      </div>
    </div>
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
  const startCamera = useCallback(async (mode: 'environment' | 'user') => {
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
            const errName = err && typeof err === 'object' && 'name' in err ? (err as { name: string }).name : '';
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
  }, [stopTracks]);

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

    // Draw frame to canvas
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
    if (capturedPreview) {
      URL.revokeObjectURL(capturedPreview);
    }
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

/* ── SVG Icons ────────────────────────────────────────────────────────── */

function UploadIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
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
