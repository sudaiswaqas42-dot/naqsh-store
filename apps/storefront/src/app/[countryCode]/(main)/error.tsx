"use client"

import { useEffect } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function ErrorPage({
  error,
  reset,
}: {
  error?: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (error) {
      console.error("Storefront runtime error:", error)
    }
  }, [error])

  return (
    <div className="content-container text-center py-24 min-h-[60vh] space-y-6 flex flex-col items-center justify-center">
      <p className="text-xs uppercase tracking-widest text-[#B6975A] font-semibold">NAQSH ATELIER</p>
      <h1 className="font-serif text-3xl sm:text-4xl text-stone-900">We could not load this page</h1>
      <p className="text-stone-600 max-w-md text-sm">
        Please try again. Your shopping bag and preferences are safely preserved.
      </p>
      <div className="flex items-center justify-center gap-4 pt-2">
        <button
          onClick={() => reset()}
          className="bg-[#0F2D22] hover:bg-[#B6975A] px-8 py-3 text-white text-xs font-semibold uppercase tracking-widest transition-colors shadow-sm"
        >
          Try Again
        </button>
        <LocalizedClientLink
          href="/store"
          className="border border-stone-300 hover:border-stone-900 px-6 py-3 text-stone-800 text-xs font-semibold uppercase tracking-widest transition-colors"
        >
          Explore Catalog
        </LocalizedClientLink>
      </div>
    </div>
  )
}
