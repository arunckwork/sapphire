'use client';

import React, { useState } from 'react';
import type { User } from '@/features/users';
import type { SortableSellerField, SellersQueryParams } from '../types/seller.types';
import { Badge, Button, Spinner, EmptyState, ConfirmDialog } from '@/components/shared';
import { getMediaUrl } from '@/utils/media';

/* ── Status badge colours ───────────────────────────────────────────── */
const STATUS_BADGE: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  suspended: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
};

/* ── Column definitions ─────────────────────────────────────────────── */
interface Column {
  key: SortableSellerField | 'name' | 'mobile' | 'location' | 'status' | 'actions';
  label: string;
  sortable?: SortableSellerField;
}

const COLUMNS: Column[] = [
  { key: 'name', label: 'Name', sortable: 'first_name' },
  { key: 'email', label: 'Email', sortable: 'email' },
  { key: 'mobile', label: 'Mobile' },
  { key: 'location', label: 'Location' },
  { key: 'status', label: 'Status' },
  { key: 'createdAt', label: 'Joined', sortable: 'createdAt' },
  { key: 'actions', label: '' },
];

const PAGE_SIZE_OPTIONS = [10, 25, 50];

function SortIcon({ active, order }: { active: boolean; order: 'asc' | 'desc' }) {
  return (
    <svg
      className={`ml-1 inline-block h-3 w-3 transition-transform ${active ? 'opacity-100' : 'opacity-30'} ${active && order === 'desc' ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
    </svg>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-border/30">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3.5 rounded-full bg-muted/70 animate-pulse" style={{ width: `${60 + (i % 3) * 15}%` }} />
        </td>
      ))}
    </tr>
  );
}

interface SellersTableProps {
  sellers: User[];
  total: number;
  totalPages: number;
  isLoading: boolean;
  params: SellersQueryParams;
  onSearchChange: (value: string) => void;
  onSort: (field: SortableSellerField) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onEdit: (seller: User) => void;
  onSuspend: (seller: User) => Promise<void>;
  onActivate: (seller: User) => Promise<void>;
  suspendingId: string | null;
  activatingId: string | null;
  onAddNew: () => void;
}

export function SellersTable({
  sellers,
  total,
  totalPages,
  isLoading,
  params,
  onSearchChange,
  onSort,
  onPageChange,
  onLimitChange,
  onEdit,
  onSuspend,
  onActivate,
  suspendingId,
  activatingId,
  onAddNew,
}: SellersTableProps) {
  const [searchValue, setSearchValue] = useState('');
  const [confirmSeller, setConfirmSeller] = useState<User | null>(null);
  const [confirmAction, setConfirmAction] = useState<'suspend' | 'activate' | null>(null);

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    onSearchChange(e.target.value);
  };

  const handleConfirm = async () => {
    if (!confirmSeller || !confirmAction) return;
    if (confirmAction === 'suspend') await onSuspend(confirmSeller);
    else await onActivate(confirmSeller);
    setConfirmSeller(null);
    setConfirmAction(null);
  };

  const start = (params.page - 1) * params.limit + 1;
  const end = Math.min(params.page * params.limit, total);

  const isBusy = (sellerId: string) =>
    suspendingId === sellerId || activatingId === sellerId;

  return (
    <div className="rounded-xl border border-border/40 bg-card/60 backdrop-blur-md">
      {/* ── Toolbar ────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 border-b border-border/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
          </span>
          <input
            id="sellers-search"
            type="search"
            value={searchValue}
            onChange={handleSearchInput}
            placeholder="Search by name or email…"
            className="h-8 w-full rounded-lg border border-border/60 bg-background/80 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Per-page */}
          <select
            id="sellers-page-size"
            value={params.limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="h-8 rounded-lg border border-border/60 bg-background/80 px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>{n} / page</option>
            ))}
          </select>

          {/* Add New */}
          <Button
            id="add-seller-btn"
            type="button"
            variant="primary"
            onClick={onAddNew}
            className="h-8 text-xs px-3"
          >
            <svg className="mr-1.5 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Seller
          </Button>
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border/40 bg-muted/30">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground ${col.sortable ? 'cursor-pointer select-none hover:text-foreground transition-colors' : ''}`}
                  onClick={col.sortable ? () => onSort(col.sortable!) : undefined}
                >
                  {col.label}
                  {col.sortable && (
                    <SortIcon
                      active={params.sort_by === col.sortable}
                      order={params.sort_order}
                    />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 7 }).map((_, i) => <SkeletonRow key={i} />)
              : sellers?.length === 0
              ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <EmptyState
                      title="No sellers found"
                      description={params.search ? 'Try adjusting your search.' : 'Add the first seller to get started.'}
                    />
                  </td>
                </tr>
              )
              : sellers && sellers.map((seller) => (
                <tr
                  key={seller.id}
                  className="border-b border-border/30 transition-colors hover:bg-muted/30"
                >
                  {/* Name with Photo or Avatar */}
                  <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      {seller.profile_photo_url ? (
                        <img
                          src={getMediaUrl(seller.profile_photo_url)}
                          alt={seller.first_name}
                          className="h-7 w-7 shrink-0 rounded-full object-cover border border-border/50 shadow-sm"
                        />
                      ) : (
                        <div
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white shadow-sm"
                          style={{ background: 'linear-gradient(135deg, hsl(160 70% 40%), hsl(200 85% 50%))' }}
                        >
                          {seller.first_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span>{seller.first_name} {seller.last_name ?? ''}</span>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-4 py-3 text-muted-foreground">{seller.email}</td>

                  {/* Mobile */}
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {seller.mobile ? (
                      <span className="font-mono text-[11px] text-foreground/90">{seller.mobile}</span>
                    ) : (
                      <span className="text-muted-foreground/40">—</span>
                    )}
                  </td>

                  {/* Location */}
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {seller.location ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-foreground">
                        <svg className="h-3 w-3 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {seller.location}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/40">—</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_BADGE[seller.status] ?? STATUS_BADGE.active}`}>
                      {seller.status === 'active' ? 'Active' : 'Suspended'}
                    </span>
                  </td>

                  {/* Joined */}
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {new Date(seller.createdAt).toLocaleDateString('en-GB', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        id={`edit-seller-${seller.id}`}
                        onClick={() => onEdit(seller)}
                        disabled={isBusy(seller.id)}
                        className="rounded-md px-2 py-1 text-[11px] font-medium text-primary hover:bg-primary/10 transition-colors disabled:opacity-40"
                      >
                        Edit
                      </button>

                      {seller.status === 'active' ? (
                        <button
                          id={`suspend-seller-${seller.id}`}
                          onClick={() => { setConfirmSeller(seller); setConfirmAction('suspend'); }}
                          disabled={isBusy(seller.id)}
                          className="rounded-md px-2 py-1 text-[11px] font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors disabled:opacity-40 flex items-center gap-1"
                        >
                          {suspendingId === seller.id ? <Spinner size="sm" /> : null}
                          Suspend
                        </button>
                      ) : (
                        <button
                          id={`activate-seller-${seller.id}`}
                          onClick={() => { setConfirmSeller(seller); setConfirmAction('activate'); }}
                          disabled={isBusy(seller.id)}
                          className="rounded-md px-2 py-1 text-[11px] font-medium text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors disabled:opacity-40 flex items-center gap-1"
                        >
                          {activatingId === seller.id ? <Spinner size="sm" /> : null}
                          Activate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ─────────────────────────────────────────────── */}
      {!isLoading && sellers && sellers.length > 0 && (
        <div className="flex items-center justify-between border-t border-border/40 px-4 py-3">
          <p className="text-[11px] text-muted-foreground">
            Showing <span className="font-medium text-foreground">{start}–{end}</span> of{' '}
            <span className="font-medium text-foreground">{total}</span> sellers
          </p>
          <div className="flex items-center gap-1">
            <button
              id="sellers-prev-page"
              onClick={() => onPageChange(params.page - 1)}
              disabled={params.page <= 1}
              className="rounded-md px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:bg-muted/60 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ← Prev
            </button>
            <span className="px-2 text-[11px] font-medium text-foreground">
              {params.page} / {totalPages}
            </span>
            <button
              id="sellers-next-page"
              onClick={() => onPageChange(params.page + 1)}
              disabled={params.page >= totalPages}
              className="rounded-md px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:bg-muted/60 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* ── Confirm Dialog ─────────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={confirmSeller !== null}
        onClose={() => { setConfirmSeller(null); setConfirmAction(null); }}
        onConfirm={handleConfirm}
        title={confirmAction === 'suspend' ? 'Suspend Seller' : 'Activate Seller'}
        description={
          confirmAction === 'suspend'
            ? `${confirmSeller?.first_name} will lose access to the system immediately.`
            : `${confirmSeller?.first_name} will regain full system access.`
        }
        confirmText={confirmAction === 'suspend' ? 'Yes, Suspend' : 'Yes, Activate'}
        variant={confirmAction === 'suspend' ? 'danger' : 'primary'}
        isLoading={isBusy(confirmSeller?.id ?? '')}
      />
    </div>
  );
}
