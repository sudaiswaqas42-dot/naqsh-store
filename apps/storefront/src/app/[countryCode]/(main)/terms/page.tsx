import { Metadata } from "next"
import NaqshLogo from "@modules/common/components/naqsh-logo"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Terms & Conditions — NAQSH",
  description:
    "Review the Terms & Conditions of NAQSH. Understand policies regarding orders, pricing, delivery, returns, and intellectual property across Pakistan.",
}

export default function TermsPage() {
  return (
    <div className="bg-[#FAF9F6] text-[#1A1A1A] font-sans py-14 sm:py-20">
      <div className="content-container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="flex justify-center mb-2">
            <NaqshLogo variant="dark" size="md" />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#B6975A]">
            Client Agreement
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#0F2D22] font-medium">
            Terms & Conditions
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-light">
            Last Updated: January 2025
          </p>
        </div>

        {/* Intro Banner */}
        <div className="bg-white p-6 sm:p-8 border border-stone-200 shadow-2xs mb-10 text-xs sm:text-sm leading-relaxed text-stone-700 space-y-3">
          <p>
            Welcome to <strong>NAQSH</strong>. By accessing our website, creating an account, or placing an order, you agree to follow the Terms & Conditions mentioned below.
          </p>
        </div>

        {/* 18 Sections */}
        <div className="space-y-8 text-xs sm:text-sm text-stone-700 leading-relaxed">
          {/* 1 */}
          <section className="bg-white p-6 sm:p-8 border border-stone-200/90 space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#0F2D22] font-medium">
              1. About Our Store
            </h2>
            <p>
              NAQSH is a Pakistan-based online fashion store offering men's and women's clothing and fashion articles from different brands and collections. We deliver orders across Pakistan.
            </p>
          </section>

          {/* 2 */}
          <section className="bg-white p-6 sm:p-8 border border-stone-200/90 space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#0F2D22] font-medium">
              2. Use of Our Website
            </h2>
            <p>
              Customers must provide accurate information when using our website or placing an order. The website must only be used for lawful purposes. Any fraudulent activity, misuse, unauthorized access, or attempt to disrupt the website may result in restriction or termination of access.
            </p>
          </section>

          {/* 3 */}
          <section className="bg-white p-6 sm:p-8 border border-stone-200/90 space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#0F2D22] font-medium">
              3. Product Information
            </h2>
            <p>
              We make reasonable efforts to provide accurate product names, images, descriptions, prices, sizes, colors, and other details. However, slight differences in product color, print, texture, or appearance may occur due to photography, lighting, or individual screen settings.
            </p>
          </section>

          {/* 4 */}
          <section className="bg-white p-6 sm:p-8 border border-stone-200/90 space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#0F2D22] font-medium">
              4. Product Availability
            </h2>
            <p>
              All products are subject to availability. Adding an item to the cart does not guarantee that it will remain available until checkout. If an ordered product becomes unavailable, we may contact the customer regarding an alternative or cancellation.
            </p>
          </section>

          {/* 5 */}
          <section className="bg-white p-6 sm:p-8 border border-stone-200/90 space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#0F2D22] font-medium">
              5. Prices
            </h2>
            <p>
              All prices are displayed in Pakistani Rupees (PKR), unless stated otherwise. Prices and product availability may change without prior notice. Delivery charges, where applicable, may be added separately.
            </p>
          </section>

          {/* 6 */}
          <section className="bg-white p-6 sm:p-8 border border-stone-200/90 space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#0F2D22] font-medium">
              6. Orders
            </h2>
            <p>
              Customers are responsible for providing correct name, phone number, email, and complete delivery address. We may contact customers to verify orders before dispatch.
            </p>
            <p>
              We reserve the right to cancel or reject an order due to product unavailability, incorrect pricing or information, incomplete details, suspected fraud, or other legitimate reasons.
            </p>
          </section>

          {/* 7 */}
          <section className="bg-white p-6 sm:p-8 border border-stone-200/90 space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#0F2D22] font-medium">
              7. Payments
            </h2>
            <p>
              Available payment methods may include Cash on Delivery (COD) and advance payment options. Payment requirements and applicable delivery charges will be shown during the ordering process.
            </p>
            <p>
              For COD orders, customers must pay the total applicable amount to the courier at the time of delivery.
            </p>
          </section>

          {/* 8 */}
          <section className="bg-white p-6 sm:p-8 border border-stone-200/90 space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#0F2D22] font-medium">
              8. Delivery
            </h2>
            <p>
              We deliver across Pakistan. Delivery time may vary depending on location, courier operations, weather, public holidays, product availability, and other circumstances. Customers are responsible for providing an accurate and complete delivery address and an active contact number.
            </p>
          </section>

          {/* 9 */}
          <section className="bg-white p-6 sm:p-8 border border-stone-200/90 space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#0F2D22] font-medium">
              9. Returns & Exchanges
            </h2>
            <p>
              Returns and exchanges are subject to our separate{" "}
              <LocalizedClientLink href="/return-policy" className="text-[#B6975A] font-semibold underline">
                Return & Exchange Policy
              </LocalizedClientLink>
              . Customers should review that policy before placing an order.
            </p>
            <p>
              If you receive a damaged, defective, or incorrect product, contact us as soon as possible with your order details and any requested photographs or videos.
            </p>
          </section>

          {/* 10 */}
          <section className="bg-white p-6 sm:p-8 border border-stone-200/90 space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#0F2D22] font-medium">
              10. Order Cancellation
            </h2>
            <p>
              Customers may request cancellation before an order is dispatched. Once an order has been dispatched, cancellation may not be possible. We may also cancel orders when necessary due to availability, verification, pricing errors, or suspected fraudulent activity.
            </p>
          </section>

          {/* 11 */}
          <section className="bg-white p-6 sm:p-8 border border-stone-200/90 space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#0F2D22] font-medium">
              11. Discounts & Promotions
            </h2>
            <p>
              Discounts, coupon codes, and promotional offers may have specific conditions, validity periods, or product restrictions. We reserve the right to modify or end any promotion without prior notice.
            </p>
          </section>

          {/* 12 */}
          <section className="bg-white p-6 sm:p-8 border border-stone-200/90 space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#0F2D22] font-medium">
              12. Intellectual Property
            </h2>
            <p>
              Website content such as original text, graphics, designs, logos, and photographs may not be copied, reproduced, or commercially used without permission. Brand names, trademarks, logos, and product materials belonging to respective brands remain the property of their respective owners.
            </p>
          </section>

          {/* 13 */}
          <section className="bg-white p-6 sm:p-8 border border-stone-200/90 space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#0F2D22] font-medium">
              13. Third-Party Services
            </h2>
            <p>
              Our website may use third-party services such as payment gateways, courier companies, hosting providers, and analytics services. Such services may have their own terms and privacy policies.
            </p>
          </section>

          {/* 14 */}
          <section className="bg-white p-6 sm:p-8 border border-stone-200/90 space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#0F2D22] font-medium">
              14. Website Availability
            </h2>
            <p>
              We aim to keep our website secure and available, but temporary interruptions may occur due to maintenance, technical issues, internet problems, or circumstances beyond our control.
            </p>
          </section>

          {/* 15 */}
          <section className="bg-white p-6 sm:p-8 border border-stone-200/90 space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#0F2D22] font-medium">
              15. Privacy
            </h2>
            <p>
              Your use of our website is also subject to our{" "}
              <LocalizedClientLink href="/privacy-policy" className="text-[#B6975A] font-semibold underline">
                Privacy Policy
              </LocalizedClientLink>
              , which explains how we collect and use your personal information.
            </p>
          </section>

          {/* 16 */}
          <section className="bg-white p-6 sm:p-8 border border-stone-200/90 space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#0F2D22] font-medium">
              16. Changes to These Terms
            </h2>
            <p>
              We may update these Terms & Conditions when necessary. Updated terms will be published on this page with a revised "Last Updated" date.
            </p>
          </section>

          {/* 17 */}
          <section className="bg-white p-6 sm:p-8 border border-stone-200/90 space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#0F2D22] font-medium">
              17. Governing Law
            </h2>
            <p>
              These Terms & Conditions are governed by the applicable laws and regulations of Pakistan.
            </p>
          </section>

          {/* 18 */}
          <section className="p-8 bg-[#0F2D22] text-[#FAF9F6] border border-[#081B14] space-y-4">
            <h2 className="font-serif text-2xl text-white font-medium">
              18. Contact Us
            </h2>
            <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-light">
              For questions regarding our Terms & Conditions, orders, products, payments, or delivery, please contact us:
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
