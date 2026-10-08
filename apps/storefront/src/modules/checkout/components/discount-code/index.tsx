"use client"

import { useState } from "react"
import { HttpTypes } from "@medusajs/types"
import { applyPromotions } from "@lib/data/cart"

export default function DiscountCode({ cart }: { cart: HttpTypes.StoreCart }) {
  const [code, setCode] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const promotions = cart.promotions || []
  const hasCode = promotions.some(promotion => !promotion.is_automatic)
  const apply = async (codes: string[], removing = false) => {
    setBusy(true)
    setError("")
    setSuccess("")
    try {
      await applyPromotions(codes)
      setSuccess(removing ? "Promotion removed." : "Promotion applied. Your totals have been updated.")
      setCode("")
    } catch (error) { setError(error instanceof Error ? error.message : "Unable to apply this code.") }
    finally { setBusy(false) }
  }
  return <section className="py-5 border-y border-stone-200 space-y-3">
    <h3 className="text-sm font-medium">Have a promotion code?</h3>
    <form onSubmit={event => { event.preventDefault(); if (code.trim()) void apply([code]) }} className="flex gap-2">
      <input aria-label="Promotion code" autoComplete="off" autoCapitalize="characters" value={code} onChange={event => setCode(event.target.value)} placeholder="Enter code" disabled={busy || hasCode} className="min-w-0 flex-1 border border-stone-300 px-3 py-3 text-sm uppercase" data-testid="discount-input" />
      <button disabled={busy || hasCode || !code.trim()} className="bg-stone-900 text-white px-5 py-3 text-xs uppercase tracking-wider disabled:opacity-50" data-testid="discount-apply-button">{busy ? "Updating..." : "Apply"}</button>
    </form>
    {hasCode && <p className="text-xs text-stone-500">One promotion code per order. Remove your current code to use another.</p>}
    {error && <p role="alert" className="text-sm text-red-700" data-testid="discount-error-message">{error}</p>}
    {success && <p role="status" className="text-sm text-emerald-700">{success}</p>}
    {promotions.map(promotion => <div key={promotion.id} className="flex justify-between items-center bg-stone-50 px-3 py-2 text-xs"><span>{promotion.code}{promotion.application_method?.type === "percentage" ? " / " + promotion.application_method.value + "%" : ""}</span>{!promotion.is_automatic && <button aria-label={"Remove " + promotion.code} disabled={busy} onClick={() => apply(promotions.filter(p => !p.is_automatic && p.code && p.code !== promotion.code).map(p => p.code!), true)} className="underline">Remove</button>}</div>)}
  </section>
}
