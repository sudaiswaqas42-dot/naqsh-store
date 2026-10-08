"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useWishlist } from "@lib/context/wishlist-context"
import { HttpTypes } from "@medusajs/types"
import { getProductPrice } from "@lib/util/get-product-price"

export default function MobileProductToolbar({ product }: { product: HttpTypes.StoreProduct }) {
  const { isInWishlist, toggleWishlist } = useWishlist()
  const favorite = isInWishlist(product.id)
  return <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-2 p-4 lg:hidden">
    <LocalizedClientLink href="/store" aria-label="Back to products" className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 text-xl text-stone-900 shadow-sm">&larr;</LocalizedClientLink>
    <span className="rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-stone-900">Product Details</span>
    <div className="flex gap-2">
      <button aria-label={favorite ? "Remove from wishlist" : "Save to wishlist"} aria-pressed={favorite} onClick={() => toggleWishlist({ id: product.id, title: product.title, handle: product.handle || "", thumbnail: product.thumbnail || product.images?.[0]?.url || "", price: getProductPrice({ product }).cheapestPrice?.calculated_price_number || 0, currency_code: "pkr" })} className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 text-stone-900 shadow-sm">
        <svg width="18" height="18" viewBox="0 0 24 24" fill={favorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" /></svg>
      </button>
      <LocalizedClientLink href="/cart" aria-label="Shopping bag" className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 text-stone-900 shadow-sm"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 8h14l1 13H4L5 8Z" /><path d="M8 8V6a4 4 0 0 1 8 0v2" /></svg></LocalizedClientLink>
    </div>
  </div>
}
