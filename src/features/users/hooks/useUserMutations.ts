'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { userService } from '../services/user.service';
import type { User, UserFormData } from '../types/user.types';
import type { Role } from '@/constants/roles';

export function useUserMutations(refetch: () => void) {
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [suspendingId, setSuspendingId] = useState<string | null>(null);
  const [activatingId, setActivatingId] = useState<string | null>(null);

  const addUser = async (formData: UserFormData): Promise<boolean> => {
    setIsAdding(true);
    try {
      // Strip confirm_password; set username = email
      const { confirm_password: _, ...rest } = formData;
      await userService.registerUser({
        ...rest,
        role: rest.role as Role,
      }).send();
      toast.success(`User ${formData.first_name} added successfully.`);
      refetch();
      return true;
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'status' in err && (err as { status: number }).status === 409
          ? 'A user with this email already exists.'
          : 'Failed to add user. Please try again.';
      toast.error(message);
      return false;
    } finally {
      setIsAdding(false);
    }
  };

  const editUser = async (id: string, formData: Pick<UserFormData, 'first_name' | 'last_name' | 'role'>): Promise<boolean> => {
    setIsEditing(true);
    try {
      await userService.updateUser(id, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: formData.role as Role,
      }).send();
      toast.success('User updated successfully.');
      refetch();
      return true;
    } catch {
      toast.error('Failed to update user. Please try again.');
      return false;
    } finally {
      setIsEditing(false);
    }
  };

  const suspendUser = async (user: User): Promise<void> => {
    setSuspendingId(user.id);
    try {
      await userService.suspendUser(user.id).send();
      toast.success(`${user.first_name} has been suspended.`);
      refetch();
    } catch {
      toast.error('Failed to suspend user. Please try again.');
    } finally {
      setSuspendingId(null);
    }
  };

  const activateUser = async (user: User): Promise<void> => {
    setActivatingId(user.id);
    try {
      await userService.activateUser(user.id).send();
      toast.success(`${user.first_name} has been reactivated.`);
      refetch();
    } catch {
      toast.error('Failed to activate user. Please try again.');
    } finally {
      setActivatingId(null);
    }
  };

  return {
    addUser,
    editUser,
    suspendUser,
    activateUser,
    isAdding,
    isEditing,
    suspendingId,
    activatingId,
  };
}
