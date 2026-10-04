"use client"

import { useState, useEffect } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

interface FlashSaleCountdownProps {
  imageUrl?: string
  badge?: string
  headline?: string
  subtitle?: string
  code?: string
  ctaText?: string
  ctaLink?: string
  /** Absolute ISO end time set by the admin panel */
  endsAt?: string | null
}

function computeTimeLeft(targetTime: number) {
  const remainingMs = Math.max(0, targetTime - Date.now())
  const totalSec = Math.floor(remainingMs / 1000)
  return {
    remainingMs,
    days: Math.floor(totalSec / 86400),
    hours: Math.floor((totalSec % 86400) / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
  }
}

export default function FlashSaleCountdown({
  badge = "Limited Time Festive Gala",
  headline = "Flat 20% Off Ready-to-Wear & Luxury Pret",
  subtitle = "Hand-spun pashmina wraps, pure chiffon dupattas, and intricate zari embroideries. Applicable at checkout.",
  code = "LUXE20",
  ctaText = "Shop The Gala",
  ctaLink = "/store",
  endsAt = null,
  imageUrl,
}: FlashSaleCountdownProps) {
  const targetTime = endsAt ? new Date(endsAt).getTime() : NaN
  const hasTarget = !Number.isNaN(targetTime)

  const [timeLeft, setTimeLeft] = useState(() =>
    hasTarget ? computeTimeLeft(targetTime) : null
  )
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!hasTarget) return
    const tick = () => setTimeLeft(computeTimeLeft(targetTime))
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [hasTarget, targetTime])

  // No end time configured or countdown finished: banner is disabled
  if (!hasTarget || !timeLeft || timeLeft.remainingMs <= 0) {
    return null
  }

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch { setCopied(false) }
  }

  const pad = (n: number) => n.toString().padStart(2, "0")
  const displayHours = timeLeft.hours + timeLeft.days * 24

  return (
    <div style={imageUrl ? { backgroundImage: `linear-gradient(rgba(0,0,0,.7),rgba(0,0,0,.7)),url(${JSON.stringify(imageUrl)})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined} className="bg-[#0F2D22] text-white overflow-hidden relative border-y border-stone-800">
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
              <span suppressHydrationWarning className="font-serif text-2xl sm:text-3xl font-bold text-accent block tabular-nums">
                {pad(displayHours)}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-stone-400 block mt-0.5">
                Hours
              </span>
            </div>
            <span className="text-xl font-bold text-accent/60">:</span>
            <div className="text-center bg-black/40 border border-stone-700/80 px-3 sm:px-4 py-2.5 rounded-sm min-w-[62px]">
              <span suppressHydrationWarning className="font-serif text-2xl sm:text-3xl font-bold text-accent block tabular-nums">
                {pad(timeLeft.minutes)}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-stone-400 block mt-0.5">
                Mins
              </span>
            </div>
            <span className="text-xl font-bold text-accent/60">:</span>
            <div className="text-center bg-black/40 border border-stone-700/80 px-3 sm:px-4 py-2.5 rounded-sm min-w-[62px]">
              <span suppressHydrationWarning className="font-serif text-2xl sm:text-3xl font-bold text-accent block tabular-nums">
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
