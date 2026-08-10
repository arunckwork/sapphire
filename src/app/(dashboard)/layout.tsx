'use client';

import { useUIStore } from '@/store';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area — Compact left padding: md:pl-56 when open, md:pl-16 when collapsed */}
      <div
        className={`flex min-h-screen flex-col transition-all duration-300 pl-0 ${
          sidebarOpen ? 'md:pl-56' : 'md:pl-16'
        }`}
      >
        <Header />
        <main className="flex-1 p-4 sm:p-5 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
