"use client"

import { useRef, useState, useEffect } from "react"
import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

interface FabricCategory {
  title: string
  subtitle: string
  image: string
  href: string
  badge?: string
}

const FABRIC_CATEGORIES: FabricCategory[] = [
  {
    title: "3-Piece Luxury Lawn",
    subtitle: "Embroidered Voile & Chiffon",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=85",
    href: "/store?category=women",
    badge: "Trending",
  },
  {
    title: "Unstitched 2-Piece",
    subtitle: "Printed & Jacquard Lawn",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=85",
    href: "/store?category=unstitched",
    badge: "Bestseller",
  },
  {
    title: "Ready to Wear Pret",
    subtitle: "Tailored Kurtas & Co-ords",
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=600&q=85",
    href: "/store?category=women",
    badge: "New In",
  },
  {
    title: "Luxury Chiffon & Silk",
    subtitle: "Festive Embroidered Couture",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=85",
    href: "/store?category=luxury",
    badge: "Hot",
  },
  {
    title: "Handloom Pashmina",
    subtitle: "Pure Cashmere & Wool Wraps",
    image: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=600&q=85",
    href: "/store?category=luxury",
  },
  {
    title: "Men's Festive Kurta",
    subtitle: "Jacquard Silk & Fine Cotton",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=85",
    href: "/store?category=men",
    badge: "Classic",
  },
  {
    title: "Bottoms & Trousers",
    subtitle: "Embroidered Cambric & Silk",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=85",
    href: "/store?category=women",
  },
  {
    title: "End of Season Sale",
    subtitle: "Up to 40% Off Handcrafted Edits",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=85",
    href: "/store",
    badge: "Flat 40%",
  },
]

