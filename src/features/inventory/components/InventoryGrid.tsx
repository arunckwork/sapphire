'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getMediaUrl } from '@/utils/media';
import type {
  CollectionRecord,
  SortConfig,
  SortField,
  SingleStoneCollection,
  BulkStonesCollection,
  JewelleryCollection,
  IndustrialStonesCollection,
  UserRef,
} from '@/features/collection/types/gemstone.types';
import { COLLECTION_TYPE_OPTIONS } from '@/features/collection/constants/gemstone.constants';

/* ── Props ─────────────────────────────────────────────────────────────── */

interface InventoryGridProps {
  records: CollectionRecord[];
  isLoading: boolean;
}

/* ── Filter state ──────────────────────────────────────────────────────── */

interface InventoryFilterState {
  search: string;
  collection_type: string;
}

const DEFAULT_FILTERS: InventoryFilterState = {
  search: '',
  collection_type: 'ALL',
};

/* ── Display helpers ───────────────────────────────────────────────────── */

const COLLECTION_TYPE_BADGE: Record<string, string> = {
  single_stone:      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-500/30',
  bulk_stones:       'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 border-sky-500/30',
  jewellery:         'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-500/30',
  industrial_stones: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-500/30',
};

const COLLECTION_TYPE_LABEL: Record<string, string> = {
  single_stone:      'Single Stone',
  bulk_stones:       'Bulk Stones',
  jewellery:         'Jewellery',
  industrial_stones: 'Industrial',
};

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  cash:          'Cash',
  mobile_money:  'Mobile Money',
  bank_transfer: 'Bank Transfer',
};

function getWeightDisplay(record: CollectionRecord): string {
  if (record.collection_type === 'single_stone') {
    const r = record as SingleStoneCollection;
    return `${r.weight} ${r.weight_unit}`;
  }
  if (record.collection_type === 'industrial_stones') {
    const r = record as IndustrialStonesCollection;
    return `${r.weight} ${r.weight_unit}`;
  }
  if (record.collection_type === 'bulk_stones') {
    const r = record as BulkStonesCollection;
    const qty       = r.stones.reduce((acc, s) => acc + (s.quantity || 0), 0);
    const weightSum = r.stones.reduce((acc, s) => acc + (s.weight || 0), 0);
    const primaryUnit = r.stones[0]?.weight_unit || 'ct';
    return weightSum > 0 ? `${weightSum} ${primaryUnit} · ${qty} pcs` : `${qty} pcs`;
  }
  if (record.collection_type === 'jewellery') {
    const r = record as JewelleryCollection;
    return r.weight ? `${r.weight} ${r.weight_unit}` : '—';
  }
  return '—';
}

function getDetailsDisplay(record: CollectionRecord): string {
  switch (record.collection_type) {
    case 'single_stone': {
      const r = record as SingleStoneCollection;
      const parts = [r.gemstone_type, r.variety].filter(Boolean);
      return parts.length ? parts.join(' · ') : '—';
    }
    case 'bulk_stones': {
      const r = record as BulkStonesCollection;
      const types = [...new Set(r.stones.map((s) => s.gemstone_type).filter(Boolean))];
      return types.length ? types.join(', ') : '—';
    }
    case 'jewellery':
      return record.description
        ? record.description.slice(0, 60) + (record.description.length > 60 ? '…' : '')
        : '—';
    case 'industrial_stones': {
      const r = record as IndustrialStonesCollection;
      return [r.stone_type, r.variety].filter(Boolean).join(' · ') || '—';
    }
  }
}

function formatUserName(user?: UserRef | null): string {
  if (!user) return '—';
  return `${user.first_name} ${user.last_name ?? ''}`.trim();
}

/* ── Component ─────────────────────────────────────────────────────────── */

