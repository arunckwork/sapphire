'use client';

import React from 'react';
import type { IndustrialStonesFormData } from '../types/gemstone.types';
import { WEIGHT_UNITS } from '../constants/gemstone.constants';
import { useGemstoneOptions, useQuickAddMasterdata } from '@/features/masterdata';
import { AutocompleteField } from '@/components/shared/forms/AutocompleteField';

interface IndustrialStonesFormProps {
  data: IndustrialStonesFormData;
  errors: Record<string, string>;
  onChange: <K extends keyof IndustrialStonesFormData>(field: K, value: IndustrialStonesFormData[K]) => void;
}

const sectionHead =
  'text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 border-b border-slate-200 dark:border-slate-800 pb-1.5';
const inputBase =
  'w-full rounded-lg border bg-white dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-colors';
const labelBase = 'block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1';

export function IndustrialStonesForm({ data, errors, onChange }: IndustrialStonesFormProps) {
  const { options } = useGemstoneOptions();
  const { quickAdd, pendingCategory } = useQuickAddMasterdata();

  return (
    <div className="space-y-6">

      {/* ── Stone Info ────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <h3 className={sectionHead}>Stone Information</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AutocompleteField
            id="stone_type"
            label="Stone Type"
            required
            options={options.industrial_stone_types}
            value={data.stone_type}
            onChange={(v) => onChange('stone_type', v)}
            placeholder="Select or search…"
            error={errors.stone_type}
            categoryKey="industrial_stone_types"
            onQuickAdd={quickAdd}
            isAdding={pendingCategory === 'industrial_stone_types'}
          />

          <AutocompleteField
            id="ind_variety"
            label="Variety (English Name)"
            options={options.gemstone_varieties}
            value={data.variety}
            onChange={(v) => onChange('variety', v)}
            placeholder="Select or search…"
            categoryKey="gemstone_varieties"
            onQuickAdd={quickAdd}
            isAdding={pendingCategory === 'gemstone_varieties'}
          />
        </div>
      </div>

      {/* ── Weight ────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <h3 className={sectionHead}>Weight</h3>

        <div className="grid grid-cols-2 gap-4">
          {/* Weight + inline unit selector */}
          <div>
            <label htmlFor="ind_weight" className={labelBase}>
              Weight (Decimal) <span className="text-rose-500">*</span>
            </label>
            <div className={`flex items-stretch rounded-lg border ${errors.weight || errors.weight_unit ? 'border-rose-500/60' : 'border-slate-300 dark:border-slate-700'
              } overflow-hidden focus-within:ring-1 focus-within:ring-amber-500/50 transition-all`}>
              <input
                id="ind_weight"
                type="number"
                min="0.001"
                step="0.001"
                value={data.weight}
                onChange={(e) => onChange('weight', parseFloat(e.target.value) || 0)}
                className="flex-1 min-w-0 bg-white dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                placeholder="0.00"
              />
              <select
                id="ind_weight_unit"
                value={data.weight_unit}
                onChange={(e) => onChange('weight_unit', e.target.value)}
                className="shrink-0 border-l border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-2 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="" disabled>Unit</option>
                {WEIGHT_UNITS.map((u) => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
            </div>
            {errors.weight && (
              <span className="mt-1 block text-[11px] text-rose-500">{errors.weight}</span>
            )}
            {errors.weight_unit && (
              <span className="mt-1 block text-[11px] text-rose-500">{errors.weight_unit}</span>
            )}
          </div>

          {/* Reserved for future "weight in carat" field */}
          <div />
        </div>
      </div>

      {/* ── Description ──────────────────────────────────────────────── */}
      <div>
        <h3 className={`${sectionHead} mb-3`}>Description</h3>
        <textarea
          value={data.description}
          onChange={(e) => onChange('description', e.target.value)}
          rows={3}
          placeholder="Grade, mesh size, intended industrial use, purity, batch notes…"
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 resize-none transition-colors"
        />
      </div>
    </div>
  );
}
