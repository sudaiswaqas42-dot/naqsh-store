"use client"

import React, { useState, useEffect } from "react"
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
  const [isMinimized, setIsMinimized] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem("naqsh_recently_viewed")
      if (stored) {
        const parsed: RecentlyViewedItem[] = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setItems(parsed)
          // Only auto-open on desktop; never auto-open on mobile so screen is never covered
          const isMobile = typeof window !== "undefined" && window.innerWidth < 768
          if (!isMobile) {
            const timer = setTimeout(() => {
              setIsOpen(true)
            }, 1200)
            return () => clearTimeout(timer)
          }
        }
      }
    } catch {}
  }, [])

  const handleClear = () => {
    try {
      localStorage.removeItem("naqsh_recently_viewed")
    } catch {}
    setItems([])
    setIsOpen(false)
  }

  const handleClose = () => {
    setIsOpen(false)
    setIsMinimized(true)
    setHasInteracted(true)
  }

  if (items.length === 0) {
    return null
  }

  return (
    <>
      {/* 1. Minimized Floating Badge: Cleanly positioned alongside WhatsApp button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => {
            setIsOpen(true)
            setIsMinimized(false)
          }}
          className="hidden sm:flex fixed bottom-6 right-20 sm:right-24 z-40 bg-stone-900 hover:bg-black text-white px-4 py-2.5 rounded-full shadow-2xl border border-white/20 items-center gap-2 text-xs font-semibold uppercase tracking-wider transition-all duration-300 hover:scale-105 active:scale-95 group font-sans"
          aria-label="View recently viewed products"
        >
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Recently Viewed ({items.length})</span>
        </button>
      )}

      {/* 2. Expanded Luxury Popup Drawer: Positioned neatly ABOVE WhatsApp button without any overflow or overlap */}
      {isOpen && (
        <div className="hidden sm:block fixed bottom-22 right-4 sm:bottom-24 sm:right-6 z-40 w-[min(94vw,390px)] bg-white/95 backdrop-blur-md border border-stone-300 shadow-2xl rounded-xs overflow-hidden animate-slideUp font-sans text-stone-900 select-none">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-stone-900 text-white">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
              <span className="font-serif text-sm font-medium tracking-wide">
                Pick Up Where You Left Off
              </span>
              <span className="text-[10px] bg-accent/20 text-accent px-1.5 py-0.2 rounded-full font-bold">
                {items.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="text-stone-400 hover:text-white p-1 text-sm font-bold transition-colors"
                title="Minimize"
              >
                &minus;
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="text-stone-400 hover:text-white p-1 text-lg leading-none transition-colors"
                title="Close"
              >
                &times;
              </button>
            </div>
          </div>

          {/* Subheader hint */}
          <div className="flex items-center justify-between px-4 py-2 bg-stone-50 border-b border-stone-200 text-[10px] text-stone-500 font-medium">
            <span>Recently visited pieces on NAQSH</span>
            <button
              type="button"
              onClick={handleClear}
              className="text-stone-400 hover:text-red-600 transition-colors underline"
            >
              Clear
            </button>
          </div>

          {/* Product Items Carousel / List */}
          <div className="max-h-[310px] overflow-y-auto divide-y divide-stone-100 p-2">
            {items.map((item) => (
              <div key={item.id} className="p-2 flex items-center gap-3 hover:bg-stone-50 transition-colors rounded-xs group">
                <LocalizedClientLink
                  href={`/products/${item.handle}`}
                  className="w-14 h-18 bg-stone-100 relative overflow-hidden flex-shrink-0 border border-stone-200"
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
                    className="font-serif text-xs font-medium text-stone-900 group-hover:text-accent truncate block transition-colors"
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
                    className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-accent hover:text-brand mt-1.5 transition-colors"
                  >
                    <span>View Piece</span>
                    <span>&rarr;</span>
                  </LocalizedClientLink>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Action Footer */}
          <div className="p-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-2">
            <LocalizedClientLink
              href="/store"
              className="flex-1 py-2 bg-stone-900 hover:bg-black text-white text-[10px] font-bold uppercase tracking-widest text-center transition-colors shadow-2xs"
            >
              Explore Full Collection
            </LocalizedClientLink>

            <button
              type="button"
              onClick={handleClose}
              className="px-3 py-2 border border-stone-300 text-stone-700 hover:border-black text-[10px] font-semibold uppercase tracking-wider transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </>
  )
}
