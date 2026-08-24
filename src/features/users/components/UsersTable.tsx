'use client';

import React, { useState } from 'react';
import type { User, SortableUserField, UsersQueryParams } from '../types/user.types';
import { ROLES } from '@/constants/roles';
import { Badge, Button, Spinner, EmptyState, ConfirmDialog } from '@/components/shared';

/* ── Role badge colours ─────────────────────────────────────────────── */
const ROLE_BADGE: Record<string, string> = {
  [ROLES.ADMIN]: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  [ROLES.MANAGER]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  [ROLES.USER]: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  suspended: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
};

/* ── Column definitions ─────────────────────────────────────────────── */
interface Column {
  key: SortableUserField | 'name' | 'status' | 'actions';
  label: string;
  sortable?: SortableUserField;
}

const COLUMNS: Column[] = [
  { key: 'name', label: 'Name', sortable: 'first_name' },
  { key: 'email', label: 'Email', sortable: 'email' },
  { key: 'role', label: 'Role', sortable: 'role' },
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
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3.5 rounded-full bg-muted/70 animate-pulse" style={{ width: `${60 + (i % 3) * 15}%` }} />
        </td>
      ))}
    </tr>
  );
}

interface UsersTableProps {
  users: User[];
  total: number;
  totalPages: number;
  isLoading: boolean;
  params: UsersQueryParams;
  onSearchChange: (value: string) => void;
  onSort: (field: SortableUserField) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onEdit: (user: User) => void;
  onSuspend: (user: User) => Promise<void>;
  onActivate: (user: User) => Promise<void>;
  suspendingId: string | null;
  activatingId: string | null;
  onAddNew: () => void;
}

export function UsersTable({
  users,
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
}: UsersTableProps) {
  const [searchValue, setSearchValue] = useState('');
  const [confirmUser, setConfirmUser] = useState<User | null>(null);
  const [confirmAction, setConfirmAction] = useState<'suspend' | 'activate' | null>(null);

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    onSearchChange(e.target.value);
  };

  const handleConfirm = async () => {
    if (!confirmUser || !confirmAction) return;
    if (confirmAction === 'suspend') await onSuspend(confirmUser);
    else await onActivate(confirmUser);
    setConfirmUser(null);
    setConfirmAction(null);
  };

  const start = (params.page - 1) * params.limit + 1;
  const end = Math.min(params.page * params.limit, total);

  const isBusy = (userId: string) =>
    suspendingId === userId || activatingId === userId;

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
            id="users-search"
            type="search"
            value={searchValue}
            onChange={handleSearchInput}
            placeholder="Search by name, email, role…"
            className="h-8 w-full rounded-lg border border-border/60 bg-background/80 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Per-page */}
          <select
            id="users-page-size"
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
            id="add-user-btn"
            type="button"
            variant="primary"
            onClick={onAddNew}
            className="h-8 text-xs px-3"
          >
            <svg className="mr-1.5 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add User
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
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              : users?.length === 0
              ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <EmptyState
                      title="No users found"
                      description={params.search ? 'Try adjusting your search.' : 'Add the first user to get started.'}
                    />
                  </td>
                </tr>
              )
              : users && users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-border/30 transition-colors hover:bg-muted/30"
                >
                  {/* Name */}
                  <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                        style={{ background: 'linear-gradient(135deg, hsl(217 91% 60%), hsl(200 85% 50%))' }}
                      >
                        {user.first_name.charAt(0).toUpperCase()}
                      </div>
                      <span>{user.first_name} {user.last_name ?? ''}</span>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-4 py-3 text-muted-foreground">{user.email}</td>

                  {/* Role */}
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${ROLE_BADGE[user.role] ?? ROLE_BADGE[ROLES.USER]}`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${STATUS_BADGE[user.status] ?? STATUS_BADGE.active}`}>
                      {user.status === 'active' ? 'Active' : 'Suspended'}
                    </span>
                  </td>

                  {/* Joined */}
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {new Date(user.createdAt).toLocaleDateString('en-GB', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        id={`edit-user-${user.id}`}
                        onClick={() => onEdit(user)}
                        disabled={isBusy(user.id)}
                        className="rounded-md px-2 py-1 text-[11px] font-medium text-primary hover:bg-primary/10 transition-colors disabled:opacity-40"
                      >
                        Edit
                      </button>

                      {user.status === 'active' ? (
                        <button
                          id={`suspend-user-${user.id}`}
                          onClick={() => { setConfirmUser(user); setConfirmAction('suspend'); }}
                          disabled={isBusy(user.id)}
                          className="rounded-md px-2 py-1 text-[11px] font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors disabled:opacity-40 flex items-center gap-1"
                        >
                          {suspendingId === user.id ? <Spinner size="sm" /> : null}
                          Suspend
                        </button>
                      ) : (
                        <button
                          id={`activate-user-${user.id}`}
                          onClick={() => { setConfirmUser(user); setConfirmAction('activate'); }}
                          disabled={isBusy(user.id)}
                          className="rounded-md px-2 py-1 text-[11px] font-medium text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors disabled:opacity-40 flex items-center gap-1"
                        >
                          {activatingId === user.id ? <Spinner size="sm" /> : null}
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
      {!isLoading && users && users.length > 0 && (
        <div className="flex items-center justify-between border-t border-border/40 px-4 py-3">
          <p className="text-[11px] text-muted-foreground">
            Showing <span className="font-medium text-foreground">{start}–{end}</span> of{' '}
            <span className="font-medium text-foreground">{total}</span> users
          </p>
          <div className="flex items-center gap-1">
            <button
              id="users-prev-page"
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
              id="users-next-page"
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
        isOpen={confirmUser !== null}
        onClose={() => { setConfirmUser(null); setConfirmAction(null); }}
        onConfirm={handleConfirm}
        title={confirmAction === 'suspend' ? 'Suspend User' : 'Activate User'}
        description={
          confirmAction === 'suspend'
            ? `${confirmUser?.first_name} will lose access to the system immediately.`
            : `${confirmUser?.first_name} will regain full system access.`
        }
        confirmText={confirmAction === 'suspend' ? 'Yes, Suspend' : 'Yes, Activate'}
        variant={confirmAction === 'suspend' ? 'danger' : 'primary'}
        isLoading={isBusy(confirmUser?.id ?? '')}
      />
    </div>
  );
}
