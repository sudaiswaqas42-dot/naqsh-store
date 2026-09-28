export default function StoreLoading() {
  return (
    <div className="content-container py-8 md:py-12 min-h-screen">
      {/* Title & Filter Bar Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-4 border-b border-stone-200">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-stone-200 rounded animate-pulse" />
          <div className="h-4 w-64 bg-stone-100 rounded animate-pulse" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-28 bg-stone-200 rounded animate-pulse" />
          <div className="h-10 w-28 bg-stone-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Grid of Product Skeletons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <div className="aspect-[3/4] w-full bg-stone-200 rounded-lg animate-pulse" />
            <div className="h-4 w-3/4 bg-stone-200 rounded animate-pulse" />
            <div className="h-4 w-1/2 bg-stone-100 rounded animate-pulse" />
            <div className="h-5 w-1/3 bg-stone-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
