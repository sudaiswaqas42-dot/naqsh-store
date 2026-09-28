import { Suspense } from "react"
import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { retrieveCart } from "@lib/data/cart"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import SideMenu from "@modules/layout/components/side-menu"
import AnnouncementBar from "@modules/layout/components/announcement-bar"
import SearchAutocomplete from "@modules/layout/components/search-autocomplete"
import WishlistButton from "@modules/layout/components/wishlist-button"
import CartTriggerButton from "@modules/layout/components/cart-trigger-button"
import CartDrawer from "@modules/cart/templates/cart-drawer"
import MegaNav from "@modules/layout/components/mega-nav"

import NaqshLogo from "@modules/common/components/naqsh-logo"

export default async function Nav() {
  const [categories, collectionsData] = await Promise.all([
    listCategories({ limit: 100 }).catch(() => []),
    listCollections().catch(() => ({ collections: [] })),
  ])

  return (
    <div className="sticky top-0 inset-x-0 z-40">
      {/* Top Announcement Bar */}
      <AnnouncementBar />

      {/* Main Header */}
      <header className="relative bg-[#FAF9F6] border-b border-[#EBE1D6] shadow-2xs transition-all duration-200">
        <div className="content-container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 sm:h-22 gap-4">
            {/* Left: Mobile Menu & Quick Catalog Link */}
            <div className="flex items-center gap-4 w-20 sm:w-auto lg:w-1/4">
              <SideMenu />
              <LocalizedClientLink
                href="/store"
                className="hidden xl:inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1A1A1A] hover:text-[#B6975A] transition-colors"
              >
                Catalog
              </LocalizedClientLink>
            </div>

            {/* Center: Brand Logo */}
            <div className="flex-1 flex justify-center text-center">
              <LocalizedClientLink
                href="/"
                className="flex items-center justify-center py-1 group"
                data-testid="nav-store-link"
                aria-label="NAQSH Home"
              >
                <NaqshLogo variant="dark" size="md" />
              </LocalizedClientLink>
            </div>

            {/* Right: Search, Track Order, Contact Us, Wishlist, Account, Cart */}
            <div className="flex items-center justify-end gap-1 sm:gap-2.5 lg:gap-3 w-auto lg:w-auto">
              {/* Autocomplete Search */}
              <div className="block">
                <SearchAutocomplete />
              </div>

              {/* Track Order Pill Button */}
              <LocalizedClientLink
                href="/order/track"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#EBE1D6] hover:border-[#0F2D22] text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-[#1A1A1A] hover:text-[#FAF9F6] bg-[#FAF9F6] hover:bg-[#0F2D22] transition-all duration-200 shadow-2xs group"
                title="Track Order Status"
              >
                <svg className="w-3.5 h-3.5 text-[#B6975A] group-hover:text-amber-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
                <span>Track Order</span>
              </LocalizedClientLink>

              {/* Contact Us Pill Button */}
              <LocalizedClientLink
                href="/contact"
                className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#EBE1D6] hover:border-[#0F2D22] text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-[#1A1A1A] hover:text-[#FAF9F6] bg-[#FAF9F6] hover:bg-[#0F2D22] transition-all duration-200 shadow-2xs group"
                title="Contact NAQSH Concierge"
              >
                <svg className="w-3.5 h-3.5 text-[#B6975A] group-hover:text-amber-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>Contact Us</span>
              </LocalizedClientLink>

              {/* Wishlist */}
              <div className="hidden sm:block"><WishlistButton /></div>

              {/* Account Profile */}
              <LocalizedClientLink
                href="/account"
                className="p-2 text-[#1A1A1A] hover:text-[#0F2D22] transition-colors rounded-full hover:bg-[#EBE1D6]/40"
                title="Account"
                data-testid="nav-account-link"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </LocalizedClientLink>

              {/* Slide-in Cart Drawer Trigger */}
              <Suspense fallback={<LocalizedClientLink href="/cart" className="p-2 text-xs">Bag</LocalizedClientLink>}><CartControl /></Suspense>
            </div>
          </div>

          {/* Desktop Mega Navigation */}
          <MegaNav categories={categories} collections={collectionsData.collections} />
        </div>
      </header>

      {/* Slide-in Cart Drawer instance */}
      <Suspense fallback={null}><CartContent /></Suspense>
    </div>
  )
}

async function CartControl() {
  const cart = await retrieveCart().catch(() => null)
  return <CartTriggerButton cart={cart} />
}

async function CartContent() {
  const cart = await retrieveCart().catch(() => null)
  return <CartDrawer cart={cart} />
}
