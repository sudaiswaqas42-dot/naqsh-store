"use client"

import React, { useState, useEffect } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const announcements = [
  { text: "FREE DELIVERY ACROSS PAKISTAN | EASY RETURNS & EXCHANGES", code: "" },
  { text: "Nationwide Express Delivery on All Orders Across Pakistan", code: "" },
  { text: "Use code LUXE20 for 20% off your unstitched fabric order", code: "LUXE20" },
  { text: "Cash on Delivery & 30-Day Doorstep Exchanges", code: "" },
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
    <div className="bg-[#FDD78E] text-[#0F2D22] text-xs py-2.5 px-4 border-b border-[#FDD78E] select-none">
      <div className="content-container mx-auto flex items-center justify-between">
        <div className="hidden md:flex items-center gap-3 text-[11px] text-[#0F2D22]/80 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0F2D22]" />
            NAQSH • Where Identity Begins
          </span>
        </div>

        <div className="flex-1 text-center font-medium transition-all duration-300">
          <span>{announcements[index].text}</span>
          {announcements[index].code && (
            <span className="ml-2 font-mono font-bold text-[#0F2D22] bg-[#0F2D22]/10 px-1.5 py-0.5 rounded text-[10px]">
              {announcements[index].code}
            </span>
          )}
        </div>

        <div className="hidden md:flex items-center gap-3 text-[11px] text-[#0F2D22]">
          <LocalizedClientLink href="/order/track" className="hover:text-[#967A43] font-medium transition-colors flex items-center gap-1">
            <span>Track Order</span>
          </LocalizedClientLink>
          <span>•</span>
          <span>PKR (Rs.)</span>
          <span>•</span>
          <LocalizedClientLink href="/contact-us" className="hover:text-[#0F2D22] transition-colors">
            Helpline: 0800-NAQSH
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}
