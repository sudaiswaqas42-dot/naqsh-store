"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import React from "react"

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

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (typeof targetHref === "string" && !targetHref.startsWith("http") && !targetHref.startsWith("#")) {
      try {
        router.prefetch(targetHref)
      } catch {}
    }
    if (onMouseEnter) {
      onMouseEnter(e)
    }
  }

  const handlePrefetch = () => {
    if (typeof targetHref === "string" && !targetHref.startsWith("http") && !targetHref.startsWith("#")) {
      try {
        router.prefetch(targetHref)
      } catch {}
    }
  }

  return (
    <Link
      href={targetHref}
      prefetch={prefetch}
      onMouseEnter={handleMouseEnter}
      onTouchStart={handlePrefetch}
      onFocus={handlePrefetch}
      {...props}
    >
      {children}
    </Link>
  )
}

export default LocalizedClientLink
