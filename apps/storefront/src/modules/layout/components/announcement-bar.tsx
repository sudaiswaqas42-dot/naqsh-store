"use client"

import React, { useState, useEffect } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const announcements = [
  { text: "Cash on Delivery & 30-Day Doorstep Exchanges", code: "" },
  { text: "FREE DELIVERY ACROSS PAKISTAN | EASY RETURNS & EXCHANGES", code: "" },
  { text: "Nationwide Express Delivery on All Orders Across Pakistan", code: "" },
  { text: "Use code LUXE20 for 20% off your unstitched fabric order", code: "LUXE20" },
]

export default function AnnouncementBar() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % announcements.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="bg-[#0F2D22] text-[#FAF9F6] text-xs py-2.5 px-4 border-b border-[#0B2219] select-none">
      <div className="content-container mx-auto flex items-center justify-between">
        <div className="hidden md:flex items-center gap-3 text-[11px] text-[#FAF9F6]/90 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A869]" />
            <span>NAQSH • Where Identity Begins</span>
          </span>
        </div>

        <div className="flex-1 text-center font-medium transition-all duration-300">
          <span className="inline-flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-[#C5A869] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span>{announcements[index].text}</span>
          </span>
          {announcements[index].code && (
            <span className="ml-2 font-mono font-bold text-[#FAF9F6] bg-white/15 px-1.5 py-0.5 rounded text-[10px]">
              {announcements[index].code}
            </span>
          )}
        </div>

        <div className="hidden md:flex items-center gap-3 text-[11px] text-[#FAF9F6]">
          <LocalizedClientLink href="/order/track" className="hover:text-[#C5A869] font-medium transition-colors flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-[#C5A869]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
            </svg>
            <span>Track Order</span>
          </LocalizedClientLink>
          <span className="text-[#C5A869]">•</span>
          <span>PKR (Rs.)</span>
          <span className="text-[#C5A869]">•</span>
          <LocalizedClientLink href="/contact" className="hover:text-[#C5A869] transition-colors">
            Helpline: 0800 NAQSH
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}
