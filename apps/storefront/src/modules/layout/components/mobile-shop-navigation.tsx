"use client"

import { usePathname } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const items = [
  { href: "/", title: "Home", icon: "M3 10 12 3l9 7v11h-6v-7H9v7H3Z" },
  { href: "/store", title: "Shop", icon: "M3 3h7v7H3ZM14 3h7v7h-7ZM3 14h7v7H3ZM14 14h7v7h-7Z" },
  { href: "/cart", title: "Bag", icon: "M5 8h14l1 13H4L5 8ZM8 8V6a4 4 0 0 1 8 0v2" },
  { href: "/wishlist", title: "Saved", icon: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" },
]

export default function MobileShopNavigation() {
  const pathname = usePathname()
  const path = pathname.replace(/^\/[^/]+/, "") || "/"
  if (/^\/(products|checkout|order|account|cart)(\/|$)/.test(path)) return null
  return <div className="mobile-shop-dock-space"><nav aria-label="Mobile shopping navigation" className="mobile-shop-dock">
    {items.map(item => {
      const active = item.href === "/store" ? /^\/(store|categories|brands)/.test(path) : item.href === path
      return <LocalizedClientLink key={item.href} href={item.href} aria-label={item.title} aria-current={active ? "page" : undefined} className={"flex h-12 w-14 flex-col items-center justify-center gap-1 rounded-2xl " + (active ? "bg-brand text-white" : "text-stone-600")}><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d={item.icon} /></svg><span className="text-[8px]">{item.title}</span></LocalizedClientLink>
    })}
  </nav></div>
}
