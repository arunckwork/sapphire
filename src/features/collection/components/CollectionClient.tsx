'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import type { CollectionFormData, CollectionRecord } from '../types/gemstone.types';
import { GemstoneGrid } from './GemstoneGrid';
import { GemstoneDrawer } from './GemstoneDrawer';
import type { SellerRef } from '../types/gemstone.types';

/* ── Dummy sellers (replaced when useSellers hook is wired) ─────────────── */
const DUMMY_SELLERS: SellerRef[] = [
  { id: 'seller-1', first_name: 'Arun',  last_name: 'Ck',      email: 'arun@example.com',   role: 'user' },
  { id: 'seller-2', first_name: 'Priya', last_name: 'Nair',    email: 'priya@example.com',  role: 'user' },
  { id: 'seller-3', first_name: 'Rahul', last_name: 'Sharma',  email: 'rahul@example.com',  role: 'user' },
];

/* ── Dummy collections (replaced when useCollections hook is wired) ──────── */
const DUMMY_RECORDS: CollectionRecord[] = [
  {
    id: 'col-001',
    serial_no: 'COL-SNG-2026-001',
    collection_type: 'single_stone',
    seller_id: 'seller-1',
    seller: DUMMY_SELLERS[0],
    gemstone_type: 'sapphire',
    variety: 'blue sapphire',
    treatment: 'none / unheated',
    origin: 'sri lanka (ratnapura)',
    weight: 4.85,
    weight_unit: 'ct',
    shape: 'cushion',
    cut: 'excellent',
    color: 'royal blue',
    clarity: 'vvs1 (very very slightly included 1)',
    dimensions: '9.4 x 7.8 x 5.2 mm',
    certification_no: 'GIA-24819031',
    certification_lab: 'gia (gemological institute of america)',
    asking_price: 4500,
    image_urls: [],
    created_at: '2026-08-01T10:30:00Z',
    updated_at: '2026-08-01T10:30:00Z',
  },
  {
    id: 'col-002',
    serial_no: 'COL-BLK-2026-002',
    collection_type: 'bulk_stones',
    seller_id: 'seller-2',
    seller: DUMMY_SELLERS[1],
    stones: [
      { gemstone_type: 'ruby', variety: 'pigeon blood ruby', quantity: 5, weight: 12.5, weight_unit: 'ct' },
      { gemstone_type: 'sapphire', variety: 'pink sapphire', quantity: 3, weight: 6.2, weight_unit: 'ct' },
    ],
    description: 'Mixed lot of premium rubies and sapphires from Mogok.',
    certification_no: '',
    certification_lab: '',
    asking_price: 18000,
    image_urls: [],
    created_at: '2026-08-05T09:00:00Z',
    updated_at: '2026-08-05T09:00:00Z',
  },
  {
    id: 'col-003',
    serial_no: 'COL-JWL-2026-003',
    collection_type: 'jewellery',
    seller_id: 'seller-3',
    seller: DUMMY_SELLERS[2],
    description: '18K gold sapphire pendant with two side diamonds, handcrafted.',
    weight: 8.5,
    weight_unit: 'g',
    certification_no: 'GRS-2025-0948',
    certification_lab: 'grs (gemresearch swisslab)',
    asking_price: 7200,
    image_urls: [],
    created_at: '2026-08-10T14:00:00Z',
    updated_at: '2026-08-10T14:00:00Z',
  },
  {
    id: 'col-004',
    serial_no: 'COL-IND-2026-004',
    collection_type: 'industrial_stones',
    seller_id: 'seller-1',
    seller: DUMMY_SELLERS[0],
    stone_type: 'abrasive corundum',
    variety: 'star ruby',
    weight: 250,
    weight_unit: 'g',
    description: 'Grade A abrasive corundum, mesh 80, for industrial polishing.',
    certification_no: '',
    certification_lab: '',
    asking_price: 320,
    image_urls: [],
    created_at: '2026-08-12T11:00:00Z',
    updated_at: '2026-08-12T11:00:00Z',
  },
];

