export default function ProductLoading() {
  return (
    <div className="content-container py-8 md:py-12 min-h-screen">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2 mb-8">
        <div className="h-3 w-16 bg-stone-200 rounded animate-pulse" />
        <div className="h-3 w-3 bg-stone-200 rounded-full animate-pulse" />
        <div className="h-3 w-24 bg-stone-200 rounded animate-pulse" />
        <div className="h-3 w-3 bg-stone-200 rounded-full animate-pulse" />
        <div className="h-3 w-36 bg-stone-200 rounded animate-pulse" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
        {/* Left: Product Images Gallery Skeleton (7 cols) */}
        <div className="lg:col-span-7 flex flex-col md:flex-row gap-4">
          {/* Thumbnails */}
          <div className="hidden md:flex flex-col gap-3 w-20 shrink-0">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] w-full bg-stone-200 rounded animate-pulse" />
            ))}
          </div>
          {/* Main Hero Image */}
          <div className="flex-1 aspect-[3/4] bg-stone-200 rounded-lg animate-pulse" />
        </div>

        {/* Right: Product Details & Actions Skeleton (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="h-4 w-28 bg-stone-200 rounded animate-pulse" />
          <div className="h-8 w-3/4 bg-stone-200 rounded animate-pulse" />
          <div className="h-6 w-32 bg-stone-200 rounded animate-pulse" />

          <div className="border-t border-b border-stone-200 py-6 my-2 space-y-4">
            <div className="h-4 w-20 bg-stone-200 rounded animate-pulse" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 w-16 bg-stone-200 rounded animate-pulse" />
              ))}
            </div>
          </div>

          <div className="h-12 w-full bg-stone-200 rounded animate-pulse" />
          <div className="h-12 w-full bg-stone-100 rounded animate-pulse" />

          <div className="space-y-3 pt-4">
            <div className="h-4 w-full bg-stone-100 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-stone-100 rounded animate-pulse" />
            <div className="h-4 w-4/6 bg-stone-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
