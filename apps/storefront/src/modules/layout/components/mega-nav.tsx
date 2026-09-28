"use client"

import React, { useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

interface MegaNavProps {
  categories: HttpTypes.StoreProductCategory[]
  collections: HttpTypes.StoreCollection[]
}

// Pakistani fashion visual catalogue data for hover circle previews and campaign cards
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
  // Stitched & Unstitched Categories
  "women-stitched": {
    name: "Women's Stitched Pret",
    img: "/images/products/women_stitched_1.svg",
    desc: "Ready to wear luxury pret, 2-piece & 3-piece embroidered ensembles",
    price: "1,250+ Designs",
    href: "/categories/women-stitched",
  },
  "women-unstitched": {
    name: "Women's Unstitched",
    img: "/images/products/women_unstitched_1.svg",
    desc: "Fine lawn, pure silk dupattas & embroidered 3-piece unstitched fabrics",
    price: "1,250+ Designs",
    href: "/categories/women-unstitched",
  },
  "men-stitched": {
    name: "Men's Stitched Eastern",
    img: "/images/products/men_stitched_1.svg",
    desc: "Bespoke stitched kurtas, shalwar kameez & festive waistcoats",
    price: "1,000+ Designs",
    href: "/categories/men-stitched",
  },
  "men-unstitched": {
    name: "Men's Unstitched Fabric",
    img: "/images/products/men_unstitched_1.svg",
    desc: "Premium Egyptian cotton, latha, wash & wear unstitched fabrics",
    price: "1,000+ Designs",
    href: "/categories/men-unstitched",
  },
  "children": {
    name: "Children Eastern",
    img: "/images/products/kids_eastern_1.svg",
    desc: "Handcrafted festive ghararas, kurtas & eastern kids collection",
    price: "500+ Designs",
    href: "/categories/children",
  },
  // Ready to Wear
  "co-ords": {
    name: "Co-Ord Sets",
    img: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80",
    desc: "Fluid modern digital printed silhouettes & matching 2-piece sets",
    price: "From Rs. 7,450",
    href: "/categories/co-ords",
  },
  "aura-pret": {
    name: "Aura Pret",
    img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80",
    desc: "Luxury daywear tunics with subtle embroidery accents",
    price: "From Rs. 5,950",
    href: "/categories/co-ords",
  },
  "printed-pret": {
    name: "Printed Kurtas",
    img: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80",
    desc: "Breathable daily wear kurtas with artisanal necklines",
    price: "From Rs. 4,850",
    href: "/store?sortBy=newest",
  },
  "embroidered-pret": {
    name: "Embroidered Pret",
    img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80",
    desc: "Intricate resham and schiffli work on premium lawn fabrics",
    price: "From Rs. 8,250",
    href: "/categories/unstitched",
  },
  "solids-pret": {
    name: "Solids & Slips",
    img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80",
    desc: "Monochrome matching separates in pure cotton and silk",
    price: "From Rs. 4,200",
    href: "/store",
  },

  // Unstitched
  "unstitched-printed": {
    name: "Printed Lawn",
    img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80",
    desc: "Vibrant Pakistani floral motifs with lightweight chiffon dupattas",
    price: "From Rs. 4,950",
    href: "/categories/unstitched",
  },
  "unstitched-embroidered": {
    name: "Embroidered 3-Piece",
    img: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80",
    desc: "Heirloom threadwork, organza border patti, and pure silk pallu",
    price: "From Rs. 8,950",
    href: "/categories/unstitched",
  },
  "unstitched-1piece": {
    name: "1 Piece Shirt Fabric",
    img: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80",
    desc: "Signature printed and embroidered individual shirt cuts (3 meters)",
    price: "From Rs. 2,450",
    href: "/categories/unstitched",
  },
  "unstitched-2piece": {
    name: "2 Piece Suit",
    img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80",
    desc: "Shirt & Dupatta or Shirt & Trouser coordinated sets",
    price: "From Rs. 4,850",
    href: "/categories/unstitched",
  },
  "unstitched-3piece": {
    name: "3 Piece Luxury Suit",
    img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80",
    desc: "Complete luxury lawn suite: Embroidered shirt, trousers, and dupatta",
    price: "From Rs. 9,950",
    href: "/collections/summer-lawn-25",
  },

  // Luxury & Formals
  "festive-formals": {
    name: "Festive Formals",
    img: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80",
    desc: "Zardozi hand-embellished raw silks, organza coats, and wedding wear",
    price: "From Rs. 16,500",
    href: "/collections/festive-formals",
  },
  "raw-silk": {
    name: "Pure Raw Silk",
    img: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=600&q=80",
    desc: "Lustrous heavy pure silk sets tailored for evening elegance",
    price: "From Rs. 18,900",
    href: "/collections/festive-formals",
  },
  "organza-wraps": {
    name: "Organza Wraps",
    img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80",
    desc: "Translucent embroidered statement jackets and formal dupattas",
    price: "From Rs. 12,500",
    href: "/categories/festive-formals",
  },

  // Bottoms & Shawls
  lowers: {
    name: "Pants & Trousers",
    img: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80",
    desc: "Tailored cigarette pants, culottes, and embroidered lace hem trousers",
    price: "From Rs. 2,850",
    href: "/store",
  },
  shalwars: {
    name: "Traditional Shalwars",
    img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80",
    desc: "Authentic pleated Pakistani cotton & silk shalwars",
    price: "From Rs. 2,650",
    href: "/store",
  },
  shawls: {
    name: "Pashmina & Velvet Shawls",
    img: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=600&q=80",
    desc: "Heirloom Kashmiri embroidery, velvet borders, and warm wraps",
    price: "From Rs. 6,950",
    href: "/categories/accessories",
  },

  // Men
  "men-kurtas": {
    name: "Jacquard Kurtas",
    img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80",
    desc: "Fine Egyptian cotton & jacquard weave formal kurtas",
    price: "From Rs. 5,950",
    href: "/categories/men",
  },
  "men-waistcoats": {
    name: "Festive Waistcoats",
    img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80",
    desc: "Structured raw silk & jamawar waistcoats with engraved metal buttons",
    price: "From Rs. 6,850",
    href: "/categories/men",
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
    title: "WOMEN",
    subtitle: "New Season Pret & Unstitched Lawn Collection",
    img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=85",
    link: "/categories/women",
  },
  unstitched: {
    title: "FESTIVE LAWN '25",
    subtitle: "Artisanal 3-Piece Embroideries & Silk Dupattas",
    img: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=85",
    link: "/categories/unstitched",
  },
  luxury: {
    title: "HAUTE COUTURE",
    subtitle: "Heirloom Silks, Organza & Zardozi Pret",
    img: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=900&q=85",
    link: "/collections/festive-formals",
  },
  men: {
    title: "MEN'S EASTERN",
    subtitle: "Jacquard Kurtas, Shalwar Kameez & Waistcoats",
    img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=85",
    link: "/categories/men",
  },
  collections: {
    title: "CURATED EDITS",
    subtitle: "Limited Edition Releases & Lookbooks",
    img: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=900&q=85",
    link: "/store",
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
      <LocalizedClientLink
        href="/store"
        onMouseEnter={() => {
          setActiveMenu(null)
          setHoveredKey(null)
        }}
        className="hover:text-[#B6975A] transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1.5px] after:bg-[#B6975A] hover:after:w-full after:transition-all"
      >
        New In
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
          <svg
            className={`w-3 h-3 text-stone-400 transition-transform duration-200 ${
              activeMenu === "women" ? "rotate-180 text-[#B6975A]" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </LocalizedClientLink>
      </div>

      {/* 2. UNSTITCHED */}
      <div
        onMouseEnter={() => {
          setActiveMenu("unstitched")
          setHoveredKey(null)
        }}
      >
        <LocalizedClientLink
          href="/categories/unstitched"
          className={`py-1 flex items-center gap-1 transition-colors relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:bg-[#B6975A] hover:after:w-full after:transition-all ${
            activeMenu === "unstitched" ? "text-[#B6975A] after:w-full" : "hover:text-[#B6975A] after:w-0"
          }`}
        >
          <span>Unstitched</span>
          <svg
            className={`w-3 h-3 text-stone-400 transition-transform duration-200 ${
              activeMenu === "unstitched" ? "rotate-180 text-[#B6975A]" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </LocalizedClientLink>
      </div>

      {/* 3. LUXURY PRET */}
      <div
        onMouseEnter={() => {
          setActiveMenu("luxury")
          setHoveredKey(null)
        }}
      >
        <LocalizedClientLink
          href="/collections/festive-formals"
          className={`py-1 flex items-center gap-1 transition-colors relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[1.5px] after:bg-[#B6975A] hover:after:w-full after:transition-all ${
            activeMenu === "luxury" ? "text-[#B6975A] after:w-full" : "hover:text-[#B6975A] after:w-0"
          }`}
        >
          <span>Luxury</span>
        </LocalizedClientLink>
      </div>

      {/* 4. MEN */}
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

      {/* 5. CHILDREN */}
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

      {/* 6. SALE */}
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

      {/* Centered Mega Menu Dropdown: Positioned directly in the exact horizontal middle using left-0 right-0 mx-auto */}
      {activeMenu && (
        <div
          className="absolute top-full left-0 right-0 mx-auto pt-2 z-50 w-[min(94vw,980px)] font-sans"
          onMouseEnter={() => {
            // Keep menu active while cursor explores inside the card
          }}
        >
          {activeMenu === "women" && (
            <div className="bg-white border border-[#EBE1D6] shadow-2xl p-8 grid grid-cols-12 gap-8 text-left rounded-xs animate-dropdown-fade">
              {/* Column 1: Ready To Wear */}
              <div className="col-span-2 space-y-3">
                <h4 className="text-[11px] font-bold text-stone-900 uppercase tracking-[0.18em] pb-1 border-b border-stone-100">
                  Stitched Pret
                </h4>
                <ul className="space-y-2.5 text-xs text-stone-600 font-normal">
                  {[
                    { key: "women-stitched", label: "Stitched Pret (1,250+)" },
                    { key: "co-ords", label: "Co-Ord Sets" },
                    { key: "aura-pret", label: "Aura Pret" },
                    { key: "printed-pret", label: "Printed Kurtas" },
                    { key: "embroidered-pret", label: "Embroidered Pret" },
                  ].map((item) => {
                    const isHovered = hoveredKey === item.key
                    const catalogItem = fashionCatalog[item.key]
                    return (
                      <li key={item.key}>
                        <LocalizedClientLink
                          href={catalogItem?.href || "/categories/women-stitched"}
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

              {/* Column 2: Unstitched */}
              <div className="col-span-2 space-y-3">
                <h4 className="text-[11px] font-bold text-stone-900 uppercase tracking-[0.18em] pb-1 border-b border-stone-100">
                  Unstitched Lawn
                </h4>
                <ul className="space-y-2.5 text-xs text-stone-600 font-normal">
                  {[
                    { key: "women-unstitched", label: "Unstitched (1,250+)" },
                    { key: "unstitched-printed", label: "Printed Lawn" },
                    { key: "unstitched-embroidered", label: "Embroidered 3-Piece" },
                    { key: "unstitched-1piece", label: "1 Piece Shirts" },
                    { key: "unstitched-2piece", label: "2 Piece Suits" },
                  ].map((item) => {
                    const isHovered = hoveredKey === item.key
                    const catalogItem = fashionCatalog[item.key]
                    return (
                      <li key={item.key}>
                        <LocalizedClientLink
                          href={catalogItem?.href || "/categories/women-unstitched"}
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

              {/* Column 3: Luxury Pret & Formals */}
              <div className="col-span-2 space-y-3">
                <h4 className="text-[11px] font-bold text-stone-900 uppercase tracking-[0.18em] pb-1 border-b border-stone-100">
                  Luxury Couture
                </h4>
                <ul className="space-y-2.5 text-xs text-stone-600 font-normal">
                  {[
                    { key: "festive-formals", label: "Festive Formals" },
                    { key: "raw-silk", label: "Pure Raw Silk" },
                    { key: "organza-wraps", label: "Organza Wraps" },
                  ].map((item) => {
                    const isHovered = hoveredKey === item.key
                    const catalogItem = fashionCatalog[item.key]
                    return (
                      <li key={item.key}>
                        <LocalizedClientLink
                          href={catalogItem?.href || "/collections/festive-formals"}
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

              {/* Column 4: Bottoms & Shawls */}
              <div className="col-span-2 space-y-3">
                <h4 className="text-[11px] font-bold text-stone-900 uppercase tracking-[0.18em] pb-1 border-b border-stone-100">
                  Bottoms & Wraps
                </h4>
                <ul className="space-y-2.5 text-xs text-stone-600 font-normal">
                  {[
                    { key: "lowers", label: "Lowers & Pants" },
                    { key: "shalwars", label: "Traditional Shalwars" },
                    { key: "shawls", label: "Velvet Shawls" },
                  ].map((item) => {
                    const isHovered = hoveredKey === item.key
                    const catalogItem = fashionCatalog[item.key]
                    return (
                      <li key={item.key}>
                        <LocalizedClientLink
                          href={catalogItem?.href || "/store"}
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

              {/* Column 5: Right Campaign Banner OR Hover Circle Spotlight */}
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
                      <span>Explore Designs</span>
                      <span>&rarr;</span>
                    </LocalizedClientLink>
                  </div>
                ) : (
                  <LocalizedClientLink
                    href={currentCampaign.link}
                    className="group block relative overflow-hidden aspect-[4/3] bg-stone-100"
                  >
                    <img
                      src={currentCampaign.img}
                      alt={currentCampaign.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                      <span className="font-serif text-base font-medium tracking-wider uppercase block text-white drop-shadow-sm">
                        {currentCampaign.title}
                      </span>
                      <span className="text-[10px] text-stone-200 font-light block">
                        {currentCampaign.subtitle}
                      </span>
                    </div>
                  </LocalizedClientLink>
                )}
              </div>
            </div>
          )}

          {activeMenu === "unstitched" && (
            <div className="bg-white border border-[#EBE1D6] shadow-2xl p-7 grid grid-cols-12 gap-8 text-left rounded-xs animate-dropdown-fade">
              <div className="col-span-7 space-y-3">
                <h4 className="text-[11px] font-bold text-stone-900 uppercase tracking-[0.18em] pb-1 border-b border-stone-100">
                  Unstitched Lawn & Silks
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs text-stone-600">
                  {[
                    { key: "unstitched-printed", label: "Printed 3-Piece" },
                    { key: "unstitched-embroidered", label: "Embroidered Lawn" },
                    { key: "unstitched-1piece", label: "1 Piece Shirts" },
                    { key: "unstitched-2piece", label: "2 Piece Suits" },
                    { key: "unstitched-3piece", label: "Luxury Festive Lawn" },
                    { key: "shawls", label: "Shawls & Dupattas" },
                  ].map((item) => {
                    const isHovered = hoveredKey === item.key
                    const catalogItem = fashionCatalog[item.key]
                    return (
                      <LocalizedClientLink
                        key={item.key}
                        href={catalogItem?.href || "/categories/unstitched"}
                        onMouseEnter={() => setHoveredKey(item.key)}
                        className="flex items-center gap-2 hover:text-brand transition-colors p-1.5"
                      >
                        {isHovered && (
                          <span className="w-4 h-4 rounded-full overflow-hidden border border-accent flex-shrink-0 animate-scale-up">
                            <img src={catalogItem?.img} alt={item.label} className="w-full h-full object-cover" />
                          </span>
                        )}
                        <span className={`capitalize ${isHovered ? "text-accent font-semibold translate-x-0.5" : ""}`}>
                          {item.label}
                        </span>
                      </LocalizedClientLink>
                    )
                  })}
                </div>
              </div>

              {/* Right Campaign / Hover Spotlight */}
              <div className="col-span-5 border-l border-stone-100 pl-6 flex flex-col justify-center">
                {activeHoverItem ? (
                  <div className="bg-stone-50 border border-stone-200 p-5 flex flex-col items-center text-center animate-fadeIn">
                    <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-accent shadow-md mb-2 animate-scale-up">
                      <img src={activeHoverItem.img} alt={activeHoverItem.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="font-serif font-semibold text-brand text-sm">{activeHoverItem.name}</div>
                    <div className="text-[10px] text-accent font-semibold">{activeHoverItem.price}</div>
                  </div>
                ) : (
                  <LocalizedClientLink href="/categories/unstitched" className="block relative aspect-[4/3] overflow-hidden group">
                    <img src={menuCampaigns.unstitched.img} alt="Unstitched Lawn" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className="absolute bottom-3 left-3 text-white font-serif text-sm font-medium uppercase">
                      Festive Lawn '25
                    </span>
                  </LocalizedClientLink>
                )}
              </div>
            </div>
          )}

          {activeMenu === "luxury" && (
            <div className="bg-white border border-[#EBE1D6] shadow-2xl p-7 grid grid-cols-12 gap-8 text-left rounded-xs animate-dropdown-fade">
              <div className="col-span-7 space-y-3">
                <h4 className="text-[11px] font-bold text-stone-900 uppercase tracking-[0.18em] pb-1 border-b border-stone-100">
                  Haute Couture & Formals
                </h4>
                <div className="space-y-2.5 text-xs text-stone-600">
                  {[
                    { key: "festive-formals", label: "Festive Pret Formals" },
                    { key: "raw-silk", label: "Raw Silk Luxury Ensembles" },
                    { key: "organza-wraps", label: "Embroidered Organza Jackets" },
                    { key: "shawls", label: "Handcrafted Velvet Shawls" },
                  ].map((item) => {
                    const isHovered = hoveredKey === item.key
                    const catalogItem = fashionCatalog[item.key]
                    return (
                      <LocalizedClientLink
                        key={item.key}
                        href={catalogItem?.href || "/collections/festive-formals"}
                        onMouseEnter={() => setHoveredKey(item.key)}
                        className="flex items-center gap-2 hover:text-brand transition-colors p-1"
                      >
                        {isHovered && (
                          <span className="w-4 h-4 rounded-full overflow-hidden border border-accent flex-shrink-0 animate-scale-up">
                            <img src={catalogItem?.img} alt={item.label} className="w-full h-full object-cover" />
                          </span>
                        )}
                        <span className={`${isHovered ? "text-accent font-semibold translate-x-0.5" : ""}`}>
                          {item.label}
                        </span>
                      </LocalizedClientLink>
                    )
                  })}
                </div>
              </div>

              <div className="col-span-5 border-l border-stone-100 pl-6 flex flex-col justify-center">
                {activeHoverItem ? (
                  <div className="bg-stone-50 border border-stone-200 p-5 flex flex-col items-center text-center animate-fadeIn">
                    <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-accent shadow-md mb-2 animate-scale-up">
                      <img src={activeHoverItem.img} alt={activeHoverItem.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="font-serif font-semibold text-brand text-sm">{activeHoverItem.name}</div>
                    <div className="text-[10px] text-accent font-semibold">{activeHoverItem.price}</div>
                  </div>
                ) : (
                  <LocalizedClientLink href="/collections/festive-formals" className="block relative aspect-[4/3] overflow-hidden group">
                    <img src={menuCampaigns.luxury.img} alt="Haute Couture" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className="absolute bottom-3 left-3 text-white font-serif text-sm font-medium uppercase">
                      Heirloom Pret
                    </span>
                  </LocalizedClientLink>
                )}
              </div>
            </div>
          )}

          {activeMenu === "men" && (
            <div className="bg-white border border-[#EBE1D6] shadow-2xl p-7 grid grid-cols-12 gap-8 text-left rounded-xs animate-dropdown-fade">
              <div className="col-span-7 space-y-3">
                <h4 className="text-[11px] font-bold text-stone-900 uppercase tracking-[0.18em] pb-1 border-b border-stone-100">
                  Men's Eastern Wardrobe
                </h4>
                <div className="space-y-2.5 text-xs text-stone-600">
                  {[
                    { key: "men-stitched", label: "Stitched Eastern (1,000+ Designs)" },
                    { key: "men-unstitched", label: "Unstitched Fabric (1,000+ Cuts)" },
                    { key: "men-kurtas", label: "Jacquard Kurtas & Pajamas" },
                    { key: "men-waistcoats", label: "Embroidered Waistcoats" },
                  ].map((item) => {
                    const isHovered = hoveredKey === item.key
                    const catalogItem = fashionCatalog[item.key]
                    return (
                      <LocalizedClientLink
                        key={item.key}
                        href={catalogItem?.href || "/categories/men"}
                        onMouseEnter={() => setHoveredKey(item.key)}
                        className="flex items-center gap-2 hover:text-brand transition-colors p-1"
                      >
                        {isHovered && (
                          <span className="w-4 h-4 rounded-full overflow-hidden border border-accent flex-shrink-0 animate-scale-up">
                            <img src={catalogItem?.img} alt={item.label} className="w-full h-full object-cover" />
                          </span>
                        )}
                        <span className={`${isHovered ? "text-accent font-semibold translate-x-0.5" : ""}`}>
                          {item.label}
                        </span>
                      </LocalizedClientLink>
                    )
                  })}
                </div>
              </div>

              <div className="col-span-5 border-l border-stone-100 pl-6 flex flex-col justify-center">
                <LocalizedClientLink href="/categories/men" className="block relative aspect-[4/3] overflow-hidden group">
                  <img src={menuCampaigns.men.img} alt="Men's Eastern" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute bottom-3 left-3 text-white font-serif text-sm font-medium uppercase">
                    Men's Collection
                  </span>
                </LocalizedClientLink>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