/* ── Component ─────────────────────────────────────────────────────────── */

export function CollectionClient() {
  const [records, setRecords] = useState<CollectionRecord[]>(DUMMY_RECORDS);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CollectionRecord | null>(null);

  /* ── Metrics ─────────────────────────────────────────────────────── */
  const totalCollections = records.length;
  const totalAskingValue = records.reduce((acc, r) => acc + (r.asking_price || 0), 0);
  const singleStoneCount = records.filter((r) => r.collection_type === 'single_stone').length;
  const bulkCount = records.filter((r) => r.collection_type === 'bulk_stones').length;
  const jewelleryCount = records.filter((r) => r.collection_type === 'jewellery').length;
  const industrialCount = records.filter((r) => r.collection_type === 'industrial_stones').length;

  const METRICS = [
    {
      title: 'Total Collections',
      value: totalCollections,
      unit: 'entries',
      textColor: 'text-amber-600 dark:text-amber-400',
      borderColor: 'border-amber-500/20 hover:border-amber-500/35',
    },
    {
      title: 'Total Asking Value',
      value: `$${totalAskingValue.toLocaleString()}`,
      unit: 'combined',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      borderColor: 'border-emerald-500/20 hover:border-emerald-500/35',
    },
    {
      title: 'Single Stones',
      value: singleStoneCount,
      unit: 'items',
      textColor: 'text-sky-600 dark:text-sky-400',
      borderColor: 'border-sky-500/20 hover:border-sky-500/35',
    },
    {
      title: 'Bulk Lots',
      value: bulkCount,
      unit: 'lots',
      textColor: 'text-violet-600 dark:text-violet-400',
      borderColor: 'border-violet-500/20 hover:border-violet-500/35',
    },
    {
      title: 'Jewellery',
      value: jewelleryCount,
      unit: 'pieces',
      textColor: 'text-purple-600 dark:text-purple-400',
      borderColor: 'border-purple-500/20 hover:border-purple-500/35',
    },
    {
      title: 'Industrial',
      value: industrialCount,
      unit: 'entries',
      textColor: 'text-slate-600 dark:text-slate-400',
      borderColor: 'border-slate-500/20 hover:border-slate-500/35',
    },
  ];

  /* ── Handlers ────────────────────────────────────────────────────── */

  const handleAddNew = () => { setEditingRecord(null); setIsDrawerOpen(true); };
  const handleEdit = (record: CollectionRecord) => { setEditingRecord(record); setIsDrawerOpen(true); };

  const handleSubmitForm = (formData: CollectionFormData) => {
    if (editingRecord) {
      setRecords((prev) =>
        prev.map((rec) =>
          rec.id === editingRecord.id
            ? { ...rec, ...formData, updated_at: new Date().toISOString() } as CollectionRecord
            : rec
        )
      );
      toast.success('Collection updated successfully.');
    } else {
      const newRecord = {
        ...formData,
        id: `col-${Date.now()}`,
        serial_no: '',        // will be populated by backend
        seller: DUMMY_SELLERS.find((s) => s.id === formData.seller_id) ?? DUMMY_SELLERS[0],
        image_urls: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as unknown as CollectionRecord;
      setRecords((prev) => [newRecord, ...prev]);
      toast.success('New collection added successfully.');
    }
    setIsDrawerOpen(false);
    setEditingRecord(null);
  };

  const handleDelete = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    toast.info('Collection removed.');
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
        records={records}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddNew={handleAddNew}
      />

      {/* ── Drawer ───────────────────────────────────────────────────── */}
      <GemstoneDrawer
        key={editingRecord ? editingRecord.id : isDrawerOpen ? 'open' : 'closed'}
        isOpen={isDrawerOpen}
        onClose={() => { setIsDrawerOpen(false); setEditingRecord(null); }}
        onSubmit={handleSubmitForm}
        editingRecord={editingRecord}
        sellers={DUMMY_SELLERS}
        isSellersLoading={false}
      />
    </div>
  );
}
