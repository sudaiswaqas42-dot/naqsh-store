"use client"

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react"
import { useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import NaqshLogo from "@modules/common/components/naqsh-logo"

const menuSections = [
  {
    title: "Categories",
    links: [
      { name: "Shop All Fabrics", href: "/store" },
      { name: "Women", href: "/categories/women" },
      { name: "Men", href: "/categories/men" },
      { name: "Kids", href: "/categories/kids" },
      { name: "Accessories", href: "/categories/accessories" },
      { name: "Sale & Clearance", href: "/categories/sale" },
    ],
  },
  {
    title: "Collections",
    links: [
      { name: "Summer Lawn '25", href: "/collections/summer-lawn-25" },
      { name: "Festive Formals", href: "/collections/festive-formals" },
      { name: "Unstitched Luxury Edit", href: "/collections/unstitched-edit" },
      { name: "Bestsellers", href: "/collections/bestsellers" },
    ],
  },
  {
    title: "Customer Care",
    links: [
      { name: "Track Order", href: "/order/track" },
      { name: "Contact Concierge", href: "/contact" },
      { name: "My Account", href: "/account" },
      { name: "Wishlist", href: "/wishlist" },
      { name: "30-Day Return & Exchange", href: "/return-policy" },
      { name: "Shipping Policy", href: "/shipping-policy" },
      { name: "Size Guide", href: "/size-guide" },
    ],
  },
]

export default function SideMenu() {
  const [open, setOpen] = useState(false)
  return <div className="lg:hidden">
    <button aria-label="Open navigation menu" onClick={() => setOpen(true)} className="p-2 text-charcoal hover:text-brand" data-testid="nav-menu-button">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" /></svg>
    </button>
    <Dialog open={open} onClose={setOpen} className="relative z-[100]">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-2xs" aria-hidden="true" />
      <div className="fixed inset-0 flex">
        <DialogPanel className="w-[min(88vw,420px)] h-[100dvh] bg-[#FAF9F6] shadow-2xl flex flex-col">
          <div className="flex items-center justify-between px-6 py-5 border-b border-stone-200 shrink-0">
            <div>
              <DialogTitle className="sr-only">NAQSH Navigation</DialogTitle>
              <NaqshLogo variant="dark" size="sm" />
            </div>
            <button aria-label="Close navigation menu" onClick={() => setOpen(false)} className="p-2.5 text-2xl text-stone-500 hover:text-stone-900">&times;</button>
          </div>
          <nav aria-label="Mobile navigation" className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-6 space-y-8">
            <LocalizedClientLink href="/search" onClick={() => setOpen(false)} className="block border border-stone-300 bg-white p-4 text-sm">Search the collection &rarr;</LocalizedClientLink>
            {menuSections.map(section => <section key={section.title}><h2 className="text-[10px] tracking-[0.2em] uppercase text-stone-500 mb-3">{section.title}</h2>{section.links.map(link => <LocalizedClientLink key={link.href} href={link.href} onClick={() => setOpen(false)} className="flex justify-between py-3 border-b border-stone-200 text-base font-serif">{link.name}<span aria-hidden="true">&rarr;</span></LocalizedClientLink>)}</section>)}
            <LocalizedClientLink href="/customer-service" onClick={() => setOpen(false)} className="block py-3">Customer Service</LocalizedClientLink>
          </nav>
          <div className="shrink-0 border-t border-stone-200 p-5 text-xs text-stone-500">NAQSH / Pakistan / PKR</div>
        </DialogPanel>
      </div>
    </Dialog>
  </div>
}
