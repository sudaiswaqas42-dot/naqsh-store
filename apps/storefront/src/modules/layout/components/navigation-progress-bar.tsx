"use client"

import React, { useEffect, useState, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import BrandLoader from "./brand-loader"

// Non-blocking route feedback keeps the page and navigation available.
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
      const target = e.target instanceof Element ? e.target.closest("a") : null
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
          !target.hasAttribute("download") &&
          !url.hash &&
          e.button === 0 &&
          !e.altKey &&
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

  return <BrandLoader fading={isFadingOut} />
}
