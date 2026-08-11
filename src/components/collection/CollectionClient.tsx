'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { GemstoneFormData, GemstoneRecord } from '@/types/gemstone.types';
import { INITIAL_DUMMY_GEMSTONES } from '@/constants/gemstone.constants';
import { GemstoneGrid } from './GemstoneGrid';
import { GemstoneDrawer } from './GemstoneDrawer';

export function CollectionClient() {
  const [records, setRecords] = useState<GemstoneRecord[]>(INITIAL_DUMMY_GEMSTONES);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<GemstoneRecord | null>(null);

  // Dynamic Metrics Calculation
  const totalStones = records.reduce((acc, curr) => acc + (curr.quantity || 1), 0);
  const totalCarats = records
    .filter((r) => r.weightUnit === 'ct')
    .reduce((acc, curr) => acc + (curr.weight || 0), 0)
    .toFixed(2);

  const naturalCount = records.filter((r) => r.nature === 'Natural').length;
  const certifiedCount = records.filter((r) => r.certificationNo && r.certificationNo.trim()).length;
  const unheatedCount = records.filter((r) => r.treatment?.toLowerCase().includes('unheated') || r.treatment?.toLowerCase().includes('none')).length;
  const madagascarOriginCount = records.filter((r) => r.origin?.toLowerCase().includes('madagascar')).length;

  const METRICS = [
    {
      title: 'Total Collection',
      count: totalStones,
      unit: 'stones',
      textColor: 'text-amber-400',
      borderColor: 'border-amber-500/20 hover:border-amber-500/35',
    },
    {
      title: 'Total Carat Weight',
      count: parseFloat(totalCarats),
      unit: 'ct',
      textColor: 'text-sky-400',
      borderColor: 'border-sky-500/20 hover:border-sky-500/35',
    },
    {
      title: 'Natural Gemstones',
      count: naturalCount,
      unit: 'records',
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/20 hover:border-emerald-500/35',
    },
    {
      title: 'Certified Gemstones',
      count: certifiedCount,
      unit: 'certified',
      textColor: 'text-purple-400',
      borderColor: 'border-purple-500/20 hover:border-purple-500/35',
    },
    {
      title: 'Unheated / Natural',
      count: unheatedCount,
      unit: 'entries',
      textColor: 'text-orange-400',
      borderColor: 'border-orange-500/20 hover:border-orange-500/35',
    },
    {
      title: 'Madagascar Origin',
      count: madagascarOriginCount,
      unit: 'sourced',
      textColor: 'text-rose-400',
      borderColor: 'border-rose-500/20 hover:border-rose-500/35',
    },
  ];

  // Open Drawer for Add
  const handleAddNew = () => {
    setEditingRecord(null);
    setIsDrawerOpen(true);
  };

  // Open Drawer for Edit
  const handleEdit = (record: GemstoneRecord) => {
    setEditingRecord(record);
    setIsDrawerOpen(true);
  };

  // Handle Form Submission (Add or Edit)
  const handleSubmitForm = (formData: GemstoneFormData) => {
    if (editingRecord) {
      // Edit existing record
      setRecords((prev) =>
        prev.map((rec) =>
          rec.id === editingRecord.id
            ? { ...rec, ...formData }
            : rec
        )
      );
      toast.success(`Gemstone ${formData.serialNo} updated successfully!`);
    } else {
      // Add new record
      const newRecord: GemstoneRecord = {
        ...formData,
        id: `gem-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setRecords((prev) => [newRecord, ...prev]);
      toast.success(`New gemstone ${formData.serialNo} recorded successfully!`);
    }

    setIsDrawerOpen(false);
    setEditingRecord(null);
  };

  // Delete record
  const handleDelete = (id: string) => {
    const target = records.find((r) => r.id === id);
    setRecords((prev) => prev.filter((r) => r.id !== id));
    if (target) {
      toast.info(`Record ${target.serialNo} removed from collection.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-200 md:text-2xl">
            Gemstone Collection
          </h1>
          <p className="text-xs font-normal text-muted-foreground">
            GemTrace Madagascar — Gemstone Collection Inventory & Grading Registry
          </p>
        </div>
      </div>

      {/* ── Metric Cards Grid ───────────────────────────────────────── */}
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
                {metric.count}
              </div>
              <div className="text-[11px] text-muted-foreground font-normal">{metric.unit}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Gemstone Grid & Actions ───────────────────────────── */}
      <GemstoneGrid
        records={records}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddNew={handleAddNew}
      />

      {/* ── Offcanvas Right Side Drawer Form ──────────────────────── */}
      <GemstoneDrawer
        key={editingRecord ? editingRecord.id : isDrawerOpen ? 'open' : 'closed'}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditingRecord(null);
        }}
        onSubmit={handleSubmitForm}
        editingRecord={editingRecord}
      />
    </div>
  );
}