export default function FabricCategoryStrip({ section }: { section?: any }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeftState, setScrollLeftState] = useState(0)
  const [loadedImages, setLoadedImages] = useState<Record<number, boolean>>({})

  // Dynamic categories from Admin if configured, else default to curated list
  const categories: FabricCategory[] =
    Array.isArray(section?.settings?.cards)
      ? section.settings.cards.map((c: any) => ({
          title: c.title,
          subtitle: c.subtitle || "",
          image: c.image_url || c.image || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=85",
          href: c.link || c.href || "/store",
          badge: c.badge || undefined,
        }))
      : FABRIC_CATEGORIES

  // Update scroll arrows state
  const updateScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 20)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 20)
    }
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    updateScrollButtons()
    el.addEventListener("scroll", updateScrollButtons, { passive: true })
    window.addEventListener("resize", updateScrollButtons)
    return () => {
      el.removeEventListener("scroll", updateScrollButtons)
      window.removeEventListener("resize", updateScrollButtons)
    }
  }, [])

  // Smooth auto-sliding right-to-left every 3.8s when not hovered or dragged
  useEffect(() => {
    if (isHovered || isDragging) return

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
        const maxScroll = scrollWidth - clientWidth
        // If reached end, smoothly loop back to start
        if (scrollLeft >= maxScroll - 20) {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" })
        } else {
          scrollRef.current.scrollBy({ left: 280, behavior: "smooth" })
        }
      }
    }, 3800)

    return () => clearInterval(interval)
  }, [isHovered, isDragging])

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const step = Math.max(300, Math.floor(scrollRef.current.clientWidth * 0.65))
      scrollRef.current.scrollBy({
        left: direction === "left" ? -step : step,
        behavior: "smooth",
      })
    }
  }

  // Mouse Drag-to-Scroll Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - scrollRef.current.offsetLeft)
    setScrollLeftState(scrollRef.current.scrollLeft)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX) * 1.5
    scrollRef.current.scrollLeft = scrollLeftState - walk
  }

  const stopDragging = () => {
    setIsDragging(false)
  }

  return (
    <section
      className="bg-stone-50/80 border-y border-stone-200/90 py-12 my-6 overflow-hidden relative font-sans select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        stopDragging()
      }}
    >
      <div className="content-container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-accent">
                {section?.settings?.eyebrow ?? "Shop By Fabric & Pieces"}
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-brand font-medium mt-1">
              {section?.title ?? "Curated Seasonal Categories"}
            </h2>
            <p className="text-xs text-stone-500 font-light mt-1 max-w-md hidden sm:block">
              {section?.subtitle ?? "Explore pure Pima lawn, artisanal formals, and handloom wraps tailored for modern celebrations."}
            </p>
          </div>

          {/* Top Pill Indicators & Pause State */}
          <div className="flex items-center gap-3">
            <span className="hidden md:inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-stone-400 bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
              <span className={`w-1.5 h-1.5 rounded-full ${isHovered ? "bg-amber-500" : "bg-emerald-500 animate-pulse"}`} />
              {isHovered ? "Paused • Drag or Click" : "Auto Moving"}
            </span>

            {/* Header Mini Controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                aria-label="Previous categories"
                className="w-10 h-10 rounded-full border border-stone-300 bg-white flex items-center justify-center text-stone-700 hover:border-brand hover:bg-brand hover:text-white transition-all shadow-xs disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-stone-700 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                aria-label="Next categories"
                className="w-10 h-10 rounded-full border border-stone-300 bg-white flex items-center justify-center text-stone-700 hover:border-brand hover:bg-brand hover:text-white transition-all shadow-xs disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-stone-700 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Container with Big Floating Side Arrows */}
        <div className="relative group/track">
          {/* Big Left Floating Arrow */}
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            aria-label="Scroll Left"
            className={`absolute left-0 sm:-left-3 top-1/2 -translate-y-1/2 z-20 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/95 backdrop-blur-md shadow-2xl border border-stone-200/90 text-stone-900 flex items-center justify-center hover:bg-brand hover:text-white hover:border-brand transition-all duration-300 transform active:scale-95 disabled:opacity-0 disabled:pointer-events-none ${
              canScrollLeft ? "opacity-100" : "opacity-0"
            }`}
          >
            <svg className="w-6 h-6 transform -translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Big Right Floating Arrow */}
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            aria-label="Scroll Right"
            className={`absolute right-0 sm:-right-3 top-1/2 -translate-y-1/2 z-20 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/95 backdrop-blur-md shadow-2xl border border-stone-200/90 text-stone-900 flex items-center justify-center hover:bg-brand hover:text-white hover:border-brand transition-all duration-300 transform active:scale-95 disabled:opacity-0 disabled:pointer-events-none ${
              canScrollRight ? "opacity-100" : "opacity-0"
            }`}
          >
            <svg className="w-6 h-6 transform translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Horizontal Sliding Track (Bigger Circles) */}
          <div
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={stopDragging}
            className={`flex items-center gap-6 sm:gap-9 overflow-x-auto pb-6 pt-3 px-2 no-scrollbar scroll-smooth cursor-grab ${
              isDragging ? "cursor-grabbing" : ""
            }`}
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {categories.map((cat, idx) => (
              <LocalizedClientLink
                key={idx}
                href={cat.href}
                className="flex-shrink-0 group flex flex-col items-center text-center w-36 sm:w-44 md:w-48 focus:outline-none"
              >
                {/* Large Circular Runway Container with Double Luxury Rings */}
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 rounded-full p-1.5 bg-gradient-to-tr from-amber-300/40 via-stone-200 to-amber-200/60 shadow-md group-hover:shadow-2xl group-hover:from-amber-500 group-hover:to-amber-300 transition-all duration-500 transform group-hover:scale-105">
                  <div className="relative w-full h-full rounded-full overflow-hidden bg-stone-100 border border-white">
                    {/* Functional Loader Spinner while image is loading */}
                    {!loadedImages[idx] && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-stone-100 animate-pulse">
                        <div className="w-7 h-7 rounded-full border-2 border-amber-300 border-t-amber-600 animate-spin" />
                      </div>
                    )}

                    <Image unoptimized
                      src={cat.image}
                      alt={cat.title}
                      fill
                      onLoad={() => setLoadedImages((prev) => ({ ...prev, [idx]: true }))}
                      className={`object-cover object-top transition-transform duration-700 ease-out group-hover:scale-115 ${
                        loadedImages[idx] ? "opacity-100" : "opacity-0"
                      } transition-opacity duration-500`}
                      sizes="(max-width: 640px) 160px, 192px"
                    />

                    {/* Subtle Luxury Gradient Vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent opacity-60 group-hover:opacity-20 transition-opacity duration-300" />
                  </div>

                  {/* Badge */}
                  {cat.badge && (
                    <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-stone-950 text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-widest px-3 py-0.5 rounded-full shadow-md whitespace-nowrap border border-amber-300/50 group-hover:bg-accent group-hover:border-white transition-colors duration-300">
                      {cat.badge}
                    </span>
                  )}
                </div>

                {/* Title & Subtitle */}
                <div className="mt-4 px-1 max-w-[170px]">
                  <span className="block text-xs sm:text-sm font-serif font-semibold text-brand group-hover:text-accent transition-colors leading-snug line-clamp-1 tracking-wide">
                    {cat.title}
                  </span>
                  <span className="block text-[11px] text-stone-500 font-light mt-0.5 line-clamp-1">
                    {cat.subtitle}
                  </span>
                </div>
              </LocalizedClientLink>
            ))}
          </div>
        </div>
        {section?.cta_text && <div className="mt-8 text-center"><LocalizedClientLink href={section.cta_link || "/store"} className="text-sm underline">{section.cta_text}</LocalizedClientLink></div>}
      </div>
    </section>
  )
}
