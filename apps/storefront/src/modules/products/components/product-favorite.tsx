"use client"

import { useWishlist } from "@lib/context/wishlist-context"
import { HttpTypes } from "@medusajs/types"
import { productPrice } from "@lib/util/catalog"

export default function ProductFavorite({ product, desktop = false }: { product: HttpTypes.StoreProduct; desktop?: boolean }) {
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
        <button
          type="button"
          aria-label={favorite ? "Remove from wishlist" : "Save to wishlist"}
          aria-pressed={favorite}
          onClick={handleFavoriteClick}
          className={(desktop ? "hidden lg:flex h-10 w-10" : "lg:hidden flex h-12 w-11") + " shrink-0 border border-stone-200 items-center justify-center rounded-xl bg-white/90 text-stone-900 shadow-sm transition-transform active:scale-90 hover:scale-105"}
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
  )
}
