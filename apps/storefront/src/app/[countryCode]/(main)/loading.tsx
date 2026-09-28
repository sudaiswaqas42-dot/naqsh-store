import React from "react"
import Image from "next/image"

export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading page"
      className="min-h-[70vh] flex flex-col items-center justify-center bg-[#FAF9F6] px-4 py-20 select-none"
    >
      <div className="flex flex-col items-center text-center">
        {/* Breathing Logo */}
        <div className="animate-pulse mb-3">
          <Image
            src="/images/naqsh-logo-dark.png"
            alt="NAQSH"
            width={200}
            height={78}
            priority
            className="h-14 sm:h-16 w-auto object-contain"
          />
        </div>

        {/* Brand Tagline */}
        <div className="flex items-center gap-2 mt-1">
          <span className="w-8 h-[1px] bg-[#B6975A]/60" />
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.35em] text-[#0F2D22]">
            Where Identity Begins
          </span>
          <span className="w-8 h-[1px] bg-[#B6975A]/60" />
        </div>

        {/* Delicate Golden Shimmer Bar */}
        <div className="w-40 h-[1.5px] bg-[#EBE1D6] rounded-full overflow-hidden mt-5 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#B6975A] to-transparent animate-shimmer" />
        </div>
      </div>
    </div>
  )
}
