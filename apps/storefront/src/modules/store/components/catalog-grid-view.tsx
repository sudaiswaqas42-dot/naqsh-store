"use client"

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState, useTransition, useEffect } from "react"
import NaqshProductCard from "@modules/products/components/naqsh-product-card"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Link from "next/link"

import { computeDiscountForProduct, SalesConfig } from "@lib/data/sales"

type Choice = { id: string; label: string }

type Props = {
  products: any[]
  count: number
  categories: Choice[]
  collections: Choice[]
  facets: { sizes: string[]; colors: string[]; fabrics: string[] }
  page: number
  pages: number
  query?: any
  isSalePage?: boolean
  sales?: SalesConfig
}

export default function CatalogGridView({
  products,
  count,
  categories,
  collections,
  facets,
  page,
  pages,
  query = {},
  isSalePage = false,
  sales,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [pending, startTransition] = useTransition()

  const [filterOpen, setFilterOpen] = useState(false)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [gridCols, setGridCols] = useState<number>(4)

  useEffect(() => {
    try {
      const saved = localStorage.getItem("naqsh_grid_cols")
      if (saved) {
        const parsed = parseInt(saved, 10)
        if (parsed >= 1 && parsed <= 6) {
          setGridCols(parsed)
        }
      }
    } catch {}
  }, [])

  const handleGridChange = (cols: number) => {
    setGridCols(cols)
    try {
      localStorage.setItem("naqsh_grid_cols", String(cols))
    } catch {}
  }

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString())
    if (value) next.set(key, value)
    else next.delete(key)
    next.delete("page")
    startTransition(() => router.replace(pathname + "?" + next, { scroll: false }))
  }

  const groups = [
    { key: "category", title: "Category", choices: categories },
    { key: "collection", title: "Collection", choices: collections },
    { key: "size", title: "Size", choices: facets.sizes.map((value) => ({ id: value, label: value })) },
    { key: "color", title: "Colour", choices: facets.colors.map((value) => ({ id: value, label: value })) },
    { key: "fabric", title: "Fabric", choices: facets.fabrics.map((value) => ({ id: value, label: value })) },
  ]

  const filterKeys = ["category", "collection", "size", "color", "fabric", "min", "max", "stock", "sale"]
  const active = filterKeys.filter((key) => params.has(key)).length

  const clear = () => {
    const next = new URLSearchParams(params.toString())
    filterKeys.concat("page").forEach((key) => next.delete(key))
    startTransition(() => router.replace(pathname + "?" + next, { scroll: false }))
  }

  const pageLink = (p: number) => {
    const next = new URLSearchParams(params.toString())
    next.set("page", String(p))
    return "?" + next.toString()
  }

  const getGridClass = () => {
    switch (gridCols) {
      case 1:
        return "grid grid-cols-1 gap-6 max-w-xl mx-auto"
      case 2:
        return "grid grid-cols-2 gap-4 sm:gap-6"
      case 3:
        return "grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6"
      case 5:
        return "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4"
      case 6:
        return "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3"
      case 4:
      default:
        return "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
    }
  }

  const filtersMarkup = (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xs uppercase tracking-[0.2em] font-semibold text-stone-900">
          Refine Your Edit
        </h2>
        {active > 0 && (
          <button onClick={clear} className="text-xs underline text-stone-500 hover:text-black">
            Clear all ({active})
          </button>
        )}
      </div>

      {groups
        .filter((group) => group.choices.length > 0)
        .map((group) => (
          <details open key={group.key} className="border-b border-stone-200 pb-5">
            <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider mb-3 text-stone-800">
              {group.title}
            </summary>
            <div className="space-y-2.5 max-h-56 overflow-auto pr-2">
              {group.choices.map((choice) => {
                const selected = (params.get(group.key) || "").split(",").filter(Boolean)
                return (
                  <label
                    key={choice.id}
                    className="flex items-center gap-2.5 text-xs text-stone-600 hover:text-black cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      disabled={pending}
                      checked={selected.includes(choice.id)}
                      onChange={() =>
                        update(
                          group.key,
                          (selected.includes(choice.id)
                            ? selected.filter((value) => value !== choice.id)
                            : [...selected, choice.id]
                          ).join(",")
                        )
                      }
                      className="accent-stone-900 w-3.5 h-3.5 rounded-none"
                    />
                    <span>{choice.label}</span>
                  </label>
                )
              })}
            </div>
          </details>
        ))}

      <form
        key={params.get("min") + ":" + params.get("max")}
        onSubmit={(event) => {
          event.preventDefault()
          const data = new FormData(event.currentTarget)
          const next = new URLSearchParams(params.toString())
          for (const key of ["min", "max"]) {
            const value = String(data.get(key) || "")
            if (value) next.set(key, value)
            else next.delete(key)
          }
          next.delete("page")
          startTransition(() => router.replace(pathname + "?" + next, { scroll: false }))
        }}
        className="border-b border-stone-200 pb-5 space-y-3"
      >
        <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-800">
          Price Range (PKR)
        </h3>
        <div className="flex gap-2">
          <input
            aria-label="Minimum price"
            name="min"
            type="number"
            min="0"
            defaultValue={params.get("min") || ""}
            placeholder="Min"
            className="w-1/2 min-w-0 bg-white border border-stone-300 p-2 text-xs"
          />
          <input
            aria-label="Maximum price"
            name="max"
            type="number"
            min="0"
            defaultValue={params.get("max") || ""}
            placeholder="Max"
            className="w-1/2 min-w-0 bg-white border border-stone-300 p-2 text-xs"
          />
        </div>
        <button
          disabled={pending}
          className="w-full bg-stone-900 text-white py-2 text-[11px] font-semibold uppercase tracking-wider hover:bg-black transition-colors"
        >
          Apply Price
        </button>
      </form>

      {[{ key: "stock", label: "In Stock Only" }, { key: "sale", label: "On Sale" }].map(
        (item) => (
          <label key={item.key} className="flex items-center gap-2.5 text-xs text-stone-700 cursor-pointer">
            <input
              type="checkbox"
              className="accent-stone-900 w-3.5 h-3.5"
              disabled={pending}
              checked={params.get(item.key) === "1"}
              onChange={(event) => update(item.key, event.target.checked ? "1" : "")}
            />
            <span>{item.label}</span>
          </label>
        )
      )}
    </div>
  )

  return (
    <div className="content-container py-6 select-none font-sans">
      {/* Control Bar: Exact Match to Image 4 (Filter button on Left, 6 Grid Icons in Center, Featured Sort on Right) */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b border-stone-200">
        {/* Left: Filter Button with Funnel Icon */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              // On desktop toggle sidebar; on mobile open drawer
              if (typeof window !== "undefined" && window.innerWidth >= 1024) {
                setFilterOpen(!filterOpen)
              } else {
                setMobileDrawerOpen(true)
              }
            }}
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-900 hover:text-accent transition-colors"
          >
            <svg
              className="w-4 h-4 text-stone-800"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3c2.755 0 5.455.232 8.083.678.539.092.917.574.917 1.097v1.884a2.25 2.25 0 01-.659 1.59l-5.432 5.432a2.25 2.25 0 00-.659 1.59v5.676a.75.75 0 01-.22.53l-3.75 3.75a.75.75 0 01-1.28-.53v-9.426a2.25 2.25 0 00-.659-1.59L3.659 8.25A2.25 2.25 0 013 6.66V4.775c0-.523.378-1.005.917-1.097A48.539 48.539 0 0112 3z"
              />
            </svg>
            <span>Filter</span>
            {active > 0 && (
              <span className="w-5 h-5 rounded-full bg-stone-900 text-white text-[10px] font-bold flex items-center justify-center">
                {active}
              </span>
            )}
          </button>

          <span className="text-xs text-stone-400 font-sans hidden sm:inline">
            ({count} {count === 1 ? "piece" : "pieces"})
          </span>
        </div>

        {/* Center: Grid Density Switcher (1, 2, 3, 4, 5, 6 Columns - Exact Match to Image 4) */}
        <div className="hidden sm:flex items-center gap-1.5 border border-stone-200 p-1 rounded-xs bg-stone-50/60">
          {/* 1 Column (List view) */}
          <button
            type="button"
            onClick={() => handleGridChange(1)}
            title="1 Column View"
            className={`p-1.5 rounded-xs transition-all ${
              gridCols === 1
                ? "bg-stone-900 text-white shadow-2xs"
                : "text-stone-500 hover:text-stone-900 hover:bg-stone-200/60"
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 18 18" fill="currentColor">
              <rect x="1" y="2" width="16" height="3" rx="0.5" />
              <rect x="1" y="7.5" width="16" height="3" rx="0.5" />
              <rect x="1" y="13" width="16" height="3" rx="0.5" />
            </svg>
          </button>

          {/* 2 Columns */}
          <button
            type="button"
            onClick={() => handleGridChange(2)}
            title="2 Columns View"
            className={`p-1.5 rounded-xs transition-all ${
              gridCols === 2
                ? "bg-stone-900 text-white shadow-2xs"
                : "text-stone-500 hover:text-stone-900 hover:bg-stone-200/60"
            }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 18 18" fill="currentColor">
              <rect x="1" y="1" width="7" height="16" rx="0.5" />
              <rect x="10" y="1" width="7" height="16" rx="0.5" />
            </svg>
          </button>

          {/* 3 Columns */}
          <button
            type="button"
            onClick={() => handleGridChange(3)}
            title="3 Columns View"
            className={`p-1.5 rounded-xs transition-all ${
              gridCols === 3
                ? "bg-stone-900 text-white shadow-2xs"
                : "text-stone-500 hover:text-stone-900 hover:bg-stone-200/60"
            }`}
          >
            <svg className="w-5 h-4" viewBox="0 0 22 18" fill="currentColor">
              <rect x="1" y="1" width="5" height="16" rx="0.5" />
              <rect x="8" y="1" width="5" height="16" rx="0.5" />
              <rect x="15" y="1" width="5" height="16" rx="0.5" />
            </svg>
          </button>

          {/* 4 Columns */}
          <button
            type="button"
            onClick={() => handleGridChange(4)}
            title="4 Columns View"
            className={`p-1.5 rounded-xs transition-all ${
              gridCols === 4
                ? "bg-stone-900 text-white shadow-2xs"
                : "text-stone-500 hover:text-stone-900 hover:bg-stone-200/60"
            }`}
          >
            <svg className="w-6 h-4" viewBox="0 0 26 18" fill="currentColor">
              <rect x="1" y="1" width="4.5" height="16" rx="0.5" />
              <rect x="7.5" y="1" width="4.5" height="16" rx="0.5" />
              <rect x="14" y="1" width="4.5" height="16" rx="0.5" />
              <rect x="20.5" y="1" width="4.5" height="16" rx="0.5" />
            </svg>
          </button>

          {/* 5 Columns */}
          <button
            type="button"
            onClick={() => handleGridChange(5)}
            title="5 Columns View"
            className={`p-1.5 rounded-xs transition-all ${
              gridCols === 5
                ? "bg-stone-900 text-white shadow-2xs"
                : "text-stone-500 hover:text-stone-900 hover:bg-stone-200/60"
            }`}
          >
            <svg className="w-7 h-4" viewBox="0 0 32 18" fill="currentColor">
              <rect x="1" y="1" width="4.5" height="16" rx="0.5" />
              <rect x="7.5" y="1" width="4.5" height="16" rx="0.5" />
              <rect x="14" y="1" width="4.5" height="16" rx="0.5" />
              <rect x="20.5" y="1" width="4.5" height="16" rx="0.5" />
              <rect x="27" y="1" width="4.5" height="16" rx="0.5" />
            </svg>
          </button>

          {/* 6 Columns */}
          <button
            type="button"
            onClick={() => handleGridChange(6)}
            title="6 Columns View"
            className={`p-1.5 rounded-xs transition-all ${
              gridCols === 6
                ? "bg-stone-900 text-white shadow-2xs"
                : "text-stone-500 hover:text-stone-900 hover:bg-stone-200/60"
            }`}
          >
            <svg className="w-8 h-4" viewBox="0 0 38 18" fill="currentColor">
              <rect x="1" y="1" width="4.5" height="16" rx="0.5" />
              <rect x="7.5" y="1" width="4.5" height="16" rx="0.5" />
              <rect x="14" y="1" width="4.5" height="16" rx="0.5" />
              <rect x="20.5" y="1" width="4.5" height="16" rx="0.5" />
              <rect x="27" y="1" width="4.5" height="16" rx="0.5" />
              <rect x="33.5" y="1" width="4.5" height="16" rx="0.5" />
            </svg>
          </button>
        </div>

        {/* Right: Sort Dropdown (Rounded Pill matching Image 4) */}
        <div className="relative">
          <select
            value={params.get("sortBy") || "newest"}
            onChange={(e) => update("sortBy", e.target.value)}
            disabled={pending}
            className="appearance-none bg-white border border-stone-300 hover:border-stone-500 pl-4 pr-9 py-2 text-xs font-medium text-stone-800 rounded-full focus:outline-none cursor-pointer transition-colors shadow-2xs"
          >
            <option value="newest">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="popular">Popular This Month</option>
            <option value="best-selling">Best Selling</option>
            <option value="title-asc">Alphabetical (A - Z)</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-stone-500">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Content Area: Optional Filter Sidebar + Grid */}
      <div
        className={`transition-all duration-300 ${
          filterOpen ? "grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] gap-8 items-start" : "block"
        }`}
      >
        {/* Desktop Filter Sidebar (Toggled by Filter button) */}
        {filterOpen && (
          <aside className="hidden lg:block bg-stone-50/80 border border-stone-200 p-5 rounded-xs animate-fadeIn self-start sticky top-28">
            {filtersMarkup}
          </aside>
        )}

        {/* Products Grid Area */}
        <section aria-label="Products" className="min-w-0 flex-1">
          {products.length ? (
            <div className={getGridClass()}>
              {products.map((product, index) => {
                const isMetaSale = product.metadata?.is_sale === true
                const isCardSale = isSalePage || isMetaSale
                const metaDiscount =
                  typeof product.metadata?.discount_percent === "number"
                    ? Number(product.metadata.discount_percent)
                    : 25
                const metaSalePrice =
                  typeof product.metadata?.sale_price_pkr === "number"
                    ? Number(product.metadata.sale_price_pkr)
                    : undefined
                const metaOrigPrice =
                  typeof product.metadata?.original_price_pkr === "number"
                    ? Number(product.metadata.original_price_pkr)
                    : undefined

                return (
                  <NaqshProductCard
                    key={product.id}
                    product={product}
                    priority={index < 4}
                    showSale={isCardSale}
                    discountPercent={metaDiscount}
                    customSalePrice={isCardSale ? metaSalePrice : undefined}
                    customOriginalPrice={isCardSale ? metaOrigPrice : undefined}
                  />
                )
              })}
            </div>
          ) : (
            <div className="min-h-80 flex flex-col items-center justify-center text-center border border-dashed border-stone-300 bg-white p-8">
              <p className="text-xs uppercase tracking-widest text-accent mb-4">
                A fresh edit is on its way
              </p>
              <h2 className="font-serif text-3xl mb-4 text-stone-900">No matching pieces</h2>
              <p className="text-sm text-stone-500 max-w-sm">
                Try a different filter or explore the complete collection.
              </p>
              <LocalizedClientLink
                href="/store"
                className="bg-stone-900 text-white px-7 py-3 mt-7 text-xs uppercase tracking-widest hover:bg-black transition-colors"
              >
                Explore all pieces
              </LocalizedClientLink>
            </div>
          )}

          {pages > 1 && (
            <nav
              aria-label="Product pages"
              className="flex justify-center items-center gap-5 border-t border-stone-200 mt-12 pt-6"
            >
              {page > 1 && (
                <Link
                  href={pageLink(page - 1)}
                  className="px-4 py-2 border border-stone-300 text-xs font-semibold uppercase tracking-wider hover:border-black transition-colors"
                >
                  Previous
                </Link>
              )}
              <p className="text-xs text-stone-500">
                Page <strong className="text-stone-900">{page}</strong> of {pages}
              </p>
              {page < pages && (
                <Link
                  href={pageLink(page + 1)}
                  className="px-4 py-2 border border-stone-300 text-xs font-semibold uppercase tracking-wider hover:border-black transition-colors"
                >
                  Next
                </Link>
              )}
            </nav>
          )}
        </section>
      </div>

      {/* Mobile Filters Slide-over Modal */}
      <Dialog open={mobileDrawerOpen} onClose={setMobileDrawerOpen} className="relative z-[100]">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" aria-hidden="true" />
        <div className="fixed inset-0 flex justify-end">
          <DialogPanel className="h-[100dvh] w-[min(90vw,420px)] bg-[#faf8f5] flex flex-col shadow-2xl animate-fadeIn">
            <div className="flex justify-between items-center p-6 border-b border-stone-200">
              <DialogTitle className="font-serif text-2xl font-semibold text-stone-900">
                Filters
              </DialogTitle>
              <button
                aria-label="Close filters"
                onClick={() => setMobileDrawerOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-stone-500 hover:text-black hover:bg-stone-200 text-xl transition-colors"
              >
                &times;
              </button>
            </div>
            <div className="p-6 flex-1 min-h-0 overflow-auto">{filtersMarkup}</div>
            <div className="p-5 border-t border-stone-200 bg-white">
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="w-full py-3.5 bg-stone-900 hover:bg-black text-white text-xs font-semibold uppercase tracking-widest transition-colors shadow-sm"
              >
                View {count} {count === 1 ? "Piece" : "Pieces"}
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  )
}
