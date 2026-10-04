import LocalizedClientLink from "@modules/common/components/localized-client-link"
import React from "react"

interface FeaturesStripProps {
  section?: {
    cta_text?: string | null
    cta_link?: string | null
    title?: string
    subtitle?: string | null
    settings?: {
      eyebrow?: string
      items?: Array<{
        title: string
        desc: string
        icon: string
      }>
    }
  }
}

const defaultItems = [
  {
    icon: (
      <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
    title: "Free Nationwide Delivery",
    desc: "Complimentary shipping across Pakistan on all orders over Rs. 4,999",
  },
  {
    icon: (
      <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    title: "Hassle-Free 7-Day Returns",
    desc: "Convenient doorstep exchange and return requests handled smoothly",
  },
  {
    icon: (
      <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: "Cash on Delivery",
    desc: "Pay securely at your doorstep anywhere in Pakistan upon parcel inspection",
  },
  {
    icon: (
      <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    title: "24/7 Dedicated Concierge",
    desc: "Live WhatsApp sizing advice, styling consultations and order queries",
  },
]

export default function FeaturesStrip({ section }: FeaturesStripProps) {
  return (
    <section className="bg-surface/50 border-y border-stone-200/70 py-10">
      <div className="content-container mx-auto px-4 sm:px-6 lg:px-8">
        {section?.settings?.eyebrow && <p className="text-xs text-center uppercase mb-2">{section.settings.eyebrow}</p>}
        {section?.title && <h2 className="font-serif text-2xl text-center mb-2">{section.title}</h2>}
        {section?.subtitle && <p className="text-sm text-center mb-6">{section.subtitle}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {(section?.settings?.items ?? defaultItems).map((item, idx) => (
            <div key={idx} className="flex items-start gap-4">
              <div className="p-3 bg-white border border-stone-200 shadow-xs flex-shrink-0">
                {item.icon}
              </div>
              <div>
                <h4 className="font-serif text-base font-medium text-brand">
                  {item.title}
                </h4>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
        {section?.cta_text && <div className="mt-8 text-center"><LocalizedClientLink href={section.cta_link || "/store"} className="text-sm underline">{section.cta_text}</LocalizedClientLink></div>}
      </div>
    </section>
  )
}
