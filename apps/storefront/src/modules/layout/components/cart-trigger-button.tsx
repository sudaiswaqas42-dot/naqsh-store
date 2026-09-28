"use client"

import React from "react"
import { useCartDrawer } from "@lib/context/cart-drawer-context"
import { HttpTypes } from "@medusajs/types"

export default function CartTriggerButton({
  cart,
}: {
  cart: HttpTypes.StoreCart | null
}) {
  const { openCart } = useCartDrawer()
  const totalItems = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0

  return (
    <button
      onClick={openCart}
      className="relative p-2 text-gray-700 hover:text-brand transition-colors inline-flex items-center justify-center focus:outline-none"
      aria-label={`Open shopping cart with ${totalItems} items`}
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
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
      {totalItems > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-1 bg-stone-950 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white shadow-xs">
          {totalItems}
        </span>
      )}
    </button>
  )
}
