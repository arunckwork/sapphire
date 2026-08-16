import type { Metadata } from 'next';
import { ProfileForm } from '@/features/profile';

export const metadata: Metadata = {
  title: 'Profile | Trove',
  description: 'Manage your profile details and preferences',
};

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div className="space-y-0.5">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-200 md:text-2xl">
          User Profile
        </h1>
        <p className="text-xs font-normal text-muted-foreground">
          Manage your personal account information and credentials.
        </p>
      </div>

      <ProfileForm />
    </div>
  );
}
