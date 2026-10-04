"use client"

import React from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const lookbookItems = [
  {
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
    name: "Festive Embroidered Lawn",
    city: "Karachi, Clifton",
    price: "Rs. 8,950",
    link: "/collections/summer-lawn-25",
  },
  {
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
    name: "Raw Silk Formal Tunic",
    city: "Lahore, Gulberg",
    price: "Rs. 14,500",
    link: "/collections/festive-formals",
  },
  {
    image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80",
    name: "Printed Silk Co-ord Set",
    city: "Islamabad, F-7",
    price: "Rs. 7,450",
    link: "/categories/co-ords",
  },
  {
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
    name: "Men's Jacquard Kurta",
    city: "Lahore, DHA",
    price: "Rs. 5,950",
    link: "/categories/men",
  },
]

export default function LookbookSection({ section }: { section?: any }) {
  return (
    <section className="py-20 bg-white border-t border-stone-100 font-sans">
      <div className="content-container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-14">
          <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">
            {section?.settings?.eyebrow ?? "Style Inspiration"}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-brand font-medium mt-1">
            {section?.title ?? "#NAQSHWoman Community"}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-2 font-light">
            {section?.subtitle ?? "Seen on tastemakers across Pakistan."}
          </p>
        </div>

        {/* 4-Column Instagram-Style Interactive Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {(section?.settings?.cards?.map((card: any) => ({ image: card.image_url, name: card.title, city: card.subtitle, price: card.price == null || card.price === "" ? "" : `Rs. ${Number(card.price).toLocaleString()}`, link: card.link || "/store" })) ?? lookbookItems).map((item: typeof lookbookItems[number], idx: number) => (
            <LocalizedClientLink
              key={idx}
              href={item.link}
              className="group relative aspect-[3/4] overflow-hidden bg-stone-100 shadow-sm"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-75 group-hover:opacity-90 transition-opacity" />

              {/* Floating City Tag */}
              <div className="absolute top-3 left-3 px-2 py-0.5 bg-black/40 backdrop-blur-md text-[9px] font-medium text-white/90 uppercase tracking-widest border border-white/10">
                {item.city}
              </div>

              {/* Bottom Card Content with Slide-Up CTA */}
              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <span className="font-serif text-sm font-medium block truncate text-white group-hover:text-amber-200 transition-colors">
                  {item.name}
                </span>
                <span className="text-xs text-accent font-semibold block mt-0.5">
                  {item.price}
                </span>

                <div className="mt-2.5 opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-white bg-accent px-3 py-1 text-stone-950 font-bold">
                    <span>Shop Look</span>
                    <span>&rarr;</span>
                  </span>
                </div>
              </div>
            </LocalizedClientLink>
          ))}
        </div>


        {section?.cta_text && <div className="mt-8 text-center"><LocalizedClientLink href={section.cta_link || "/store"} className="text-sm underline">{section.cta_text}</LocalizedClientLink></div>}
      </div>
    </section>
  )
}
