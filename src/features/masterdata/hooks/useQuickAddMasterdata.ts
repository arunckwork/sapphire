'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { masterdataAdminService } from '../services/masterdataAdmin.service';
import { masterdataService } from '../services/masterdata.service';
import type { MasterDataCategoryKey } from '../types/masterdata.types';

/**
 * Provides a `quickAdd` function that creates a new masterdata option on the fly
 * when a user types a value not found in the dropdown list.
 *
 * Usage (one hook per form, shared across all AutocompleteFields in that form):
 *   const { quickAdd, pendingCategory } = useQuickAddMasterdata();
 *   <AutocompleteField categoryKey="gemstone_types" onQuickAdd={quickAdd}
 *                       isAdding={pendingCategory === 'gemstone_types'} />
 */
export function useQuickAddMasterdata() {
  // Tracks which category is currently being created (null = idle)
  const [pendingCategory, setPendingCategory] = useState<MasterDataCategoryKey | null>(null);

  /**
   * @param category  The masterdata category key to add the item into
   * @param rawLabel  The label text typed by the user (will be trimmed)
   * @param onSuccess Called with the new item's `value` after successful creation.
   *                  AutocompleteField uses this to commit the selection.
   */
  const quickAdd = async (
    category: MasterDataCategoryKey,
    rawLabel: string,
    onSuccess: (value: string) => void,
  ): Promise<void> => {
    const label = rawLabel.trim();
    if (!label) return;

    // Derive value the same way the admin Drawer does: lowercase, single-space
    const value = label.toLowerCase().replace(/\s{2,}/g, ' ');

    setPendingCategory(category);
    try {
      await masterdataAdminService.createItem({ category, label, value }).send();

      // Bust the public read-only cache so GemstoneOptionsContext refreshes
      masterdataService.getMasterdata().send().catch(() => { /* silent background refresh */ });

      toast.success(`"${label}" added to masterdata.`);
      onSuccess(value);
    } catch (err: unknown) {
      const status =
        err && typeof err === 'object' && 'status' in err
          ? (err as { status: number }).status
          : 0;

      if (status === 409) {
        // Item already exists — commit the value anyway (it's valid) and refresh
        toast.info(`"${label}" already exists — selecting it.`);
        masterdataService.getMasterdata().send().catch(() => { /* silent */ });
        onSuccess(value);
      } else {
        toast.error('Could not add to masterdata — please try again.');
      }
    } finally {
      setPendingCategory(null);
    }
  };

  return { quickAdd, pendingCategory };
}
