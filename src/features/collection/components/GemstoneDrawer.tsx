'use client';

import React, { useState } from 'react';
import type { GemstoneFormData, GemstoneRecord } from '../types/gemstone.types';
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
  CERTIFICATION_LABS,
} from '../constants/gemstone.constants';

interface GemstoneDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: GemstoneFormData) => void;
  editingRecord?: GemstoneRecord | null;
}

const DEFAULT_FORM_DATA: GemstoneFormData = {
  serialNo: '',
  type: 'Sapphire',
  variety: 'Blue Sapphire',
  nature: 'Natural',
  treatment: 'None / Unheated',
  origin: 'Madagascar (Ilakaka)',
  quantity: 1,
  weight: 1.0,
  weightUnit: 'ct',
  shape: 'Cushion',
  cut: 'Excellent',
  color: 'Royal Blue',
  clarity: 'VVS1 (Very Very Slightly Included 1)',
  dimensions: '',
  certificationNo: '',
  certificationLab: 'GIA (Gemological Institute of America)',
};

export function GemstoneDrawer({
  isOpen,
  onClose,
  onSubmit,
  editingRecord,
}: GemstoneDrawerProps) {
  const getInitialData = (): GemstoneFormData => {
    if (editingRecord) {
      const rest = { ...editingRecord };
      delete (rest as Partial<GemstoneRecord>).id;
      delete (rest as Partial<GemstoneRecord>).createdAt;
      return rest;
    }
    return {
      ...DEFAULT_FORM_DATA,
      serialNo: `GT-MAD-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    };
  };

  const [formData, setFormData] = useState<GemstoneFormData>(getInitialData);
  const [isCustomVariety, setIsCustomVariety] = useState<boolean>(() => {
    if (editingRecord) {
      return !(GEMSTONE_VARIETIES as readonly string[]).includes(editingRecord.variety);
    }
    return false;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleChange = (
    field: keyof GemstoneFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear field error on change
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.serialNo.trim()) {
      newErrors.serialNo = 'Gemstone Serial No. is required';
    }
    if (!formData.type.trim()) {
      newErrors.type = 'Gemstone Type is required';
    }
    if (!formData.weightUnit.trim()) {
      newErrors.weightUnit = 'Weight Unit is required';
    }
    if (formData.quantity === undefined || formData.quantity === null || isNaN(formData.quantity) || formData.quantity < 1) {
      newErrors.quantity = 'Quantity must be at least 1';
    }
    if (formData.weight === undefined || formData.weight === null || isNaN(formData.weight) || formData.weight <= 0) {
      newErrors.weight = 'Weight must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <>
      {/* ── Backdrop ────────────────────────────────────────────────── */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ── Drawer Offcanvas Panel (Right side) ──────────────────────── */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-2xl transition-transform duration-300 animate-in slide-in-from-right">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {editingRecord ? 'Edit Gemstone Record' : 'Add New Gemstone Collection'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Enter physical and laboratory details for the gemstone entry
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Drawer Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Validation Alert Header if errors */}
          {Object.keys(errors).length > 0 && (
            <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-300 space-y-1">
              <span className="font-bold block">Please fix mandatory fields:</span>
              <ul className="list-disc list-inside space-y-0.5">
                {Object.values(errors).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* SECTION 1: Core Gemstone Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 border-b border-slate-200 dark:border-slate-800 pb-1.5">
              Gemstone Information
            </h3>

            {/* Serial No. (Mandatory) */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                Gemstone Serial No. <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.serialNo}
                onChange={(e) => handleChange('serialNo', e.target.value)}
                placeholder="e.g. GT-MAD-2026-001"
                className={`w-full rounded-lg border bg-white dark:bg-slate-950 px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-1 focus:ring-amber-500/50 ${
                  errors.serialNo ? 'border-rose-500/60' : 'border-slate-300 dark:border-slate-700'
                }`}
              />
              {errors.serialNo && (
                <span className="text-[11px] text-rose-500 mt-1 block">{errors.serialNo}</span>
              )}
            </div>

            {/* Type & Variety Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Gemstone Type (Mandatory) */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Gemstone Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                  className={`w-full rounded-lg border bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-amber-500/50 cursor-pointer ${
                    errors.type ? 'border-rose-500/60' : 'border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {GEMSTONE_TYPES.map((t) => (
                    <option key={t} value={t} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                      {t}
                    </option>
                  ))}
                </select>
                {errors.type && (
                  <span className="text-[11px] text-rose-500 mt-1 block">{errors.type}</span>
                )}
              </div>

              {/* Variety (Dropdown / Text) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">Variety</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomVariety(!isCustomVariety);
                      if (!isCustomVariety) {
                        handleChange('variety', '');
                      } else {
                        handleChange('variety', GEMSTONE_VARIETIES[0]);
                      }
                    }}
                    className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold hover:underline"
                  >
                    {isCustomVariety ? 'Select from list' : 'Custom Text'}
                  </button>
                </div>
                {isCustomVariety ? (
                  <input
                    type="text"
                    value={formData.variety}
                    onChange={(e) => handleChange('variety', e.target.value)}
                    placeholder="Enter custom variety..."
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-1 focus:ring-amber-500/50"
                  />
                ) : (
                  <select
                    value={formData.variety}
                    onChange={(e) => handleChange('variety', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-amber-500/50 cursor-pointer"
                  >
                    {GEMSTONE_VARIETIES.map((v) => (
                      <option key={v} value={v} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                        {v}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Natural / Synthetic Radio */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                Natural / Synthetic
              </label>
              <div className="flex items-center gap-4 rounded-lg border border-slate-300 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-950/60 p-2.5">
                <label className="flex items-center gap-2 text-xs text-slate-900 dark:text-slate-100 font-medium cursor-pointer">
                  <input
                    type="radio"
                    name="nature"
                    value="Natural"
                    checked={formData.nature === 'Natural'}
                    onChange={() => handleChange('nature', 'Natural')}
                    className="accent-amber-500 h-4 w-4"
                  />
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    Natural
                  </span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-900 dark:text-slate-100 font-medium cursor-pointer">
                  <input
                    type="radio"
                    name="nature"
                    value="Synthetic"
                    checked={formData.nature === 'Synthetic'}
                    onChange={() => handleChange('nature', 'Synthetic')}
                    className="accent-amber-500 h-4 w-4"
                  />
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                    Synthetic
                  </span>
                </label>
              </div>
            </div>

            {/* Treatment & Origin */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">Treatment</label>
                <select
                  value={formData.treatment}
                  onChange={(e) => handleChange('treatment', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-amber-500/50 cursor-pointer"
                >
                  {TREATMENT_OPTIONS.map((t) => (
                    <option key={t} value={t} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">Origin</label>
                <select
                  value={formData.origin}
                  onChange={(e) => handleChange('origin', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-amber-500/50 cursor-pointer"
                >
                  {ORIGIN_OPTIONS.map((o) => (
                    <option key={o} value={o} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                      {o}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: Quantity & Weight */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 border-b border-slate-200 dark:border-slate-800 pb-1.5">
              Quantity & Weight
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Quantity (Mandatory) */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Quantity <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={formData.quantity}
                  onChange={(e) => handleChange('quantity', parseInt(e.target.value, 10) || 0)}
                  className={`w-full rounded-lg border bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-amber-500/50 ${
                    errors.quantity ? 'border-rose-500/60' : 'border-slate-300 dark:border-slate-700'
                  }`}
                />
                {errors.quantity && (
                  <span className="text-[11px] text-rose-500 mt-1 block">{errors.quantity}</span>
                )}
              </div>

              {/* Weight (Mandatory) */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Weight (Decimal) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={formData.weight}
                  onChange={(e) => handleChange('weight', parseFloat(e.target.value) || 0)}
                  className={`w-full rounded-lg border bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-amber-500/50 ${
                    errors.weight ? 'border-rose-500/60' : 'border-slate-300 dark:border-slate-700'
                  }`}
                />
                {errors.weight && (
                  <span className="text-[11px] text-rose-500 mt-1 block">{errors.weight}</span>
                )}
              </div>

              {/* Weight Unit (Mandatory) */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Weight Unit <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.weightUnit}
                  onChange={(e) => handleChange('weightUnit', e.target.value)}
                  className={`w-full rounded-lg border bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-amber-500/50 cursor-pointer ${
                    errors.weightUnit ? 'border-rose-500/60' : 'border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {WEIGHT_UNITS.map((u) => (
                    <option key={u} value={u} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                      {u}
                    </option>
                  ))}
                </select>
                {errors.weightUnit && (
                  <span className="text-[11px] text-rose-500 mt-1 block">{errors.weightUnit}</span>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 3: Cut, Shape & Grading */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 border-b border-slate-200 dark:border-slate-800 pb-1.5">
              Cut, Shape & Appearance
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Shape */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">Shape</label>
                <select
                  value={formData.shape}
                  onChange={(e) => handleChange('shape', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-amber-500/50 cursor-pointer"
                >
                  {SHAPE_OPTIONS.map((s) => (
                    <option key={s} value={s} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cut */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">Cut</label>
                <select
                  value={formData.cut}
                  onChange={(e) => handleChange('cut', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-amber-500/50 cursor-pointer"
                >
                  {CUT_OPTIONS.map((c) => (
                    <option key={c} value={c} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Color */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">Color</label>
                <select
                  value={formData.color}
                  onChange={(e) => handleChange('color', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-amber-500/50 cursor-pointer"
                >
                  {COLOR_OPTIONS.map((co) => (
                    <option key={co} value={co} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                      {co}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clarity */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">Clarity</label>
                <select
                  value={formData.clarity}
                  onChange={(e) => handleChange('clarity', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-amber-500/50 cursor-pointer"
                >
                  {CLARITY_OPTIONS.map((cl) => (
                    <option key={cl} value={cl} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                      {cl}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dimensions */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                Dimensions (Length x Width x Depth)
              </label>
              <input
                type="text"
                value={formData.dimensions}
                onChange={(e) => handleChange('dimensions', e.target.value)}
                placeholder="e.g. 8.5 x 6.2 x 4.1 mm"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-1 focus:ring-amber-500/50"
              />
            </div>
          </div>

          {/* SECTION 4: Certification */}
          <div className="space-y-4 pb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 border-b border-slate-200 dark:border-slate-800 pb-1.5">
              Certification & Lab
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Certification No. */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Certification No.
                </label>
                <input
                  type="text"
                  value={formData.certificationNo}
                  onChange={(e) => handleChange('certificationNo', e.target.value)}
                  placeholder="e.g. GIA-2481903"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-hidden focus:ring-1 focus:ring-amber-500/50 font-mono"
                />
              </div>

              {/* Certification Laboratory */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Certification Laboratory
                </label>
                <select
                  value={formData.certificationLab}
                  onChange={(e) => handleChange('certificationLab', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-amber-500/50 cursor-pointer"
                >
                  {CERTIFICATION_LABS.map((lab) => (
                    <option key={lab} value={lab} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                      {lab}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </form>

        {/* Drawer Footer Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800 px-6 py-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2 text-xs font-bold text-slate-950 hover:from-amber-400 hover:to-amber-500 transition-colors shadow-md shadow-amber-500/20"
          >
            {editingRecord ? 'Update Gemstone' : 'Save Gemstone'}
          </button>
        </div>
      </div>
    </>
  );
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
