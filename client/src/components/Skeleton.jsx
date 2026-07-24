function Shimmer({ className = '' }) {
  return (
    <div className={`relative overflow-hidden rounded-lg bg-hairline ${className}`}>
      <div className="absolute inset-0 animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl bg-surface p-5 shadow-soft ring-1 ring-hairline">
      <Shimmer className="mb-3 h-40 w-full rounded-xl" />
      <Shimmer className="mb-2 h-4 w-3/4" />
      <Shimmer className="mb-2 h-3 w-full" />
      <Shimmer className="h-3 w-1/2" />
    </div>
  );
}

export function GridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function LineSkeleton({ rows = 3 }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: rows }).map((_, i) => (
        <Shimmer key={i} className="h-4 w-full" />
      ))}
    </div>
  );
}
