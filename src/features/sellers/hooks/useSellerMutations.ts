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

  /**
   * Two-step add:
   * 1. POST register (text fields + role enforced by BFF)
   * 2. If photo selected → POST photo to the new seller's id
   */
  const addSeller = async (formData: SellerFormData): Promise<boolean> => {
    setIsAdding(true);
    try {
      // Step 1: register seller (strip client-only fields)
      const { confirm_password: _, profile_photo, ...rest } = formData;
      const newSeller = await sellerAdminService.registerSeller(rest).send();

      // Step 2: upload photo if provided
      if (profile_photo && newSeller?.id) {
        try {
          await sellerAdminService.uploadPhoto(newSeller.id, profile_photo).send();
        } catch {
          // Photo upload failure is non-fatal — seller was created successfully
          toast.warning(`${formData.first_name} added, but profile photo upload failed. You can re-upload from Edit.`);
          refetch();
          return true;
        }
      }

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

  /**
   * Two-step edit:
   * 1. PUT text fields (name, mobile, location)
   * 2a. If new photo File → POST photo
   * 2b. If photo removed (remove=true) → DELETE photo
   */
  const editSeller = async (
    id: string,
    formData: Pick<SellerFormData, 'first_name' | 'last_name' | 'mobile' | 'location'>,
    photo: { file: File | null; remove: boolean },
  ): Promise<boolean> => {
    setIsEditing(true);
    try {
      // Step 1: update text fields
      await sellerAdminService.updateSeller(id, {
        first_name: formData.first_name,
        last_name: formData.last_name,
        mobile: formData.mobile || undefined,
        location: formData.location || undefined,
      }).send();

      // Step 2: handle photo change
      if (photo.file) {
        try {
          await sellerAdminService.uploadPhoto(id, photo.file).send();
        } catch {
          toast.warning('Seller updated, but photo upload failed. Try again from Edit.');
          refetch();
          return true;
        }
      } else if (photo.remove) {
        try {
          await sellerAdminService.removePhoto(id).send();
        } catch {
          toast.warning('Seller updated, but photo removal failed. Try again from Edit.');
          refetch();
          return true;
        }
      }

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
