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
  const { cart, removedItemIds } = useOptimisticCart()
  const activeItems = (cart.items || []).filter((item) => !removedItemIds.has(item.id))
  const activeItemCount = activeItems.length

  if (activeItemCount <= 0) {
    return <EmptyCartMessage />
  }

  const activeCart = {
    ...cart,
    items: activeItems,
  }

  return (
    <div>
      <div className="mb-6 rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700">
        Standard delivery: <strong>Rs. 250</strong>. For COD orders, shipping is payable in advance before dispatch.
      </div>

      <div className="grid grid-cols-1 small:grid-cols-[1fr_360px] gap-x-20 lg:gap-x-32">
        <div className="flex flex-col bg-white py-2 gap-y-6">
          {!customer && (
            <>
              <SignInPrompt />
              <Divider />
            </>
          )}
          <ItemsTemplate cart={activeCart} />
        </div>
        <div className="relative">
          <div className="flex flex-col gap-y-8 sticky top-12">
            {activeCart && activeCart.region && (
              <div className="bg-white py-6">
                <Summary cart={activeCart} />
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
