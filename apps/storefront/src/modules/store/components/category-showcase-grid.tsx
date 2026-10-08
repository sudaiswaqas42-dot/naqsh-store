"use client"

import React from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

interface CategoryShowcaseGridProps {
  categoryHandle?: string
  title?: string
}

export default function CategoryShowcaseGrid({ categoryHandle = "", title = "" }: CategoryShowcaseGridProps) {
  const handle = (categoryHandle || "").toLowerCase().trim()
  const titleLower = (title || "").toLowerCase().trim()

  const isWomenRoot = handle === "women" || titleLower === "women"
  const isMenRoot = (handle === "men" || titleLower === "men") && !handle.includes("women")

  // Only show curated showcase cards on the root Women or Men category pages
  if (!isWomenRoot && !isMenRoot) {
    return null
  }

  const cards = isWomenRoot
    ? [
        {
          title: "3-Piece Festive Unstitched",
          badge: "1,250+ FABRICS LIVE",
          subtitle: "Artisanal hand-embroidered cuts, pure chiffon & silk dupattas, and premium swiss lawn 3-piece suits.",
          href: "/categories/3pc",
          img: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85",
          btnText: "Shop 3-Piece Unstitched",
        },
        {
          title: "2-Piece Printed & Embroidered",
          badge: "SPRING / SUMMER EDIT",
          subtitle: "Printed lawn shirt & dupatta cuts, schiffli embroidery borders, and daily luxury unstitched fabrics.",
          href: "/categories/2pc",
          img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85",
          btnText: "Shop 2-Piece Unstitched",
        },
      ]
    : [
        {
          title: "Pure Silk Boski & Superfine Latha",
          badge: "HERITAGE HEIRLOOM",
          subtitle: "Heavyweight heirloom silk boski, luxury white latha, and traditional unstitched suit lengths.",
          href: "/categories/boski",
          img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=85",
          btnText: "Shop Boski & Latha",
        },
        {
          title: "Italian Wash & Wear Fabric Cuts",
          badge: "1,000+ SUIT LENGTHS",
          subtitle: "Finest Egyptian combed cotton, wrinkle-free wash-and-wear, and handspun Kamalia Khaddar 4.5-meter cuts.",
          href: "/categories/wash-wear",
          img: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1200&q=85",
          btnText: "Shop Wash & Wear",
        },
      ]

  return (
    <section className="py-8 bg-[#FAF8F5] border-b border-[#EBE1D6]">
      <div className="content-container">
        <div className="text-center max-w-xl mx-auto mb-6">
          <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.25em] text-[#B6975A] uppercase block mb-1">
            100% UNSTITCHED FABRIC ATELIER
          </span>
          <h2 className="font-serif text-base sm:text-3xl text-stone-900 font-normal">
            {isWomenRoot ? "Curated Ladies Unstitched Collections" : "Curated Gents Unstitched Fabric Cuts"}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-6">
          {cards.map((card) => (
            <LocalizedClientLink
              key={card.href}
              href={card.href}
              className="group relative block overflow-hidden rounded-xs min-h-[250px] sm:min-h-[340px] shadow-md border border-[#EBE1D6] hover:shadow-xl transition-all duration-500"
            >
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                style={{ backgroundImage: `url('${card.img}')` }}
              />

              {/* Gradient Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20 group-hover:from-black/90 transition-colors" />

              {/* Card Content */}
              <div className="absolute inset-0 p-3 sm:p-8 flex flex-col justify-end text-white z-10">
                <span className="inline-block px-2 py-1 text-[8px] sm:text-[10px] font-bold tracking-widest uppercase bg-[#B6975A] text-[#081B14] w-fit mb-2 shadow-xs">
                  {card.badge}
                </span>

                <h3 className="font-serif text-base sm:text-3xl font-normal drop-shadow-sm text-white mb-2">
                  {card.title}
                </h3>

                <p className="hidden sm:block text-xs sm:text-sm text-stone-200 font-light leading-relaxed max-w-md mb-4 drop-shadow-xs">
                  {card.subtitle}
                </p>

                <div className="inline-flex items-center gap-2 text-[9px] sm:text-xs font-semibold uppercase tracking-wider text-[#FAF9F6] group-hover:text-[#B6975A] transition-colors">
                  <span>{card.btnText}</span>
                  <span className="transform group-hover:translate-x-1 transition-transform">&rarr;</span>
                </div>
              </div>
            </LocalizedClientLink>
          ))}
        </div>
      </div>
    </section>
  )
}
