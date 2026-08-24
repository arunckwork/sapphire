'use client';

import React, { useState, useMemo } from 'react';
import type {
  CollectionRecord,
  SortConfig,
  SortField,
  CollectionFilterState,
  SingleStoneCollection,
  BulkStonesCollection,
  JewelleryCollection,
  IndustrialStonesCollection,
} from '../types/gemstone.types';
import { COLLECTION_TYPE_OPTIONS } from '../constants/gemstone.constants';

interface CollectionGridProps {
  records: CollectionRecord[];
  onEdit: (record: CollectionRecord) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

const DEFAULT_FILTERS: CollectionFilterState = {
  search: '',
  collection_type: 'ALL',
};

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

/* ── Helpers to extract display values from polymorphic records ─────────── */

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
    const qty = r.stones.reduce((acc, s) => acc + (s.quantity || 0), 0);
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
      return record.description ? record.description.slice(0, 60) + (record.description.length > 60 ? '…' : '') : '—';
    case 'industrial_stones': {
      const r = record as IndustrialStonesCollection;
      return [r.stone_type, r.variety].filter(Boolean).join(' · ') || '—';
    }
  }
}

/* ── Component ─────────────────────────────────────────────────────────── */

export function GemstoneGrid({ records, onEdit, onDelete, onAddNew }: CollectionGridProps) {
  const [filters, setFilters] = useState<CollectionFilterState>(DEFAULT_FILTERS);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'created_at', order: 'desc' });
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
          if (
            !rec.serial_no?.toLowerCase().includes(q) &&
            !sellerName.includes(q) &&
            !rec.collection_type.includes(q) &&
            !rec.certification_no?.toLowerCase().includes(q)
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

  const recordToDelete = records.find((r) => r.id === deletingId);

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
              className="w-full rounded-lg border border-border bg-background pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50"
            />
            <SearchIcon />
          </div>

          {/* Collection Type Filter */}
          <select
            value={filters.collection_type}
            onChange={(e) => setFilters((f) => ({ ...f, collection_type: e.target.value }))}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50 cursor-pointer"
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

        <button
          onClick={onAddNew}
          className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all duration-200 shrink-0"
        >
          <PlusIcon />
          <span>Add Collection</span>
        </button>
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
                  className="px-4 py-3.5 cursor-pointer hover:text-amber-600 dark:hover:text-amber-400 transition-colors select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Collection</span>
                    <SortIndicator field="collection_type" currentSort={sortConfig} />
                  </div>
                </th>
                {/* Details summary */}
                <th className="px-4 py-3.5 select-none">Details</th>
                {/* Weight / Qty */}
                <th className="px-4 py-3.5 select-none">Weight / Qty</th>
                {/* Certification */}
                <th className="px-4 py-3.5 select-none">Certification</th>
                {/* Asking Price */}
                <th
                  onClick={() => handleSort('asking_price')}
                  className="px-4 py-3.5 cursor-pointer hover:text-amber-600 dark:hover:text-amber-400 transition-colors select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Asking Price</span>
                    <SortIndicator field="asking_price" currentSort={sortConfig} />
                  </div>
                </th>
                {/* Date */}
                <th
                  onClick={() => handleSort('created_at')}
                  className="px-4 py-3.5 cursor-pointer hover:text-amber-600 dark:hover:text-amber-400 transition-colors select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Added</span>
                    <SortIndicator field="created_at" currentSort={sortConfig} />
                  </div>
                </th>
                <th className="px-4 py-3.5 text-right select-none">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border/60">
              {processedRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <EmptyIcon />
                      <span className="font-semibold text-sm text-foreground">No collections found</span>
                      <span className="text-xs text-muted-foreground">
                        {hasActiveFilters
                          ? 'Try adjusting your search or filter.'
                          : 'Click "Add Collection" to record your first entry.'}
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
                          <span className="font-mono text-[10px] text-amber-600 dark:text-amber-400">
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

                    {/* Added date */}
                    <td className="px-4 py-3.5 text-muted-foreground whitespace-nowrap">
                      {item.created_at
                        ? new Date(item.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                        : '—'}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100">
                        <button
                          onClick={() => onEdit(item)}
                          title="Edit"
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => setDeletingId(item.id)}
                          title="Delete"
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                        >
                          <TrashIcon />
                        </button>
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
            <strong className="text-foreground">{records.length}</strong> entries
          </span>
          {hasActiveFilters && <span>Filtered by active criteria</span>}
        </div>
      </div>

      {/* ── Delete Confirm ────────────────────────────────────────────── */}
      {deletingId && recordToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-2xl space-y-4 text-card-foreground">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-500/10 border border-rose-500/30">
                <TrashIcon />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Delete Collection?</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  This action cannot be undone.
                  {recordToDelete.serial_no && (
                    <> Record <strong className="text-foreground">{recordToDelete.serial_no}</strong> will be removed.</>
                  )}
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-muted/60 p-3 text-xs text-foreground space-y-1">
              <div>
                <strong>Type:</strong>{' '}
                {COLLECTION_TYPE_LABEL[recordToDelete.collection_type]}
              </div>
              <div>
                <strong>Seller:</strong>{' '}
                {recordToDelete.seller ? `${recordToDelete.seller.first_name} ${recordToDelete.seller.last_name ?? ''}` : '—'}
              </div>
              <div>
                <strong>Asking Price:</strong>{' '}
                ${recordToDelete.asking_price?.toLocaleString() ?? '—'}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="rounded-lg border border-border px-4 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={() => { onDelete(deletingId); setDeletingId(null); }}
                className="rounded-lg bg-rose-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-rose-500 shadow-sm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Icons & helpers ──────────────────────────────────────────────────────── */

function SortIndicator({ field, currentSort }: { field: SortField; currentSort: SortConfig }) {
  if (currentSort.field !== field) return <span className="text-muted-foreground text-[10px]">↕</span>;
  return <span className="text-amber-600 dark:text-amber-400 text-[10px]">{currentSort.order === 'asc' ? '↑' : '↓'}</span>;
}

function SearchIcon() {
  return (
    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    </div>
  );
}
function PlusIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
}
function EditIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
}
function TrashIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>;
}
function EmptyIcon() {
  return <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><polygon points="12 2 22 8.5 12 22 2 8.5 12 2" /><line x1="2" y1="8.5" x2="22" y2="8.5" /></svg>;
}
