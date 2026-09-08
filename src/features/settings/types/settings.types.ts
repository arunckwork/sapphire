export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  emailNotifications: boolean;
  securityAlerts: boolean;
  defaultOrigin: string;
  defaultWeightUnit: 'ct' | 'g' | 'ratti';
  language: string;
  defaultCurrency: string;
}

export type UpdateSettingsDto = Partial<AppSettings>;
