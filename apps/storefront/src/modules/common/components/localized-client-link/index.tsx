"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import React from "react"

// Let Next.js prefetch route shells up to their loading boundary on visibility.
const LocalizedClientLink = ({
  children,
  href,
  prefetch = null,
  onMouseEnter,
  onClick,
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

  const targetHref =
    /^(https?:|mailto:|tel:|#)/.test(href) ||
    href === `/${countryCode}` ||
    href.startsWith(`/${countryCode}/`)
      ? href
      : `/${countryCode || "pk"}${href.startsWith("/") ? href : `/${href}`}`

  return (
    <Link
      href={targetHref}
      prefetch={prefetch}
      onMouseEnter={onMouseEnter}
      {...props}
      scroll={href === "/" ? true : props.scroll as boolean | undefined}
      onClick={event => {
        onClick?.()
        if (href === "/" && !event.defaultPrevented && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && event.button === 0) {
          window.scrollTo({ top: 0, left: 0, behavior: "instant" })
        }
      }}
    >
      {children}
    </Link>
  )
}

export default LocalizedClientLink
