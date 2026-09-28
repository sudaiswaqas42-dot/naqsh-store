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

  // 1. Check if user is inside a specific subcategory
  const isWomenStitched = handle === "women-stitched" || titleLower.includes("women's stitched") || titleLower.includes("women - stitched")
  const isWomenUnstitched = handle === "women-unstitched" || titleLower.includes("women's unstitched") || titleLower.includes("women - unstitched")
  const isMenStitched = handle === "men-stitched" || titleLower.includes("men's stitched") || titleLower.includes("men - stitched")
  const isMenUnstitched = handle === "men-unstitched" || titleLower.includes("men's unstitched") || titleLower.includes("men - unstitched")
  const isGeneralUnstitched = handle === "unstitched" || titleLower === "unstitched fabric" || (titleLower === "unstitched" && !handle.includes("women") && !handle.includes("men"))

  // If inside Women's Stitched subcategory: Show professional luxury breadcrumb & navigation bar (NO 2-card selector)
  if (isWomenStitched) {
    return (
      <section className="bg-[#FAF8F5] border-b border-[#EBE1D6] py-4 sm:py-5 shadow-2xs">
        <div className="content-container">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <LocalizedClientLink
                href="/categories/women"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#EBE1D6] hover:border-[#B6975A] text-stone-700 hover:text-[#0F2D22] text-xs font-semibold uppercase tracking-wider transition-all shadow-2xs group"
              >
                <span className="transform group-hover:-translate-x-0.5 transition-transform text-[#B6975A]">&larr;</span>
                <span>Back to Women&apos;s Collection</span>
              </LocalizedClientLink>
              <span className="text-stone-300 hidden sm:inline">|</span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span className="text-xs font-serif tracking-wide text-stone-900 font-medium">
                  Viewing: <strong className="font-semibold text-[#0F2D22]">Women&apos;s Stitched Pret</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-stone-500 uppercase tracking-wider hidden lg:inline">Want unstitched fabric?</span>
              <LocalizedClientLink
                href="/categories/women-unstitched"
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F2D22] hover:bg-[#B6975A] text-white hover:text-[#0F2D22] text-xs font-semibold uppercase tracking-wider transition-all shadow-xs"
              >
                <span>Shop Unstitched Lawn &amp; Silks</span>
                <span>&rarr;</span>
              </LocalizedClientLink>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // If inside Women's Unstitched subcategory: Show professional luxury breadcrumb & navigation bar
  if (isWomenUnstitched) {
    return (
      <section className="bg-[#FAF8F5] border-b border-[#EBE1D6] py-4 sm:py-5 shadow-2xs">
        <div className="content-container">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <LocalizedClientLink
                href="/categories/women"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#EBE1D6] hover:border-[#B6975A] text-stone-700 hover:text-[#0F2D22] text-xs font-semibold uppercase tracking-wider transition-all shadow-2xs group"
              >
                <span className="transform group-hover:-translate-x-0.5 transition-transform text-[#B6975A]">&larr;</span>
                <span>Back to Women&apos;s Collection</span>
              </LocalizedClientLink>
              <span className="text-stone-300 hidden sm:inline">|</span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span className="text-xs font-serif tracking-wide text-stone-900 font-medium">
                  Viewing: <strong className="font-semibold text-[#0F2D22]">Women&apos;s Unstitched Lawn &amp; Silks</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-stone-500 uppercase tracking-wider hidden lg:inline">Want ready-to-wear?</span>
              <LocalizedClientLink
                href="/categories/women-stitched"
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F2D22] hover:bg-[#B6975A] text-white hover:text-[#0F2D22] text-xs font-semibold uppercase tracking-wider transition-all shadow-xs"
              >
                <span>Shop Stitched Pret</span>
                <span>&rarr;</span>
              </LocalizedClientLink>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // If inside Men's Stitched subcategory: Show professional luxury breadcrumb & navigation bar
  if (isMenStitched) {
    return (
      <section className="bg-[#FAF8F5] border-b border-[#EBE1D6] py-4 sm:py-5 shadow-2xs">
        <div className="content-container">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <LocalizedClientLink
                href="/categories/men"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#EBE1D6] hover:border-[#B6975A] text-stone-700 hover:text-[#0F2D22] text-xs font-semibold uppercase tracking-wider transition-all shadow-2xs group"
              >
                <span className="transform group-hover:-translate-x-0.5 transition-transform text-[#B6975A]">&larr;</span>
                <span>Back to Men&apos;s Collection</span>
              </LocalizedClientLink>
              <span className="text-stone-300 hidden sm:inline">|</span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span className="text-xs font-serif tracking-wide text-stone-900 font-medium">
                  Viewing: <strong className="font-semibold text-[#0F2D22]">Men&apos;s Stitched Eastern Wear</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-stone-500 uppercase tracking-wider hidden lg:inline">Prefer unstitched cuts?</span>
              <LocalizedClientLink
                href="/categories/men-unstitched"
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F2D22] hover:bg-[#B6975A] text-white hover:text-[#0F2D22] text-xs font-semibold uppercase tracking-wider transition-all shadow-xs"
              >
                <span>Shop Unstitched Fabric Cuts</span>
                <span>&rarr;</span>
              </LocalizedClientLink>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // If inside Men's Unstitched subcategory: Show professional luxury breadcrumb & navigation bar
  if (isMenUnstitched) {
    return (
      <section className="bg-[#FAF8F5] border-b border-[#EBE1D6] py-4 sm:py-5 shadow-2xs">
        <div className="content-container">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <LocalizedClientLink
                href="/categories/men"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#EBE1D6] hover:border-[#B6975A] text-stone-700 hover:text-[#0F2D22] text-xs font-semibold uppercase tracking-wider transition-all shadow-2xs group"
              >
                <span className="transform group-hover:-translate-x-0.5 transition-transform text-[#B6975A]">&larr;</span>
                <span>Back to Men&apos;s Collection</span>
              </LocalizedClientLink>
              <span className="text-stone-300 hidden sm:inline">|</span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span className="text-xs font-serif tracking-wide text-stone-900 font-medium">
                  Viewing: <strong className="font-semibold text-[#0F2D22]">Men&apos;s Unstitched Fabric Cuts</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-stone-500 uppercase tracking-wider hidden lg:inline">Want tailored eastern wear?</span>
              <LocalizedClientLink
                href="/categories/men-stitched"
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0F2D22] hover:bg-[#B6975A] text-white hover:text-[#0F2D22] text-xs font-semibold uppercase tracking-wider transition-all shadow-xs"
              >
                <span>Shop Stitched Eastern</span>
                <span>&rarr;</span>
              </LocalizedClientLink>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // If inside Unstitched dedicated page
  if (isGeneralUnstitched) {
    return (
      <section className="bg-[#FAF8F5] border-b border-[#EBE1D6] py-4 sm:py-5 shadow-2xs">
        <div className="content-container">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <LocalizedClientLink
                href="/store"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#EBE1D6] hover:border-[#B6975A] text-stone-700 hover:text-[#0F2D22] text-xs font-semibold uppercase tracking-wider transition-all shadow-2xs group"
              >
                <span className="transform group-hover:-translate-x-0.5 transition-transform text-[#B6975A]">&larr;</span>
                <span>Back to Complete Store</span>
              </LocalizedClientLink>
              <span className="text-stone-300 hidden sm:inline">|</span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B6975A] animate-pulse" />
                <span className="text-xs font-serif tracking-wide text-stone-900 font-medium">
                  Viewing: <strong className="font-semibold text-[#0F2D22]">All Unstitched Fabrics (Women &amp; Men)</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <LocalizedClientLink
                href="/categories/women-unstitched"
                className="px-3 py-1.5 rounded-full bg-white border border-stone-300 hover:border-[#0F2D22] text-stone-800 text-[11px] font-semibold uppercase tracking-wider transition-all"
              >
                Women&apos;s Unstitched (1,250)
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/categories/men-unstitched"
                className="px-3 py-1.5 rounded-full bg-white border border-stone-300 hover:border-[#0F2D22] text-stone-800 text-[11px] font-semibold uppercase tracking-wider transition-all"
              >
                Men&apos;s Unstitched (1,000)
              </LocalizedClientLink>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // 2. ONLY show the 2 large craft selector cards on the ROOT Women or Men category pages
  const isWomenRoot = handle === "women" || (titleLower === "women" && !handle.includes("stitched"))
  const isMenRoot = handle === "men" || (titleLower === "men" && !handle.includes("stitched"))

  if (!isWomenRoot && !isMenRoot) {
    return null
  }

  const cards = isWomenRoot
    ? [
        {
          title: "Stitched Pret",
          badge: "1,250+ DESIGNS LIVE",
          subtitle: "Bespoke ready-to-wear silhouettes, 2-piece coord sets & 3-piece embroidered luxury pret.",
          href: "/categories/women-stitched",
          img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85",
          btnText: "Shop Stitched Pret",
        },
        {
          title: "Unstitched Lawn & Silks",
          badge: "1,250+ FABRICS LIVE",
          subtitle: "Artisanal hand-embroidered cuts, pure chiffon & silk dupattas, and premium swiss lawn.",
          href: "/categories/women-unstitched",
          img: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=85",
          btnText: "Shop Unstitched Lawn",
        },
      ]
    : [
        {
          title: "Stitched Eastern Wear",
          badge: "1,000+ DESIGNS LIVE",
          subtitle: "Tailored jacquard kurtas, bandhgala sherwanis, shalwar kameez & embroidered waistcoats.",
          href: "/categories/men-stitched",
          img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=85",
          btnText: "Shop Stitched Eastern",
        },
        {
          title: "Unstitched Fabric Cuts",
          badge: "1,000+ SUIT LENGTHS",
          subtitle: "Finest Egyptian combed cotton, luxury latha & textured wash-and-wear 4-meter cuts.",
          href: "/categories/men-unstitched",
          img: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1200&q=85",
          btnText: "Shop Unstitched Fabric",
        },
      ]

  return (
    <section className="py-8 bg-[#FAF8F5] border-b border-[#EBE1D6]">
      <div className="content-container">
        <div className="text-center max-w-xl mx-auto mb-6">
          <span className="text-[10px] sm:text-[11px] font-bold tracking-[0.25em] text-[#B6975A] uppercase block mb-1">
            EXPLORE BY ATELIER
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-stone-900 font-normal">
            Choose Your Craft: Stitched or Unstitched
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((card) => (
            <LocalizedClientLink
              key={card.href}
              href={card.href}
              className="group relative block overflow-hidden rounded-xs min-h-[300px] sm:min-h-[340px] shadow-md border border-[#EBE1D6] hover:shadow-xl transition-all duration-500"
            >
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                style={{ backgroundImage: `url('${card.img}')` }}
              />

              {/* Gradient Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20 group-hover:from-black/90 transition-colors" />

              {/* Card Content */}
              <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end text-white z-10">
                <span className="inline-block px-3 py-1 text-[10px] font-bold tracking-widest uppercase bg-[#B6975A] text-[#081B14] w-fit mb-2 shadow-xs">
                  {card.badge}
                </span>

                <h3 className="font-serif text-2xl sm:text-3xl font-normal drop-shadow-sm text-white mb-2">
                  {card.title}
                </h3>

                <p className="text-xs sm:text-sm text-stone-200 font-light leading-relaxed max-w-md mb-4 drop-shadow-xs">
                  {card.subtitle}
                </p>

                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#FAF9F6] group-hover:text-[#B6975A] transition-colors">
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
