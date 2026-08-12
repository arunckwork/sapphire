'use client';

import React, { useState, useMemo } from 'react';
import {
  GemstoneRecord,
  SortConfig,
  SortField,
  GemstoneFilterState,
} from '@/types/gemstone.types';
import { GEMSTONE_TYPES, ORIGIN_OPTIONS } from '@/constants/gemstone.constants';

interface GemstoneGridProps {
  records: GemstoneRecord[];
  onEdit: (record: GemstoneRecord) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

const DEFAULT_FILTERS: GemstoneFilterState = {
  search: '',
  type: 'ALL',
  origin: 'ALL',
  nature: 'ALL',
  treatment: 'ALL',
};

export function GemstoneGrid({
  records,
  onEdit,
  onDelete,
  onAddNew,
}: GemstoneGridProps) {
  const [filters, setFilters] = useState<GemstoneFilterState>(DEFAULT_FILTERS);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'createdAt',
    order: 'desc',
  });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Handle header sort click
  const handleSort = (field: SortField) => {
    setSortConfig((prev) => {
      if (prev.field === field) {
        return { field, order: prev.order === 'asc' ? 'desc' : 'asc' };
      }
      return { field, order: 'asc' };
    });
  };

  // Reset all filters
  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  const hasActiveFilters =
    filters.search !== '' ||
    filters.type !== 'ALL' ||
    filters.origin !== 'ALL' ||
    filters.nature !== 'ALL';

  // Filtered & Sorted Records
  const processedRecords = useMemo(() => {
    return records
      .filter((rec) => {
        // Search Filter
        if (filters.search.trim()) {
          const q = filters.search.toLowerCase();
          const matchSearch =
            rec.serialNo.toLowerCase().includes(q) ||
            rec.type.toLowerCase().includes(q) ||
            rec.variety.toLowerCase().includes(q) ||
            rec.origin.toLowerCase().includes(q) ||
            rec.color.toLowerCase().includes(q) ||
            rec.certificationNo.toLowerCase().includes(q) ||
            rec.certificationLab.toLowerCase().includes(q);
          if (!matchSearch) return false;
        }

        // Type Filter
        if (filters.type !== 'ALL' && rec.type !== filters.type) {
          return false;
        }

        // Origin Filter
        if (filters.origin !== 'ALL' && rec.origin !== filters.origin) {
          return false;
        }

        // Nature Filter
        if (filters.nature !== 'ALL' && rec.nature !== filters.nature) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const { field, order } = sortConfig;
        const rawA = a[field];
        const rawB = b[field];

        let valA: string | number = rawA ?? '';
        let valB: string | number = rawB ?? '';

        if (typeof valA === 'string' && typeof valB === 'string') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }

        if (valA < valB) return order === 'asc' ? -1 : 1;
        if (valA > valB) return order === 'asc' ? 1 : -1;
        return 0;
      });
  }, [records, filters, sortConfig]);

  const recordToDelete = records.find((r) => r.id === deletingId);

  return (
    <div className="space-y-4">
      {/* ── Toolbar: Header Filter Controls & Add Button ───────────────── */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between rounded-xl border border-border bg-card/90 p-4 backdrop-blur-md shadow-xs text-card-foreground">
        {/* Left Side: Search & Filter Selects */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Box */}
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              placeholder="Search serial, type, origin, cert..."
              className="w-full rounded-lg border border-border bg-background pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-amber-500/50"
            />
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
              <SearchIcon />
            </div>
            {filters.search && (
              <button
                onClick={() => setFilters((f) => ({ ...f, search: '' }))}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Type Filter Dropdown */}
          <select
            value={filters.type}
            onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-amber-500/50 cursor-pointer"
          >
            <option value="ALL" className="bg-card text-card-foreground">All Types</option>
            {GEMSTONE_TYPES.map((t) => (
              <option key={t} value={t} className="bg-card text-card-foreground">
                {t}
              </option>
            ))}
          </select>

          {/* Origin Filter Dropdown */}
          <select
            value={filters.origin}
            onChange={(e) => setFilters((f) => ({ ...f, origin: e.target.value }))}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-amber-500/50 max-w-[170px] truncate cursor-pointer"
          >
            <option value="ALL" className="bg-card text-card-foreground">All Origins</option>
            {ORIGIN_OPTIONS.map((o) => (
              <option key={o} value={o} className="bg-card text-card-foreground">
                {o}
              </option>
            ))}
          </select>

          {/* Nature Radio/Filter Dropdown */}
          <select
            value={filters.nature}
            onChange={(e) => setFilters((f) => ({ ...f, nature: e.target.value }))}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-amber-500/50 cursor-pointer"
          >
            <option value="ALL" className="bg-card text-card-foreground">All Natures</option>
            <option value="Natural" className="bg-card text-card-foreground">Natural</option>
            <option value="Synthetic" className="bg-card text-card-foreground">Synthetic</option>
          </select>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-2.5 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-300 hover:bg-rose-500/20 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Right Side: Add New Gemstone Button */}
        <button
          onClick={onAddNew}
          className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all duration-200 shrink-0"
        >
          <PlusIcon />
          <span>Add new Gem stone</span>
        </button>
      </div>

      {/* ── Data Grid Table ───────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-xl border border-border bg-card/90 backdrop-blur-md shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-foreground">
            {/* Table Header */}
            <thead
              style={{ backgroundColor: 'hsl(var(--table-header-bg))', color: 'hsl(var(--table-header-fg))' }}
              className="border-b border-border text-[11px] font-bold uppercase tracking-wider"
            >
              <tr>
                <th
                  onClick={() => handleSort('serialNo')}
                  className="px-4 py-3.5 cursor-pointer hover:text-amber-600 dark:hover:text-amber-400 transition-colors select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Serial & Variety</span>
                    <SortIndicator field="serialNo" currentSort={sortConfig} />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('type')}
                  className="px-4 py-3.5 cursor-pointer hover:text-amber-600 dark:hover:text-amber-400 transition-colors select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Type & Nature</span>
                    <SortIndicator field="type" currentSort={sortConfig} />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('weight')}
                  className="px-4 py-3.5 cursor-pointer hover:text-amber-600 dark:hover:text-amber-400 transition-colors select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Weight & Qty</span>
                    <SortIndicator field="weight" currentSort={sortConfig} />
                  </div>
                </th>
                <th className="px-4 py-3.5 select-none">
                  Shape & Color
                </th>
                <th
                  onClick={() => handleSort('origin')}
                  className="px-4 py-3.5 cursor-pointer hover:text-amber-600 dark:hover:text-amber-400 transition-colors select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Origin & Treatment</span>
                    <SortIndicator field="origin" currentSort={sortConfig} />
                  </div>
                </th>
                <th className="px-4 py-3.5 select-none">
                  Certification
                </th>
                {/* Last Action Column */}
                <th className="px-4 py-3.5 text-right select-none">
                  Actions
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-border/60">
              {processedRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <EmptyIcon />
                      <span className="font-semibold text-sm text-foreground">No gemstones found</span>
                      <span className="text-xs text-muted-foreground">
                        {hasActiveFilters
                          ? 'Try adjusting your search query or filter options.'
                          : 'Click "Add new Gem stone" to record your first entry.'}
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
                  <tr
                    key={item.id}
                    className="group hover:bg-muted/50 transition-colors duration-150"
                  >
                    {/* Serial & Variety */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono font-bold text-amber-600 dark:text-amber-400 tracking-tight">
                          {item.serialNo}
                        </span>
                        <span className="text-muted-foreground text-[11px] font-normal">
                          {item.variety}
                        </span>
                      </div>
                    </td>

                    {/* Type & Nature */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-1 items-start">
                        <span className="font-semibold text-foreground">{item.type}</span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            item.nature === 'Natural'
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                              : 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30'
                          }`}
                        >
                          {item.nature}
                        </span>
                      </div>
                    </td>

                    {/* Weight & Qty */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-foreground">
                          {item.weight} {item.weightUnit}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {item.quantity} {item.quantity === 1 ? 'piece' : 'pieces'}
                        </span>
                      </div>
                    </td>

                    {/* Shape & Color */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-foreground font-medium">{item.shape || '—'}</span>
                        <span className="text-[11px] text-muted-foreground">{item.color || '—'}</span>
                      </div>
                    </td>

                    {/* Origin & Treatment */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-foreground font-medium">{item.origin || '—'}</span>
                        <span className="text-[11px] text-muted-foreground">{item.treatment || '—'}</span>
                      </div>
                    </td>

                    {/* Certification */}
                    <td className="px-4 py-3.5">
                      <div className="flex flex-col gap-0.5">
                        {item.certificationNo ? (
                          <>
                            <span className="font-mono text-[11px] text-sky-600 dark:text-sky-400 font-semibold">
                              {item.certificationNo}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {item.certificationLab}
                            </span>
                          </>
                        ) : (
                          <span className="text-[11px] text-muted-foreground italic">Uncertified</span>
                        )}
                      </div>
                    </td>

                    {/* Action Column: Edit & Delete */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-90 group-hover:opacity-100">
                        <button
                          onClick={() => onEdit(item)}
                          title="Edit record"
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => setDeletingId(item.id)}
                          title="Delete record"
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

        {/* Table Footer info */}
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

      {/* ── Delete Confirmation Dialog ─────────────────────────────────── */}
      {deletingId && recordToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-2xl space-y-4 text-card-foreground">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-500/10 border border-rose-500/30">
                <TrashIcon />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Delete Gemstone Record?</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Are you sure you want to delete <strong className="text-foreground">{recordToDelete.serialNo}</strong>?
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-muted/60 p-3 text-xs text-foreground space-y-1">
              <div><strong>Type:</strong> {recordToDelete.type} ({recordToDelete.variety})</div>
              <div><strong>Weight:</strong> {recordToDelete.weight} {recordToDelete.weightUnit}</div>
              <div><strong>Origin:</strong> {recordToDelete.origin}</div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="rounded-lg border border-border px-4 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete(deletingId);
                  setDeletingId(null);
                }}
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

/* ── Helper Icon Components ─────────────────────────────────────────── */

function SortIndicator({ field, currentSort }: { field: SortField; currentSort: SortConfig }) {
  if (currentSort.field !== field) {
    return <span className="text-muted-foreground text-[10px]">↕</span>;
  }
  return (
    <span className="text-amber-600 dark:text-amber-400 text-[10px]">
      {currentSort.order === 'asc' ? '↑' : '↓'}
    </span>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
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
