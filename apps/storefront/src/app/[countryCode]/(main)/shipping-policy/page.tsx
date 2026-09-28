import { Metadata } from "next"
import NaqshLogo from "@modules/common/components/naqsh-logo"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Shipping Policy — NAQSH",
  description:
    "Review the official Shipping Policy of NAQSH. Information on delivery coverage across Pakistan, 2-7 working days timelines, order tracking, and delivery guidelines.",
}

export default function ShippingPolicyPage() {
  return (
    <div className="bg-[#FAF9F6] text-[#1A1A1A] font-sans py-14 sm:py-20">
      <div className="content-container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="flex justify-center mb-2">
            <NaqshLogo variant="dark" size="md" />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#B6975A]">
            Nationwide Logistics
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#0F2D22] font-medium">
            Shipping Policy
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-light">
            Last Updated: January 2025
          </p>
        </div>

        {/* Intro */}
        <div className="bg-white p-6 sm:p-8 border border-stone-200 shadow-2xs mb-10 text-xs sm:text-sm leading-relaxed text-stone-700 space-y-3">
          <p>
            At <strong>NAQSH</strong> we aim to provide a simple, reliable, and convenient delivery experience for customers across Pakistan. Please review the following shipping information before placing your order.
          </p>
        </div>

        {/* 10 Sections */}
        <div className="space-y-8 text-xs sm:text-sm text-stone-700 leading-relaxed">
          {/* 1 */}
          <section className="bg-white p-6 sm:p-8 border border-stone-200/90 space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#0F2D22] font-medium">
              1. Delivery Coverage
            </h2>
            <p>
              We deliver orders across Pakistan, including major cities and other serviceable areas.
            </p>
          </section>

          {/* 2 */}
          <section className="bg-white p-6 sm:p-8 border border-stone-200/90 space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#0F2D22] font-medium">
              2. Processing Time
            </h2>
            <p>
              Orders are normally processed and prepared for dispatch after confirmation. Processing time may vary depending on product availability, order verification, weekends, public holidays, or high order volumes.
            </p>
          </section>

          {/* 3 */}
          <section className="bg-white p-6 sm:p-8 border border-stone-200/90 space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#0F2D22] font-medium">
              3. Delivery Time
            </h2>
            <p>
              Once dispatched, delivery usually takes approximately <strong>2–7 working days</strong>, depending on the destination and courier service.
            </p>
            <p className="text-stone-500 text-xs">
              Remote or less-serviceable areas may require additional delivery time. Delivery timelines are estimates and may be affected by weather, courier operations, public holidays, unforeseen circumstances, or incorrect customer information.
            </p>
          </section>

          {/* 4 */}
          <section className="bg-white p-6 sm:p-8 border border-stone-200/90 space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#0F2D22] font-medium">
              4. Shipping Charges
            </h2>
            <p>
              Applicable delivery charges will be displayed during the checkout/order process. Shipping charges may vary depending on the order, delivery location, courier service, or promotional offers.
            </p>
          </section>

          {/* 5 */}
          <section className="bg-white p-6 sm:p-8 border border-stone-200/90 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl sm:text-2xl text-[#0F2D22] font-medium">
                5. Order Tracking
              </h2>
              <LocalizedClientLink
                href="/order/track"
                className="px-4 py-1.5 bg-[#0F2D22] text-white text-[11px] font-semibold uppercase tracking-wider hover:bg-[#B6975A] hover:text-[#0F2D22] transition-colors"
              >
                Track Now &rarr;
              </LocalizedClientLink>
            </div>
            <p>
              Where tracking is available, customers may receive tracking information through the contact details provided with their order. Customers can use the tracking information to check the status of their shipment.
            </p>
          </section>

          {/* 6 */}
          <section className="bg-white p-6 sm:p-8 border border-stone-200/90 space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#0F2D22] font-medium">
              6. Delivery Address
            </h2>
            <p>
              Customers are responsible for providing a complete and accurate delivery address, including:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-stone-600">
              <li>Full name</li>
              <li>Active phone number</li>
              <li>House/Street address</li>
              <li>Area</li>
              <li>City</li>
              <li>Any other required delivery information</li>
            </ul>
            <p className="text-stone-500 text-xs pt-1">
              We may contact customers if additional information is required to complete delivery.
            </p>
          </section>

          {/* 7 */}
          <section className="bg-white p-6 sm:p-8 border border-stone-200/90 space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#0F2D22] font-medium">
              7. Missed Delivery
            </h2>
            <p>
              If a customer is unavailable when the courier attempts delivery, the courier may make another delivery attempt or contact the customer. Repeated failed delivery attempts, refusal to receive a confirmed order, or incorrect contact/address information may result in additional charges or cancellation of the order.
            </p>
          </section>

          {/* 8 */}
          <section className="bg-white p-6 sm:p-8 border border-stone-200/90 space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#0F2D22] font-medium">
              8. Damaged Package
            </h2>
            <p>
              If your package appears damaged or tampered with upon delivery, please contact us as soon as possible and provide your order details along with photographs or videos where required. We will review the matter and provide an appropriate solution according to our{" "}
              <LocalizedClientLink href="/return-policy" className="text-[#B6975A] font-semibold underline">
                Return & Exchange Policy
              </LocalizedClientLink>
              .
            </p>
          </section>

          {/* 9 */}
          <section className="bg-white p-6 sm:p-8 border border-stone-200/90 space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#0F2D22] font-medium">
              9. Delivery Delays
            </h2>
            <p>
              We work with courier partners to deliver orders within the estimated timeframe. However, delays caused by weather, public holidays, courier operations, high-volume periods, road conditions, or other circumstances beyond our control may occur.
            </p>
          </section>

          {/* 10 */}
          <section className="p-8 bg-[#0F2D22] text-[#FAF9F6] border border-[#081B14] space-y-4">
            <h2 className="font-serif text-2xl text-white font-medium">
              10. Contact Us
            </h2>
            <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-light">
              For questions regarding shipping or delivery, contact us through:
            </p>
            <div className="pt-2 space-y-2 text-xs sm:text-sm font-light">
              <div>
                <strong className="text-[#B6975A] font-semibold">Store:</strong> NAQSH
              </div>
              <div>
                <strong className="text-[#B6975A] font-semibold">Email:</strong>{" "}
                <a href="mailto:info@naqsh.pk" className="underline hover:text-white">
                  info@naqsh.pk
                </a>
              </div>
              <div>
                <strong className="text-[#B6975A] font-semibold">Phone / WhatsApp:</strong>{" "}
                <a href="https://wa.me/923001234567" target="_blank" rel="noreferrer" className="underline hover:text-white">
                  +92 300 1234567
                </a>
              </div>
              <div>
                <strong className="text-[#B6975A] font-semibold">Website:</strong>{" "}
                <span className="font-mono text-stone-200">https://naqsh.pk</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
