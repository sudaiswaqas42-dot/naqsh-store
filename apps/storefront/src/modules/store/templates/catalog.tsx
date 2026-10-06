import { Suspense } from "react"
import Form from "next/form"
import { getCatalog, CatalogQuery } from "@lib/data/catalog"
import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import CatalogGridView from "../components/catalog-grid-view"
import CategoryShowcaseGrid from "../components/category-showcase-grid"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const heroBannersConfig: Record<
  string,
  {
    bgImage: string
    tag: string
    badgeText: string
    accentSubtitle: string
  }
> = {
  women: {
    bgImage: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=2000&q=85",
    tag: "WOMEN'S ATELIER",
    badgeText: "Haute Couture & Pret",
    accentSubtitle: "Intricate resham embroideries, fine festive lawn, and hand-embellished pure silk silhouettes.",
  },
  men: {
    bgImage: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=2000&q=85",
    tag: "MEN'S ATELIER",
    badgeText: "Bespoke Eastern Wear",
    accentSubtitle: "Raw silk kurtas, tailored jacquard waistcoats, and embroidered bandhgala collars.",
  },
  unstitched: {
    bgImage: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=2000&q=85",
    tag: "LUXURY UNSTITCHED",
    badgeText: "Festive Lawn & Silks",
    accentSubtitle: "Pure chiffon dupattas, organza border patti, and premium swiss lawn cuts.",
  },
  sale: {
    bgImage: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=2000&q=85",
    tag: "EXCLUSIVE ARCHIVE",
    badgeText: "End of Season Sale • Limited Time",
    accentSubtitle: "Celebratory luxury pret, stitched ensembles, and unstitched fabrics on exclusive seasonal offer.",
  },
  "co-ords": {
    bgImage: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=2000&q=85",
    tag: "CONTEMPORARY EDITS",
    badgeText: "Matching Separates",
    accentSubtitle: "Fluid modern digital prints and monochrome separates tailored for effortless elegance.",
  },
  store: {
    bgImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=85",
    tag: "COMPLETE CATALOGUE",
    badgeText: "Signature Wardrobe",
    accentSubtitle: "Handcrafted fabrics. Refined silhouettes. Elegance that whispers rather than shouts.",
  },
  search: {
    bgImage: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=2000&q=85",
    tag: "CURATED SEARCH",
    badgeText: "Atelier Search",
    accentSubtitle: "Discover hand-embroidered silhouettes and master-tailored eastern wear.",
  },
}

