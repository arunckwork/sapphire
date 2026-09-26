'use client';

import React, { useState } from 'react';
import type { MasterDataItem } from '../types/masterdata.types';
import { Badge, Spinner, ConfirmDialog } from '@/components/shared';

/* ── Props ────────────────────────────────────────────────────────────────── */

interface MasterdataTableProps {
  items:          MasterDataItem[];
  total:          number;
  isLoading:      boolean;
  search:         string;
  showInactive:   boolean;
  onSearchChange: (v: string) => void;
  onToggleInactive: (v: boolean) => void;
  onAddNew:       () => void;
  onEdit:         (item: MasterDataItem) => void;
  onDeactivate:   (item: MasterDataItem) => void;
  onReactivate:   (item: MasterDataItem) => void;
  deactivatingId: number | null;
  reactivatingId: number | null;
}

/* ── Confirm dialog state ─────────────────────────────────────────────────── */

interface ConfirmState {
  item:   MasterDataItem | null;
  action: 'deactivate' | 'reactivate' | null;
}

/* ── Component ────────────────────────────────────────────────────────────── */

export function MasterdataTable({
  items,
  total,
  isLoading,
  search,
  showInactive,
  onSearchChange,
  onToggleInactive,
  onAddNew,
  onEdit,
  onDeactivate,
  onReactivate,
  deactivatingId,
  reactivatingId,
}: MasterdataTableProps) {
  const [confirm, setConfirm] = useState<ConfirmState>({ item: null, action: null });

  /* ── filtering (client-side within the loaded page) ──────────────── */
  const filtered = items
    .filter((item) => showInactive || item.is_active)
    .filter(
      (item) =>
        !search ||
        item.label.toLowerCase().includes(search.toLowerCase()) ||
        item.value.toLowerCase().includes(search.toLowerCase())
    );

  const handleConfirm = () => {
    if (!confirm.item || !confirm.action) return;
    if (confirm.action === 'deactivate') onDeactivate(confirm.item);
    else onReactivate(confirm.item);
    setConfirm({ item: null, action: null });
  };

  const isPending = (id: number) => deactivatingId === id || reactivatingId === id;

  return (
    <>
      {/* ── Toolbar ─────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <span className="absolute inset-y-0 left-2.5 flex items-center text-muted-foreground pointer-events-none">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="search"
            placeholder="Search label or value…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8 w-full rounded-lg border border-border/60 bg-background pl-8 pr-3 text-xs focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Show inactive toggle */}
          <label className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground select-none">
            <button
              role="switch"
              aria-checked={showInactive}
              onClick={() => onToggleInactive(!showInactive)}
              className={`relative inline-flex h-4.5 w-8 items-center rounded-full transition-colors focus:outline-none ${
                showInactive ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            >
              <span
                className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform ${
                  showInactive ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </button>
            Show inactive
          </label>

          {/* Add New */}
          <button
            onClick={onAddNew}
            className="flex h-8 items-center gap-1.5 rounded-lg bg-amber-500 px-3 text-xs font-semibold text-white shadow-sm transition-all hover:bg-amber-600 active:scale-95"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Item
          </button>
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────────────── */}
      <div className="mt-4 overflow-hidden rounded-xl border border-border/40 bg-card/60 backdrop-blur-md">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner className="h-7 w-7 text-amber-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
                <line x1="12" y1="12" x2="12.01" y2="12" />
              </svg>
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              {search ? `No items match "${search}"` : 'No items in this category yet'}
            </p>
            {!search && (
              <button
                onClick={onAddNew}
                className="mt-3 text-xs text-amber-600 hover:underline"
              >
                Add the first item →
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/40 bg-muted/30">
                <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground w-8">#</th>
                <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">Label</th>
                <th className="hidden px-4 py-2.5 text-left font-semibold text-muted-foreground sm:table-cell">Value</th>
                <th className="hidden px-4 py-2.5 text-center font-semibold text-muted-foreground lg:table-cell w-20">Order</th>
                <th className="px-4 py-2.5 text-center font-semibold text-muted-foreground w-24">Status</th>
                <th className="px-4 py-2.5 text-right font-semibold text-muted-foreground w-36">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filtered.map((item, idx) => (
                <tr
                  key={item.id}
                  className={`group transition-colors hover:bg-muted/30 ${
                    !item.is_active ? 'opacity-50' : ''
                  }`}
                >
                  {/* Sort order / index */}
                  <td className="px-4 py-2.5 text-muted-foreground tabular-nums">
                    {item.sort_order ?? idx}
                  </td>

                  {/* Label */}
                  <td className="px-4 py-2.5 font-medium text-foreground">
                    {item.label}
                  </td>

                  {/* Value — monospace, hidden on small */}
                  <td className="hidden px-4 py-2.5 font-mono text-muted-foreground sm:table-cell">
                    {item.value}
                  </td>

                  {/* Sort order number — hidden on small */}
                  <td className="hidden px-4 py-2.5 text-center tabular-nums text-muted-foreground lg:table-cell">
                    {item.sort_order}
                  </td>

                  {/* Status badge */}
                  <td className="px-4 py-2.5 text-center">
                    <Badge variant={item.is_active ? 'success' : 'neutral'}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-2">
                      {/* Edit */}
                      <button
                        onClick={() => onEdit(item)}
                        title="Edit item"
                        className="rounded-md px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        Edit
                      </button>

                      {/* Deactivate / Reactivate */}
                      {isPending(item.id) ? (
                        <Spinner className="h-3.5 w-3.5 text-amber-500" />
                      ) : item.is_active ? (
                        <button
                          onClick={() => setConfirm({ item, action: 'deactivate' })}
                          title="Deactivate item (soft-delete)"
                          className="rounded-md px-2.5 py-1 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => setConfirm({ item, action: 'reactivate' })}
                          title="Reactivate item"
                          className="rounded-md px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                        >
                          Reactivate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Count footer */}
        {!isLoading && filtered.length > 0 && (
          <div className="border-t border-border/30 px-4 py-2 text-[10px] text-muted-foreground">
            {filtered.length} of {total} item{total !== 1 ? 's' : ''}
            {!showInactive && items.some((i) => !i.is_active) && (
              <span className="ml-1">
                · <button onClick={() => onToggleInactive(true)} className="text-amber-600 hover:underline">show inactive</button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Confirm Dialog ───────────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={!!confirm.item}
        onClose={() => setConfirm({ item: null, action: null })}
        onConfirm={handleConfirm}
        title={
          confirm.action === 'deactivate'
            ? `Deactivate "${confirm.item?.label}"?`
            : `Reactivate "${confirm.item?.label}"?`
        }
        description={
          confirm.action === 'deactivate'
            ? 'This option will no longer appear in collection forms. You can reactivate it at any time.'
            : 'This option will appear again in collection forms after the next refresh.'
        }
        confirmText={confirm.action === 'deactivate' ? 'Deactivate' : 'Reactivate'}
        variant={confirm.action === 'deactivate' ? 'danger' : 'primary'}
      />
    </>
  );
}
