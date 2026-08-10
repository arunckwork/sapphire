'use client';

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface UIState {
  /** Whether the sidebar is expanded */
  sidebarOpen: boolean;
  /** User's preferred color theme */
  theme: Theme;
  /** Controls the full-page loading overlay */
  isGlobalLoading: boolean;

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: Theme) => void;
  setGlobalLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        sidebarOpen: true,
        theme: 'system',
        isGlobalLoading: false,

        toggleSidebar: () =>
          set((s) => ({ sidebarOpen: !s.sidebarOpen }), false, 'ui/toggleSidebar'),

        setSidebarOpen: (open) =>
          set({ sidebarOpen: open }, false, 'ui/setSidebarOpen'),

        setTheme: (theme) =>
          set({ theme }, false, 'ui/setTheme'),

        setGlobalLoading: (loading) =>
          set({ isGlobalLoading: loading }, false, 'ui/setGlobalLoading'),
      }),
      {
        name: 'sapphire-ui',
        // Only persist these keys — do NOT persist isGlobalLoading
        partialize: (state) => ({
          sidebarOpen: state.sidebarOpen,
          theme: state.theme,
        }),
      },
    ),
    { name: 'UIStore' },
  ),
);
