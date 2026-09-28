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
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-stone-900/60 border border-stone-800 p-6 md:p-8 rounded-none">
      <h3 className="font-serif text-xl font-medium text-white mb-1">
        Join the NAQSH Insiders Circle
      </h3>
      <p className="text-xs text-stone-400 mb-4">
        Receive privileged preview access to new seasonal lawn collections and private VIP exhibitions.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          className="flex-1 bg-stone-950 border border-stone-700 text-stone-100 text-xs px-4 py-3 placeholder:text-stone-500 focus:outline-none focus:border-accent"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-accent text-white font-medium text-xs uppercase tracking-widest hover:bg-amber-600 transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {loading ? "Subscribing..." : "Subscribe"}
        </button>
      </form>
      <p className="text-xs text-stone-400 mt-3">By subscribing, you agree to receive NAQSH marketing emails.</p>
    </div>
  )
}
