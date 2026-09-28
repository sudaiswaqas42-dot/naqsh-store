"use client"

import React, { useState, useEffect } from "react"
import { useWishlist } from "@lib/context/wishlist-context"
import { useCartDrawer } from "@lib/context/cart-drawer-context"
import { useToast } from "@lib/context/toast-context"
import { addToCart } from "@lib/data/cart"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useParams } from "next/navigation"

export default function WishlistPage() {
  const { items, toggleWishlist } = useWishlist()
  const { openCart } = useCartDrawer()
  const { showToast } = useToast()
  const params = useParams()
  const countryCode = (params?.countryCode as string) || "pk"
  const [mounted, setMounted] = useState(false)
  const [movingId, setMovingId] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="content-container mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-stone-500">Loading your wishlist...</p>
      </div>
    )
  }

  const handleMoveToCart = async (item: any) => {
    setMovingId(item.id)
    try {
      // Fetch product to get a variant id
      const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
      const apiKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
      const res = await fetch(`${backendUrl}/store/products/${item.id}?fields=*variants`, {
        headers: { "x-publishable-api-key": apiKey },
      })

      if (!res.ok) throw new Error("Could not fetch product variants")
      const data = await res.json()
      const variant = data.product?.variants?.[0]
      if (!variant) throw new Error("No variants available")

      await addToCart({
        variantId: variant.id,
        quantity: 1,
        countryCode,
      })

      toggleWishlist(item)
      showToast(`Moved ${item.title} to your shopping bag!`, "success")
      openCart()
    } catch (err: any) {
      console.error(err)
      showToast(err?.message || "Failed to add to bag.", "error")
    } finally {
      setMovingId(null)
    }
  }

  return (
    <div className="content-container mx-auto px-4 sm:px-6 lg:px-8 py-14">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-12">
        <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-accent">
          Personal Edit
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-brand font-medium mt-1">
          Your Saved Pieces
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-2 font-light">
          {items.length === 0
            ? "Your wishlist is currently empty."
            : `You have ${items.length} saved ${items.length === 1 ? "piece" : "pieces"} in your wishlist.`}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-stone-300 p-8 space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-stone-100 mx-auto flex items-center justify-center text-stone-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
          <h3 className="font-serif text-xl font-medium text-brand">
            Your Wishlist is Empty
          </h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Click the heart icon on any piece while browsing to save it to your personal wishlist.
          </p>
          <LocalizedClientLink
            href="/store"
            className="inline-block mt-2 px-8 py-3 bg-brand text-white text-xs font-semibold uppercase tracking-widest hover:bg-black transition-colors"
          >
            Explore Catalog
          </LocalizedClientLink>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col bg-white border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="relative aspect-[3/4] bg-stone-100 overflow-hidden">
                <LocalizedClientLink href={`/products/${item.handle}`}>
                  <img
                    src={item.thumbnail || ""}
                    alt={item.title}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                </LocalizedClientLink>

                <button
                  onClick={() => toggleWishlist(item)}
                  className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white text-red-500 rounded-full shadow-sm transition-transform active:scale-95"
                  title="Remove from wishlist"
                >
                  <svg className="w-4 h-4 fill-red-500" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </button>
              </div>

              <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                <div>
                  <LocalizedClientLink
                    href={`/products/${item.handle}`}
                    className="font-serif text-sm font-medium text-brand hover:text-accent line-clamp-1"
                  >
                    {item.title}
                  </LocalizedClientLink>
                  <div className="text-xs font-semibold text-stone-900 mt-1">
                    Rs. {(item.price || 6950).toLocaleString()}
                  </div>
                </div>

                <button
                  onClick={() => handleMoveToCart(item)}
                  disabled={movingId === item.id}
                  className="w-full py-2.5 bg-brand text-white text-xs font-semibold uppercase tracking-wider hover:bg-black transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {movingId === item.id ? (
                    <span>Moving to Bag...</span>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <span>Move to Bag</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
