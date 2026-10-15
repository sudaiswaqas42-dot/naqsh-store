import MobileShopNavigation from "@modules/layout/components/mobile-shop-navigation"
import ScrollReveal from "@modules/layout/components/scroll-reveal"
import { Suspense } from "react"
import { Metadata } from "next"

import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { getCodSettings } from "@lib/data/homepage"
import { getBaseURL } from "@lib/util/env"
import CartMismatchBanner from "@modules/layout/components/cart-mismatch-banner"
import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"
import FreeShippingPriceNudge from "@modules/shipping/components/free-shipping-price-nudge"
import WhatsAppFloatingButton from "@modules/common/components/whatsapp-floating-button"
import RecentlyViewedPopup from "@modules/home/components/recently-viewed-popup"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

async function CartNotices() {
  const [customer, cart] = await Promise.all([
    retrieveCustomer().catch(() => null),
    retrieveCart().catch(() => null),
  ])

  return (
    <>
      {customer && cart && (
        <CartMismatchBanner customer={customer} cart={cart} />
      )}

      {cart && (
        <FreeShippingPriceNudge
          variant="popup"
          cart={cart}
          shippingOptions={[]}
        />
      )}
    </>
  )
}

export default async function PageLayout({ children }: { children: React.ReactNode }) {
  const codSettings = await getCodSettings().catch(() => null)

  return (
    <>
      <ScrollReveal />
      <Suspense fallback={<div className="h-36 border-b border-stone-200 bg-white flex items-center justify-center font-serif text-3xl tracking-[0.3em]">NAQSH</div>}>
        <Nav />
      </Suspense>
      <Suspense fallback={null}><CartNotices /></Suspense>
      {children}
      <Suspense fallback={<div className="min-h-40 bg-[#0F2D22]" />}><Footer /></Suspense>
      <WhatsAppFloatingButton initialNumber={codSettings?.whatsapp_number} />
      <RecentlyViewedPopup />
      <MobileShopNavigation />
    </>
  )
}

