"use client"

import React, { useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const faqSections = [
  {
    category: "Ordering & Payment",
    items: [
      {
        q: "Do you offer Cash on Delivery (COD) across Pakistan?",
        a: "Yes! We proudly provide Cash on Delivery across all cities, towns, and villages in Pakistan with no additional handling surcharge. You may inspect the package seal and pay the courier rider upon delivery.",
      },
      {
        q: "Which credit/debit cards and digital wallets are accepted?",
        a: "We accept Visa, MasterCard, UnionPay, PayPak, as well as direct mobile account transfers via JazzCash and EasyPaisa for prepaid orders.",
      },
      {
        q: "How do I apply a promotional voucher code?",
        a: "You can enter your promo code (e.g. LUXE20 for 20% off or FLAT1000 for Rs. 1,000 off) either in your Cart drawer, on the dedicated Cart page, or during the final Checkout review step.",
      },
    ],
  },
  {
    category: "Sizing & Fabrics",
    items: [
      {
        q: "How do I know which size to order?",
        a: "Please refer to our detailed Size Guide. All measurements are given in inches across Bust, Waist, Hip, and Shirt Length. If you fall between sizes, we recommend sizing up for comfortable eastern tailoring.",
      },
      {
        q: "Are the unstitched lawn 3-piece sets complete with dupattas?",
        a: "Yes, all unstitched 3-piece suites include full 3.0m pure lawn or cambric shirt fabric, 2.5m dyed cotton trousers fabric, and 2.5m printed/embroidered chiffon or silk dupatta, plus embroidered neckline and hem patches.",
      },
      {
        q: "How should I wash and care for NAQSH garments?",
        a: "We recommend dry cleaning for all embellished, silk, organza, and velvet pieces. Pure lawn garments may be hand-washed gently in cold water with mild detergent. Do not dry in direct sunlight.",
      },
    ],
  },
  {
    category: "Shipping & Tracking",
    items: [
      {
        q: "What are your delivery timelines across Pakistan?",
        a: "Orders within Karachi are delivered within 24 to 48 hours. Deliveries to Lahore, Islamabad, Rawalpindi, Faisalabad, and Multan take 2 to 3 business days. Other cities and rural areas take 3 to 5 business days.",
      },
      {
        q: "How do I track my order once dispatched?",
        a: "You can track your parcel in real-time at /order/track using your Order Number and email address. You will also receive an SMS and WhatsApp update with your courier waybill number upon dispatch.",
      },
      {
        q: "Is shipping free?",
        a: "Yes, delivery is 100% complimentary across Pakistan for all orders totaling Rs. 4,999 or more. For orders below this threshold, a flat delivery fee of Rs. 250 applies.",
      },
    ],
  },
  {
    category: "Returns & Exchanges",
    items: [
      {
        q: "What is your return and exchange policy?",
        a: "We maintain a 7-day doorstep return and exchange policy. If your piece doesn't fit or meet expectations, visit our Return Portal at /return-policy to request an exchange. Our courier partner will pickup the parcel from your doorstep.",
      },
      {
        q: "Can sale or clearance items be exchanged?",
        a: "Clearance and flash sale items can be exchanged for size subject to stock availability, or returned for store credit voucher.",
      },
    ],
  },
]

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({ "0-0": true })

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="content-container mx-auto px-4 sm:px-6 lg:px-8 py-14 max-w-4xl font-sans">
      <div className="text-center max-w-xl mx-auto mb-12">
        <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-accent">
          Help Center
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-brand font-medium mt-1">
          Frequently Asked Questions
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-2 font-light">
          Everything you need to know about our handcrafted luxury apparel, shipping, sizing, and policies.
        </p>
      </div>

      <div className="space-y-10">
        {faqSections.map((sec, secIdx) => (
          <div key={secIdx} className="space-y-4">
            <h2 className="font-serif text-xl font-medium text-brand pb-2 border-b border-stone-200">
              {sec.category}
            </h2>

            <div className="space-y-3">
              {sec.items.map((item, itemIdx) => {
                const key = `${secIdx}-${itemIdx}`
                const isOpen = !!openItems[key]

                return (
                  <div
                    key={itemIdx}
                    className="border border-stone-200 bg-white transition-colors"
                  >
                    <button
                      onClick={() => toggleItem(key)}
                      className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-medium text-xs sm:text-sm text-brand hover:text-accent transition-colors"
                    >
                      <span>{item.q}</span>
                      <span className="text-stone-400 font-mono text-base flex-shrink-0">
                        {isOpen ? "−" : "+"}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="px-4 sm:px-5 pb-5 text-xs text-stone-600 leading-relaxed border-t border-stone-100 pt-3">
                        {item.a}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Still need help CTA */}
      <div className="mt-16 p-8 bg-stone-50 border border-stone-200 text-center space-y-3">
        <h3 className="font-serif text-xl font-medium text-brand">
          Still Have Questions?
        </h3>
        <p className="text-xs text-stone-500 max-w-md mx-auto">
          Our senior styling concierge is available to guide you on fabric choices, sizing, and bridal orders.
        </p>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
          <LocalizedClientLink
            href="/contact-us"
            className="px-6 py-2.5 bg-brand text-white text-xs font-semibold uppercase tracking-wider hover:bg-black transition-colors"
          >
            Contact Concierge
          </LocalizedClientLink>
          <a
            href="https://wa.me/923001234567"
            target="_blank"
            rel="noreferrer"
            className="px-6 py-2.5 bg-emerald-700 text-white text-xs font-semibold uppercase tracking-wider hover:bg-emerald-800 transition-colors"
          >
            WhatsApp Support
          </a>
        </div>
      </div>
    </div>
  )
}
