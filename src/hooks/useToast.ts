'use client';

import { toast } from 'sonner';

/**
 * useToast — lightweight wrapper around Sonner's toast API.
 *
 * Provides typed, named methods instead of using the imperative
 * toast() function directly in components.
 *
 * Usage:
 *   const { success, error, info } = useToast();
 *   success('Record saved!');
 *   error('Something went wrong');
 */
export function useToast() {
  return {
    success: (message: string, description?: string) =>
      toast.success(message, { description }),

    error: (message: string, description?: string) =>
      toast.error(message, { description }),

    info: (message: string, description?: string) =>
      toast.info(message, { description }),

    warning: (message: string, description?: string) =>
      toast.warning(message, { description }),

    loading: (message: string) => toast.loading(message),

    dismiss: (id?: string | number) => toast.dismiss(id),

    promise: toast.promise,
  };
}
