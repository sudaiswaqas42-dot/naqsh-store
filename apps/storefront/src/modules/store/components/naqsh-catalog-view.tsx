"use client"

import SortDropdown from "./sort-dropdown"

import React, { useState, useMemo } from "react"
import NaqshProductCard from "@modules/products/components/naqsh-product-card"

interface CatalogProps {
  initialProducts: any[]
  title?: string
  description?: string
  categories?: any[]
  collections?: any[]
}

const FABRICS = [
  "Lawn",
  "Organza",
  "Silk",
  "Chiffon",
  "Jacquard",
  "Raw Silk",
  "Velvet",
  "Cotton",
  "Pashmina",
]

const PRICE_BRACKETS = [
  { id: "all", label: "All Prices", min: 0, max: Infinity },
  { id: "under-5k", label: "Under Rs. 5,000", min: 0, max: 5000 },
  { id: "5k-10k", label: "Rs. 5,000 - Rs. 10,000", min: 5000, max: 10000 },
  { id: "10k-20k", label: "Rs. 10,000 - Rs. 20,000", min: 10000, max: 20000 },
  { id: "above-20k", label: "Above Rs. 20,000", min: 20000, max: Infinity },
]

export default function NaqshCatalogView({
  initialProducts,
  title = "The NAQSH Collection",
  description = "Explore our handcrafted Pakistani unstitched lawn, pure silks, and festive fabric cuts.",
  categories = [],
  collections = [],
}: CatalogProps) {
  const [selectedCollections, setSelectedCollections] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedFabrics, setSelectedFabrics] = useState<string[]>([])
  const [selectedPieces, setSelectedPieces] = useState<string[]>([])
  const [selectedPriceBracket, setSelectedPriceBracket] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")
  const [inStockOnly, setInStockOnly] = useState<boolean>(false)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const [gridCols, setGridCols] = useState<number>(4)

  // Toggle helpers
  const toggleCollection = (title: string) => {
    setSelectedCollections((prev) =>
      prev.includes(title) ? prev.filter((c) => c !== title) : [...prev, title]
    )
  }

  const toggleCategory = (name: string) => {
    setSelectedCategories((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name]
    )
  }

  const toggleFabric = (fabric: string) => {
    setSelectedFabrics((prev) =>
      prev.includes(fabric) ? prev.filter((f) => f !== fabric) : [...prev, fabric]
    )
  }

  const resetAllFilters = () => {
    setSelectedCollections([])
    setSelectedCategories([])
    setSelectedFabrics([])
    setSelectedPieces([])
    setSelectedPriceBracket("all")
    setInStockOnly(false)
  }

  const activeFilterCount =
    selectedCollections.length +
    selectedCategories.length +
    selectedFabrics.length +
    selectedPieces.length +
    (selectedPriceBracket !== "all" ? 1 : 0) +
    (inStockOnly ? 1 : 0)

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      // 1. Collection filter
      if (selectedCollections.length > 0) {
        const colTitle = product.collection?.title || ""
        if (!selectedCollections.includes(colTitle)) return false
      }

      // 2. Category filter
      if (selectedCategories.length > 0) {
        const productCats = (product.categories || []).map((c: any) => c.name)
        const hasMatch = selectedCategories.some((sc) => productCats.includes(sc))
        if (!hasMatch) return false
      }

      // 3. Fabric filter (search title, description, or material)
      if (selectedFabrics.length > 0) {
        const text = `${product.title} ${product.description || ""} ${product.material || ""}`.toLowerCase()
        const hasFabric = selectedFabrics.some((f) => text.includes(f.toLowerCase()))
        if (!hasFabric) return false
      }

      // 4. Pieces filter (3-Piece, 2-Piece, 1-Piece)
      if (selectedPieces.length > 0) {
        const text = `${product.title} ${product.description || ""}`.toLowerCase()
        const hasPiece = selectedPieces.some((p) => {
          if (p === "3-Piece") return text.includes("3-piece") || text.includes("3 piece") || text.includes("three piece") || text.includes("suit") || text.includes("lawn set")
          if (p === "2-Piece") return text.includes("2-piece") || text.includes("2 piece") || text.includes("two piece") || text.includes("co-ord")
          if (p === "1-Piece") return text.includes("1-piece") || text.includes("1 piece") || text.includes("kurti") || text.includes("shirt")
          return false
        })
        if (!hasPiece) return false
      }

      // 5. Price bracket
      const bracket = PRICE_BRACKETS.find((b) => b.id === selectedPriceBracket)
      if (bracket && bracket.id !== "all") {
        const firstVariant = product.variants?.[0]
        const price =
          firstVariant?.calculated_price?.calculated_amount ??
          firstVariant?.prices?.[0]?.amount ??
          6950
        if (price < bracket.min || price > bracket.max) return false
      }

      // 6. In stock only
      if (inStockOnly) {
        const totalStock = (product.variants || []).reduce(
          (sum: number, v: any) => sum + (v.inventory_quantity ?? 10),
          0
        )
        if (totalStock <= 0) return false
      }

      return true
    })
  }, [
    initialProducts,
    selectedCollections,
    selectedCategories,
    selectedFabrics,
    selectedPieces,
    selectedPriceBracket,
    inStockOnly,
  ])

  // Sorting
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts]
    switch (sortBy) {
      case "price-asc":
        return list.sort((a, b) => {
          const pA = a.variants?.[0]?.calculated_price?.calculated_amount ?? a.variants?.[0]?.prices?.[0]?.amount ?? 0
          const pB = b.variants?.[0]?.calculated_price?.calculated_amount ?? b.variants?.[0]?.prices?.[0]?.amount ?? 0
          return pA - pB
        })
      case "price-desc":
        return list.sort((a, b) => {
          const pA = a.variants?.[0]?.calculated_price?.calculated_amount ?? a.variants?.[0]?.prices?.[0]?.amount ?? 0
          const pB = b.variants?.[0]?.calculated_price?.calculated_amount ?? b.variants?.[0]?.prices?.[0]?.amount ?? 0
          return pB - pA
        })
      case "title-asc":
        return list.sort((a, b) => a.title.localeCompare(b.title))
      case "newest":
      default:
        return list
    }
  }, [filteredProducts, sortBy])

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

  return (
    <div className="content-container mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-accent">
          100% Unstitched Fabric Atelier
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-brand font-medium mt-1">
          {title}
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-2 font-light leading-relaxed">
          {description}
        </p>
      </div>

      {/* Pakistani Fabric & Pieces Quick-Filter Strip */}
      <div className="mb-8 p-3 bg-stone-50/90 border border-stone-200/90 rounded-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 whitespace-nowrap mr-1 flex items-center gap-1">
            <span>✨</span> Quick Filter:
          </span>
          {[
            { label: "All Pieces", type: "all", value: "all" },
            { label: "3-Piece Luxury Suits", type: "piece", value: "3-Piece" },
            { label: "2-Piece Sets", type: "piece", value: "2-Piece" },
            { label: "1-Piece Fabric", type: "piece", value: "1-Piece" },
            { label: "Pure Lawn", type: "fabric", value: "Lawn" },
            { label: "Silk & Chiffon", type: "fabric", value: "Silk" },
            { label: "Organza", type: "fabric", value: "Organza" },
            { label: "Festive Jacquard", type: "fabric", value: "Jacquard" },
          ].map((pill) => {
            const isSelected =
              pill.type === "all"
                ? selectedPieces.length === 0 && selectedFabrics.length === 0
                : pill.type === "piece"
                ? selectedPieces.includes(pill.value)
                : selectedFabrics.includes(pill.value)

            return (
              <button
                key={pill.label}
                onClick={() => {
                  if (pill.type === "all") {
                    setSelectedPieces([])
                    setSelectedFabrics([])
                  } else if (pill.type === "piece") {
                    setSelectedPieces((prev) =>
                      prev.includes(pill.value)
                        ? prev.filter((p) => p !== pill.value)
                        : [...prev, pill.value]
                    )
                  } else {
                    toggleFabric(pill.value)
                  }
                }}
                className={`px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap rounded-full border transition-all ${
                  isSelected
                    ? "bg-brand text-white border-brand shadow-xs"
                    : "bg-white text-stone-700 border-stone-300 hover:border-stone-500 hover:bg-stone-50"
                }`}
              >
                {pill.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Control Bar: Exact Match to Image 4 (Filter button on Left, 6 Grid Icons in Center, Featured Sort on Right) */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b border-stone-200">
        {/* Left: Filter Toggle Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileFilterOpen((prev) => !prev)}
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-900 hover:text-accent transition-colors"
          >
            <svg className="w-4 h-4 text-stone-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.539.092.917.574.917 1.097v1.884a2.25 2.25 0 01-.659 1.59l-5.432 5.432a2.25 2.25 0 00-.659 1.59v5.676a.75.75 0 01-.22.53l-3.75 3.75a.75.75 0 01-1.28-.53v-9.426a2.25 2.25 0 00-.659-1.59L3.659 8.25A2.25 2.25 0 013 6.66V4.775c0-.523.378-1.005.917-1.097A48.539 48.539 0 0112 3z" />
            </svg>
            <span>Filter</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-stone-900 text-white text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          <span className="text-xs text-stone-400 font-sans hidden sm:inline">
            ({sortedProducts.length} pieces)
          </span>
        </div>

        {/* Center: Grid Density Switcher (1, 2, 3, 4, 5, 6 Columns - Exact Match to Image 4) */}
        <div className="hidden sm:flex items-center gap-1.5 border border-stone-200 p-1 rounded-xs bg-stone-50/60">
          {/* 1 Column (List view) */}
          <button
            type="button"
            onClick={() => setGridCols(1)}
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
            onClick={() => setGridCols(2)}
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
            onClick={() => setGridCols(3)}
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
            onClick={() => setGridCols(4)}
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
            onClick={() => setGridCols(5)}
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
            onClick={() => setGridCols(6)}
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
          <SortDropdown value={sortBy} onChange={setSortBy} />
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-8 p-3 bg-stone-50 border border-stone-200 text-xs">
          <span className="text-stone-400 font-semibold uppercase text-[10px] tracking-wider">
            Active Filters:
          </span>
          {selectedCollections.map((c) => (
            <button
              key={c}
              onClick={() => toggleCollection(c)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-stone-300 text-stone-800 hover:border-red-400 text-xs"
            >
              <span>{c}</span>
              <span className="text-stone-400">&times;</span>
            </button>
          ))}
          {selectedCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-stone-300 text-stone-800 hover:border-red-400 text-xs"
            >
              <span>{cat}</span>
              <span className="text-stone-400">&times;</span>
            </button>
          ))}
          {selectedFabrics.map((f) => (
            <button
              key={f}
              onClick={() => toggleFabric(f)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-stone-300 text-stone-800 hover:border-red-400 text-xs"
            >
              <span>Fabric: {f}</span>
              <span className="text-stone-400">&times;</span>
            </button>
          ))}
          {selectedPriceBracket !== "all" && (
            <button
              onClick={() => setSelectedPriceBracket("all")}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-stone-300 text-stone-800 hover:border-red-400 text-xs"
            >
              <span>{PRICE_BRACKETS.find((b) => b.id === selectedPriceBracket)?.label}</span>
              <span className="text-stone-400">&times;</span>
            </button>
          )}
          {inStockOnly && (
            <button
              onClick={() => setInStockOnly(false)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-stone-300 text-stone-800 hover:border-red-400 text-xs"
            >
              <span>In Stock Only</span>
              <span className="text-stone-400">&times;</span>
            </button>
          )}
          <button
            onClick={resetAllFilters}
            className="text-xs text-accent font-semibold hover:underline ml-2"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Layout: Sidebar + Product Grid */}
      <div
        className={`items-start transition-all duration-300 ${
          mobileFilterOpen ? "grid grid-cols-1 lg:grid-cols-4 gap-8" : "block"
        }`}
      >
        {/* Filter Sidebar */}
        {mobileFilterOpen && (
          <aside className="space-y-8 block mb-8 p-5 bg-stone-50/90 border border-stone-200/90 rounded-xs animate-fadeIn lg:col-span-1">
            {/* Collections */}
            {collections.length > 0 && (
              <div className="border-b border-stone-200 pb-6">
                <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-brand mb-3">
                  Collections
                </h3>
                <div className="space-y-2">
                  {collections.map((col) => (
                    <label
                      key={col.id}
                      className="flex items-center gap-2.5 text-xs text-stone-600 hover:text-brand cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCollections.includes(col.title)}
                        onChange={() => toggleCollection(col.title)}
                        className="rounded-none border-stone-300 text-brand focus:ring-accent"
                      />
                      <span>{col.title}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Categories */}
            {categories.length > 0 && (
              <div className="border-b border-stone-200 pb-6">
                <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-brand mb-3">
                  Categories
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                  {categories.map((cat) => (
                    <label
                      key={cat.id}
                      className="flex items-center gap-2.5 text-xs text-stone-600 hover:text-brand cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.name)}
                        onChange={() => toggleCategory(cat.name)}
                        className="rounded-none border-stone-300 text-brand focus:ring-accent"
                      />
                      <span>{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Fabric Types */}
            <div className="border-b border-stone-200 pb-6">
              <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-brand mb-3">
                Fabric
              </h3>
              <div className="space-y-2">
                {FABRICS.map((fabric) => (
                  <label
                    key={fabric}
                    className="flex items-center gap-2.5 text-xs text-stone-600 hover:text-brand cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFabrics.includes(fabric)}
                      onChange={() => toggleFabric(fabric)}
                      className="rounded-none border-stone-300 text-brand focus:ring-accent"
                    />
                    <span>{fabric}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="border-b border-stone-200 pb-6">
              <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-brand mb-3">
                Price Range
              </h3>
              <div className="space-y-2">
                {PRICE_BRACKETS.map((b) => (
                  <label
                    key={b.id}
                    className="flex items-center gap-2.5 text-xs text-stone-600 hover:text-brand cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="priceBracket"
                      checked={selectedPriceBracket === b.id}
                      onChange={() => setSelectedPriceBracket(b.id)}
                      className="text-brand focus:ring-accent"
                    />
                    <span>{b.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="pb-4">
              <h3 className="font-serif text-sm font-semibold uppercase tracking-wider text-brand mb-3">
                Availability
              </h3>
              <label className="flex items-center gap-2.5 text-xs text-stone-600 hover:text-brand cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded-none border-stone-300 text-brand focus:ring-accent"
                />
                <span>In Stock Only</span>
              </label>
            </div>
          </aside>
        )}

        {/* Product Grid Area with Dynamic 1, 2, 3, 4, 5, 6 Columns (Matching Image 4) */}
        <div className={mobileFilterOpen ? "lg:col-span-3" : "w-full"}>
          {sortedProducts.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-stone-300 p-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-stone-100 mx-auto flex items-center justify-center text-stone-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </div>
              <h3 className="font-serif text-xl font-medium text-brand">
                No matching pieces found
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                We couldn't find any items matching your selected filters. Try broadening your criteria or reset filters.
              </p>
              <button
                onClick={resetAllFilters}
                className="mt-2 px-6 py-2.5 bg-brand text-white text-xs font-semibold uppercase tracking-wider hover:bg-black transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className={getGridClass()}>
              {sortedProducts.map((product) => (
                <NaqshProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
