"use client"

import { useWishlist } from "@lib/context/wishlist-context"
import { useState } from "react"
import { productPrice, productOriginalPrice } from "@lib/util/catalog"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import SvgProductImage from "@modules/common/components/svg-product-image"

interface ProductCardProps {
  product: any
  priority?: boolean
  showSale?: boolean
  discountPercent?: number
  customSalePrice?: number
  customOriginalPrice?: number
}

export function formatPrice(amount?: number | null, currency = "pkr") {
  if (amount == null) return "Price unavailable"
  return new Intl.NumberFormat("en-PK", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount)
}

export default function NaqshProductCard({ product, priority = false }: ProductCardProps) {
  const { isInWishlist, toggleWishlist } = useWishlist()
  const [hovered, setHovered] = useState(false)
  const images = product.images || []
  const primaryImage = product.thumbnail || images[0]?.url || ""
  const price = productPrice(product)
  const original = productOriginalPrice(product)
  return (
    <article className="naqsh-product-card relative h-full">
    <LocalizedClientLink href={"/products/" + product.handle} className="group flex h-full flex-col" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className="naqsh-product-media aspect-[3/4] overflow-hidden bg-stone-100">
        {primaryImage ? <SvgProductImage src={hovered ? images[1]?.url || primaryImage : primaryImage} alt={product.title} priority={priority} className="h-full w-full transition-transform duration-500 motion-safe:group-hover:scale-105" /> : <div className="flex h-full items-center justify-center font-serif text-xl text-stone-400">NAQSH</div>}
      </div>
      <div className="naqsh-product-details flex flex-1 flex-col gap-2 py-3">
        <h3 className="line-clamp-2 text-sm font-medium leading-relaxed text-brand">{product.title}</h3>
        <div className="mt-auto flex flex-wrap items-baseline gap-2 text-sm font-semibold text-stone-900">
          <span>{formatPrice(price)}</span>
          {original != null && price != null && original > price && <span className="text-xs font-normal text-stone-500 line-through">{formatPrice(original)}</span>}
        </div>
      </div>
    </LocalizedClientLink>
    <button type="button" className="naqsh-mobile-heart" aria-label={isInWishlist(product.id) ? "Remove from wishlist" : "Save to wishlist"} aria-pressed={isInWishlist(product.id)} onClick={() => toggleWishlist({ id: product.id, title: product.title, handle: product.handle, thumbnail: primaryImage, price: price || 0, currency_code: "pkr" })}>
      <svg width="17" height="17" viewBox="0 0 24 24" fill={isInWishlist(product.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" /></svg>
    </button>
    </article>
  )
}
