"use client"

import React, { useEffect, useState, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import NaqshLogo from "@modules/common/components/naqsh-logo"

/**
 * Luxury Brand Page Transition Screen with NAQSH Logo.
 * Displays the NAQSH emblem on an opaque luxury canvas during page transitions.
 * When Next.js completes the route change, smoothly fades out to reveal the NEW
 * destination page directly, completely eliminating any flicker or bounce back
 * to the previous page.
 */
export default function NavigationProgressBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isNavigating, setIsNavigating] = useState(false)
  const [isFadingOut, setIsFadingOut] = useState(false)
  const currentPathRef = useRef(pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : ""))
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const fadeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Listen for clicks on internal navigation links
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a")
      if (!target || !target.href) return

      try {
        const url = new URL(target.href, window.location.href)
        const isSameOrigin = url.origin === window.location.origin
        const targetPath = url.pathname + url.search
        const currentPath = window.location.pathname + window.location.search
        const isDifferentPath = targetPath !== currentPath

        if (
          isSameOrigin &&
          isDifferentPath &&
          !target.target &&
          !e.ctrlKey &&
          !e.metaKey &&
          !e.shiftKey
        ) {
          // Clear any active exit timeouts
          if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current)
          if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current)

          setIsFadingOut(false)
          setIsNavigating(true)

          // Generous safety timeout (15s) strictly as a failsafe so it never gets permanently stuck
          safetyTimeoutRef.current = setTimeout(() => {
            setIsNavigating(false)
            setIsFadingOut(false)
          }, 15000)
        }
      } catch {}
    }

    document.addEventListener("click", handleDocumentClick, { capture: true })
    return () => {
      document.removeEventListener("click", handleDocumentClick, { capture: true })
      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current)
      if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current)
    }
  }, [])

  // When pathname or searchParams change, the new route has successfully mounted!
  useEffect(() => {
    const newPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "")
    if (newPath !== currentPathRef.current) {
      currentPathRef.current = newPath
      if (isNavigating) {
        if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current)
        // Begin elegant fade-out reveal of the new page
        setIsFadingOut(true)
        fadeTimeoutRef.current = setTimeout(() => {
          setIsNavigating(false)
          setIsFadingOut(false)
        }, 220)
      }
    }
  }, [pathname, searchParams, isNavigating])

  if (!isNavigating) return null

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#FAF9F6] transition-opacity duration-300 select-none pointer-events-none ${
        isFadingOut ? "opacity-0" : "opacity-100 animate-fadeIn"
      }`}
    >
      <div className="flex flex-col items-center justify-center text-center p-8 max-w-lg mx-auto">
        {/* Animated Brand Logo - Prominent Luxury Scale */}
        <div className="relative animate-pulse-subtle">
          <NaqshLogo variant="dark" size="2xl" priority />
        </div>

        {/* Subtle Luxury Gold Shimmer Indicator */}
        <div className="w-48 sm:w-60 md:w-72 h-[2.5px] bg-[#EBE1D6] rounded-full overflow-hidden mt-8 relative shadow-xs">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#B6975A] to-transparent animate-shimmer" />
        </div>
      </div>
    </div>
  )
}

