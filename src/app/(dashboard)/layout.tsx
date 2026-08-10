/**
 * Dashboard route group layout.
 * Wraps all protected pages in the main app shell (header + sidebar + content).
 * The proxy.ts ensures only authenticated users reach this layout.
 *
 * TODO: Replace the placeholder with the real AppShell component once built.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* TODO: <Header /> */}
      <div className="flex flex-1">
        {/* TODO: <Sidebar /> */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