export function InventoryGrid({ records, isLoading }: InventoryGridProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<InventoryFilterState>(DEFAULT_FILTERS);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'created_at', order: 'desc' });

  const handleSort = (field: SortField) => {
    setSortConfig((prev) =>
      prev.field === field
        ? { field, order: prev.order === 'asc' ? 'desc' : 'asc' }
        : { field, order: 'asc' }
    );
  };

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  const hasActiveFilters =
    filters.search !== '' || filters.collection_type !== 'ALL';

  const processedRecords = useMemo(() => {
    return records
      .filter((rec) => {
        if (filters.search.trim()) {
          const q = filters.search.toLowerCase();
          const sellerName = `${rec.seller?.first_name ?? ''} ${rec.seller?.last_name ?? ''}`.toLowerCase();
          const createdBy  = formatUserName(rec.created_by).toLowerCase();
          const approvedBy = formatUserName(rec.approved_by).toLowerCase();
          if (
            !rec.serial_no?.toLowerCase().includes(q) &&
            !sellerName.includes(q) &&
            !rec.collection_type.includes(q) &&
            !rec.certification_no?.toLowerCase().includes(q) &&
            !createdBy.includes(q) &&
            !approvedBy.includes(q)
          ) return false;
        }
        if (filters.collection_type !== 'ALL' && rec.collection_type !== filters.collection_type) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        const { field, order } = sortConfig;
        let valA: string | number = '';
        let valB: string | number = '';
        if (field === 'asking_price') {
          valA = Number(a.asking_price) || 0;
          valB = Number(b.asking_price) || 0;
        } else if (field === 'created_at') {
          valA = (a.created_at ?? '').toLowerCase();
          valB = (b.created_at ?? '').toLowerCase();
        } else {
          valA = (a.collection_type ?? '').toLowerCase();
          valB = (b.collection_type ?? '').toLowerCase();
        }
        if (valA < valB) return order === 'asc' ? -1 : 1;
        if (valA > valB) return order === 'asc' ? 1 : -1;
        return 0;
      });
  }, [records, filters, sortConfig]);

  return (
    <div className="space-y-4">
      {/* ── Toolbar ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between rounded-xl border border-border bg-card/90 p-4 backdrop-blur-md shadow-xs text-card-foreground">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search */}
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              placeholder="Search serial, seller, cert…"
              className="w-full rounded-lg border border-border bg-background pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-teal-500/50"
            />
            <SearchIcon />
          </div>

          {/* Collection Type Filter */}
          <select
            value={filters.collection_type}
            onChange={(e) => setFilters((f) => ({ ...f, collection_type: e.target.value }))}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-teal-500/50 cursor-pointer"
          >
            <option value="ALL">All Types</option>
            {COLLECTION_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-2.5 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-300 hover:bg-rose-500/20 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* ── Table ────────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-xl border border-border bg-card/90 backdrop-blur-md shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-foreground">
            <thead
              style={{ backgroundColor: 'hsl(var(--table-header-bg))', color: 'hsl(var(--table-header-fg))' }}
              className="border-b border-border text-[11px] font-bold uppercase tracking-wider"
            >
              <tr>
                {/* Collection Type + Seller */}
                <th
                  onClick={() => handleSort('collection_type')}
                  className="px-4 py-3.5 cursor-pointer hover:text-teal-600 dark:hover:text-teal-400 transition-colors select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Collection</span>
                    <SortIndicator field="collection_type" currentSort={sortConfig} />
                  </div>
                </th>
                {/* Details */}
                <th className="px-4 py-3.5 select-none">Details</th>
                {/* Weight / Qty */}
                <th className="px-4 py-3.5 select-none">Weight / Qty</th>
                {/* Certification */}
                <th className="px-4 py-3.5 select-none">Certification</th>
                {/* Asking Price */}
                <th
                  onClick={() => handleSort('asking_price')}
                  className="px-4 py-3.5 cursor-pointer hover:text-teal-600 dark:hover:text-teal-400 transition-colors select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Asking Price</span>
                    <SortIndicator field="asking_price" currentSort={sortConfig} />
                  </div>
                </th>
                {/* Finalized Price */}
                <th className="px-4 py-3.5 select-none">Finalized Price</th>
                {/* Payment Method */}
                <th className="px-4 py-3.5 select-none">Payment</th>
                {/* Created By */}
                <th className="px-4 py-3.5 select-none">Created By</th>
                {/* Approved By */}
                <th className="px-4 py-3.5 select-none">Approved By</th>
                {/* Date */}
                <th
                  onClick={() => handleSort('created_at')}
                  className="px-4 py-3.5 cursor-pointer hover:text-teal-600 dark:hover:text-teal-400 transition-colors select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Added</span>
                    <SortIndicator field="created_at" currentSort={sortConfig} />
                  </div>
                </th>
                {/* Actions */}
                <th className="px-4 py-3.5 text-right select-none">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border/60">
              {isLoading ? (
                /* ── Skeleton rows ─────────────────────────────────────── */
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 11 }).map((__, j) => (
                      <td key={j} className="px-4 py-3.5">
                        <div className="h-3 rounded bg-muted animate-pulse" style={{ width: `${60 + (j * 7) % 40}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : processedRecords.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <EmptyIcon />
                      <span className="font-semibold text-sm text-foreground">No accepted collections found</span>
                      <span className="text-xs text-muted-foreground">
                        {hasActiveFilters
                          ? 'Try adjusting your search or filter.'
                          : 'Accepted collections will appear here once reviewed.'}
                      </span>
                      {hasActiveFilters && (
                        <button
                          onClick={resetFilters}
                          className="mt-2 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground hover:bg-secondary/80"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                processedRecords.map((item) => (
                  <tr key={item.id} className="group hover:bg-muted/50 transition-colors duration-150">

                    {/* Collection Type + Seller */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold w-fit ${COLLECTION_TYPE_BADGE[item.collection_type]}`}>
                          {COLLECTION_TYPE_LABEL[item.collection_type]}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {item.seller
                            ? `${item.seller.first_name} ${item.seller.last_name ?? ''}`
                            : <span className="italic">—</span>}
                        </span>
                        {item.serial_no && (
                          <span className="font-mono text-[10px] text-teal-600 dark:text-teal-400">
                            {item.serial_no}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Details */}
                    <td className="px-4 py-3.5 max-w-[180px]">
                      <span className="text-foreground font-medium line-clamp-2">
                        {getDetailsDisplay(item)}
                      </span>
                    </td>

                    {/* Weight / Qty */}
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-foreground">
                        {getWeightDisplay(item)}
                      </span>
                    </td>

                    {/* Certification */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-0.5">
                        {item.certification_no ? (
                          <>
                            <span className="font-mono text-[11px] text-sky-600 dark:text-sky-400 font-semibold">
                              {item.certification_no}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {item.certification_lab || '—'}
                            </span>
                          </>
                        ) : (
                          <span className="text-[11px] text-muted-foreground italic">Uncertified</span>
                        )}
                      </div>
                    </td>

                    {/* Asking Price */}
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-foreground">
                        {item.asking_price != null && !isNaN(Number(item.asking_price))
                          ? `$${Number(item.asking_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : '—'}
                      </span>
                    </td>

                    {/* Finalized Price */}
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {item.finalized_price != null && !isNaN(Number(item.finalized_price))
                          ? `$${Number(item.finalized_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : '—'}
                      </span>
                    </td>

                    {/* Payment Method */}
                    <td className="px-4 py-3.5">
                      {item.payment_method ? (
                        <span className="inline-flex items-center rounded-full border border-teal-500/30 bg-teal-50 dark:bg-teal-900/20 px-2 py-0.5 text-[10px] font-semibold text-teal-700 dark:text-teal-300">
                          {PAYMENT_METHOD_LABEL[item.payment_method] ?? item.payment_method}
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground italic">—</span>
                      )}
                    </td>

                    {/* Created By */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-medium text-foreground">
                          {formatUserName(item.created_by)}
                        </span>
                        {item.created_by?.email && (
                          <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                            {item.created_by.email}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Approved By */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-medium text-foreground">
                          {formatUserName(item.approved_by)}
                        </span>
                        {item.approved_by?.email && (
                          <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                            {item.approved_by.email}
                          </span>
                        )}
                        {item.approved_at && (
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(item.approved_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Added date */}
                    <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap">
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '—'}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100">
                        {/* View Details */}
                        <button
                          onClick={() => router.push(`/collection/${item.id}/review`)}
                          title="View Details"
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-slate-500/10 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                        >
                          <EyeIcon />
                        </button>

                        {/* View Payment Voucher */}
                        {item.voucher_url ? (
                          <a
                            href={getMediaUrl(item.voucher_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View Payment Voucher"
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-teal-500/10 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                          >
                            <VoucherIcon />
                          </a>
                        ) : (
                          <button
                            disabled
                            title="Voucher not yet available"
                            className="rounded-md p-1.5 text-muted-foreground/30 cursor-not-allowed"
                          >
                            <VoucherIcon />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div
          style={{ backgroundColor: 'hsl(var(--table-footer-bg))', color: 'hsl(var(--table-footer-fg))' }}
          className="border-t border-border px-4 py-2.5 flex items-center justify-between text-[11px] font-semibold"
        >
          <span>
            Showing <strong className="text-foreground">{processedRecords.length}</strong> of{' '}
            <strong className="text-foreground">{records.length}</strong> accepted entries
          </span>
          {hasActiveFilters && <span>Filtered by active criteria</span>}
        </div>
      </div>
    </div>
  );
}

/* ── Sort Indicator ──────────────────────────────────────────────────────── */

function SortIndicator({ field, currentSort }: { field: SortField; currentSort: SortConfig }) {
  if (currentSort.field !== field) return <span className="text-muted-foreground text-[10px]">↕</span>;
  return <span className="text-teal-600 dark:text-teal-400 text-[10px]">{currentSort.order === 'asc' ? '↑' : '↓'}</span>;
}

/* ── Icons ───────────────────────────────────────────────────────────────── */

function SearchIcon() {
  return (
    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function VoucherIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function EmptyIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
      <polygon points="12 2 22 8.5 12 22 2 8.5 12 2" />
      <line x1="2" y1="8.5" x2="22" y2="8.5" />
    </svg>
  );
}
