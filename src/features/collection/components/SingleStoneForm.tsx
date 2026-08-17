'use client';

import React from 'react';
import type { SingleStoneFormData } from '../types/gemstone.types';
import {
  GEMSTONE_TYPES,
  GEMSTONE_VARIETIES,
  TREATMENT_OPTIONS,
  ORIGIN_OPTIONS,
  WEIGHT_UNITS,
  SHAPE_OPTIONS,
  CUT_OPTIONS,
  COLOR_OPTIONS,
  CLARITY_OPTIONS,
} from '../constants/gemstone.constants';
import { AutocompleteField } from '@/components/shared/forms/AutocompleteField';

interface SingleStoneFormProps {
  data: SingleStoneFormData;
  errors: Record<string, string>;
  onChange: (field: keyof SingleStoneFormData, value: string | number) => void;
}

const sectionHead =
  'text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 border-b border-slate-200 dark:border-slate-800 pb-1.5';
const inputBase =
  'w-full rounded-lg border bg-white dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-colors';
const labelBase = 'block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1';

function borderFor(field: string, errors: Record<string, string>) {
  return errors[field] ? 'border-rose-500/60' : 'border-slate-300 dark:border-slate-700';
}

export function SingleStoneForm({ data, errors, onChange }: SingleStoneFormProps) {
  return (
    <div className="space-y-6">

      {/* ── Gemstone Details ─────────────────────────────────────────── */}
      <div className="space-y-4">
        <h3 className={sectionHead}>Gemstone Details</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AutocompleteField
            id="gemstone_type"
            label="Gemstone Type"
            required
            options={GEMSTONE_TYPES}
            value={data.gemstone_type}
            onChange={(v) => onChange('gemstone_type', v)}
            placeholder="e.g. sapphire"
            error={errors.gemstone_type}
          />

          <AutocompleteField
            id="variety"
            label="Variety"
            options={GEMSTONE_VARIETIES}
            value={data.variety}
            onChange={(v) => onChange('variety', v)}
            placeholder="e.g. blue sapphire"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AutocompleteField
            id="treatment"
            label="Treatment"
            options={TREATMENT_OPTIONS}
            value={data.treatment}
            onChange={(v) => onChange('treatment', v)}
            placeholder="e.g. none / unheated"
          />

          <AutocompleteField
            id="origin"
            label="Origin"
            options={ORIGIN_OPTIONS}
            value={data.origin}
            onChange={(v) => onChange('origin', v)}
            placeholder="e.g. sri lanka (ratnapura)"
          />
        </div>
      </div>

      {/* ── Weight ─────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <h3 className={sectionHead}>Weight</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="weight" className={labelBase}>
              Weight (Decimal) <span className="text-rose-500">*</span>
            </label>
            <input
              id="weight"
              type="number"
              min="0.001"
              step="0.001"
              value={data.weight}
              onChange={(e) => onChange('weight', parseFloat(e.target.value) || 0)}
              className={`${inputBase} ${borderFor('weight', errors)}`}
            />
            {errors.weight && (
              <span className="mt-1 block text-[11px] text-rose-500">{errors.weight}</span>
            )}
          </div>

          <div>
            <label htmlFor="weight_unit" className={labelBase}>
              Weight Unit <span className="text-rose-500">*</span>
            </label>
            <select
              id="weight_unit"
              value={data.weight_unit}
              onChange={(e) => onChange('weight_unit', e.target.value)}
              className={`${inputBase} ${borderFor('weight_unit', errors)} cursor-pointer`}
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

      {/* ── Cut, Shape & Appearance ─────────────────────────────────── */}
      <div className="space-y-4">
        <h3 className={sectionHead}>Cut, Shape & Appearance</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AutocompleteField
            id="shape"
            label="Shape"
            options={SHAPE_OPTIONS}
            value={data.shape}
            onChange={(v) => onChange('shape', v)}
            placeholder="e.g. cushion"
          />

          <AutocompleteField
            id="cut"
            label="Cut"
            options={CUT_OPTIONS}
            value={data.cut}
            onChange={(v) => onChange('cut', v)}
            placeholder="e.g. excellent"
          />

          <AutocompleteField
            id="color"
            label="Color"
            options={COLOR_OPTIONS}
            value={data.color}
            onChange={(v) => onChange('color', v)}
            placeholder="e.g. royal blue"
          />

          <AutocompleteField
            id="clarity"
            label="Clarity"
            options={CLARITY_OPTIONS}
            value={data.clarity}
            onChange={(v) => onChange('clarity', v)}
            placeholder="e.g. vvs1"
          />
        </div>

        {/* Dimensions — three numeric inputs */}
        <div>
          <label className={labelBase}>Dimensions (Length × Width × Depth)</label>
          <DimensionsInput
            value={data.dimensions}
            onChange={(v) => onChange('dimensions', v)}
          />
        </div>
      </div>
    </div>
  );
}

/* ── Dimensions helper ────────────────────────────────────────────────────── */

function DimensionsInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  // Parse "L x W x D mm" or leave as raw
  const parts = value.replace(/\s*mm\s*$/, '').split(/\s*x\s*/i);
  const l = parts[0] ?? '';
  const w = parts[1] ?? '';
  const d = parts[2] ?? '';

  const emit = (newL: string, newW: string, newD: string) => {
    const filled = [newL, newW, newD].filter(Boolean);
    onChange(filled.length ? `${newL} x ${newW} x ${newD} mm` : '');
  };

  const partInput = (
    placeholder: string,
    val: string,
    onPart: (v: string) => void
  ) => (
    <input
      type="number"
      min="0"
      step="0.01"
      value={val}
      onChange={(e) => onPart(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-colors"
    />
  );

  return (
    <div className="flex items-center gap-2">
      {partInput('L', l, (v) => emit(v, w, d))}
      <span className="text-xs text-slate-400 font-medium shrink-0">×</span>
      {partInput('W', w, (v) => emit(l, v, d))}
      <span className="text-xs text-slate-400 font-medium shrink-0">×</span>
      {partInput('D', d, (v) => emit(l, w, v))}
      <span className="text-[11px] text-slate-400 shrink-0">mm</span>
    </div>
  );
}
