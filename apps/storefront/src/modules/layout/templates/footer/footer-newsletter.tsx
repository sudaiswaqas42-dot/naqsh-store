"use client"

import { subscribeNewsletter } from "@lib/data/customer-care"
import React, { useState } from "react"
import { useToast } from "@lib/context/toast-context"

export default function FooterNewsletter() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes("@")) {
      showToast("Please enter a valid email address.", "error")
      return
    }

    setLoading(true)
    try {
      const result = await subscribeNewsletter(email)
      if (result.error) {
        showToast(result.error, "error")
        return
      }
      setEmail("")
      showToast("Your subscription has been saved. Welcome to the NAQSH Circle.", "success")
    } catch {
      showToast("Could not subscribe right now. Please try again.", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid items-center gap-7 lg:grid-cols-2 lg:gap-20">
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-[#9b7a43]">A note from NAQSH</p>
        <h2 className="mt-3 font-serif text-3xl text-brand sm:text-4xl">Stay close to what&apos;s new.</h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-stone-600">Be the first to discover new unstitched collections, seasonal favourites and special offers.</p>
      </div>
      <div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
          <input type="email" aria-label="Email address for newsletter" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="Your email address" disabled={loading} className="min-w-0 flex-1 rounded-xl border border-stone-300 bg-white px-4 py-4 text-base outline-none focus:border-brand" />
          <button type="submit" disabled={loading} className="rounded-xl bg-brand px-7 py-4 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-black disabled:opacity-50">{loading ? "Subscribing..." : "Subscribe"}</button>
        </form>
        <p className="mt-3 text-xs leading-relaxed text-stone-500">Subscribe for NAQSH updates. You can unsubscribe at any time.</p>
      </div>
    </div>
  )
}
