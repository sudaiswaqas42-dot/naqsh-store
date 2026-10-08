"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import { updateCart } from "@lib/data/cart"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import PaymentButton from "../payment-button"

export default function Review({ cart }: { cart: HttpTypes.StoreCart }) {
  const searchParams = useSearchParams()
  const isOpen = searchParams.get("step") === "review"
  const [notes, setNotes] = useState(String(cart.metadata?.order_notes || ""))
  const ready = cart.shipping_address && (cart.shipping_methods?.length || 0) > 0 && cart.payment_collection
  const savePreferences = async () => {
    await updateCart({ metadata: { ...cart.metadata, order_notes: notes.trim().slice(0, 2000) } })
  }
  return <section className="bg-white">
    <h2 className={"font-serif text-2xl mb-6 " + (!isOpen ? "text-stone-400" : "text-brand")}>Review your order</h2>
    {isOpen && ready && <div className="space-y-6">
      <label className="block text-sm text-stone-600">Order notes (optional)<textarea value={notes} onChange={event => setNotes(event.target.value)} maxLength={2000} placeholder="Delivery instructions or anything we should know" className="block w-full mt-2 border border-stone-300 p-3 min-h-24" /></label>
      <p className="text-xs leading-relaxed text-stone-500">Please review our <LocalizedClientLink href="/terms" target="_blank" className="underline">Terms & Conditions</LocalizedClientLink>, <LocalizedClientLink href="/return-policy" target="_blank" className="underline">Returns Policy</LocalizedClientLink> and <LocalizedClientLink href="/privacy-policy" target="_blank" className="underline">Privacy Policy</LocalizedClientLink>.</p>
      <PaymentButton cart={cart} beforeSubmit={savePreferences} data-testid="submit-order-button" />
    </div>}
  </section>
}
