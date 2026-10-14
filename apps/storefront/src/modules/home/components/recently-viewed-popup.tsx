"use client"

import React, { useState, useEffect, useCallback } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { convertToLocale } from "@lib/util/money"

interface RecentlyViewedItem {
  id: string
  title: string
  handle: string
  thumbnail?: string
  price?: number
  currency_code?: string
  viewedAt: number
}

export default function RecentlyViewedPopup() {
  const [items, setItems] = useState<RecentlyViewedItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const loadItems = useCallback(() => {
    try {
      const stored = localStorage.getItem("naqsh_recently_viewed")
      if (stored) {
        const parsed: RecentlyViewedItem[] = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed)
          return parsed
        }
      }
    } catch {}
    setItems([])
    return []
  }, [])

  useEffect(() => {
    const loaded = loadItems()
    const handleUpdate = () => loadItems()
    window.addEventListener("naqsh_recently_viewed_updated", handleUpdate)
    window.addEventListener("storage", handleUpdate)

    return () => {
      window.removeEventListener("naqsh_recently_viewed_updated", handleUpdate)
      window.removeEventListener("storage", handleUpdate)
    }
  }, [loadItems])

  const handleClear = () => {
    try {
      localStorage.removeItem("naqsh_recently_viewed")
    } catch {}
    setItems([])
    setIsOpen(false)
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  if (items.length === 0) {
    return null
  }

  return (
    <>
      {/* 1. Floating Trigger Button to the LEFT side of WhatsApp - Single circle, glassy backdrop */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="recently-viewed-trigger fixed bottom-6 right-20 sm:right-[84px] z-40 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/50 text-[#0F2D22] shadow-lg hover:shadow-xl hover:bg-white/30 transition-all duration-300 hover:scale-105 focus:outline-none"
          aria-label="View recently viewed products"
          title="Recently Viewed Products"
        >
          {/* Eye Icon sized w-6 h-6 exactly matching WhatsApp floating button */}
          <svg
            className="naqsh-eye-blink h-6 w-6 text-[#0F2D22]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
            />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      )}

      {/* 2. Compact Popup Card: On Mobile it sits neatly above the bottom dock without covering the screen; on Desktop it floats at bottom right */}
      {isOpen && (
        <div className="fixed bottom-20 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-24 z-50 sm:w-[380px] max-h-[360px] bg-white backdrop-blur-lg border border-stone-300 shadow-2xl rounded-2xl overflow-hidden font-sans text-stone-900 flex flex-col transition-all duration-300 animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-stone-900 text-white shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#B6975A] naqsh-eye-pulse" />
              <span className="font-serif text-xs sm:text-sm font-medium tracking-wide">
                Recently Viewed
              </span>
              <span className="text-[10px] bg-[#B6975A]/25 text-[#FAF9F6] px-1.5 py-0.2 rounded-full font-bold">
                {items.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClear}
                className="text-[10px] text-stone-400 hover:text-red-400 transition-colors uppercase tracking-wider underline mr-1"
                title="Clear history"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="w-6 h-6 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white text-base leading-none transition-colors"
                aria-label="Close popup"
              >
                &times;
              </button>
            </div>
          </div>

          {/* Product Items: Compact scrollable list */}
          <div className="overflow-y-auto flex-1 divide-y divide-stone-100 p-2 max-h-[240px]">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-1.5 flex items-center gap-3 hover:bg-stone-50 transition-colors rounded-lg group"
              >
                <LocalizedClientLink
                  href={`/products/${item.handle}`}
                  onClick={handleClose}
                  className="w-12 h-15 bg-stone-100 relative overflow-hidden shrink-0 border border-stone-200 rounded-sm"
                >
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[9px] text-stone-400">
                      NAQSH
                    </div>
                  )}
                </LocalizedClientLink>

                <div className="flex-1 min-w-0">
                  <LocalizedClientLink
                    href={`/products/${item.handle}`}
                    onClick={handleClose}
                    className="font-serif text-xs font-medium text-stone-900 group-hover:text-[#B6975A] truncate block transition-colors leading-tight"
                  >
                    {item.title}
                  </LocalizedClientLink>

                  <p className="text-xs font-semibold text-stone-800 mt-0.5">
                    {convertToLocale({
                      amount: item.price || 0,
                      currency_code: item.currency_code || "pkr",
                    })}
                  </p>

                  <LocalizedClientLink
                    href={`/products/${item.handle}`}
                    onClick={handleClose}
                    className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-[#B6975A] hover:text-stone-900 mt-1 transition-colors"
                  >
                    <span>View Piece</span>
                    <span>&rarr;</span>
                  </LocalizedClientLink>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Action Footer */}
          <div className="px-3 py-2 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-2 shrink-0">
            <LocalizedClientLink
              href="/store"
              onClick={handleClose}
              className="flex-1 py-1.5 bg-stone-900 hover:bg-black text-white text-[10px] font-bold uppercase tracking-widest text-center transition-colors rounded-sm"
            >
              Explore Collection
            </LocalizedClientLink>

            <button
              type="button"
              onClick={handleClose}
              className="px-3 py-1.5 border border-stone-300 text-stone-700 hover:border-black text-[10px] font-semibold uppercase tracking-wider transition-colors rounded-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}
