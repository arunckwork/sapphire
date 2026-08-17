'use client';

import React from 'react';
import type { BulkStonesFormData, BulkStoneRow } from '../types/gemstone.types';
import { GEMSTONE_TYPES, GEMSTONE_VARIETIES, WEIGHT_UNITS } from '../constants/gemstone.constants';
import { AutocompleteField } from '@/components/shared/forms/AutocompleteField';

interface BulkStonesFormProps {
  data: BulkStonesFormData;
  errors: Record<string, string>;
  onChange: <K extends keyof BulkStonesFormData>(field: K, value: BulkStonesFormData[K]) => void;
}

const sectionHead =
  'text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 border-b border-slate-200 dark:border-slate-800 pb-1.5';
const inputBase =
  'w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-colors';

const EMPTY_ROW: BulkStoneRow = {
  gemstone_type: '',
  variety: '',
  quantity: 1,
  weight: 0,
  weight_unit: 'ct',
};

export function BulkStonesForm({ data, errors, onChange }: BulkStonesFormProps) {
  const updateRow = (index: number, patch: Partial<BulkStoneRow>) => {
    const updated = data.stones.map((row, i) =>
      i === index ? { ...row, ...patch } : row
    );
    onChange('stones', updated);
  };

  const addRow = () => onChange('stones', [...data.stones, { ...EMPTY_ROW }]);

  const removeRow = (index: number) =>
    onChange('stones', data.stones.filter((_, i) => i !== index));

  return (
    <div className="space-y-6">

      {/* ── Stone Rows ──────────────────────────────────────────────── */}
      <div className="space-y-3">
        <h3 className={sectionHead}>Stone Rows</h3>

        {errors.stones && (
          <span className="block text-[11px] text-rose-500">{errors.stones}</span>
        )}

        {data.stones.map((row, idx) => (
          <div
            key={idx}
            className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-3 space-y-3"
          >
            {/* Row header */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Stone #{idx + 1}
              </span>
              {data.stones.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRow(idx)}
                  className="text-[11px] font-semibold text-rose-500 hover:text-rose-400 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <AutocompleteField
                id={`bulk_type_${idx}`}
                label="Gemstone Type"
                required
                options={GEMSTONE_TYPES}
                value={row.gemstone_type}
                onChange={(v) => updateRow(idx, { gemstone_type: v })}
                placeholder="e.g. sapphire"
                error={errors[`stones.${idx}.gemstone_type`]}
              />

              <AutocompleteField
                id={`bulk_variety_${idx}`}
                label="Variety"
                options={GEMSTONE_VARIETIES}
                value={row.variety}
                onChange={(v) => updateRow(idx, { variety: v })}
                placeholder="e.g. blue sapphire"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Quantity <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={row.quantity}
                  onChange={(e) => updateRow(idx, { quantity: parseInt(e.target.value, 10) || 1 })}
                  className={`${inputBase} ${errors[`stones.${idx}.quantity`] ? 'border-rose-500/60' : ''}`}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Total Weight
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.001"
                  value={row.weight || ''}
                  onChange={(e) => updateRow(idx, { weight: parseFloat(e.target.value) || 0 })}
                  className={inputBase}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Weight Unit
                </label>
                <select
                  value={row.weight_unit || 'ct'}
                  onChange={(e) => updateRow(idx, { weight_unit: e.target.value })}
                  className={`${inputBase} cursor-pointer`}
                >
                  {WEIGHT_UNITS.map((u) => (
                    <option key={u.value} value={u.value}>{u.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addRow}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-amber-500/40 py-2 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:border-amber-500/70 hover:bg-amber-50/30 dark:hover:bg-amber-900/10 transition-colors"
        >
          <PlusIcon />
          Add Stone Row
        </button>
      </div>

      {/* ── Description ──────────────────────────────────────────────── */}
      <div>
        <h3 className={`${sectionHead} mb-3`}>Description</h3>
        <textarea
          value={data.description}
          onChange={(e) => onChange('description', e.target.value)}
          rows={3}
          placeholder="Describe the bulk lot, provenance, notes…"
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 resize-none transition-colors"
        />
      </div>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
