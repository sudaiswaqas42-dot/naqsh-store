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
  const [accepted, setAccepted] = useState(false)
  const [notes, setNotes] = useState(String(cart.metadata?.order_notes || ""))
  const ready = cart.shipping_address && (cart.shipping_methods?.length || 0) > 0 && cart.payment_collection
  const savePreferences = async () => {
    if (!accepted) throw new Error("Please accept the terms before placing your order.")
    await updateCart({ metadata: { ...cart.metadata, order_notes: notes.trim().slice(0, 2000), terms_accepted_at: new Date().toISOString() } })
  }
  return <section className="bg-white">
    <h2 className={"font-serif text-2xl mb-6 " + (!isOpen ? "text-stone-400" : "text-brand")}>Review your order</h2>
    {isOpen && ready && <div className="space-y-6">
      <label className="block text-sm text-stone-600">Order notes (optional)<textarea value={notes} onChange={event => setNotes(event.target.value)} maxLength={2000} placeholder="Delivery instructions or anything we should know" className="block w-full mt-2 border border-stone-300 p-3 min-h-24" /></label>
      <label className="flex items-start gap-3 text-sm text-stone-600 leading-6"><input type="checkbox" checked={accepted} onChange={event => setAccepted(event.target.checked)} className="mt-1 w-4 h-4 accent-stone-900" /><span>I agree to the <LocalizedClientLink href="/terms" target="_blank" className="underline">Terms & Conditions</LocalizedClientLink> and <LocalizedClientLink href="/return-policy" target="_blank" className="underline">Returns Policy</LocalizedClientLink>, and have read the <LocalizedClientLink href="/privacy-policy" target="_blank" className="underline">Privacy Policy</LocalizedClientLink>.</span></label>
      <PaymentButton cart={cart} disabled={!accepted} beforeSubmit={savePreferences} data-testid="submit-order-button" />
    </div>}
  </section>
}
