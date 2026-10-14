"use client"

import { useState } from "react"
import CodNotice from "@modules/checkout/components/cod-notice"
import { Button, Heading } from "@modules/common/components/ui"

import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import DiscountCode from "@modules/checkout/components/discount-code"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

import { useOptimisticCart } from "./cart-state"

type SummaryProps = {
  cart: HttpTypes.StoreCart
}

function getCheckoutStep(cart: HttpTypes.StoreCart) {
  if (!cart?.shipping_address?.address_1 || !cart.email) {
    return "address"
  } else if (cart?.shipping_methods?.length === 0) {
    return "delivery"
  } else {
    return "payment"
  }
}

const Summary = ({ cart }: SummaryProps) => {
  const [codSelected, setCodSelected] = useState(false)
  const step = getCheckoutStep(cart)
  let optimisticTotals = cart

  try {
    const { optimisticSubtotal, optimisticTotal } = useOptimisticCart()
    optimisticTotals = {
      ...cart,
      item_subtotal: optimisticSubtotal,
      subtotal: optimisticSubtotal,
      total: optimisticTotal,
    }
  } catch {
    // Fallback if rendered outside provider
  }

  return (
    <div className="flex flex-col gap-y-4">
      <Heading level="h2" className="text-[2rem] leading-[2.75rem]">
        Summary
      </Heading>
      <DiscountCode cart={cart} />
      <Divider />
      <CartTotals totals={optimisticTotals} />
      <div className="rounded-xl border border-stone-200 p-4">
        <label className="flex cursor-pointer items-center gap-3 text-sm font-medium">
          <input type="checkbox" checked={codSelected} onChange={event => setCodSelected(event.target.checked)} className="h-5 w-5 accent-[#0F2D22]" />
          Cash on Delivery (COD)
        </label>
        {codSelected && <CodNotice />}
      </div>
      {codSelected ? <LocalizedClientLink
        href={"/checkout?step=" + step}
        data-testid="checkout-button"
      >
        <Button className="w-full h-10">Go to checkout</Button>
      </LocalizedClientLink> : <><Button className="w-full h-10" disabled>Go to checkout</Button><p className="text-xs text-stone-500">Select Cash on Delivery to continue.</p></>}
    </div>
  )
}

export default Summary
