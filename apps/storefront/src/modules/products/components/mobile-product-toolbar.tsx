"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useWishlist } from "@lib/context/wishlist-context"
import { HttpTypes } from "@medusajs/types"
import { productPrice } from "@lib/util/catalog"

export default function MobileProductToolbar({ product }: { product: HttpTypes.StoreProduct }) {
  const { isInWishlist, toggleWishlist } = useWishlist()
  const favorite = isInWishlist(product.id)

  const handleFavoriteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const safePrice =
      productPrice(product as any) ??
      (product.variants || []).map((v: any) => v.calculated_price?.calculated_amount).find((val: any) => typeof val === "number") ??
      (product.variants?.[0] as any)?.prices?.[0]?.amount ??
      0

    toggleWishlist({
      id: product.id,
      title: product.title,
      handle: product.handle || "",
      thumbnail: product.thumbnail || product.images?.[0]?.url || "",
      price: safePrice,
      currency_code: "pkr",
    })
  }

  return (
    <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between gap-2 p-4 lg:justify-end">
      <LocalizedClientLink
        href="/store"
        aria-label="Back to products"
        className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 text-xl text-stone-900 shadow-sm"
      >
        &larr;
      </LocalizedClientLink>
      <span className="lg:hidden rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-stone-900">
        Product Details
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          aria-label={favorite ? "Remove from wishlist" : "Save to wishlist"}
          aria-pressed={favorite}
          onClick={handleFavoriteClick}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 text-stone-900 shadow-sm transition-transform active:scale-90 hover:scale-105"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={favorite ? "#e11d48" : "none"}
            stroke={favorite ? "#e11d48" : "currentColor"}
            strokeWidth="1.8"
          >
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
          </svg>
        </button>
        <LocalizedClientLink
          href="/cart"
          aria-label="Shopping bag"
          className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 text-stone-900 shadow-sm"
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
