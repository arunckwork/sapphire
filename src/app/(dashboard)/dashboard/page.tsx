import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Dashboard' };

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your Sapphire dashboard.</p>
      </div>
      {/* TODO: Add dashboard widgets and KPI cards */}
    </div>
  );
}
