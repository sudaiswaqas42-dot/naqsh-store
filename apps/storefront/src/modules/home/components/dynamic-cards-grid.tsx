"use client"

import React from "react"
import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import NaqshProductCard from "@modules/products/components/naqsh-product-card"

export interface CustomCardItem {
  id: string
  title: string
  subtitle?: string
  image_url: string
  price?: number | string
  original_price?: number | string
  discount_percent?: number
  badge?: string
  link?: string
  product_id?: string
}

interface DynamicCardsGridProps {
  title?: string
  subtitle?: string
  cta_text?: string
  cta_link?: string
  cards?: CustomCardItem[]
  products?: any[]
  showSale?: boolean
}

export default function DynamicCardsGrid({
  title,
  subtitle,
  cta_text,
  cta_link,
  cards = [],
  products = [],
  showSale = true,
}: DynamicCardsGridProps) {
  // If admin configured custom cards, use those. Otherwise, render products.
  const hasCustomCards = cards && cards.length > 0
  const items = hasCustomCards ? cards : products
  const count = items.length

  if (count === 0) return null

  // Special 5-card auto-flow layout: 3 on top row, 2 on bottom row!
  const is5CardLayout = count === 5

  return (
    <section className="py-16 sm:py-20 bg-white border-t border-stone-200/60">
      <div className="content-container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        {(title || subtitle) && (
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#B6975A]">
              NAQSH Curations
            </span>
            {title && (
              <h2 className="font-serif text-3xl sm:text-4xl text-[#0F2D22] font-medium mt-1">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xs sm:text-sm text-stone-500 mt-2 font-light">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Dynamic Responsive Grid */}
        <div
          className={
            is5CardLayout
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 sm:gap-6 lg:gap-8"
              : count === 2
              ? "grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto"
              : count === 3
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
              : count === 4
              ? "grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
              : count === 6
              ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
              : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
          }
        >
          {items.map((item: any, idx: number) => {
            // 5-card layout classes: First 3 take col-span-2, last 2 take col-span-3
            const colSpanClass = is5CardLayout
              ? idx < 3
                ? "lg:col-span-2"
                : "lg:col-span-3"
              : ""

            if (hasCustomCards) {
              const card = item as CustomCardItem
              const discount = card.discount_percent || 20
              const salePrice = card.price ? Number(card.price) : 4950
              const origPrice = card.original_price
                ? Number(card.original_price)
                : Math.round(salePrice / (1 - discount / 100))

              return (
                <div
                  key={card.id || idx}
                  className={`group relative flex flex-col bg-white overflow-hidden transition-all duration-300 ${colSpanClass}`}
                >
                  {/* Card Image */}
                  <div className="relative aspect-[3/4] w-full bg-stone-100 overflow-hidden">
                    <LocalizedClientLink href={card.link || "/store"} className="block w-full h-full">
                      {card.image_url ? (
                        <Image
                          src={card.image_url}
                          alt={card.title || "NAQSH Product"}
                          fill
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                          className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center font-serif text-2xl tracking-widest text-stone-400">
                          NAQSH
                        </div>
                      )}
                    </LocalizedClientLink>

                    {/* Red SALE Badge */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                      <span className="bg-[#991b1b] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 shadow-xs">
                        {card.badge || "SALE"}
                      </span>
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="pt-4 pb-2 px-1 flex flex-col flex-1">
                    {card.subtitle && (
                      <div className="text-[10px] uppercase tracking-widest text-stone-500 font-medium mb-1">
                        {card.subtitle}
                      </div>
                    )}
                    <LocalizedClientLink
                      href={card.link || "/store"}
                      className="font-serif text-sm font-medium text-[#0F2D22] hover:text-[#B6975A] transition-colors line-clamp-1 mb-1"
                    >
                      {card.title}
                    </LocalizedClientLink>

                    {/* Star Rating */}
                    <div className="flex items-center gap-1.5 mb-1 text-[11px] text-amber-500">
                      <span>★★★★★</span>
                      <span className="text-stone-400 text-[10px] font-sans">(98)</span>
                    </div>

                    {/* Pricing */}
                    <div className="mt-auto flex items-baseline gap-2 flex-wrap pt-0.5">
                      <span className="text-xs sm:text-sm font-bold text-stone-900 tracking-tight">
                        Rs {salePrice.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-stone-400 line-through">
                        Rs {origPrice.toLocaleString()}
                      </span>
                      <span className="text-[11px] font-bold text-red-600">
                        -{discount}%
                      </span>
                    </div>

                    {/* Add to Cart button */}
                    <LocalizedClientLink
                      href={card.link || "/store"}
                      className="w-full mt-3 py-2.5 bg-black hover:bg-stone-800 text-white text-[11px] sm:text-xs font-bold uppercase tracking-widest transition-all duration-200 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 flex items-center justify-center gap-1.5 shadow-sm active:scale-98 text-center"
                    >
                      Add to Cart
                    </LocalizedClientLink>
                  </div>
                </div>
              )
            }

            // Medusa product fallback
            return (
              <div key={item.id || idx} className={colSpanClass}>
                <NaqshProductCard product={item} showSale={showSale} />
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        {cta_text && (
          <div className="mt-14 text-center">
            <LocalizedClientLink
              href={cta_link || "/store"}
              className="inline-flex items-center justify-center px-10 py-3.5 bg-[#0F2D22] text-white text-xs font-semibold uppercase tracking-widest hover:bg-black transition-colors shadow-sm"
            >
              <span>{cta_text}</span>
              <span className="ml-2">&rarr;</span>
            </LocalizedClientLink>
          </div>
        )}
      </div>
    </section>
  )
}
