import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | GemTrace',
};

interface MetricCard {
  title: string;
  count: number;
  unit: string;
  textColor: string;
  borderColor: string;
}

const METRICS: MetricCard[] = [
  {
    title: 'Collection',
    count: 142,
    unit: 'stones',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-500/20 hover:border-amber-500/35',
  },
  {
    title: 'Registration',
    count: 98,
    unit: 'stones',
    textColor: 'text-sky-400',
    borderColor: 'border-sky-500/20 hover:border-sky-500/35',
  },
  {
    title: 'Sorting',
    count: 67,
    unit: 'stones',
    textColor: 'text-purple-400',
    borderColor: 'border-purple-500/20 hover:border-purple-500/35',
  },
  {
    title: 'Packing',
    count: 34,
    unit: 'stones',
    textColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/20 hover:border-emerald-500/35',
  },
  {
    title: 'Relotting',
    count: 12,
    unit: 'stones',
    textColor: 'text-orange-400',
    borderColor: 'border-orange-500/20 hover:border-orange-500/35',
  },
  {
    title: 'Trade',
    count: 8,
    unit: 'stones',
    textColor: 'text-rose-400',
    borderColor: 'border-rose-500/20 hover:border-rose-500/35',
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* ── Page Header ────────────────────────────────────────────── */}
      <div className="space-y-0.5">
        <h1 className="text-xl font-bold tracking-tight text-slate-200 md:text-2xl">Dashboard</h1>
        <p className="text-xs font-normal text-muted-foreground">
          GemTrace Madagascar — Pipeline Overview
        </p>
      </div>

      {/* ── Metric Cards Grid ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 xl:grid-cols-6">
        {METRICS.map((metric) => (
          <div
            key={metric.title}
            className={`flex flex-col justify-between rounded-xl border bg-card/60 p-4 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${metric.borderColor}`}
          >
            <span className="text-[11px] font-medium tracking-wide text-muted-foreground">{metric.title}</span>
            <div className="mt-2.5 space-y-0.5">
              <div className={`text-2xl font-bold tracking-tight ${metric.textColor}`}>
                {metric.count}
              </div>
              <div className="text-[11px] text-muted-foreground font-normal">{metric.unit}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Recent Activity Main Panel ───────────────────────────────── */}
      <div className="rounded-xl border border-border/60 bg-card/40 p-5 backdrop-blur-md shadow-xs">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold tracking-tight text-slate-200">Recent Activity</h2>
        </div>

        {/* Skeleton rows */}
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-12 w-full rounded-lg border border-border/30 bg-muted/20 animate-pulse"
            />
          ))}
        </div>

        {/* Footer info note */}
        <div className="mt-10 text-center text-xs font-normal text-muted-foreground/60">
          Connect to backend API to see live data
        </div>
      </div>
    </div>
  );
}
