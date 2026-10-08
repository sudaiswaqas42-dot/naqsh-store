"use client"

import React, { useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

interface MegaNavProps {
  categories: HttpTypes.StoreProductCategory[]
  collections: HttpTypes.StoreCollection[]
}

// Pakistani fashion visual catalogue data for unstitched fabric previews
const fashionCatalog: Record<
  string,
  {
    name: string
    img: string
    desc: string
    price: string
    href: string
  }
> = {
  // Ladies Unstitched Categories
  "women-unstitched": {
    name: "Women's Unstitched",
    img: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80",
    desc: "Fine lawn, pure silk dupattas & embroidered 3-piece unstitched fabrics",
    price: "1,250+ Fabrics",
    href: "/categories/women",
  },
  "3pc": {
    name: "3-Piece Luxury Suit",
    img: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80",
    desc: "Complete unstitched luxury lawn suite: Embroidered shirt, trousers, and dupatta",
    price: "From Rs. 8,950",
    href: "/categories/3pc",
  },
  "2pc": {
    name: "2-Piece Unstitched",
    img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80",
    desc: "Printed shirt & dupatta or shirt & trouser coordinated unstitched cuts",
    price: "From Rs. 4,850",
    href: "/categories/2pc",
  },
  "1piece": {
    name: "1-Piece Shirt Cut",
    img: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80",
    desc: "Signature printed and embroidered individual shirt fabric cuts (3.0 meters)",
    price: "From Rs. 2,450",
    href: "/categories/women",
  },
  "lawn": {
    name: "Pure Swiss Lawn",
    img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80",
    desc: "Superfine breathable summer lawn with artisanal embroidered neckline borders",
    price: "From Rs. 4,950",
    href: "/categories/women",
  },
  "silk": {
    name: "Pure Heirloom Silk",
    img: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=600&q=80",
    desc: "Lustrous heavy pure silk 3-piece cuts with zari and resham motifs",
    price: "From Rs. 14,500",
    href: "/categories/silk",
  },
  "khaddar": {
    name: "Handspun Khaddar",
    img: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80",
    desc: "Authentic winter khaddar with textured yarn and wool shawl accents",
    price: "From Rs. 5,450",
    href: "/categories/khaddar",
  },
  "karandi": {
    name: "Luxury Karandi",
    img: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=600&q=80",
    desc: "Rich winter karandi weave with schiffli embroidered hems",
    price: "From Rs. 7,250",
    href: "/categories/karandi",
  },
  "dhanak": {
    name: "Winter Dhanak",
    img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80",
    desc: "Warm brushed cotton-wool blend with vibrant winter prints",
    price: "From Rs. 4,950",
    href: "/categories/dhanak",
  },
  "linen": {
    name: "Fine Linen",
    img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80",
    desc: "Crisp natural linen fabric with printed organza dupatta",
    price: "From Rs. 5,850",
    href: "/categories/linen",
  },
  "embroidery": {
    name: "Embroidery Waly Suits",
    img: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80",
    desc: "Intricate heavy tilla and resham threadwork on premium fabrics",
    price: "From Rs. 7,950",
    href: "/categories/embroidery-waly",
  },
  "printed": {
    name: "Digital Printed Cuts",
    img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80",
    desc: "High-definition floral and geometric oriental prints",
    price: "From Rs. 4,250",
    href: "/categories/printed",
  },

  // Men's Unstitched Categories
  "men-unstitched": {
    name: "Men's Unstitched Fabric",
    img: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=600&q=80",
    desc: "Premium Egyptian cotton, latha, wash & wear 4.5-meter cuts",
    price: "1,000+ Cuts",
    href: "/categories/men",
  },
  "boski": {
    name: "Pure Silk Boski",
    img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80",
    desc: "Heavyweight heirloom pure silk boski 4-meter unstitched cut",
    price: "From Rs. 14,500",
    href: "/categories/boski",
  },
  "wash-wear": {
    name: "Executive Wash & Wear",
    img: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=600&q=80",
    desc: "Wrinkle-free, breathable micro-poly blend with graceful drape",
    price: "From Rs. 4,450",
    href: "/categories/wash-wear",
  },
  "italian": {
    name: "Italian Superfine",
    img: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=600&q=80",
    desc: "Italian imported high-twist combed cotton suit lengths",
    price: "From Rs. 6,850",
    href: "/categories/italian",
  },
  "wool": {
    name: "Winter Wool & Blends",
    img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80",
    desc: "Fine merino wool and warm textured fabrics for winter wear",
    price: "From Rs. 7,450",
    href: "/categories/wool",
  },
  "kamalia-khaddar": {
    name: "Kamalia Khaddar",
    img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80",
    desc: "Handspun authentic Kamalia cotton khaddar 7-meter suit lengths",
    price: "From Rs. 3,950",
    href: "/categories/kamalia-khaddar",
  },

  // Children
  "children": {
    name: "Children Unstitched",
    img: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=600&q=80",
    desc: "Soft gentle fabrics for girls and boys festive wear",
    price: "350+ Fabrics",
    href: "/categories/children",
  },
}

// Campaign banner defaults matching Nishat Linen style (Image 3)
const menuCampaigns: Record<
  string,
  {
    title: string
    subtitle: string
    img: string
    link: string
  }
> = {
  women: {
    title: "LADIES UNSTITCHED",
    subtitle: "New Season 3-Piece & 2-Piece Luxury Lawn Collection",
    img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=85",
    link: "/categories/women",
  },
  men: {
    title: "GENTS UNSTITCHED",
    subtitle: "Pure Silk Boski, Superfine Latha & Wash & Wear Cuts",
    img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=85",
    link: "/categories/men",
  },
}

export default function MegaNav({ categories, collections }: MegaNavProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)

  const activeHoverItem = hoveredKey ? fashionCatalog[hoveredKey] : null
  const currentCampaign = (activeMenu && menuCampaigns[activeMenu]) || menuCampaigns.women

  return (
    <nav
      className="relative hidden lg:flex items-center justify-center gap-9 py-3 border-t border-[#EBE1D6] bg-transparent text-[11px] font-medium uppercase tracking-[0.2em] text-[#1A1A1A]"
      onMouseLeave={() => {
        setActiveMenu(null)
        setHoveredKey(null)
      }}
    >
      {/* 0. SHOP */}
      <LocalizedClientLink
        href="/store"
        onMouseEnter={() => {
          setActiveMenu(null)
          setHoveredKey(null)
        }}
        className="hover:text-[#B6975A] transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1.5px] after:bg-[#B6975A] hover:after:w-full after:transition-all font-semibold"
      >
        <span>Shop</span>
      </LocalizedClientLink>

      {/* 1. WOMEN */}
      <div
        onMouseEnter={() => {
          setActiveMenu("women")
          setHoveredKey(null)
        }}
      >
        <LocalizedClientLink
          href="/categories/women"
          className={`py-1 flex items-center gap-1 transition-colors relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:bg-[#B6975A] hover:after:w-full after:transition-all ${
            activeMenu === "women" ? "text-[#B6975A] after:w-full" : "hover:text-[#B6975A] after:w-0"
          }`}
        >
          <span>Women</span>
        </LocalizedClientLink>
      </div>

      {/* 2. MEN */}
      <div
        onMouseEnter={() => {
          setActiveMenu("men")
          setHoveredKey(null)
        }}
      >
        <LocalizedClientLink
          href="/categories/men"
          className={`py-1 flex items-center gap-1 transition-colors relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:bg-[#B6975A] hover:after:w-full after:transition-all ${
            activeMenu === "men" ? "text-[#B6975A] after:w-full" : "hover:text-[#B6975A] after:w-0"
          }`}
        >
          <span>Men</span>
        </LocalizedClientLink>
      </div>

      {/* 4. CHILDREN */}
      <LocalizedClientLink
        href="/categories/children"
        onMouseEnter={() => {
          setActiveMenu(null)
          setHoveredKey(null)
        }}
        className="hover:text-[#B6975A] transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1.5px] after:bg-[#B6975A] hover:after:w-full after:transition-all"
      >
        Children
      </LocalizedClientLink>

      {/* 5. SALE */}
      <LocalizedClientLink
        href="/categories/sale"
        onMouseEnter={() => {
          setActiveMenu(null)
          setHoveredKey(null)
        }}
        className="text-[#B6975A] font-bold hover:text-[#967A43] transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1.5px] after:bg-[#B6975A] hover:after:w-full after:transition-all tracking-wider"
      >
        End Of Season Sale
      </LocalizedClientLink>

      {/* Centered Mega Menu Dropdown */}
      {activeMenu && (
        <div
          className="absolute top-full left-0 right-0 mx-auto pt-2 z-50 w-[min(94vw,980px)] font-sans"
          onMouseEnter={() => {}}
        >
          {activeMenu === "women" && (
            <div className="bg-white border border-[#EBE1D6] shadow-2xl p-8 grid grid-cols-12 gap-8 text-left rounded-xs animate-dropdown-fade">
              {/* Column 1: By Pieces */}
              <div className="col-span-3 space-y-3">
                <h4 className="text-[11px] font-bold text-stone-900 uppercase tracking-[0.18em] pb-1 border-b border-stone-100">
                  By Pieces
                </h4>
                <ul className="space-y-2.5 text-xs text-stone-600 font-normal">
                  {[
                    { key: "3pc", label: "3-Piece Luxury Suits", href: "/categories/3pc" },
                    { key: "2pc", label: "2-Piece Sets", href: "/categories/2pc" },
                    { key: "1piece", label: "1-Piece Shirt Cut", href: "/categories/women" },
                    { key: "women-unstitched", label: "All Ladies Unstitched (1,250+)", href: "/categories/women" },
                  ].map((item) => {
                    const isHovered = hoveredKey === item.key
                    const catalogItem = fashionCatalog[item.key]
                    return (
                      <li key={item.key}>
                        <LocalizedClientLink
                          href={item.href}
                          onMouseEnter={() => setHoveredKey(item.key)}
                          className="flex items-center gap-2 hover:text-brand transition-colors group cursor-pointer"
                        >
                          {isHovered && (
                            <span className="w-4 h-4 rounded-full overflow-hidden border border-accent flex-shrink-0 animate-scale-up shadow-xs">
                              <img src={catalogItem?.img} alt={item.label} className="w-full h-full object-cover" />
                            </span>
                          )}
                          <span className={`transition-all ${isHovered ? "text-accent font-semibold translate-x-0.5" : ""}`}>
                            {item.label}
                          </span>
                        </LocalizedClientLink>
                      </li>
                    )
                  })}
                </ul>
              </div>

              {/* Column 2: Signature Fabrics */}
              <div className="col-span-3 space-y-3">
                <h4 className="text-[11px] font-bold text-stone-900 uppercase tracking-[0.18em] pb-1 border-b border-stone-100">
                  Signature Fabrics
                </h4>
                <ul className="space-y-2.5 text-xs text-stone-600 font-normal">
                  {[
                    { key: "lawn", label: "Pure Swiss Lawn", href: "/categories/women" },
                    { key: "silk", label: "Pure Heirloom Silk", href: "/categories/silk" },
                    { key: "linen", label: "Fine Linen Cuts", href: "/categories/linen" },
                    { key: "dhanak", label: "Winter Dhanak", href: "/categories/dhanak" },
                    { key: "khaddar", label: "Kamalia Khaddar", href: "/categories/khaddar" },
                    { key: "karandi", label: "Luxury Karandi", href: "/categories/karandi" },
                  ].map((item) => {
                    const isHovered = hoveredKey === item.key
                    const catalogItem = fashionCatalog[item.key]
                    return (
                      <li key={item.key}>
                        <LocalizedClientLink
                          href={item.href}
                          onMouseEnter={() => setHoveredKey(item.key)}
                          className="flex items-center gap-2 hover:text-brand transition-colors group cursor-pointer"
                        >
                          {isHovered && (
                            <span className="w-4 h-4 rounded-full overflow-hidden border border-accent flex-shrink-0 animate-scale-up shadow-xs">
                              <img src={catalogItem?.img} alt={item.label} className="w-full h-full object-cover" />
                            </span>
                          )}
                          <span className={`transition-all ${isHovered ? "text-accent font-semibold translate-x-0.5" : ""}`}>
                            {item.label}
                          </span>
                        </LocalizedClientLink>
                      </li>
                    )
                  })}
                </ul>
              </div>

              {/* Column 3: Craft & Embellishment */}
              <div className="col-span-2 space-y-3">
                <h4 className="text-[11px] font-bold text-stone-900 uppercase tracking-[0.18em] pb-1 border-b border-stone-100">
                  Craft & Edit
                </h4>
                <ul className="space-y-2.5 text-xs text-stone-600 font-normal">
                  {[
                    { key: "embroidery", label: "Embroidery Waly", href: "/categories/embroidery-waly" },
                    { key: "printed", label: "Digital Printed", href: "/categories/printed" },
                  ].map((item) => {
                    const isHovered = hoveredKey === item.key
                    const catalogItem = fashionCatalog[item.key]
                    return (
                      <li key={item.key}>
                        <LocalizedClientLink
                          href={item.href}
                          onMouseEnter={() => setHoveredKey(item.key)}
                          className="flex items-center gap-2 hover:text-brand transition-colors group cursor-pointer"
                        >
                          {isHovered && (
                            <span className="w-4 h-4 rounded-full overflow-hidden border border-accent flex-shrink-0 animate-scale-up shadow-xs">
                              <img src={catalogItem?.img} alt={item.label} className="w-full h-full object-cover" />
                            </span>
                          )}
                          <span className={`transition-all ${isHovered ? "text-accent font-semibold translate-x-0.5" : ""}`}>
                            {item.label}
                          </span>
                        </LocalizedClientLink>
                      </li>
                    )
                  })}
                </ul>
              </div>

              {/* Column 4: Right Campaign Banner OR Hover Circle Spotlight */}
              <div className="col-span-4 pl-4 border-l border-stone-100 flex flex-col justify-center">
                {activeHoverItem ? (
                  <div className="bg-stone-50 border border-stone-200/80 p-6 flex flex-col items-center text-center animate-fadeIn">
                    <div className="relative mb-3">
                      <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-accent shadow-xl ring-4 ring-accent/20 animate-scale-up">
                        <img
                          src={activeHoverItem.img}
                          alt={activeHoverItem.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-brand text-[9px] font-semibold text-white uppercase tracking-widest whitespace-nowrap shadow-xs">
                        {activeHoverItem.price}
                      </span>
                    </div>

                    <h5 className="font-serif text-base font-semibold text-brand mt-1">
                      {activeHoverItem.name}
                    </h5>
                    <p className="text-[11px] text-stone-500 font-light mt-1 max-w-[200px] leading-tight">
                      {activeHoverItem.desc}
                    </p>

                    <LocalizedClientLink
                      href={activeHoverItem.href}
                      className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent hover:text-stone-950 transition-colors"
                    >
                      <span>Explore Fabrics</span>
                      <span>&rarr;</span>
                    </LocalizedClientLink>
                  </div>
                ) : (
                  <LocalizedClientLink
                    href="/categories/women"
                    className="group block relative overflow-hidden aspect-[4/3] bg-stone-100"
                  >
                    <img
                      src={menuCampaigns.women.img}
                      alt={menuCampaigns.women.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                      <span className="font-serif text-base font-medium tracking-wider uppercase block text-white drop-shadow-sm">
                        {menuCampaigns.women.title}
                      </span>
                      <span className="text-[10px] text-stone-200 font-light block">
                        {menuCampaigns.women.subtitle}
                      </span>
                    </div>
                  </LocalizedClientLink>
                )}
              </div>
            </div>
          )}

          {activeMenu === "men" && (
            <div className="bg-white border border-[#EBE1D6] shadow-2xl p-8 grid grid-cols-12 gap-8 text-left rounded-xs animate-dropdown-fade">
              {/* Column 1: Luxury Silks & Cotton */}
              <div className="col-span-4 space-y-3">
                <h4 className="text-[11px] font-bold text-stone-900 uppercase tracking-[0.18em] pb-1 border-b border-stone-100">
                  Heirloom Silks & Cotton
                </h4>
                <ul className="space-y-2.5 text-xs text-stone-600 font-normal">
                  {[
                    { key: "boski", label: "Pure Silk Boski (Heavyweight)", href: "/categories/boski" },
                    { key: "italian", label: "Italian Superfine Combed Cotton", href: "/categories/italian" },
                    { key: "men-unstitched", label: "All Gents Unstitched (1,000+ Cuts)", href: "/categories/men" },
                  ].map((item) => {
                    const isHovered = hoveredKey === item.key
                    const catalogItem = fashionCatalog[item.key]
                    return (
                      <li key={item.key}>
                        <LocalizedClientLink
                          href={item.href}
                          onMouseEnter={() => setHoveredKey(item.key)}
                          className="flex items-center gap-2 hover:text-brand transition-colors group cursor-pointer"
                        >
                          {isHovered && (
                            <span className="w-4 h-4 rounded-full overflow-hidden border border-accent flex-shrink-0 animate-scale-up shadow-xs">
                              <img src={catalogItem?.img} alt={item.label} className="w-full h-full object-cover" />
                            </span>
                          )}
                          <span className={`transition-all ${isHovered ? "text-accent font-semibold translate-x-0.5" : ""}`}>
                            {item.label}
                          </span>
                        </LocalizedClientLink>
                      </li>
                    )
                  })}
                </ul>
              </div>

              {/* Column 2: Executive & Winter Fabrics */}
              <div className="col-span-4 space-y-3">
                <h4 className="text-[11px] font-bold text-stone-900 uppercase tracking-[0.18em] pb-1 border-b border-stone-100">
                  Executive & Winter Weaves
                </h4>
                <ul className="space-y-2.5 text-xs text-stone-600 font-normal">
                  {[
                    { key: "wash-wear", label: "Wrinkle-Free Wash & Wear", href: "/categories/wash-wear" },
                    { key: "kamalia-khaddar", label: "Handspun Kamalia Khaddar", href: "/categories/kamalia-khaddar" },
                    { key: "wool", label: "Fine Merino Wool Cuts", href: "/categories/wool" },
                  ].map((item) => {
                    const isHovered = hoveredKey === item.key
                    const catalogItem = fashionCatalog[item.key]
                    return (
                      <li key={item.key}>
                        <LocalizedClientLink
                          href={item.href}
                          onMouseEnter={() => setHoveredKey(item.key)}
                          className="flex items-center gap-2 hover:text-brand transition-colors group cursor-pointer"
                        >
                          {isHovered && (
                            <span className="w-4 h-4 rounded-full overflow-hidden border border-accent flex-shrink-0 animate-scale-up shadow-xs">
                              <img src={catalogItem?.img} alt={item.label} className="w-full h-full object-cover" />
                            </span>
                          )}
                          <span className={`transition-all ${isHovered ? "text-accent font-semibold translate-x-0.5" : ""}`}>
                            {item.label}
                          </span>
                        </LocalizedClientLink>
                      </li>
                    )
                  })}
                </ul>
              </div>

              {/* Column 3: Right Campaign Banner */}
              <div className="col-span-4 pl-4 border-l border-stone-100 flex flex-col justify-center">
                {activeHoverItem ? (
                  <div className="bg-stone-50 border border-stone-200/80 p-6 flex flex-col items-center text-center animate-fadeIn">
                    <div className="relative mb-3">
                      <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-accent shadow-xl ring-4 ring-accent/20 animate-scale-up">
                        <img
                          src={activeHoverItem.img}
                          alt={activeHoverItem.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 bg-brand text-[9px] font-semibold text-white uppercase tracking-widest whitespace-nowrap shadow-xs">
                        {activeHoverItem.price}
                      </span>
                    </div>

                    <h5 className="font-serif text-base font-semibold text-brand mt-1">
                      {activeHoverItem.name}
                    </h5>
                    <p className="text-[11px] text-stone-500 font-light mt-1 max-w-[200px] leading-tight">
                      {activeHoverItem.desc}
                    </p>

                    <LocalizedClientLink
                      href={activeHoverItem.href}
                      className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-accent hover:text-stone-950 transition-colors"
                    >
                      <span>Explore Cuts</span>
                      <span>&rarr;</span>
                    </LocalizedClientLink>
                  </div>
                ) : (
                  <LocalizedClientLink
                    href="/categories/men"
                    className="group block relative overflow-hidden aspect-[4/3] bg-stone-100"
                  >
                    <img
                      src={menuCampaigns.men.img}
                      alt={menuCampaigns.men.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                      <span className="font-serif text-base font-medium tracking-wider uppercase block text-white drop-shadow-sm">
                        {menuCampaigns.men.title}
                      </span>
                      <span className="text-[10px] text-stone-200 font-light block">
                        {menuCampaigns.men.subtitle}
                      </span>
                    </div>
                  </LocalizedClientLink>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
