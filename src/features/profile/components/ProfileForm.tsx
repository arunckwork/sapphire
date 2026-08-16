'use client';

import React, { useEffect, useState } from 'react';
import { useProfile } from '../hooks/useProfile';
import { Button, FormField, Input, Card, Badge } from '@/components/shared';

export function ProfileForm() {
  const { user, isUpdating, updateProfile } = useProfile();
  useEffect(() => {
    setName(user?.name || '');
    setEmail(user?.email || '');
  }, [user]);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({ name, email });
  };

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'A';

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Profile Overview Card */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-md"
            style={{ background: 'linear-gradient(135deg, hsl(43 96% 50%), hsl(30 90% 40%))' }}
          >
            {initial}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">{user?.name ?? 'Admin User'}</h2>
              <Badge variant="warning">{user?.role ?? 'Admin'}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">{user?.email ?? 'admin@gemtrace.io'}</p>
          </div>
        </div>
      </Card>

      {/* Edit Profile Form */}
      <Card className="p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Edit Personal Information</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Full Name" required>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              required
            />
          </FormField>

          <FormField label="Email Address" required>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              disabled
              className="cursor-not-allowed opacity-75"
            />
          </FormField>

          <FormField label="Role / Permissions">
            <Input value={user?.role ?? 'Admin'} disabled className="cursor-not-allowed opacity-75" />
          </FormField>

          <div className="pt-2 flex justify-end">
            <Button type="submit" isLoading={isUpdating} variant="primary">
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
