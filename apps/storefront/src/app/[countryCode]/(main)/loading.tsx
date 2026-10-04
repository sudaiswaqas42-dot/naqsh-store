import React from "react"

export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none"
    >
      <div className="h-[2.5px] w-full bg-stone-100/40 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-[#B6975A] via-[#dfca9f] to-[#B6975A] animate-shimmer" />
      </div>
    </div>
  )
}
