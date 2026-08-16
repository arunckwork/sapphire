'use client';

import React, { useState } from 'react';
import { useRole } from '@/features/auth';
import { useUsers } from '../hooks/useUsers';
import { useUserMutations } from '../hooks/useUserMutations';
import { UsersTable } from './UsersTable';
import { UserDrawer } from './UserDrawer';
import type { User } from '../types/user.types';

export function UsersClient() {
  const { isAdmin, isManager } = useRole();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const {
    users, total, totalPages, isLoading, params,
    setSearch, setSort, setPage, setLimit, refetch,
  } = useUsers();

  const { addUser, editUser, suspendUser, activateUser, isAdding, isEditing, suspendingId, activatingId } =
    useUserMutations(refetch);

  const handleAddNew = () => {
    setEditingUser(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsDrawerOpen(true);
  };

  const handleClose = () => {
    setIsDrawerOpen(false);
    setEditingUser(null);
  };

  // Guard: only admin + manager can access this page
  if (!isAdmin && !isManager) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="text-base font-semibold text-foreground">Access Denied</h2>
        <p className="mt-1 text-xs text-muted-foreground">You don&apos;t have permission to manage users.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Page Header ─────────────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-200 md:text-2xl">
          User Management
        </h1>
        <p className="text-xs font-normal text-muted-foreground">
          Manage system users, roles, and access permissions.
        </p>
      </div>

      {/* ── Stats Row ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        {[
          {
            title: 'Total Users',
            value: total,
            color: 'text-amber-600 dark:text-amber-400',
            border: 'border-amber-500/20 hover:border-amber-500/35',
          },
          {
            title: 'Active',
            value: users.filter((u) => u.status === 'active').length,
            color: 'text-emerald-600 dark:text-emerald-400',
            border: 'border-emerald-500/20 hover:border-emerald-500/35',
            note: 'on this page',
          },
          {
            title: 'Suspended',
            value: users.filter((u) => u.status === 'suspended').length,
            color: 'text-rose-600 dark:text-rose-400',
            border: 'border-rose-500/20 hover:border-rose-500/35',
            note: 'on this page',
          },
          {
            title: 'Admins',
            value: users.filter((u) => u.role === 'admin').length,
            color: 'text-purple-600 dark:text-purple-400',
            border: 'border-purple-500/20 hover:border-purple-500/35',
            note: 'on this page',
          },
        ].map((stat) => (
          <div
            key={stat.title}
            className={`flex flex-col justify-between rounded-xl border bg-card/60 p-4 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${stat.border}`}
          >
            <span className="text-[11px] font-medium tracking-wide text-muted-foreground">
              {stat.title}
            </span>
            <div className="mt-2.5 space-y-0.5">
              <div className={`text-2xl font-bold tracking-tight ${stat.color}`}>
                {isLoading ? '—' : stat.value}
              </div>
              {stat.note && (
                <div className="text-[10px] text-muted-foreground">{stat.note}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Table ───────────────────────────────────────────────── */}
      <UsersTable
        users={users}
        total={total}
        totalPages={totalPages}
        isLoading={isLoading}
        params={params}
        onSearchChange={setSearch}
        onSort={setSort}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onEdit={handleEdit}
        onSuspend={suspendUser}
        onActivate={activateUser}
        suspendingId={suspendingId}
        activatingId={activatingId}
        onAddNew={handleAddNew}
      />

      {/* ── Drawer ──────────────────────────────────────────────── */}
      <UserDrawer
        key={editingUser ? editingUser.id : isDrawerOpen ? 'new' : 'closed'}
        isOpen={isDrawerOpen}
        onClose={handleClose}
        onSuccess={handleClose}
        editingUser={editingUser}
        onAdd={addUser}
        onEdit={editUser}
        isSubmitting={isAdding || isEditing}
      />
    </div>
  );
}
