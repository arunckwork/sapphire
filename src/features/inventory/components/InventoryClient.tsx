'use client';

import React from 'react';
import { useInventory } from '../hooks/useInventory';
import { InventoryGrid } from './InventoryGrid';

export function InventoryClient() {
  const {
    collections,
    total,
    isLoading,
  } = useInventory();

  /* ── Metrics ───────────────────────────────────────────────────────── */
  const totalFinalizedValue = collections.reduce(
    (acc, r) => acc + (Number(r.finalized_price) || 0),
    0
  );
  const withVoucher = collections.filter((r) => !!r.voucher_url).length;
  const pendingVoucher = collections.filter((r) => !r.voucher_url).length;

  const METRICS = [
    {
      title: 'Total Accepted',
      value: isLoading ? '—' : total,
      unit: 'collections',
      textColor: 'text-teal-600 dark:text-teal-400',
      borderColor: 'border-teal-500/20 hover:border-teal-500/35',
    },
    {
      title: 'Finalized Value',
      value: isLoading
        ? '—'
        : `$${totalFinalizedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      unit: 'combined',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      borderColor: 'border-emerald-500/20 hover:border-emerald-500/35',
    },
    {
      title: 'Vouchers Available',
      value: isLoading ? '—' : withVoucher,
      unit: 'ready',
      textColor: 'text-sky-600 dark:text-sky-400',
      borderColor: 'border-sky-500/20 hover:border-sky-500/35',
    },
    {
      title: 'Voucher Pending',
      value: isLoading ? '—' : pendingVoucher,
      unit: 'awaiting',
      textColor: 'text-amber-600 dark:text-amber-400',
      borderColor: 'border-amber-500/20 hover:border-amber-500/35',
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Page Header ────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-200 md:text-2xl">
            Inventory
          </h1>
          <p className="text-xs font-normal text-muted-foreground">
            Accepted Collections Registry
          </p>
        </div>
        {/* Accepted badge */}
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 self-start sm:self-auto">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Status: Accepted
        </span>
      </div>

      {/* ── Metric Cards ───────────────────────────────────────────────── */}
      {/* <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        {METRICS.map((metric) => (
          <div
            key={metric.title}
            className={`flex flex-col justify-between rounded-xl border bg-card/60 p-4 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${metric.borderColor}`}
          >
            <span className="text-[11px] font-medium tracking-wide text-muted-foreground">
              {metric.title}
            </span>
            <div className="mt-2.5 space-y-0.5">
              <div className={`text-2xl font-bold tracking-tight ${metric.textColor}`}>
                {metric.value}
              </div>
              <div className="text-[11px] text-muted-foreground font-normal">{metric.unit}</div>
            </div>
          </div>
        ))}
      </div> */}

      {/* ── Grid ───────────────────────────────────────────────────────── */}
      <InventoryGrid records={collections} isLoading={isLoading} />
    </div>
  );
}
