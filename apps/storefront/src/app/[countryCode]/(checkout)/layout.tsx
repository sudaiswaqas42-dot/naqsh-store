import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ChevronDown from "@modules/common/icons/chevron-down"
import MedusaCTA from "@modules/layout/components/medusa-cta"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full bg-white relative small:min-h-screen">
      <div className="h-16 bg-white border-b ">
        <nav className="flex h-full items-center content-container justify-between">
          <LocalizedClientLink
            href="/cart"
            className="text-small-semi text-ui-fg-base flex items-center gap-x-2 uppercase flex-1 basis-0"
            data-testid="back-to-cart-link"
          >
            <ChevronDown className="rotate-90" size={16} />
            <span className="mt-px hidden small:block txt-compact-plus text-ui-fg-subtle hover:text-ui-fg-base ">
              Back to shopping cart
            </span>
            <span className="mt-px block small:hidden txt-compact-plus text-ui-fg-subtle hover:text-ui-fg-base">
              Back
            </span>
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/"
            className="flex flex-col items-center group py-1"
            data-testid="store-link"
          >
            <span className="font-serif text-2xl font-bold tracking-[0.25em] text-brand uppercase">
              NAQSH
            </span>
            <span className="text-[9px] tracking-[0.3em] text-accent uppercase font-sans font-semibold">
              Secure Checkout
            </span>
          </LocalizedClientLink>
          <div className="flex-1 basis-0 flex justify-end items-center gap-1.5 text-xs text-stone-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="hidden sm:inline">256-Bit SSL Encrypted</span>
          </div>
        </nav>
      </div>
      <div className="relative" data-testid="checkout-container">{children}</div>
      <div className="py-6 border-t border-stone-200 w-full flex items-center justify-center text-xs text-stone-400">
        © {new Date().getFullYear()} NAQSH Apparel. All rights reserved. Cash on Delivery Available.
      </div>
    </div>
  )
}
