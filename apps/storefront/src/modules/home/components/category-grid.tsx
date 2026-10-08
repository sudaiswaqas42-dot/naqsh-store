"use client"

import React from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

interface CategoryGridProps {
  section?: {
    title?: string
    subtitle?: string | null
  }
}

interface StyleCategoryItem {
  id: string
  title: string
  badge?: string
  countLabel: string
  href: string
  image: string
}

// 7-Box Curated Bento Grid with 100% clothing categories and direct navigation
const bentoCategories: {
  tallItem: StyleCategoryItem
  column2: [StyleCategoryItem, StyleCategoryItem]
  column3: [StyleCategoryItem, StyleCategoryItem]
  column4: [StyleCategoryItem, StyleCategoryItem]
} = {
  tallItem: {
    id: "ladies-unstitched",
    title: "Ladies Unstitched",
    countLabel: "1,250+ Fabrics",
    href: "/categories/women",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85",
  },
  column2: [
    {
      id: "3pc",
      title: "3-Piece Luxury",
      countLabel: "Festive Lawn & Chiffon",
      href: "/categories/3pc",
      image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=85",
    },
    {
      id: "2pc",
      title: "2-Piece Prints",
      countLabel: "Lawn & Voile Cuts",
      href: "/categories/2pc",
      image: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=800&q=85",
    },
  ],
  column3: [
    {
      id: "boski",
      title: "Pure Silk Boski",
      countLabel: "Heirloom Gents Cuts",
      href: "/categories/boski",
      image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=85",
    },
    {
      id: "women-unstitched",
      title: "Lawn & Silks",
      countLabel: "1,250+ Fabrics",
      href: "/categories/women",
      image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=85",
    },
  ],
  column4: [
    {
      id: "wash-wear",
      title: "Wash & Wear",
      countLabel: "Executive Gents Cuts",
      href: "/categories/wash-wear",
      image: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=85",
    },
    {
      id: "men-unstitched",
      title: "Gents Unstitched",
      countLabel: "1,000+ Fabric Cuts",
      href: "/categories/men",
      image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=85",
    },
  ],
}

function CategoryBox({ item, className = "" }: { item: StyleCategoryItem; className?: string }) {
  return (
    <LocalizedClientLink
      href={item.href}
      className={`group relative overflow-hidden bg-stone-900 border border-white/20 shadow-md block transition-all duration-300 ${className}`}
    >
      {/* High-res Pakistani fashion photography with smooth hover scale */}
      <img
        src={item.image}
        alt={item.title}
        loading="lazy"
        className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108"
        onError={(e) => {
          ;(e.target as HTMLImageElement).src =
            "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"
        }}
      />

      {/* Multi-stop luxury dark gradient overlay matching Image 3 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10 group-hover:from-black/90 transition-opacity" />

      {/* Text overlay at bottom-left exactly matching Image 3 */}
      <div className="absolute inset-x-0 bottom-0 p-5 text-white z-10">
        {item.badge && <p className="text-xs uppercase tracking-widest mb-2">{item.badge}</p>}
        <h3 className="font-serif text-lg sm:text-xl font-normal text-white group-hover:text-amber-200 transition-colors drop-shadow-md">
          {item.title}
        </h3>
        <p className="text-[11px] text-stone-300 font-sans tracking-wide mt-0.5 opacity-90 group-hover:opacity-100 transition-opacity">
          {item.countLabel}
        </p>
      </div>

      {/* Elegant hover arrow indicator */}
      <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-black/40 backdrop-blur-xs border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </div>
    </LocalizedClientLink>
  )
}

export default function CategoryGrid({ section }: CategoryGridProps & { section?: any }) {
  const customCards = Array.isArray(section?.settings?.cards)
    ? section.settings.cards
    : null

  const items: StyleCategoryItem[] = customCards
    ? customCards.map((c: any) => ({
        id: c.id,
        title: c.title,
        countLabel: c.subtitle ?? "Collection",
        badge: c.badge,
        href: c.link || "/store",
        image: c.image_url || c.image || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
      }))
    : [
        bentoCategories.tallItem,
        bentoCategories.column2[0],
        bentoCategories.column3[0],
        bentoCategories.column4[0],
        bentoCategories.column2[1],
        bentoCategories.column3[1],
        bentoCategories.column4[1],
      ]

  const isBento = items.length >= 7
  const tallItem = items[0]
  const col2Top = items[1]
  const col2Bottom = items[4]
  const col3Top = items[2]
  const col3Bottom = items[5]
  const col4Top = items[3]
  const col4Bottom = items[6]
  const extraItems = items.slice(7)

  return (
    <section className="py-16 sm:py-24 bg-white font-sans border-t border-stone-100">
      <div className="content-container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header matching Image 2: SHOP BY CATEGORY / Find Your Perfect Style */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">
            {section?.settings?.eyebrow ?? "Shop by Category"}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-brand font-medium mt-1">
            {section?.title ?? "Find Your Perfect Style"}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-2 font-light">
            {section?.subtitle ?? "From luxury unstitched lawn & silks to premium gents fabric cuts"}
          </p>
        </div>

        {isBento ? (
          <>
            {/* Exact 7-Box Bento Grid from Image 2: 4 Columns on desktop, responsive on tablet/mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Column 1: Tall Unstitched Box (Spans 2 rows) */}
              <div className="sm:col-span-2 lg:col-span-1 h-[420px] sm:h-[480px] lg:h-[560px]">
                <CategoryBox item={tallItem} className="h-full" />
              </div>

              {/* Column 2: Ready to Wear (Top) & Bags (Bottom) */}
              <div className="flex flex-col gap-3 sm:gap-4 h-[560px] justify-between">
                <CategoryBox item={col2Top} className="h-[272px]" />
                <CategoryBox item={col2Bottom} className="h-[272px]" />
              </div>

              {/* Column 3: Co-ords (Top) & Accessories (Bottom) */}
              <div className="flex flex-col gap-3 sm:gap-4 h-[560px] justify-between">
                <CategoryBox item={col3Top} className="h-[272px]" />
                <CategoryBox item={col3Bottom} className="h-[272px]" />
              </div>

              {/* Column 4: Footwear (Top) & Men (Bottom) */}
              <div className="flex flex-col gap-3 sm:gap-4 h-[560px] justify-between">
                <CategoryBox item={col4Top} className="h-[272px]" />
                <CategoryBox item={col4Bottom} className="h-[272px]" />
              </div>
            </div>

            {/* Extra Cards in clean grid if admin adds more than 7 */}
            {extraItems.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-4">
                {extraItems.map((item, idx) => (
                  <div key={idx} className="h-[272px]">
                    <CategoryBox item={item} className="h-full" />
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          /* Flexible Grid if fewer than 7 items */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {items.map((item, idx) => (
              <div key={idx} className="h-[280px]">
                <CategoryBox item={item} className="h-full" />
              </div>
            ))}
          </div>
        )}
        {section?.cta_text && <div className="mt-8 text-center"><LocalizedClientLink href={section.cta_link || "/store"} className="text-sm underline">{section.cta_text}</LocalizedClientLink></div>}
      </div>
    </section>
  )
}

