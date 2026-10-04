"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import React, { useEffect } from "react"

/**
 * Module-level cache to deduplicate router.prefetch() calls.
 * Prevents the same href from being prefetched more than once every 30 seconds.
 */
const recentlyPrefetched = new Map<string, number>()

/**
 * High-performance localized link that automatically prefetches on mount, hover, touch, and focus
 * for zero-second instant navigation across the entire store.
 */
const LocalizedClientLink = ({
  children,
  href,
  prefetch = true,
  onMouseEnter,
  ...props
}: {
  children?: React.ReactNode
  href: string
  className?: string
  onClick?: () => void
  onMouseEnter?: (e: React.MouseEvent<HTMLAnchorElement>) => void
  passHref?: true
  prefetch?: boolean | null
  [x: string]: unknown
}) => {
  const { countryCode } = useParams()
  const router = useRouter()

  const targetHref =
    /^(https?:|mailto:|tel:|#)/.test(href) ||
    href === `/${countryCode}` ||
    href.startsWith(`/${countryCode}/`)
      ? href
      : `/${countryCode || "pk"}${href.startsWith("/") ? href : `/${href}`}`

  // Eagerly prefetch on mount so pages are ready before user even hovers
  useEffect(() => {
    if (prefetch === false || !targetHref.startsWith("/")) return
    const now = Date.now()
    if (now - (recentlyPrefetched.get(targetHref) || 0) < 30000) return
    if (recentlyPrefetched.size > 100) recentlyPrefetched.clear()
    recentlyPrefetched.set(targetHref, now)
    router.prefetch(targetHref)
  }, [targetHref, prefetch, router])

  const handleMouseEnter = (event: React.MouseEvent<HTMLAnchorElement>) => {
    // Re-prefetch on hover in case the cache expired
    if (prefetch !== false && targetHref.startsWith("/")) {
      router.prefetch(targetHref)
    }
    onMouseEnter?.(event)
  }

  return (
    <Link
      href={targetHref}
      prefetch={prefetch}
      onMouseEnter={handleMouseEnter}
      onTouchStart={() => { if (prefetch !== false && targetHref.startsWith("/")) router.prefetch(targetHref) }}
      onFocus={() => { if (prefetch !== false && targetHref.startsWith("/")) router.prefetch(targetHref) }}
      {...props}
    >
      {children}
    </Link>
  )
}

export default LocalizedClientLink
