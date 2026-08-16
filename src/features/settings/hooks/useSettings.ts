'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import type { AppSettings, UpdateSettingsDto } from '../types/settings.types';

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  emailNotifications: true,
  securityAlerts: true,
  defaultOrigin: 'Madagascar (Ilakaka)',
  defaultWeightUnit: 'ct',
  language: 'English (US)',
};

export function useSettings() {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<AppSettings>({
    ...DEFAULT_SETTINGS,
    theme: (theme as AppSettings['theme']) || 'dark',
  });
  const [isSaving, setIsSaving] = useState(false);

  const updateSettings = async (updates: UpdateSettingsDto) => {
    setIsSaving(true);
    try {
      if (updates.theme && updates.theme !== settings.theme) {
        setTheme(updates.theme);
      }
      setSettings((prev) => ({ ...prev, ...updates }));
      toast.success('Settings saved successfully!');
    } catch {
      toast.error('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    settings,
    isSaving,
    updateSettings,
  };
}
