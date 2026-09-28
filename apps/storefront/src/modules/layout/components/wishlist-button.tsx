"use client"

import React, { useEffect, useState } from "react"
import { useWishlist } from "@lib/context/wishlist-context"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function WishlistButton() {
  const { count } = useWishlist()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <LocalizedClientLink
      href="/wishlist"
      className="relative p-2 text-gray-700 hover:text-brand transition-colors inline-flex items-center justify-center"
      title="Wishlist"
    >
      <svg
        className="w-5 h-5"
        fill="none"
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
      {mounted && count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 bg-amber-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white shadow-xs">
          {count}
        </span>
      )}
    </LocalizedClientLink>
  )
}
