'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { useCollectionDetail } from '../hooks/useCollectionDetail';
import { useRole } from '@/features/auth/hooks/useRole';
import { collectionService } from '../services/collection.service';
import { PAYMENT_METHOD_OPTIONS } from '../constants/gemstone.constants';
import type {
  CollectionRecord,
  PaymentMethod,
  SingleStoneCollection,
  BulkStonesCollection,
  IndustrialStonesCollection,
  JewelleryCollection,
} from '../types/gemstone.types';

/* ── Collection type label ───────────────────────────────────────────────── */
const TYPE_LABEL: Record<string, string> = {
  single_stone:      'Single Stone',
  bulk_stones:       'Bulk Stones',
  jewellery:         'Jewellery',
  industrial_stones: 'Industrial Stones',
};

/* ── Type-specific detail rows ───────────────────────────────────────────── */
function CollectionDetailRows({ record }: { record: CollectionRecord }) {
  if (record.collection_type === 'single_stone') {
    const r = record as SingleStoneCollection;
    return (
      <>
        <DetailRow label="Gemstone Type" value={r.gemstone_type} />
        <DetailRow label="Variety" value={r.variety} />
        <DetailRow label="Treatment" value={r.treatment} />
        <DetailRow label="Origin" value={r.origin} />
        <DetailRow label="Weight" value={r.weight ? `${r.weight} ${r.weight_unit}` : undefined} />
        <DetailRow label="Shape" value={r.shape} />
        <DetailRow label="Cut" value={r.cut} />
        <DetailRow label="Color" value={r.color} />
        <DetailRow label="Clarity" value={r.clarity} />
        <DetailRow label="Dimensions" value={r.dimensions} />
      </>
    );
  }
  if (record.collection_type === 'bulk_stones') {
    const r = record as BulkStonesCollection;
    return (
      <>
        <DetailRow label="Description" value={r.description} span={2} />
        <div className="col-span-2">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Stones</span>
          <div className="mt-1.5 overflow-hidden rounded-lg border border-border">
            <table className="w-full text-xs">
              <thead className="bg-muted/50 text-[10px] uppercase font-bold text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left">Gemstone</th>
                  <th className="px-3 py-2 text-left">Variety</th>
                  <th className="px-3 py-2 text-center">Qty</th>
                  <th className="px-3 py-2 text-right">Weight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {r.stones.map((s, i) => (
                  <tr key={i}>
                    <td className="px-3 py-1.5 font-medium capitalize">{s.gemstone_type}</td>
                    <td className="px-3 py-1.5 text-muted-foreground capitalize">{s.variety || '—'}</td>
                    <td className="px-3 py-1.5 text-center">{s.quantity}</td>
                    <td className="px-3 py-1.5 text-right">{s.weight} {s.weight_unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  }
  if (record.collection_type === 'jewellery') {
    const r = record as JewelleryCollection;
    return (
      <>
        <DetailRow label="Weight" value={r.weight ? `${r.weight} ${r.weight_unit}` : undefined} />
        <DetailRow label="Description" value={r.description} span={2} />
      </>
    );
  }
  if (record.collection_type === 'industrial_stones') {
    const r = record as IndustrialStonesCollection;
    return (
      <>
        <DetailRow label="Stone Type" value={r.stone_type} />
        <DetailRow label="Variety" value={r.variety} />
        <DetailRow label="Weight" value={r.weight ? `${r.weight} ${r.weight_unit}` : undefined} />
        <DetailRow label="Description" value={r.description} span={2} />
      </>
    );
  }
  return null;
}

function DetailRow({ label, value, span }: { label: string; value?: string | number; span?: number }) {
  return (
    <div className={span === 2 ? 'col-span-2' : ''}>
      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</span>
      <div className="mt-0.5 text-sm text-slate-900 dark:text-slate-100 font-medium capitalize">
        {value || <span className="text-muted-foreground font-normal italic">—</span>}
      </div>
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────────────────────── */

interface CollectionReviewClientProps {
  id: string;
}

export function CollectionReviewClient({ id }: CollectionReviewClientProps) {
  const router = useRouter();
  const { isAdmin, isManager } = useRole();
  const canReview = isAdmin || isManager;

  const { collection, isLoading, error, refetch } = useCollectionDetail(id);

  const [finalizedPrice, setFinalizedPrice] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');
  const [priceError, setPriceError] = useState('');
  const [methodError, setMethodError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3 text-muted-foreground">
        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="text-sm">Loading collection…</span>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
        <span className="text-sm font-semibold text-foreground">Collection not found</span>
        <Link href="/collection" className="text-xs text-amber-600 hover:underline">← Back to Collections</Link>
      </div>
    );
  }

  const isAccepted = collection.status === 'accepted';

  const handleApprove = async () => {
    let hasError = false;
    if (!finalizedPrice || isNaN(Number(finalizedPrice)) || Number(finalizedPrice) <= 0) {
      setPriceError('Finalized price must be greater than 0');
      hasError = true;
    } else {
      setPriceError('');
    }
    if (!paymentMethod) {
      setMethodError('Payment method is required');
      hasError = true;
    } else {
      setMethodError('');
    }
    if (hasError) return;

    setIsSubmitting(true);
    try {
      await collectionService.reviewCollection(id, {
        finalized_price: Number(finalizedPrice),
        payment_method: paymentMethod as PaymentMethod,
      });
      toast.success(`Collection ${collection.serial_no} accepted successfully.`);
      refetch();
      router.push('/collection');
    } catch {
      toast.error('Failed to approve collection. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls = (hasErr: boolean) =>
    `w-full rounded-lg border px-3.5 py-2.5 text-sm bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-colors ${
      hasErr ? 'border-rose-500/60' : 'border-border'
    }`;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">

      {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/collection" className="hover:text-amber-600 transition-colors">Collections</Link>
        <span>/</span>
        <span className="text-foreground font-medium">{collection.serial_no}</span>
        <span>/</span>
        <span className="text-foreground font-medium">{isAccepted ? 'Details' : 'Review'}</span>
      </div>

      {/* ── Header Card ────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-border bg-card/90 backdrop-blur-md shadow-sm overflow-hidden">
        <div className="relative px-6 py-5 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-foreground">{collection.serial_no}</h1>
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                  isAccepted
                    ? 'border-emerald-500/30 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'border-amber-500/30 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                }`}>
                  {isAccepted ? (
                    <><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Accepted</>
                  ) : (
                    <><span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />In Review</>
                  )}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{TYPE_LABEL[collection.collection_type]}</p>
              <p className="text-xs text-muted-foreground">
                Seller: <strong className="text-foreground">{collection.seller?.first_name} {collection.seller?.last_name ?? ''}</strong>
                {collection.seller?.email && <span className="ml-1 text-muted-foreground">({collection.seller.email})</span>}
              </p>
              <p className="text-xs text-muted-foreground">
                Created: {collection.created_at
                  ? new Date(collection.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                  : '—'}
              </p>
            </div>

            {/* Barcode — shown after acceptance */}
            {isAccepted && collection.barcode_url && (
              <div className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-white dark:bg-slate-950 px-4 py-3 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={collection.barcode_url}
                  alt={`Barcode for ${collection.serial_no}`}
                  className="h-14 object-contain"
                />
                <span className="font-mono text-[11px] text-muted-foreground">{collection.serial_no}</span>
              </div>
            )}
          </div>
        </div>

        {/* Collection Details Grid */}
        <div className="px-6 py-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 border-b border-border pb-1.5 mb-4">
            Collection Details
          </h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <DetailRow label="Collection Type" value={TYPE_LABEL[collection.collection_type]} />
            <DetailRow label="Asking Price" value={`$${Number(collection.asking_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
            <DetailRow label="Certification No." value={collection.certification_no} />
            <DetailRow label="Certification Lab" value={collection.certification_lab} />
            <CollectionDetailRows record={collection} />
          </div>
        </div>

        {/* Images */}
        {collection.image_urls?.length > 0 && (
          <div className="px-6 pb-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 border-b border-border pb-1.5 mb-4">
              Images
            </h2>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {collection.image_urls.map((url) => (
                <div key={url} className="relative aspect-square">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt="Collection image"
                    className="h-full w-full rounded-lg object-cover border border-border"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Accepted: Finalization Details (read-only) ─────────────────── */}
      {isAccepted && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 backdrop-blur-md shadow-sm p-6 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 border-b border-emerald-500/20 pb-1.5">
            Finalization Details
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <DetailRow
              label="Finalized Price"
              value={collection.finalized_price
                ? `$${Number(collection.finalized_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : undefined}
            />
            <DetailRow
              label="Payment Method"
              value={PAYMENT_METHOD_OPTIONS.find((o) => o.value === collection.payment_method)?.label}
            />
          </div>
        </div>
      )}

      {/* ── Review Form (only for non-accepted records, admin/manager only) */}
      {!isAccepted && canReview && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-50/30 dark:bg-amber-950/10 backdrop-blur-md shadow-sm p-6 space-y-5">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 border-b border-amber-500/20 pb-1.5">
              Approve &amp; Accept
            </h2>
            <p className="mt-2 text-xs text-muted-foreground">
              Set the finalized price and payment method, then accept this collection. Once accepted it cannot be edited.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Finalized Price */}
            <div>
              <label htmlFor="finalized_price" className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                Finalized Price <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground pointer-events-none">$</span>
                <input
                  id="finalized_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={finalizedPrice}
                  onChange={(e) => { setFinalizedPrice(e.target.value); setPriceError(''); }}
                  placeholder="0.00"
                  className={`${inputCls(!!priceError)} pl-7`}
                />
              </div>
              {priceError && <p className="mt-1 text-[11px] text-rose-500">{priceError}</p>}
              {collection.asking_price && (
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Asking price: ${Number(collection.asking_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <label htmlFor="payment_method" className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                Payment Method <span className="text-rose-500">*</span>
              </label>
              <select
                id="payment_method"
                value={paymentMethod}
                onChange={(e) => { setPaymentMethod(e.target.value as PaymentMethod); setMethodError(''); }}
                className={inputCls(!!methodError)}
              >
                <option value="">Select payment method…</option>
                {PAYMENT_METHOD_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {methodError && <p className="mt-1 text-[11px] text-rose-500">{methodError}</p>}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/collection"
              className="rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              Back to Collections
            </Link>
            <button
              type="button"
              onClick={handleApprove}
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-2.5 text-sm font-bold text-white hover:from-emerald-500 hover:to-emerald-600 shadow-md shadow-emerald-500/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              )}
              {isSubmitting ? 'Processing…' : 'Approve & Accept'}
            </button>
          </div>
        </div>
      )}

      {/* ── Non-manager viewing a review-status collection ─────────────── */}
      {!isAccepted && !canReview && (
        <div className="rounded-2xl border border-border bg-card/60 p-6 text-center space-y-2">
          <p className="text-sm text-muted-foreground">This collection is pending review by a manager or administrator.</p>
          <Link href="/collection" className="inline-block text-xs text-amber-600 hover:underline">← Back to Collections</Link>
        </div>
      )}

      {/* ── Accepted: Back link ────────────────────────────────────────── */}
      {isAccepted && (
        <div className="flex justify-start">
          <Link
            href="/collection"
            className="rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            ← Back to Collections
          </Link>
        </div>
      )}
    </div>
  );
}
