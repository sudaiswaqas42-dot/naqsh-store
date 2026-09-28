"use client"

import React from "react"
import { HttpTypes } from "@medusajs/types"
import { OptimisticCartProvider, useOptimisticCart } from "./cart-state"
import ItemsTemplate from "./items"
import Summary from "./summary"
import EmptyCartMessage from "../components/empty-cart-message"
import SignInPrompt from "../components/sign-in-prompt"
import Divider from "@modules/common/components/divider"

const CartInner = ({
  customer,
}: {
  customer: HttpTypes.StoreCustomer | null
}) => {
  const { cart, optimisticSubtotal, removedItemIds } = useOptimisticCart()
  const activeItemCount = (cart.items?.length || 0) - removedItemIds.size

  const freeShippingThreshold = 4999
  const amountNeeded = Math.max(0, freeShippingThreshold - optimisticSubtotal)
  const progressPercent = Math.min(100, Math.round((optimisticSubtotal / freeShippingThreshold) * 100))

  if (activeItemCount <= 0) {
    return <EmptyCartMessage />
  }

  return (
    <div>
      {/* Animated Pakistani Free Shipping Progress Bar */}
      <div className="mb-6 p-4 bg-gradient-to-r from-amber-50/80 via-white to-amber-50/80 border border-amber-200/90 rounded-xs shadow-2xs">
        <div className="flex flex-wrap items-center justify-between text-xs font-semibold text-stone-900 mb-2 gap-2">
          <span className="flex items-center gap-1.5">
            <span>🚚</span>
            {amountNeeded === 0 ? (
              <span className="text-emerald-700 font-bold">
                Congratulations! You unlocked FREE Nationwide Delivery across Pakistan!
              </span>
            ) : (
              <span>
                Add <strong className="text-amber-800">PKR {amountNeeded.toLocaleString()}</strong> more to unlock <strong className="text-emerald-700">FREE Nationwide Delivery</strong>
              </span>
            )}
          </span>
          <span className="text-[11px] text-stone-500 font-medium bg-white px-2 py-0.5 rounded-full border border-stone-200">
            {amountNeeded === 0 ? "100% Unlocked" : `Free on Rs. 4,999+`}
          </span>
        </div>

        {/* Progress track */}
        <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              amountNeeded === 0
                ? "bg-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                : "bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400"
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 small:grid-cols-[1fr_360px] gap-x-20 lg:gap-x-32">
        <div className="flex flex-col bg-white py-2 gap-y-6">
          {!customer && (
            <>
              <SignInPrompt />
              <Divider />
            </>
          )}
          <ItemsTemplate cart={cart} />
        </div>
        <div className="relative">
          <div className="flex flex-col gap-y-8 sticky top-12">
            {cart && cart.region && (
              <div className="bg-white py-6">
                <Summary cart={cart} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export const CartView = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart
  customer: HttpTypes.StoreCustomer | null
}) => {
  return (
    <OptimisticCartProvider initialCart={cart}>
      <CartInner customer={customer} />
    </OptimisticCartProvider>
  )
}
