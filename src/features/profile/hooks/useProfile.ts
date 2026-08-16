'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useAuthStore } from '@/features/auth/store/auth.store';
import type { UpdateUserDto } from '../types/user.types';

export function useProfile() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [isUpdating, setIsUpdating] = useState(false);

  const updateProfile = async (data: UpdateUserDto) => {
    if (!user) return;
    setIsUpdating(true);
    try {
      // Simulate backend update & update local store
      const updatedUser = {
        ...user,
        name: data.name ?? user.name,
        email: data.email ?? user.email,
        role: data.role ?? user.role,
        updatedAt: new Date().toISOString(),
      };
      setUser(updatedUser);
      toast.success('Profile updated successfully!');
      return updatedUser;
    } catch {
      toast.error('Failed to update profile.');
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    user,
    isUpdating,
    updateProfile,
  };
}
