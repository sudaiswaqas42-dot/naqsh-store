"use client"

import { usePathname } from "next/navigation"
import { ReactNode } from "react"

export default function StoreHeader({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  return <div className={/^\/[^/]+\/products\/[^/]+\/?$/.test(pathname) ? "hidden lg:block" : "block"}>{children}</div>
}
