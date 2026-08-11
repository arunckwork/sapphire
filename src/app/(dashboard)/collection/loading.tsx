/**
 * Collection route loading skeleton.
 * Shown while the collection page's async data is being fetched.
 * Override individual sections with nested loading.tsx files.
 */
export default function CollectionLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-48 rounded bg-muted" />
        <div className="h-4 w-64 rounded bg-muted" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl border border-border bg-muted" />
        ))}
      </div>
    </div>
  );
}
