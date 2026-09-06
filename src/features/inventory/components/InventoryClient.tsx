'use client';

import React from 'react';
import type { CollectionFilterState, SortConfig, SortField, SortOrder } from '@/features/collection/types/gemstone.types';
import { useInventory } from '../hooks/useInventory';
import { InventoryGrid } from './InventoryGrid';

export function InventoryClient() {
  const {
    collections,
    total,
    totalPages,
    isLoading,
    params,
    setSearch,
    setCollectionType,
    setSortConfig,
    setPage,
    setLimit,
  } = useInventory();

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
  };

  const handleSortChange = (field: SortField, order: SortOrder) => {
    setSortConfig(field, order);
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-200 md:text-2xl">
            Inventory
          </h1>
          <p className="text-xs font-normal text-muted-foreground">
            Accepted Collections Registry
          </p>
        </div>
        {/* Accepted badge */}
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 self-start sm:self-auto">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Status: Accepted
        </span>
      </div>

      {/* ── Grid ───────────────────────────────────────────────────────── */}
      <InventoryGrid
        records={collections}
        total={total}
        page={params.page}
        totalPages={totalPages}
        limit={params.limit}
        isLoading={isLoading}
        filters={filters}
        sortConfig={sortConfig}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        onPageChange={setPage}
        onLimitChange={setLimit}
      />
    </div>
  );
}

