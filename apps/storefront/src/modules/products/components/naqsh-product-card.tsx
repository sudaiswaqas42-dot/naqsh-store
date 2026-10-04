"use client"

import ProductAttributes from "@modules/products/components/product-attributes"

import { productPrice, variantAvailable } from "@lib/util/catalog"
import Image from "next/image"
import React, { useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import SvgProductImage from "@modules/common/components/svg-product-image"
import { useWishlist } from "@lib/context/wishlist-context"
import { useCartDrawer } from "@lib/context/cart-drawer-context"
import { useToast } from "@lib/context/toast-context"
import { useParams, useRouter } from "next/navigation"

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
  const val = Math.round(amount)
  return `Rs. ${val.toLocaleString()}`
}

export default function NaqshProductCard({
  product,
  priority = false,
}: ProductCardProps) {
  const { isInWishlist, toggleWishlist } = useWishlist()
  const { addItem } = useCartDrawer()
  const { showToast } = useToast()
  const params = useParams()
  const router = useRouter()
  const countryCode = (params?.countryCode as string) || "pk"

  const [addingVariantId, setAddingVariantId] = useState<string | null>(null)
  const [hovered, setHovered] = useState(false)

  const [imageLoaded, setImageLoaded] = useState(false)
  const isFavorited = isInWishlist(product.id)

  const images = product.images || []
  const primaryImage = product.thumbnail || images[0]?.url || ""
  const secondaryImage = images[1]?.url || primaryImage

  // Determine price from metadata or variants
  const variants = product.variants || []
  const firstVariant = variants[0]

  const calculatedPrice = productPrice(product)
  const rawPrice = calculatedPrice
  const formattedPrice = formatPrice(rawPrice)
  const salePrice = rawPrice
  const pricedVariant = variants.find((variant: any) => variant.calculated_price?.calculated_amount === rawPrice)
  const originalPrice = pricedVariant?.calculated_price?.original_amount ?? rawPrice
  const discountPercent = originalPrice && salePrice != null && originalPrice > salePrice
    ? Math.round((1 - salePrice / originalPrice) * 100) : 0

  const showSale = discountPercent > 0

  // Category or fabric label
  const categoryName = product.categories?.[0]?.name || product.collection?.title || "Luxury Pret"

  const handleQuickAdd = async (variantId: string, sizeTitle?: string) => {
    const variant = variants.find((v: any) => v.id === variantId) || firstVariant
    const isAvailable = variant ? variantAvailable(variant) : true

    if (!isAvailable) {
      showToast(
        `⚠️ Out of Stock: "${product.title}" is currently sold out. Our Karachi atelier is restocking shortly!`,
        "error"
      )
      return
    }

    setAddingVariantId(variantId)
    try {
      await addItem({
        variantId,
        quantity: 1,
        countryCode,
        preview: { title: product.title, thumbnail: product.thumbnail || product.images?.[0]?.url, unit_price: variant?.calculated_price?.calculated_amount ?? rawPrice ?? 0 },
      })
      showToast(`Added ${product.title} ${sizeTitle ? `(${sizeTitle})` : ""} to your bag!`, "success")

    } catch (err: any) {
      console.error(err)
      showToast(err?.message || "Failed to add to bag. Please try again.", "error")
    } finally {
      setAddingVariantId(null)
    }
  }

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist({
      id: product.id,
      title: product.title,
      handle: product.handle,
      thumbnail: primaryImage,
      price: rawPrice ?? 0,
      currency_code: "pkr",
    })
  }

  return (
    <div
      className="group relative flex flex-col bg-white overflow-hidden transition-all duration-300"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] w-full bg-stone-100 overflow-hidden">
        <LocalizedClientLink href={`/products/${product.handle}`} className="block w-full h-full">
          {primaryImage ? (
            <SvgProductImage
              src={hovered && secondaryImage ? secondaryImage : primaryImage}
              alt={product.title}
              priority={priority}
              className="w-full h-full transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="h-full flex items-center justify-center font-serif text-2xl tracking-widest text-stone-400">
              NAQSH
            </div>
          )}
        </LocalizedClientLink>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-stone-700 hover:text-red-500 hover:bg-white transition-all transform active:scale-90"
          aria-label={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
        >
          <svg
            className={`w-4 h-4 transition-colors ${
              isFavorited ? "fill-red-500 text-red-500" : "fill-none text-stone-700"
            }`}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>

        {/* Badges matching Image 3 SALE badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {showSale && (
            <span className="bg-[#991b1b] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 shadow-xs">
              SALE
            </span>
          )}
          {!showSale && product.collection?.title && (
            <span className="bg-stone-900/90 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 backdrop-blur-xs">
              {product.collection.title}
            </span>
          )}
        </div>

        {/* Luxury Quick Size Shelf on Hover for standard cards */}
        {!showSale && (
          <div
            className={`absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-all duration-300 transform flex flex-col items-center justify-end z-20 ${
              hovered
                ? "opacity-100 translate-y-0 pointer-events-auto"
                : "opacity-0 translate-y-3 pointer-events-none"
            }`}
          >
            {variants.length > 1 ? (
              <div className="w-full space-y-1.5 text-center">
                <span className="text-[10px] text-amber-200 tracking-[0.2em] uppercase font-semibold block">
                  Select Size To Add
                </span>
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  {variants.slice(0, 6).map((v: any) => (
                    <button
                      key={v.id}
                      onClick={() => handleQuickAdd(v.id, v.title)}
                      disabled={!!addingVariantId || !variantAvailable(v) || v.calculated_price?.calculated_amount == null}
                      className="min-w-[32px] h-7 px-2 bg-white/95 hover:bg-amber-600 hover:text-white text-stone-900 text-[11px] font-bold tracking-tight border border-white/40 shadow-xs transition-all uppercase disabled:opacity-40 disabled:hover:bg-white/95 disabled:hover:text-stone-900"
                    >
                      {addingVariantId === v.id ? "..." : v.title}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <button
                onClick={() => handleQuickAdd(firstVariant?.id || "")}
                disabled={!firstVariant || !!addingVariantId || !variantAvailable(firstVariant) || rawPrice == null}
                className="w-full py-2.5 bg-white text-stone-900 text-[11px] font-bold uppercase tracking-widest hover:bg-amber-600 hover:text-white shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <span>+</span>
                <span>{addingVariantId ? "Adding to Bag..." : "Quick Add to Bag"}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Product Details matching Image 3 */}
      <div className="pt-4 pb-2 px-1 flex flex-col flex-1">
        <div className="text-[10px] uppercase tracking-widest text-stone-500 font-medium mb-1">
          {categoryName}
        </div>

        <LocalizedClientLink
          href={`/products/${product.handle}`}
          className="font-serif text-sm font-medium text-brand hover:text-accent transition-colors line-clamp-1 mb-1"
        >
          {product.title}
        </LocalizedClientLink>

        <ProductAttributes product={product} />

        {/* Pricing Layout matching Image 3 */}
        {showSale ? (
          <div className="mt-auto flex items-baseline gap-2 flex-wrap pt-0.5">
            <span className="text-xs sm:text-sm font-bold text-stone-900 tracking-tight">
              {formatPrice(salePrice)}
            </span>
            {discountPercent > 0 && <span className="text-[11px] text-stone-400 line-through">
              {formatPrice(originalPrice)}
            </span>}
            {discountPercent > 0 && <span className="text-[11px] font-bold text-red-600">
              -{discountPercent}%
            </span>}
          </div>
        ) : (
          <div className="mt-auto flex items-center justify-between pt-1">
            <span className="text-xs font-semibold text-stone-900 tracking-tight">
              {formattedPrice}
            </span>
            <span className="text-[10px] text-stone-400 uppercase tracking-wider">
              PKR
            </span>
          </div>
        )}

        {/* Solid Black "ADD TO CART" Button appearing on hover matching Image 3 */}
        {showSale && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              variants.length > 1 ? router.push(`/${countryCode}/products/${product.handle}`) : handleQuickAdd(firstVariant?.id || "", firstVariant?.title)
            }}
            disabled={!firstVariant || !!addingVariantId}
            className={`w-full mt-3 py-2.5 ${
              firstVariant && !variantAvailable(firstVariant)
                ? "bg-stone-500 text-white"
                : "bg-black hover:bg-stone-800 text-white"
            } text-[11px] sm:text-xs font-bold uppercase tracking-widest transition-all duration-200 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 flex items-center justify-center gap-1.5 shadow-sm active:scale-98`}
          >
            {addingVariantId
              ? "Adding..."
              : firstVariant && !variantAvailable(firstVariant)
              ? "Out of Stock"
              : variants.length > 1 ? "Choose Options" : "Add to Cart"}
          </button>
        )}
      </div>
    </div>
  )
}

