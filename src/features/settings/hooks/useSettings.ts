'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';
import { storage } from '@/utils/storage';
import { useCurrency } from '@/contexts/CurrencyContext';
import type { AppSettings, UpdateSettingsDto } from '../types/settings.types';

const CURRENCY_KEY = 'sapphire:currency';

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  emailNotifications: true,
  securityAlerts: true,
  defaultOrigin: 'Madagascar (Ilakaka)',
  defaultWeightUnit: 'ct',
  language: 'English (US)',
  defaultCurrency: 'MGA',
};

export function useSettings() {
  const { theme, setTheme } = useTheme();
  const { setCurrency } = useCurrency();

  const [settings, setSettings] = useState<AppSettings>(() => {
    // Hydrate defaultCurrency from localStorage on first render so the form
    // shows the stored preference rather than the hard-coded default.
    const storedCurrency = storage.get<string>(CURRENCY_KEY);
    return {
      ...DEFAULT_SETTINGS,
      theme: (theme as AppSettings['theme']) || 'dark',
      ...(storedCurrency ? { defaultCurrency: storedCurrency } : {}),
    };
  });

  const [isSaving, setIsSaving] = useState(false);

  const updateSettings = async (updates: UpdateSettingsDto) => {
    setIsSaving(true);
    try {
      if (updates.theme && updates.theme !== settings.theme) {
        setTheme(updates.theme);
      }
      if (updates.defaultCurrency && updates.defaultCurrency !== settings.defaultCurrency) {
        // Persist to localStorage and update the context so all consumers
        // re-render immediately without a page reload.
        storage.set(CURRENCY_KEY, updates.defaultCurrency);
        setCurrency(updates.defaultCurrency);
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

