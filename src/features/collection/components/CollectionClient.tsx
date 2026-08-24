'use client';

import React, { useState } from 'react';
import type { CollectionFormData, CollectionRecord } from '../types/gemstone.types';
import { GemstoneGrid } from './GemstoneGrid';
import { GemstoneDrawer } from './GemstoneDrawer';
import { useCollections } from '../hooks/useCollections';
import { useCollectionMutations } from '../hooks/useCollectionMutations';
import { useSellers } from '../hooks/useSellers';

export function CollectionClient() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CollectionRecord | null>(null);

  const {
    collections,
    total,
    isLoading: isCollectionsLoading,
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
  } = useCollectionMutations(refetch);

  /* ── Metrics ─────────────────────────────────────────────────────── */
  const totalCollections = total || collections.length;
  const totalAskingValue = collections.reduce((acc, r) => acc + (Number(r.asking_price) || 0), 0);
  const singleStoneCount = collections.filter((r) => r.collection_type === 'single_stone').length;
  const bulkCount = collections.filter((r) => r.collection_type === 'bulk_stones').length;
  const jewelleryCount = collections.filter((r) => r.collection_type === 'jewellery').length;
  const industrialCount = collections.filter((r) => r.collection_type === 'industrial_stones').length;

  const METRICS = [
    {
      title: 'Total Collections',
      value: isCollectionsLoading ? '—' : totalCollections,
      unit: 'entries',
      textColor: 'text-amber-600 dark:text-amber-400',
      borderColor: 'border-amber-500/20 hover:border-amber-500/35',
    },
    {
      title: 'Total Asking Value',
      value: isCollectionsLoading
        ? '—'
        : `$${totalAskingValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      unit: 'combined',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      borderColor: 'border-emerald-500/20 hover:border-emerald-500/35',
    },
    {
      title: 'Single Stones',
      value: isCollectionsLoading ? '—' : singleStoneCount,
      unit: 'items',
      textColor: 'text-sky-600 dark:text-sky-400',
      borderColor: 'border-sky-500/20 hover:border-sky-500/35',
    },
    {
      title: 'Bulk Lots',
      value: isCollectionsLoading ? '—' : bulkCount,
      unit: 'lots',
      textColor: 'text-violet-600 dark:text-violet-400',
      borderColor: 'border-violet-500/20 hover:border-violet-500/35',
    },
    {
      title: 'Jewellery',
      value: isCollectionsLoading ? '—' : jewelleryCount,
      unit: 'pieces',
      textColor: 'text-purple-600 dark:text-purple-400',
      borderColor: 'border-purple-500/20 hover:border-purple-500/35',
    },
    {
      title: 'Industrial',
      value: isCollectionsLoading ? '—' : industrialCount,
      unit: 'entries',
      textColor: 'text-slate-600 dark:text-slate-400',
      borderColor: 'border-slate-500/20 hover:border-slate-500/35',
    },
  ];

  /* ── Handlers ────────────────────────────────────────────────────── */

  const handleAddNew = () => {
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
      if (ok) {
        handleClose();
      }
    } else {
      const ok = await addCollection(formData);
      if (ok) {
        handleClose();
      }
    }
  };

  const handleDelete = async (id: string) => {
    const record = collections.find((r) => r.id === id);
    if (record) {
      await deleteCollection(record);
    }
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
            GemTrace Madagascar — Collection Inventory & Grading Registry
          </p>
        </div>
      </div>

      {/* ── Metric Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 xl:grid-cols-6">
        {METRICS.map((metric) => (
          <div
            key={metric.title}
            className={`flex flex-col justify-between rounded-xl border bg-card/60 p-4 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${metric.borderColor}`}
          >
            <span className="text-[11px] font-medium tracking-wide text-muted-foreground">
              {metric.title}
            </span>
            <div className="mt-2.5 space-y-0.5">
              <div className={`text-2xl font-bold tracking-tight ${metric.textColor}`}>
                {metric.value}
              </div>
              <div className="text-[11px] text-muted-foreground font-normal">{metric.unit}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Grid ─────────────────────────────────────────────────────── */}
      <GemstoneGrid
        records={collections}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddNew={handleAddNew}
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
      />
    </div>
  );
}
