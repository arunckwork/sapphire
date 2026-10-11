'use client';

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useRole } from '@/features/auth';
import {
  MASTERDATA_CATEGORY_TABS,
  type MasterDataCategoryKey,
  type MasterDataItem,
  type MasterDataCreateDto,
  type MasterDataUpdateDto,
} from '../types/masterdata.types';
import { useMasterdataAdmin } from '../hooks/useMasterdataAdmin';
import { useMasterdataMutations } from '../hooks/useMasterdataMutations';
import { MasterdataTable } from './MasterdataTable';
import { MasterdataItemDrawer } from './MasterdataItemDrawer';

export function MasterdataClient() {
  const { isAdmin, isManager } = useRole();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Validate category from URL or fallback to first category
  const rawCategory = searchParams.get('category') as MasterDataCategoryKey;
  const activeCategory: MasterDataCategoryKey =
    MASTERDATA_CATEGORY_TABS.some((t) => t.key === rawCategory)
      ? rawCategory
      : 'gemstone_types';

  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MasterDataItem | null>(null);

  const { items, total, isLoading, refetch } = useMasterdataAdmin(activeCategory);
  const {
    createItem,
    updateItem,
    deactivateItem,
    reactivateItem,
    isCreating,
    isUpdating,
    deactivatingId,
    reactivatingId,
  } = useMasterdataMutations(refetch);

  // Switch category tab
  const handleTabChange = (key: MasterDataCategoryKey) => {
    if (key === activeCategory) return;
    setSearch('');
    const params = new URLSearchParams(searchParams.toString());
    params.set('category', key);
    router.push(`/masterdata?${params.toString()}`);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = (item: MasterDataItem) => {
    setEditingItem(item);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingItem(null);
  };

  const handleSave = async (
    dto: MasterDataCreateDto | MasterDataUpdateDto
  ): Promise<boolean> => {
    if (editingItem) {
      return await updateItem(editingItem.id, dto as MasterDataUpdateDto);
    } else {
      return await createItem(dto as MasterDataCreateDto);
    }
  };

  // Guard: only admin + manager can access this page
  if (!isAdmin && !isManager) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>
        <h2 className="text-base font-semibold text-foreground">Access Denied</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          You don&apos;t have permission to manage masterdata.
        </p>
      </div>
    );
  }

  const activeTabMeta = MASTERDATA_CATEGORY_TABS.find((t) => t.key === activeCategory);
  const activeCount = items.filter((i) => i.is_active).length;
  const inactiveCount = items.length - activeCount;
  const tabsContainerRef = React.useRef<HTMLDivElement>(null);
  const activeTabRef = React.useRef<HTMLButtonElement>(null);

  // Auto-scroll active category pill into view on mount or category change
  React.useEffect(() => {
    if (activeTabRef.current && tabsContainerRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeCategory]);

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-200 md:text-2xl">
            Masterdata Management
          </h1>
          <p className="mt-0.5 text-xs font-normal text-muted-foreground">
            Manage dropdown options, gemstone categories, and standard classification values.
          </p>
        </div>

        {/* Quick category indicator */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            {activeTabMeta?.label}
          </span>
        </div>
      </div>

      {/* ── Stats Summary Row ────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3.5">
        {[
          {
            title: `Total (${activeTabMeta?.label || 'Category'})`,
            value: total || items.length,
            color: 'text-amber-600 dark:text-amber-400',
            border: 'border-amber-500/20 hover:border-amber-500/35',
          },
          {
            title: 'Active Options',
            value: activeCount,
            color: 'text-emerald-600 dark:text-emerald-400',
            border: 'border-emerald-500/20 hover:border-emerald-500/35',
            note: 'visible in dropdowns',
          },
          {
            title: 'Inactive Options',
            value: inactiveCount,
            color: 'text-slate-500 dark:text-slate-400',
            border: 'border-border/40 hover:border-border/70',
            note: 'hidden from forms',
          },
        ].map((stat, idx) => (
          <div
            key={stat.title}
            className={`flex flex-col justify-between rounded-xl border bg-card/60 p-3 sm:p-4 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${stat.border} ${
              idx === 2 ? 'col-span-2 sm:col-span-1' : ''
            }`}
          >
            <span className="text-[11px] font-medium tracking-wide text-muted-foreground truncate">
              {stat.title}
            </span>
            <div className="mt-2 space-y-0.5">
              <div className={`text-xl sm:text-2xl font-bold tracking-tight ${stat.color}`}>
                {isLoading ? '—' : stat.value}
              </div>
              {stat.note && (
                <div className="text-[10px] text-muted-foreground">{stat.note}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Category Tabs ────────────────────────────────────────── */}
      <div className="space-y-2 border-b border-border/40 pb-2.5">
        {/* Mobile Dropdown Selector (sm:hidden) */}
        <div className="sm:hidden">
          <label htmlFor="mobile-category-select" className="mb-1 block text-[11px] font-medium text-muted-foreground">
            Category
          </label>
          <div className="relative">
            <select
              id="mobile-category-select"
              value={activeCategory}
              onChange={(e) => handleTabChange(e.target.value as MasterDataCategoryKey)}
              className="w-full appearance-none rounded-xl border border-border/60 bg-card py-2.5 pl-3 pr-10 text-xs font-semibold text-foreground shadow-xs focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
            >
              {MASTERDATA_CATEGORY_TABS.map((tab) => (
                <option key={tab.key} value={tab.key}>
                  {tab.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
        </div>

        {/* Scrollable Pills Strip (edge-to-edge on mobile with auto-scroll) */}
        <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
          <div
            ref={tabsContainerRef}
            className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none touch-pan-x"
          >
            {MASTERDATA_CATEGORY_TABS.map((tab) => {
              const isActive = tab.key === activeCategory;
              return (
                <button
                  key={tab.key}
                  ref={isActive ? activeTabRef : null}
                  type="button"
                  onClick={() => handleTabChange(tab.key)}
                  className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    isActive
                      ? 'border border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-400 font-semibold shadow-xs'
                      : 'border border-border/40 bg-card/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Masterdata Table ──────────────────────────────────────── */}
      <MasterdataTable
        items={items}
        total={total}
        isLoading={isLoading}
        search={search}
        showInactive={showInactive}
        onSearchChange={setSearch}
        onToggleInactive={setShowInactive}
        onAddNew={handleAddNew}
        onEdit={handleEdit}
        onDeactivate={(item) => deactivateItem(item.id, item.label)}
        onReactivate={(item) => reactivateItem(item.id, item.label)}
        deactivatingId={deactivatingId}
        reactivatingId={reactivatingId}
      />

      {/* ── Masterdata Item Drawer ────────────────────────────────── */}
      <MasterdataItemDrawer
        key={editingItem ? `edit-${editingItem.id}` : isDrawerOpen ? 'new' : 'closed'}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        editingItem={editingItem}
        category={activeCategory}
        onSave={handleSave}
        isSubmitting={isCreating || isUpdating}
      />
    </div>
  );
}
