import type { Metadata } from 'next';
import { SettingsForm } from '@/features/settings';

export const metadata: Metadata = {
  title: 'Settings | Trove',
  description: 'Application and account preferences',
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-0.5">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-200 md:text-2xl">
          Settings & Preferences
        </h1>
        <p className="text-xs font-normal text-muted-foreground">
          Configure interface options, defaults, and notification preferences.
        </p>
      </div>

      <SettingsForm />
    </div>
  );
}
