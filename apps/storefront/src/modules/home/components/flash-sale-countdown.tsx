"use client"

import { useState, useEffect } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

interface FlashSaleCountdownProps {
  badge?: string
  headline?: string
  subtitle?: string
  code?: string
  ctaText?: string
  ctaLink?: string
  initialHours?: number
  initialMinutes?: number
  initialSeconds?: number
}

export default function FlashSaleCountdown({
  badge = "Limited Time Festive Gala",
  headline = "Flat 20% Off Ready-to-Wear & Luxury Pret",
  subtitle = "Hand-spun pashmina wraps, pure chiffon dupattas, and intricate zari embroideries. Applicable at checkout.",
  code = "LUXE20",
  ctaText = "Shop The Gala →",
  ctaLink = "/store",
  initialHours = 5,
  initialMinutes = 41,
  initialSeconds = 12,
}: FlashSaleCountdownProps) {
  // Live ticking countdown state with persistent target timestamp across refreshes
  const [timeLeft, setTimeLeft] = useState({
    hours: initialHours,
    minutes: initialMinutes,
    seconds: initialSeconds,
  })
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const STORAGE_KEY = "naqsh_flash_sale_end_timestamp"
    const totalDurationMs = (initialHours * 3600 + initialMinutes * 60 + initialSeconds) * 1000

    let targetTime: number
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      const parsed = saved ? parseInt(saved, 10) : 0
      // If valid target exists in the future, continue counting down to it
      if (parsed && parsed > Date.now()) {
        targetTime = parsed
      } else {
        // If not set or expired, set a new target timestamp and persist
        targetTime = Date.now() + totalDurationMs
        localStorage.setItem(STORAGE_KEY, String(targetTime))
      }
    } catch {
      targetTime = Date.now() + totalDurationMs
    }

    const updateTime = () => {
      const remainingMs = Math.max(0, targetTime - Date.now())
      const totalSec = Math.floor(remainingMs / 1000)
      const hours = Math.floor(totalSec / 3600)
      const minutes = Math.floor((totalSec % 3600) / 60)
      const seconds = totalSec % 60
      setTimeLeft({ hours, minutes, seconds })
    }

    // Run immediately on mount
    updateTime()

    // Tick every 1 second
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [initialHours, initialMinutes, initialSeconds])

  const copyCode = () => {
    navigator.clipboard?.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const pad = (n: number) => n.toString().padStart(2, "0")

  return (
    <div className="bg-[#0F2D22] text-white overflow-hidden relative border-y border-stone-800">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#B6975A]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 left-10 w-80 h-80 bg-[#B6975A]/5 rounded-full blur-2xl pointer-events-none" />

      <div className="content-container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left: Campaign Headline */}
          <div className="lg:col-span-6 text-center lg:text-left space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-semibold tracking-[0.2em] uppercase text-[#B6975A] border border-[#B6975A]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B6975A] animate-ping" />
              {badge}
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-medium tracking-wide">
              {headline}
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 font-light max-w-lg">
              {subtitle}
            </p>
          </div>

          {/* Center: Live Countdown Clock */}
          <div className="lg:col-span-3 flex justify-center lg:justify-start items-center gap-3">
            <div className="text-center bg-black/40 border border-stone-700/80 px-3 sm:px-4 py-2.5 rounded-sm min-w-[62px]">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-accent block tabular-nums">
                {pad(timeLeft.hours)}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-stone-400 block mt-0.5">
                Hours
              </span>
            </div>
            <span className="text-xl font-bold text-accent/60">:</span>
            <div className="text-center bg-black/40 border border-stone-700/80 px-3 sm:px-4 py-2.5 rounded-sm min-w-[62px]">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-accent block tabular-nums">
                {pad(timeLeft.minutes)}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-stone-400 block mt-0.5">
                Mins
              </span>
            </div>
            <span className="text-xl font-bold text-accent/60">:</span>
            <div className="text-center bg-black/40 border border-stone-700/80 px-3 sm:px-4 py-2.5 rounded-sm min-w-[62px]">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-accent block tabular-nums">
                {pad(timeLeft.seconds)}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-stone-400 block mt-0.5">
                Secs
              </span>
            </div>
          </div>

          {/* Right: Coupon Code & Shop CTA */}
          <div className="lg:col-span-3 flex flex-col sm:flex-row lg:flex-col items-center justify-center lg:items-end gap-3">
            <div className="flex items-center gap-2 bg-white/5 border border-white/15 px-3 py-1.5 rounded-sm text-xs">
              <span className="text-stone-400 text-[11px]">Use Code:</span>
              <span className="font-mono font-bold text-[#B6975A] tracking-wider">{code}</span>
              <button
                type="button"
                onClick={copyCode}
                className="text-[10px] uppercase font-bold text-white hover:text-[#B6975A] ml-1 underline decoration-[#B6975A] transition-colors"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            <LocalizedClientLink
              href={ctaLink}
              className="px-6 py-3 bg-[#B6975A] text-[#0F2D22] font-semibold text-xs uppercase tracking-widest hover:bg-white transition-all shadow-md hover:shadow-lg w-full sm:w-auto text-center"
            >
              {ctaText}
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    </div>
  )
}
