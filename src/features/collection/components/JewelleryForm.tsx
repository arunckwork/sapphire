'use client';

import React from 'react';
import type { JewelleryFormData } from '../types/gemstone.types';
import { WEIGHT_UNITS } from '../constants/gemstone.constants';

interface JewelleryFormProps {
  data: JewelleryFormData;
  errors: Record<string, string>;
  onChange: <K extends keyof JewelleryFormData>(field: K, value: JewelleryFormData[K]) => void;
}

const sectionHead =
  'text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 border-b border-slate-200 dark:border-slate-800 pb-1.5 mb-3';
const inputBase =
  'w-full rounded-lg border bg-white dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-colors';

export function JewelleryForm({ data, errors, onChange }: JewelleryFormProps) {
  return (
    <div className="space-y-6">

      {/* ── Total Weight ─────────────────────────────────────────────── */}
      <div className="space-y-3">
        <h3 className={sectionHead}>Total Weight</h3>
        <div className="grid grid-cols-2 gap-4">
          {/* Weight + inline unit selector */}
          <div>
            <label htmlFor="jwl_weight" className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
              Total Weight (Decimal) <span className="text-rose-500">*</span>
            </label>
            <div className={`flex items-stretch rounded-lg border ${
              errors.weight || errors.weight_unit ? 'border-rose-500/60' : 'border-slate-300 dark:border-slate-700'
            } overflow-hidden focus-within:ring-1 focus-within:ring-amber-500/50 transition-all`}>
              <input
                id="jwl_weight"
                type="number"
                min="0.001"
                step="0.001"
                value={data.weight || ''}
                onChange={(e) => onChange('weight', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="flex-1 min-w-0 bg-white dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
              />
              <select
                id="jwl_weight_unit"
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

          {/* Weight in Carat (optional) */}
          <div>
            <label htmlFor="jwl_weight_in_carat" className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
              Weight in Carat
              <span className="ml-1 text-slate-400 dark:text-slate-500 font-normal text-[10px]">(optional)</span>
            </label>
            <input
              id="jwl_weight_in_carat"
              type="number"
              min="0.0001"
              step="0.0001"
              value={data.weight_in_carat ?? ''}
              onChange={(e) => onChange('weight_in_carat', e.target.value === '' ? null : parseFloat(e.target.value) || 0)}
              className={`${inputBase} border-slate-300 dark:border-slate-700`}
              placeholder="0.0000 ct"
            />
          </div>
        </div>
      </div>

      {/* ── Description ──────────────────────────────────────────────── */}
      <div>
        <h3 className={sectionHead}>Description</h3>
        <textarea
          id="jewellery_description"
          value={data.description}
          onChange={(e) => onChange('description', e.target.value)}
          rows={5}
          placeholder="Describe the jewellery piece — type, metal, design, stones set, condition, provenance…"
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 resize-none transition-colors"
        />
      </div>
    </div>
  );
}
