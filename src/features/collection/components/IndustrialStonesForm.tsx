'use client';

import React from 'react';
import type { IndustrialStonesFormData } from '../types/gemstone.types';
import { INDUSTRIAL_STONE_TYPES, GEMSTONE_VARIETIES, WEIGHT_UNITS } from '../constants/gemstone.constants';
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
            options={INDUSTRIAL_STONE_TYPES}
            value={data.stone_type}
            onChange={(v) => onChange('stone_type', v)}
            placeholder="e.g. abrasive corundum"
            error={errors.stone_type}
          />

          <AutocompleteField
            id="ind_variety"
            label="Variety"
            options={GEMSTONE_VARIETIES}
            value={data.variety}
            onChange={(v) => onChange('variety', v)}
            placeholder="e.g. star ruby"
          />
        </div>
      </div>

      {/* ── Weight ────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <h3 className={sectionHead}>Weight</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="ind_weight" className={labelBase}>
              Weight (Decimal) <span className="text-rose-500">*</span>
            </label>
            <input
              id="ind_weight"
              type="number"
              min="0.001"
              step="0.001"
              value={data.weight}
              onChange={(e) => onChange('weight', parseFloat(e.target.value) || 0)}
              className={`${inputBase} ${errors.weight ? 'border-rose-500/60' : 'border-slate-300 dark:border-slate-700'}`}
              placeholder="0.00"
            />
            {errors.weight && (
              <span className="mt-1 block text-[11px] text-rose-500">{errors.weight}</span>
            )}
          </div>

          <div>
            <label htmlFor="ind_weight_unit" className={labelBase}>
              Weight Unit <span className="text-rose-500">*</span>
            </label>
            <select
              id="ind_weight_unit"
              value={data.weight_unit}
              onChange={(e) => onChange('weight_unit', e.target.value)}
              className={`${inputBase} ${errors.weight_unit ? 'border-rose-500/60' : 'border-slate-300 dark:border-slate-700'} cursor-pointer`}
            >
              <option value="" disabled>Select unit</option>
              {WEIGHT_UNITS.map((u) => (
                <option key={u.value} value={u.value}>{u.label}</option>
              ))}
            </select>
            {errors.weight_unit && (
              <span className="mt-1 block text-[11px] text-rose-500">{errors.weight_unit}</span>
            )}
          </div>
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
