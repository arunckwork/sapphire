'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { sellerAdminService } from '../services/seller.service';
import type { User } from '@/features/users';
import type { SellerFormData } from '../types/seller.types';

export function useSellerMutations(refetch: () => void) {
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [suspendingId, setSuspendingId] = useState<string | null>(null);
  const [activatingId, setActivatingId] = useState<string | null>(null);

  const addSeller = async (formData: SellerFormData): Promise<boolean> => {
    setIsAdding(true);
    try {
      // Strip confirm_password; role is injected by the BFF
      const { confirm_password: _, ...rest } = formData;
      await sellerAdminService.registerSeller(rest).send();
      toast.success(`Seller ${formData.first_name} added successfully.`);
      refetch();
      return true;
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'status' in err && (err as { status: number }).status === 409
          ? 'A seller with this email already exists.'
          : 'Failed to add seller. Please try again.';
      toast.error(message);
      return false;
    } finally {
      setIsAdding(false);
    }
  };

  const editSeller = async (
    id: string,
    formData: Pick<SellerFormData, 'first_name' | 'last_name'>,
  ): Promise<boolean> => {
    setIsEditing(true);
    try {
      await sellerAdminService.updateSeller(id, {
        first_name: formData.first_name,
        last_name: formData.last_name,
      }).send();
      toast.success('Seller updated successfully.');
      refetch();
      return true;
    } catch {
      toast.error('Failed to update seller. Please try again.');
      return false;
    } finally {
      setIsEditing(false);
    }
  };

  const suspendSeller = async (seller: User): Promise<void> => {
    setSuspendingId(seller.id);
    try {
      await sellerAdminService.suspendSeller(seller.id).send();
      toast.success(`${seller.first_name} has been suspended.`);
      refetch();
    } catch {
      toast.error('Failed to suspend seller. Please try again.');
    } finally {
      setSuspendingId(null);
    }
  };

  const activateSeller = async (seller: User): Promise<void> => {
    setActivatingId(seller.id);
    try {
      await sellerAdminService.activateSeller(seller.id).send();
      toast.success(`${seller.first_name} has been reactivated.`);
      refetch();
    } catch {
      toast.error('Failed to activate seller. Please try again.');
    } finally {
      setActivatingId(null);
    }
  };

  return {
    addSeller,
    editSeller,
    suspendSeller,
    activateSeller,
    isAdding,
    isEditing,
    suspendingId,
    activatingId,
  };
}
