'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { masterdataAdminService } from '../services/masterdataAdmin.service';
import { masterdataService } from '../services/masterdata.service';
import type { MasterDataCreateDto, MasterDataUpdateDto } from '../types/masterdata.types';

/**
 * After every mutation, bust the read-only Alova cache by re-issuing
 * the public GET /api/masterdata request. This ensures that the next
 * time GemstoneOptionsProvider mounts it fetches fresh data — no code
 * changes needed in any form component.
 */
function bustReadOnlyCache() {
  masterdataService.getMasterdata().send().catch(() => { /* silent — background refresh */ });
}

export function useMasterdataMutations(refetch: () => void) {
  const [isCreating,     setCreating]     = useState(false);
  const [isUpdating,     setUpdating]     = useState(false);
  const [deactivatingId, setDeactivating] = useState<number | null>(null);
  const [reactivatingId, setReactivating] = useState<number | null>(null);

  /* ── Create ───────────────────────────────────────────────────────── */
  const createItem = async (dto: MasterDataCreateDto): Promise<boolean> => {
    setCreating(true);
    try {
      await masterdataAdminService.createItem(dto).send();
      toast.success(`"${dto.label}" added successfully.`);
      refetch();
      bustReadOnlyCache();
      return true;
    } catch (err: unknown) {
      const is409 =
        err &&
        typeof err === 'object' &&
        'status' in err &&
        (err as { status: number }).status === 409;
      toast.error(
        is409
          ? 'A duplicate value already exists in this category.'
          : 'Failed to add item. Please try again.'
      );
      return false;
    } finally {
      setCreating(false);
    }
  };

  /* ── Update ───────────────────────────────────────────────────────── */
  const updateItem = async (id: number, dto: MasterDataUpdateDto): Promise<boolean> => {
    setUpdating(true);
    try {
      await masterdataAdminService.updateItem(id, dto).send();
      toast.success('Item updated successfully.');
      refetch();
      bustReadOnlyCache();
      return true;
    } catch {
      toast.error('Failed to update item. Please try again.');
      return false;
    } finally {
      setUpdating(false);
    }
  };

  /* ── Deactivate ───────────────────────────────────────────────────── */
  const deactivateItem = async (id: number, label: string): Promise<void> => {
    setDeactivating(id);
    try {
      await masterdataAdminService.deactivateItem(id).send();
      toast.success(`"${label}" deactivated.`);
      refetch();
      bustReadOnlyCache();
    } catch {
      toast.error('Failed to deactivate item.');
    } finally {
      setDeactivating(null);
    }
  };

  /* ── Reactivate ───────────────────────────────────────────────────── */
  const reactivateItem = async (id: number, label: string): Promise<void> => {
    setReactivating(id);
    try {
      await masterdataAdminService.reactivateItem(id).send();
      toast.success(`"${label}" reactivated.`);
      refetch();
      bustReadOnlyCache();
    } catch {
      toast.error('Failed to reactivate item.');
    } finally {
      setReactivating(null);
    }
  };

  return {
    createItem,
    updateItem,
    deactivateItem,
    reactivateItem,
    isCreating,
    isUpdating,
    deactivatingId,
    reactivatingId,
  };
}
