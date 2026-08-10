import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Profile' };

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Profile</h1>
        <p className="text-muted-foreground">Manage your personal information and preferences.</p>
      </div>
      {/* TODO: Add ProfileForm component */}
    </div>
  );
}
