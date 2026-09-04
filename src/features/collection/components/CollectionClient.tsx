'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CollectionFilterState, CollectionFormData, CollectionRecord, SortConfig, SortField, SortOrder } from '../types/gemstone.types';
import { GemstoneGrid } from './GemstoneGrid';
import { GemstoneDrawer } from './GemstoneDrawer';
import { useCollections } from '../hooks/useCollections';
import { useCollectionMutations } from '../hooks/useCollectionMutations';
import { useSellers } from '../hooks/useSellers';
import { useRole } from '@/features/auth/hooks/useRole';

export function CollectionClient() {
  const router = useRouter();
  const { isAdmin, isManager } = useRole();
  const canManage = isAdmin || isManager;

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CollectionRecord | null>(null);

  const {
    collections,
    total,
    totalPages,
    isLoading: isCollectionsLoading,
    params,
    setSearch,
    setCollectionType,
    setStatus,
    setSortConfig,
    setPage,
    setLimit,
    refetch,
  } = useCollections();

  const {
    sellers,
    isLoading: isSellersLoading,
  } = useSellers();

  const {
    addCollection,
    editCollection,
    deleteCollection,
    isAdding,
    isEditing,
  } = useCollectionMutations(refetch);

  /* ── Derived filter + sort state from params ─────────────────────── */

  const filters: CollectionFilterState = {
    search: params.search,
    collection_type: params.collection_type,
    status: params.status,
  };

  const sortConfig: SortConfig = {
    field: params.sort_by,
    order: params.sort_order,
  };

  /* ── Filter / sort / pagination handlers ─────────────────────────── */

  const handleFilterChange = (patch: Partial<CollectionFilterState>) => {
    if (patch.search !== undefined) setSearch(patch.search);
    if (patch.collection_type !== undefined) setCollectionType(patch.collection_type);
    if (patch.status !== undefined) setStatus(patch.status);
  };

  const handleSortChange = (field: SortField, order: SortOrder) => {
    setSortConfig(field, order);
  };

  /* ── CRUD handlers ───────────────────────────────────────────────── */

  const handleAddNew = () => {
    if (!canManage) return;
    setEditingRecord(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = (record: CollectionRecord) => {
    setEditingRecord(record);
    setIsDrawerOpen(true);
  };

  const handleClose = () => {
    setIsDrawerOpen(false);
    setEditingRecord(null);
  };

  const handleSubmitForm = async (formData: CollectionFormData) => {
    if (editingRecord) {
      const ok = await editCollection(editingRecord.id, formData);
      if (ok) handleClose();
    } else {
      const ok = await addCollection(formData);
      if (ok) handleClose();
    }
  };

  const handleDelete = async (id: string) => {
    const record = collections.find((r) => r.id === id);
    if (record) await deleteCollection(record);
  };

  const handleReview = (record: CollectionRecord) => {
    router.push(`/collection/${record.id}/review`);
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-200 md:text-2xl">
            Gemstone Collection
          </h1>
          <p className="text-xs font-normal text-muted-foreground">
            Collection Inventory &amp; Grading Registry
          </p>
        </div>
      </div>

      {/* ── Grid ─────────────────────────────────────────────────────── */}
      <GemstoneGrid
        records={collections}
        total={total}
        page={params.page}
        totalPages={totalPages}
        limit={params.limit}
        isLoading={isCollectionsLoading}
        filters={filters}
        sortConfig={sortConfig}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddNew={handleAddNew}
        onReview={handleReview}
        canManage={canManage}
      />

      {/* ── Drawer ───────────────────────────────────────────────────── */}
      <GemstoneDrawer
        key={editingRecord ? editingRecord.id : isDrawerOpen ? 'open' : 'closed'}
        isOpen={isDrawerOpen}
        onClose={handleClose}
        onSubmit={handleSubmitForm}
        editingRecord={editingRecord}
        sellers={sellers}
        isSellersLoading={isSellersLoading}
        isSubmitting={isAdding || isEditing}
      />
    </div>
  );
}
