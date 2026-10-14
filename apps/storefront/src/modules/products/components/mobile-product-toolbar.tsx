"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductFavorite from "./product-favorite"
import { HttpTypes } from "@medusajs/types"

export default function MobileProductToolbar({ product }: { product: HttpTypes.StoreProduct }) {
  return (
    <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-2 p-4 lg:justify-end">
      <LocalizedClientLink
        href="/store"
        aria-label="Back to products"
        className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-white/40 bg-white/25 backdrop-blur-md text-xl text-stone-900 shadow-sm"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m15 5-7 7 7 7" /></svg>
      </LocalizedClientLink>
      <div className="flex gap-2">
        <ProductFavorite product={product} desktop />
        <LocalizedClientLink
          href="/cart"
          aria-label="Shopping bag"
          className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-white/40 bg-white/25 backdrop-blur-md text-stone-900 shadow-sm"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M5 8h14l1 13H4L5 8Z" />
            <path d="M8 8V6a4 4 0 0 1 8 0v2" />
          </svg>
        </LocalizedClientLink>
      </div>
    </div>
  )
}
