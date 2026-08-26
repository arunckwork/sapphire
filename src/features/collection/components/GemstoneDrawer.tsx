'use client';

import React, { useState, useEffect } from 'react';
import type {
  CollectionFormData,
  CollectionRecord,
  CollectionType,
  SingleStoneFormData,
  BulkStonesFormData,
  JewelleryFormData,
  IndustrialStonesFormData,
  SellerRef,
} from '../types/gemstone.types';
import {
  COLLECTION_TYPE_OPTIONS,
  CERTIFICATION_LABS,
} from '../constants/gemstone.constants';
import { SingleStoneForm } from './SingleStoneForm';
import { BulkStonesForm } from './BulkStonesForm';
import { JewelleryForm } from './JewelleryForm';
import { IndustrialStonesForm } from './IndustrialStonesForm';
import { ImageUploadField } from '@/components/shared/forms/ImageUploadField';

/* ── Default form states per collection type ──────────────────────────────── */

const BASE_DEFAULTS = {
  seller_id: '',
  certification_no: '',
  certification_lab: '',
  asking_price: 0,
  images: [] as File[],
  removed_image_urls: [] as string[],
};

const SINGLE_DEFAULTS: SingleStoneFormData = {
  ...BASE_DEFAULTS,
  collection_type: 'single_stone',
  gemstone_type: '',
  variety: '',
  treatment: '',
  origin: '',
  weight: 0,
  weight_unit: 'ct',
  shape: '',
  cut: '',
  color: '',
  clarity: '',
  dimensions: '',
};

const BULK_DEFAULTS: BulkStonesFormData = {
  ...BASE_DEFAULTS,
  collection_type: 'bulk_stones',
  stones: [{ gemstone_type: '', variety: '', quantity: 1, weight: 0, weight_unit: 'ct' }],
  description: '',
};

const JEWELLERY_DEFAULTS: JewelleryFormData = {
  ...BASE_DEFAULTS,
  collection_type: 'jewellery',
  weight: 0,
  weight_unit: 'g',
  description: '',
};

const INDUSTRIAL_DEFAULTS: IndustrialStonesFormData = {
  ...BASE_DEFAULTS,
  collection_type: 'industrial_stones',
  stone_type: '',
  variety: '',
  weight: 0,
  weight_unit: 'ct',
  description: '',
};

function defaultsForType(type: CollectionType): CollectionFormData {
  switch (type) {
    case 'single_stone':      return { ...SINGLE_DEFAULTS };
    case 'bulk_stones':       return { ...BULK_DEFAULTS, stones: [{ gemstone_type: '', variety: '', quantity: 1, weight: 0, weight_unit: 'ct' }] };
    case 'jewellery':         return { ...JEWELLERY_DEFAULTS };
    case 'industrial_stones': return { ...INDUSTRIAL_DEFAULTS };
  }
}

function recordToFormData(record: CollectionRecord): CollectionFormData {
  const base = {
    seller_id:          record.seller_id || record.seller?.id || '',
    certification_no:   record.certification_no,
    certification_lab:  record.certification_lab,
    asking_price:       Number(record.asking_price),
    images:             [] as File[],
    removed_image_urls: [] as string[],
  };
  switch (record.collection_type) {
    case 'single_stone':
      return { ...base, collection_type: 'single_stone', gemstone_type: record.gemstone_type, variety: record.variety, treatment: record.treatment, origin: record.origin, weight: record.weight, weight_unit: record.weight_unit, shape: record.shape, cut: record.cut, color: record.color, clarity: record.clarity, dimensions: record.dimensions };
    case 'bulk_stones':
      return { ...base, collection_type: 'bulk_stones', stones: record.stones, description: record.description };
    case 'jewellery':
      return { ...base, collection_type: 'jewellery', weight: record.weight, weight_unit: record.weight_unit, description: record.description };
    case 'industrial_stones':
      return { ...base, collection_type: 'industrial_stones', stone_type: record.stone_type, variety: record.variety, weight: record.weight, weight_unit: record.weight_unit, description: record.description };
  }
}

/* ── Props ────────────────────────────────────────────────────────────────── */

interface GemstoneDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: CollectionFormData) => void;
  editingRecord?: CollectionRecord | null;
  sellers: SellerRef[];
  isSellersLoading?: boolean;
  isSubmitting?: boolean;
}

