export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="h-4 w-2/3 rounded bg-zinc-200" />
        <div className="h-5 w-16 rounded-full bg-zinc-200" />
      </div>
      <div className="mt-3 flex gap-2">
        <div className="h-4 w-12 rounded-full bg-zinc-100" />
        <div className="h-4 w-24 rounded bg-zinc-100" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonSummaryCards() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="h-3 w-16 rounded bg-zinc-100" />
          <div className="mt-3 h-7 w-10 rounded bg-zinc-200" />
        </div>
      ))}
    </div>
  );
}
