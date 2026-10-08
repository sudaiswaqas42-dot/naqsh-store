import MobileShopNavigation from "@modules/layout/components/mobile-shop-navigation"
import { Suspense } from "react"
import { Metadata } from "next"

import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { getBaseURL } from "@lib/util/env"
import CartMismatchBanner from "@modules/layout/components/cart-mismatch-banner"
import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"
import FreeShippingPriceNudge from "@modules/shipping/components/free-shipping-price-nudge"
import WhatsAppFloatingButton from "@modules/common/components/whatsapp-floating-button"

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

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={<div className="h-36 border-b border-stone-200 bg-white flex items-center justify-center font-serif text-3xl tracking-[0.3em]">NAQSH</div>}>
        <Nav />
      </Suspense>
      <Suspense fallback={null}><CartNotices /></Suspense>
      {children}
      <Suspense fallback={<div className="min-h-40 bg-[#0F2D22]" />}><Footer /></Suspense>
      <WhatsAppFloatingButton />
      <MobileShopNavigation />
    </>
  )
}