/* ── Component ────────────────────────────────────────────────────────────── */

export function GemstoneDrawer({
  isOpen,
  onClose,
  onSubmit,
  editingRecord,
  sellers,
  isSellersLoading,
  isSubmitting,
}: GemstoneDrawerProps) {
  const [formData, setFormData] = useState<CollectionFormData>(() =>
    editingRecord ? recordToFormData(editingRecord) : { ...SINGLE_DEFAULTS }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Tracks existing image URLs from the record; user can remove individual ones
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>(
    editingRecord?.image_urls ?? []
  );

  /* Reset when drawer opens for a new record or a different editing record */
  useEffect(() => {
    if (isOpen) {
      setFormData(editingRecord ? recordToFormData(editingRecord) : { ...SINGLE_DEFAULTS });
      setExistingImageUrls(editingRecord?.image_urls ?? []);
      setErrors({});
    }
  }, [isOpen, editingRecord]);

  if (!isOpen) return null;

  /* ── Collection type change — wipe type-specific fields ──────────── */
  const handleTypeChange = (type: CollectionType) => {
    if (editingRecord) return; // type is immutable on edit
    setFormData((prev) => ({
      ...defaultsForType(type),
      seller_id:          prev.seller_id,
      certification_no:   prev.certification_no,
      certification_lab:  prev.certification_lab,
      asking_price:       prev.asking_price,
      images:             prev.images,
      removed_image_urls: prev.removed_image_urls,
    }));
    setErrors({});
  };

  /* ── Generic field updater for base fields ────────────────────────── */
  const setBase = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  /* ── Remove an existing (already-uploaded) image URL ─────────────── */
  const handleRemoveExistingImage = (url: string) => {
    setExistingImageUrls((prev) => prev.filter((u) => u !== url));
    setFormData((prev) => ({
      ...prev,
      removed_image_urls: [...prev.removed_image_urls, url],
    }));
  };

  /* ── Seller search / filter ───────────────────────────────────────── */
  const [sellerQuery, setSellerQuery] = useState('');
  const [sellerOpen, setSellerOpen] = useState(false);

  const filteredSellers = sellerQuery.trim()
    ? sellers.filter(
        (s) =>
          `${s.first_name} ${s.last_name ?? ''}`.toLowerCase().includes(sellerQuery.toLowerCase()) ||
          s.email.toLowerCase().includes(sellerQuery.toLowerCase())
      )
    : sellers;

  const selectedSeller = sellers.find((s) => s.id === formData.seller_id) || null;

  /* ── Validation ─────────────────────────────────────────────────────── */
  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.seller_id)                                   errs.seller_id    = 'Seller is required';
    if (!formData.asking_price || formData.asking_price <= 0)  errs.asking_price = 'Asking price must be > 0';

    if (formData.collection_type === 'single_stone') {
      if (!formData.gemstone_type)                             errs.gemstone_type = 'Gemstone Type is required';
      if (!formData.weight || formData.weight <= 0)            errs.weight        = 'Weight must be > 0';
      if (!formData.weight_unit)                               errs.weight_unit   = 'Weight Unit is required';
    }
    if (formData.collection_type === 'bulk_stones') {
      if (!formData.stones.length)                             errs.stones        = 'At least one stone row is required';
      formData.stones.forEach((row, i) => {
        if (!row.gemstone_type) errs[`stones.${i}.gemstone_type`] = 'Required';
        if (!row.quantity || row.quantity < 1) errs[`stones.${i}.quantity`] = 'Min 1';
      });
    }
    if (formData.collection_type === 'jewellery') {
      if (!formData.weight || formData.weight <= 0)            errs.weight        = 'Total weight must be > 0';
      if (!formData.weight_unit)                               errs.weight_unit   = 'Weight Unit is required';
    }
    if (formData.collection_type === 'industrial_stones') {
      if (!formData.stone_type)                                errs.stone_type    = 'Stone Type is required';
      if (!formData.weight || formData.weight <= 0)            errs.weight        = 'Weight must be > 0';
      if (!formData.weight_unit)                               errs.weight_unit   = 'Weight Unit is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSubmit(formData);
  };

  /* ── Shared styles ─────────────────────────────────────────────────── */
  const inputBase =
    'w-full rounded-lg border bg-white dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-colors';
  const sectionHead =
    'text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 border-b border-slate-200 dark:border-slate-800 pb-1.5';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-2xl animate-in slide-in-from-right duration-300">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {editingRecord ? 'Edit Collection' : 'Add New Collection'}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {editingRecord
                ? `Editing: ${editingRecord.serial_no}`
                : 'Fill in seller and collection details'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* Validation summary */}
          {Object.keys(errors).length > 0 && (
            <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-300 space-y-1">
              <span className="font-bold block">Please fix the following:</span>
              <ul className="list-disc list-inside space-y-0.5">
                {Object.values(errors).map((err, i) => <li key={i}>{err}</li>)}
              </ul>
            </div>
          )}

          {/* ── SECTION: Seller ─────────────────────────────────────── */}
          <div className="space-y-3">
            <h3 className={sectionHead}>Seller Information</h3>

            <div className="relative">
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                Seller <span className="text-rose-500">*</span>
              </label>

              {/* Trigger button */}
              <button
                id="seller-autocomplete"
                type="button"
                onClick={() => { setSellerOpen((p) => !p); setSellerQuery(''); }}
                className={`${inputBase} flex items-center justify-between ${errors.seller_id ? 'border-rose-500/60' : 'border-slate-300 dark:border-slate-700'} cursor-pointer`}
              >
                {selectedSeller ? (
                  <span className="text-slate-900 dark:text-slate-100">
                    {selectedSeller.first_name} {selectedSeller.last_name ?? ''}{' '}
                    <span className="text-slate-400 text-[11px]">— {selectedSeller.email}</span>
                  </span>
                ) : (
                  <span className="text-slate-400 dark:text-slate-500">
                    {isSellersLoading ? 'Loading sellers…' : 'Search seller by name or email…'}
                  </span>
                )}
                <ChevronIcon open={sellerOpen} />
              </button>

              {sellerOpen && (
                <div className="absolute z-50 mt-1 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
                  <div className="px-2 py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <input
                      autoFocus
                      type="text"
                      value={sellerQuery}
                      onChange={(e) => setSellerQuery(e.target.value)}
                      placeholder="Search by name or email…"
                      className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
                    />
                  </div>
                  <ul className="max-h-48 overflow-y-auto py-1">
                    {filteredSellers.length === 0 ? (
                      <li className="px-3 py-2 text-xs text-slate-400 italic">No sellers found</li>
                    ) : (
                      filteredSellers.map((s) => (
                        <li
                          key={s.id}
                          onClick={() => {
                            setBase('seller_id', s.id);
                            setSellerOpen(false);
                            setSellerQuery('');
                          }}
                          className={`px-3 py-2 text-xs cursor-pointer transition-colors ${
                            formData.seller_id === s.id
                              ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 font-semibold'
                              : 'text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <span className="font-medium">{s.first_name} {s.last_name ?? ''}</span>
                          <span className="ml-2 text-slate-400 text-[11px]">{s.email}</span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              )}
              {errors.seller_id && (
                <span className="mt-1 block text-[11px] text-rose-500">{errors.seller_id}</span>
              )}
            </div>
          </div>

          {/* ── SECTION: Collection Type ─────────────────────────────── */}
          <div className="space-y-3">
            <h3 className={sectionHead}>Collection Type</h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {COLLECTION_TYPE_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border-2 p-3 text-center text-xs font-semibold transition-all ${
                    editingRecord ? 'opacity-50 cursor-not-allowed' : ''
                  } ${
                    formData.collection_type === opt.value
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-amber-400/50 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <input
                    type="radio"
                    name="collection_type"
                    value={opt.value}
                    checked={formData.collection_type === opt.value}
                    onChange={() => handleTypeChange(opt.value)}
                    disabled={!!editingRecord}
                    className="sr-only"
                  />
                  <CollectionTypeIcon type={opt.value} />
                  {opt.label}
                </label>
              ))}
            </div>
            {editingRecord && (
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Collection type cannot be changed after creation.
              </p>
            )}
          </div>

          {/* ── SECTION: Dynamic type-specific form ─────────────────── */}
          {formData.collection_type === 'single_stone' && (
            <SingleStoneForm
              data={formData as SingleStoneFormData}
              errors={errors}
              onChange={(field, value) =>
                setFormData((prev) => ({ ...prev, [field]: value }))
              }
            />
          )}
          {formData.collection_type === 'bulk_stones' && (
            <BulkStonesForm
              data={formData as BulkStonesFormData}
              errors={errors}
              onChange={(field, value) =>
                setFormData((prev) => ({ ...prev, [field]: value }))
              }
            />
          )}
          {formData.collection_type === 'jewellery' && (
            <JewelleryForm
              data={formData as JewelleryFormData}
              errors={errors}
              onChange={(field, value) =>
                setFormData((prev) => ({ ...prev, [field]: value }))
              }
            />
          )}
          {formData.collection_type === 'industrial_stones' && (
            <IndustrialStonesForm
              data={formData as IndustrialStonesFormData}
              errors={errors}
              onChange={(field, value) =>
                setFormData((prev) => ({ ...prev, [field]: value }))
              }
            />
          )}

          {/* ── SECTION: Certification & Lab (all types) ─────────────── */}
          <div className="space-y-4">
            <h3 className={sectionHead}>Certification & Lab</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="certification_no" className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Certification No.
                </label>
                <input
                  id="certification_no"
                  type="text"
                  value={formData.certification_no}
                  onChange={(e) => setBase('certification_no', e.target.value)}
                  placeholder="e.g. GIA-2481903"
                  className={`${inputBase} border-slate-300 dark:border-slate-700 font-mono`}
                />
              </div>

              <div>
                <label htmlFor="certification_lab" className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Certification Laboratory
                </label>
                <select
                  id="certification_lab"
                  value={formData.certification_lab}
                  onChange={(e) => setBase('certification_lab', e.target.value)}
                  className={`${inputBase} border-slate-300 dark:border-slate-700 cursor-pointer`}
                >
                  <option value="">Select lab…</option>
                  {CERTIFICATION_LABS.map((lab) => (
                    <option key={lab.value} value={lab.value}>{lab.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ── SECTION: Images ──────────────────────────────────────── */}
          <div className="space-y-3">
            <h3 className={sectionHead}>Images</h3>

            {/* Existing image thumbnails (edit mode only) */}
            {existingImageUrls.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Existing images — click ✕ to remove
                </p>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                  {existingImageUrls.map((url) => (
                    <div key={url} className="group relative aspect-square">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt="Collection image"
                        className="h-full w-full rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(url)}
                        className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove image"
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New image upload field */}
            <ImageUploadField
              files={formData.images}
              onChange={(files) => setBase('images', files)}
              label={existingImageUrls.length > 0 ? 'Add more images' : 'Images'}
            />
          </div>

          {/* ── SECTION: Asking Price (all types) ────────────────────── */}
          <div className="space-y-3 pb-4">
            <h3 className={sectionHead}>Pricing</h3>
            <div>
              <label htmlFor="asking_price" className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                Asking Price <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-xs text-slate-400 pointer-events-none">$</span>
                <input
                  id="asking_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.asking_price || ''}
                  onChange={(e) => setBase('asking_price', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className={`${inputBase} pl-7 ${errors.asking_price ? 'border-rose-500/60' : 'border-slate-300 dark:border-slate-700'}`}
                />
              </div>
              {errors.asking_price && (
                <span className="mt-1 block text-[11px] text-rose-500">{errors.asking_price}</span>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800 px-6 py-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2 text-xs font-bold text-slate-950 hover:from-amber-400 hover:to-amber-500 transition-colors shadow-md shadow-amber-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting && <SpinnerIcon />}
            {editingRecord ? 'Update Collection' : 'Save Collection'}
          </button>
        </div>
      </div>
    </>
  );
}

/* ── Icon helpers ─────────────────────────────────────────────────────────── */

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg className={`h-3.5 w-3.5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function CollectionTypeIcon({ type }: { type: CollectionType }) {
  switch (type) {
    case 'single_stone':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 22 8.5 12 22 2 8.5 12 2" />
        </svg>
      );
    case 'bulk_stones':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="8 2 16 2 20 8 12 22 4 8 8 2" /><line x1="4" y1="8" x2="20" y2="8" />
        </svg>
      );
    case 'jewellery':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4.5 8-11.8A8 8 0 0 0 4 10.2C4 17.5 12 22 12 22z" />
        </svg>
      );
    case 'industrial_stones':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        </svg>
      );
  }
}