export default function CatalogTemplate({
  countryCode,
  query = {},
  title,
  description,
  categoryIds,
  collectionId,
  links = [],
  search = false,
  isSalePage = false,
  categoryHandle,
}: {
  countryCode: string
  query?: CatalogQuery
  title: string
  description?: string
  categoryIds?: string[]
  collectionId?: string
  links?: { href: string; label: string }[]
  search?: boolean
  isSalePage?: boolean
  categoryHandle?: string
}) {
  const baseFilterPath = isSalePage
    ? "/categories/sale"
    : categoryHandle
    ? `/categories/${categoryHandle}`
    : "/store"

  const lowerTitle = (title || "").toLowerCase()
  let bannerKey = "store"
  if (isSalePage || lowerTitle.includes("sale")) bannerKey = "sale"
  else if (lowerTitle.includes("women")) bannerKey = "women"
  else if (lowerTitle.includes("men")) bannerKey = "men"
  else if (lowerTitle.includes("unstitched") || lowerTitle.includes("lawn")) bannerKey = "unstitched"
  else if (lowerTitle.includes("co-ord")) bannerKey = "co-ords"
  else if (search || lowerTitle.includes("search")) bannerKey = "search"

  const banner = heroBannersConfig[bannerKey] || heroBannersConfig.store

  return (
    <main className="bg-[#FAF9F6] min-h-[75vh]">
      {/* 1. Luxury Editorial Hero Banner */}
      <section className="relative overflow-hidden min-h-[280px] sm:min-h-[340px] md:min-h-[380px] flex items-center justify-center border-b border-[#B6975A]/30">
        {/* Background Editorial Image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
          style={{ backgroundImage: `url('${banner.bgImage}')` }}
        />

        {/* Dual Gradient Overlays for Luxury Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#081B14] via-[#0F2D22]/85 to-black/60" />
        <div className="absolute inset-0 bg-radial from-transparent via-[#081B14]/40 to-[#081B14]/80 pointer-events-none" />

        {/* Golden ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#B6975A]/15 rounded-full blur-[120px] pointer-events-none" />

        {/* Content Container */}
        <div className="content-container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 relative z-10 text-center">
          {/* Badge & Breadcrumb */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-[#B6975A]/40 mb-3 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B6975A] animate-pulse" />
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.3em] text-[#FAF9F6]">
              NAQSH • {banner.tag}
            </span>
          </div>

          {/* Grand Serif Title */}
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl text-white font-normal drop-shadow-md tracking-tight">
            {title}
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm md:text-base text-stone-200 leading-relaxed max-w-2xl mx-auto mt-3 font-light drop-shadow-2xs">
            {description || banner.accentSubtitle}
          </p>

          {/* Editorial Luxury Pillars */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 mt-6 text-[10px] sm:text-[11px] text-stone-300 font-medium">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/30 backdrop-blur-sm border border-white/10">
              <span className="text-[#B6975A]">✨</span> Bespoke Tailoring
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/30 backdrop-blur-sm border border-white/10">
              <span className="text-[#B6975A]">🌿</span> Pure Breathable Fabrics
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/30 backdrop-blur-sm border border-white/10">
              <span className="text-[#B6975A]">📦</span> Express Delivery Across Pakistan
            </span>
          </div>

          {/* Search Box on Search Page */}
          {search && (
            <Form
              action={"/" + countryCode + "/search"}
              className="max-w-2xl mx-auto flex bg-white/95 backdrop-blur-md border border-[#EBE1D6] mt-7 shadow-2xl rounded-xs overflow-hidden"
            >
              <input
                aria-label="Search products"
                name="q"
                defaultValue={String(query.q || "")}
                placeholder="Search by piece, fabric, colour, or collection..."
                className="flex-1 min-w-0 bg-transparent px-5 py-3.5 outline-none text-sm sm:text-base text-stone-900"
              />
              <button className="px-7 bg-[#0F2D22] hover:bg-[#B6975A] text-[#FAF9F6] hover:text-[#0F2D22] text-xs font-semibold uppercase tracking-widest transition-all">
                Search
              </button>
            </Form>
          )}
        </div>
      </section>

      {/* 2. Visual Stitched & Unstitched Category Showcase Layout */}
      <CategoryShowcaseGrid categoryHandle={categoryHandle || bannerKey} title={title} />

      {/* 2. Instant Quick-Filter Strip (Dynamic Gents & Ladies Unstitched Categories matching Image 1) */}
      {(() => {
        const GENTS_SUB_HANDLES = ["italian", "boski", "wash-wear", "wool", "kamalia-khaddar"]
        const LADIES_SUB_HANDLES = ["dhanak", "khaddar", "linen", "karandi", "silk", "printed", "embroidery-waly", "2pc", "3pc"]

        const isMen = categoryHandle === "men-unstitched" || bannerKey === "men" || GENTS_SUB_HANDLES.includes(categoryHandle || "")
        const isWomen = categoryHandle === "women-unstitched" || bannerKey === "women" || LADIES_SUB_HANDLES.includes(categoryHandle || "")
        const isUnstitched = categoryHandle === "unstitched" || lowerTitle.includes("unstitched")

        let pills: { label: string; href: string }[] = []

        if (isMen) {
          // Gents Unstitched Categories (Image 1) - Direct category links
          pills = [
            { label: "All Gents", href: "/categories/men-unstitched" },
            { label: "Italian", href: "/categories/italian" },
            { label: "Boski", href: "/categories/boski" },
            { label: "Wash & Wear", href: "/categories/wash-wear" },
            { label: "Wool", href: "/categories/wool" },
            { label: "Kamalia Khaddar", href: "/categories/kamalia-khaddar" },
          ]
        } else if (isWomen) {
          // Ladies Unstitched Categories (Image 1) - Direct category links
          pills = [
            { label: "All Ladies", href: "/categories/women-unstitched" },
            { label: "Dhanak", href: "/categories/dhanak" },
            { label: "Khaddar", href: "/categories/khaddar" },
            { label: "Linen", href: "/categories/linen" },
            { label: "Karandi", href: "/categories/karandi" },
            { label: "Silk", href: "/categories/silk" },
            { label: "Printed", href: "/categories/printed" },
            { label: "Embroidery Waly", href: "/categories/embroidery-waly" },
            { label: "2pc", href: "/categories/2pc" },
            { label: "3pc", href: "/categories/3pc" },
          ]
        } else if (isUnstitched) {
          // All Unstitched Page: Full selection of Ladies and Gents - Direct category links
          pills = [
            { label: "All Unstitched", href: "/categories/unstitched" },
            { label: "Ladies: Dhanak", href: "/categories/dhanak" },
            { label: "Ladies: Khaddar", href: "/categories/khaddar" },
            { label: "Ladies: Linen", href: "/categories/linen" },
            { label: "Ladies: Karandi", href: "/categories/karandi" },
            { label: "Ladies: Silk", href: "/categories/silk" },
            { label: "Ladies: Printed", href: "/categories/printed" },
            { label: "Ladies: Embroidery", href: "/categories/embroidery-waly" },
            { label: "Ladies: 2pc", href: "/categories/2pc" },
            { label: "Ladies: 3pc", href: "/categories/3pc" },
            { label: "Gents: Italian", href: "/categories/italian" },
            { label: "Gents: Boski", href: "/categories/boski" },
            { label: "Gents: Wash & Wear", href: "/categories/wash-wear" },
            { label: "Gents: Wool", href: "/categories/wool" },
            { label: "Gents: Kamalia Khaddar", href: "/categories/kamalia-khaddar" },
          ]
        } else {
          // Task 2 & Task 5: On NEW IN / Complete Store page, show Unstitched & Ready to Wear circular category cards (Image 2) instead of the quick filter pills
          return (
            <section className="bg-white border-b border-stone-200/90 py-8 sm:py-10 shadow-2xs">
              <div className="content-container text-center">
                <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-wider text-stone-900 uppercase mb-8">
                  NEW IN
                </h2>
                <div className="flex items-center justify-center gap-10 sm:gap-16">
                  {/* UNSTITCHED Circular Card (Image 2) */}
                  <LocalizedClientLink
                    href="/categories/unstitched"
                    className="group flex flex-col items-center cursor-pointer"
                  >
                    <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-2 border-stone-200 group-hover:border-[#0F2D22] shadow-md transition-all duration-300 group-hover:scale-105">
                      <img
                        src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=400&q=85"
                        alt="Unstitched Collection"
                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <span className="mt-4 text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase text-stone-900 group-hover:text-[#0F2D22] transition-colors">
                      UNSTITCHED
                    </span>
                  </LocalizedClientLink>

                  {/* READY TO WEAR Circular Card (Image 2) */}
                  <LocalizedClientLink
                    href="/categories/women-stitched"
                    className="group flex flex-col items-center cursor-pointer"
                  >
                    <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-2 border-stone-200 group-hover:border-[#0F2D22] shadow-md transition-all duration-300 group-hover:scale-105">
                      <img
                        src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=400&q=85"
                        alt="Ready to Wear Collection"
                        className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <span className="mt-4 text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase text-stone-900 group-hover:text-[#0F2D22] transition-colors">
                      READY TO WEAR
                    </span>
                  </LocalizedClientLink>
                </div>
              </div>
            </section>
          )
        }

        return (
          <div className="bg-white border-b border-stone-200/90 py-3 shadow-2xs">
            <div className="content-container">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 whitespace-nowrap mr-1 flex items-center gap-1">
                  <span>✨</span> Quick Filter:
                </span>
                {pills.map((pill) => {
                  const targetCat = pill.href.split("/categories/")[1]?.split("?")[0]?.toLowerCase()
                  const isSelected = targetCat
                    ? categoryHandle === targetCat || (targetCat === "unstitched" && categoryHandle === "unstitched")
                    : false

                  return (
                    <LocalizedClientLink
                      key={pill.label}
                      href={pill.href}
                      className={`px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap rounded-full border transition-all ${
                        isSelected
                          ? "bg-brand text-white border-brand shadow-xs"
                          : "bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-400 hover:bg-white"
                      }`}
                    >
                      {pill.label}
                    </LocalizedClientLink>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })()}

      {/* 3. Product Catalog Grid: Streamed asynchronously with zero-wait transition */}
      <Suspense fallback={<CatalogGridSkeleton />}>
        <AsyncCatalogProducts
          countryCode={countryCode}
          query={query}
          categoryIds={categoryIds}
          collectionId={collectionId}
          isSalePage={isSalePage}
        />
      </Suspense>
    </main>
  )
}

async function AsyncCatalogProducts({
  countryCode,
  query,
  categoryIds,
  collectionId,
  isSalePage,
}: {
  countryCode: string
  query: CatalogQuery
  categoryIds?: string[]
  collectionId?: string
  isSalePage?: boolean
}) {
  const [result, categories, collections] = await Promise.all([
    getCatalog(countryCode, query, { categoryIds, collectionId, isSalePage }),
    listCategories(),
    listCollections().catch(() => ({ collections: [], count: 0 })),
  ])

  const displayProducts = result.products
  const displayCount = result.count

  const pages = Math.ceil(displayCount / 12) || 1

  return (
    <CatalogGridView
      products={displayProducts}
      count={displayCount}
      categories={categories.map((category) => ({ id: category.id, label: category.name }))}
      collections={collections.collections.map((collection) => ({ id: collection.id, label: collection.title }))}
      facets={result.facets}
      page={result.page}
      pages={pages}
      query={query}
      isSalePage={isSalePage}
    />
  )
}

function CatalogGridSkeleton() {
  return (
    <div className="content-container py-6 font-sans">
      {/* Skeleton Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b border-stone-200 animate-pulse">
        <div className="h-6 w-28 bg-stone-200/80 rounded-sm" />
        <div className="hidden sm:flex gap-2">
          <div className="h-7 w-48 bg-stone-200/60 rounded-sm" />
        </div>
        <div className="h-8 w-36 bg-stone-200/80 rounded-full" />
      </div>

      {/* Skeleton Product Grid: 8 Luxury Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col bg-white overflow-hidden animate-pulse">
            <div className="aspect-[3/4] w-full bg-stone-200/70 relative flex items-center justify-center">
              <span className="font-serif text-[10px] tracking-widest text-stone-400 uppercase">NAQSH</span>
            </div>
            <div className="pt-4 pb-2 px-1 space-y-2">
              <div className="h-2.5 w-16 bg-stone-200/60 rounded-xs" />
              <div className="h-4 w-3/4 bg-stone-200/80 rounded-xs" />
              <div className="h-3.5 w-1/3 bg-stone-200 rounded-xs" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
