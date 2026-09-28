export default function CategoryLoading() {
  return (
    <div className="content-container py-8 md:py-12 min-h-screen">
      <div className="h-8 w-48 bg-stone-200 rounded animate-pulse mb-8" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <div className="aspect-[3/4] w-full bg-stone-200 rounded-lg animate-pulse" />
            <div className="h-4 w-3/4 bg-stone-200 rounded animate-pulse" />
            <div className="h-5 w-1/3 bg-stone-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
