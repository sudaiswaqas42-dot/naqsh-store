"use client"

import React, { useState, useEffect, useRef } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

interface Slide {
  eyebrow?: string
  title: string
  sub: string
  cta_text: string
  cta_link: string
  image: string
  tag?: string
}

interface HeroSliderProps {
  section?: {
    title?: string
    subtitle?: string | null
    cta_text?: string | null
    cta_link?: string | null
    settings?: {
      slides?: any[]
    }
  }
}

// Curated high-res Pakistani fashion campaign photography (Khaadi / Sapphire / Nishat luxury standard)
const pakistaniHeroSlides: Slide[] = [
  {
    tag: "FESTIVE LUXURY LAWN '25",
    eyebrow: "The Summer Signature Edit",
    title: "Artisanal Handcrafted Lawn",
    sub: "Exquisite chikan kari embroideries, pure silk pallu dupattas, and handcrafted Pakistani luxury unstitched fabrics for celebratory occasions.",
    cta_text: "Shop Festive Lawn",
    cta_link: "/categories/women",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=2000&q=85",
  },
  {
    tag: "HEIRLOOM UNSTITCHED SILKS",
    eyebrow: "Heirloom Craftsmanship",
    title: "Raw Silks & Delicate Zardozi",
    sub: "Masterfully hand-embellished resham threadwork, organza dupatta cuts, and timeless Pakistani unstitched festive fabrics.",
    cta_text: "Explore Festive Cuts",
    cta_link: "/categories/silk",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=2000&q=85",
  },
  {
    tag: "UNSTITCHED 2-PIECE & 3-PIECE",
    eyebrow: "Artisanal Lawn Prints",
    title: "Printed Silks & Premium Lawn",
    sub: "Breathable unstitched matching sets, geometric digital prints, and effortless fabric cuts for custom tailoring.",
    cta_text: "Shop Unstitched Cuts",
    cta_link: "/categories/women",
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=2000&q=85",
  },
  {
    tag: "GENTS UNSTITCHED FABRICS",
    eyebrow: "Bespoke Suiting Lengths",
    title: "Pure Boski & Superfine Latha",
    sub: "Heavyweight heirloom pure silk boski, luxury Egyptian combed cotton, and wrinkle-free wash-and-wear 4.5-meter cuts.",
    cta_text: "Shop Gents Fabrics",
    cta_link: "/categories/men",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=2000&q=85",
  },
]

export default function NaqshHeroSlider({ section }: HeroSliderProps) {
  // Always guarantee high-res Pakistani fashion photography even if DB only had text/gradients
  const rawSlides = section?.settings?.slides ?? pakistaniHeroSlides.map((slide, index) => index ? slide : { ...slide, title: section?.title ?? slide.title, sub: section?.subtitle ?? slide.sub, cta_text: section?.cta_text ?? slide.cta_text, cta_link: section?.cta_link ?? slide.cta_link })
  const slides: Slide[] = rawSlides.map((s: any, idx: number) => {
    const fallback = pakistaniHeroSlides[idx % pakistaniHeroSlides.length]
    const validImage = typeof s.image === "string" && /^(https?:\/\/|\/(?!\/))/.test(s.image.trim()) ? s.image : fallback.image
    return {
      tag: s.tag ?? fallback.tag,
      eyebrow: s.eyebrow ?? fallback.eyebrow,
      title: s.title ?? fallback.title,
      sub: s.sub ?? fallback.sub,
      cta_text: s.cta_text ?? fallback.cta_text,
      cta_link: s.cta_link ?? fallback.cta_link,
      image: validImage,
    }
  })

  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const touchStartX = useRef<number>(0)
  const touchEndX = useRef<number>(0)

  // Smooth auto-sliding with live progress timer (6.5 seconds per slide)
  useEffect(() => {
    if (isPaused || !slides.length) return

    const slideDuration = 6500
    const intervalStep = 50
    const stepIncrement = (intervalStep / slideDuration) * 100

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrent((curr) => (curr + 1) % slides.length)
          return 0
        }
        return prev + stepIncrement
      })
    }, intervalStep)

    return () => clearInterval(progressTimer)
  }, [slides.length, isPaused, current])

  // Reset progress when slide changes manually
  const goToSlide = (index: number) => {
    setCurrent(index)
    setProgress(0)
  }

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length)
    setProgress(0)
  }

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length)
    setProgress(0)
  }

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX
  }

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 60) {
      nextSlide()
    }
    if (touchStartX.current - touchEndX.current < -60) {
      prevSlide()
    }
  }

  if (!slides.length) return null

  return (
    <div className="naqsh-home-hero relative w-full overflow-hidden select-none bg-stone-900 font-sans">
      {/* Main Hero Slider Container */}
      <section
        className="naqsh-home-hero-stage relative w-full h-[580px] sm:h-[660px] lg:h-[760px] overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Quick Campaign Switcher Pills (Pakistani Top Brand style) */}
        <div className="absolute top-6 left-6 sm:left-12 lg:left-16 z-30 hidden md:flex items-center gap-1.5 bg-black/50 backdrop-blur-md p-1 border border-white/20 shadow-lg">
          {slides.map((s, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`px-4 py-2 text-[10px] font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                idx === current
                  ? "bg-accent text-brand shadow-sm font-bold scale-102"
                  : "text-stone-300 hover:text-white hover:bg-white/10"
              }`}
            >
              {s.eyebrow || s.title}
            </button>
          ))}
        </div>



        {/* Slides rendering */}
        {slides.map((slide, index) => {
          const isActive = index === current
          return (
            <div
              key={index}
              aria-hidden={!isActive}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              {/* Background Image with Ken-Burns scale effect on active slide */}
              <div className="absolute inset-0 overflow-hidden bg-stone-900">
                <img
                  src={slide.image}
                  alt={slide.title}
                  loading={index === 0 ? "eager" : "lazy"}
                  className={`w-full h-full object-cover object-top sm:object-center transform transition-transform duration-[7000ms] ease-out ${
                    isActive ? "scale-105" : "scale-100"
                  }`}
                  onError={(e) => {
                    const fallback = pakistaniHeroSlides[index % pakistaniHeroSlides.length]
                    if ((e.target as HTMLImageElement).src !== fallback.image) {
                      ;(e.target as HTMLImageElement).src = fallback.image
                    }
                  }}
                />
              </div>

              {/* Sophisticated Luxury Multi-stop Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/25 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

              {/* Text & Content Container */}
              <div className="relative h-full content-container mx-auto px-6 sm:px-12 lg:px-16 flex flex-col justify-center items-start text-white max-w-4xl z-20">
                {/* Floating Campaign Tag */}
                {slide.tag && (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-accent text-brand text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] mb-4 shadow-md backdrop-blur-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand animate-ping" />
                    <span>{slide.tag}</span>
                  </div>
                )}

                {slide.eyebrow && (
                  <span className="text-xs uppercase tracking-[0.35em] text-accent font-semibold mb-2 drop-shadow-sm">
                    {slide.eyebrow}
                  </span>
                )}

                <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal tracking-wide text-white leading-tight mb-4 drop-shadow-lg max-w-2xl">
                  {slide.title}
                </h1>

                <p className="text-xs sm:text-base text-stone-200 font-light leading-relaxed mb-8 max-w-xl drop-shadow-md">
                  {slide.sub}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-4">
                  <LocalizedClientLink
                    href={slide.cta_link}
                    className="px-8 py-4 bg-white hover:bg-accent text-brand hover:text-white text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-xl hover:shadow-2xl rounded-none transform hover:-translate-y-0.5 flex items-center gap-2"
                  >
                    <span>{slide.cta_text}</span>
                    <span>&rarr;</span>
                  </LocalizedClientLink>

                  <LocalizedClientLink
                    href="/store"
                    className="px-8 py-4 bg-black/40 backdrop-blur-md border border-white/50 text-white hover:bg-white hover:text-brand hover:border-white text-xs font-semibold uppercase tracking-widest transition-all rounded-none"
                  >
                    Explore Catalog
                  </LocalizedClientLink>
                </div>
              </div>
            </div>
          )
        })}

        {/* Left Arrow (Hidden on mobile and mobile landscape) */}
        <button
          onClick={prevSlide}
          className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/40 hover:bg-accent hover:text-brand border border-white/20 backdrop-blur-md text-white items-center justify-center transition-all duration-300 group shadow-lg"
          aria-label="Previous slide"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Right Arrow (Hidden on mobile and mobile landscape) */}
        <button
          onClick={nextSlide}
          className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-black/40 hover:bg-accent hover:text-brand border border-white/20 backdrop-blur-md text-white items-center justify-center transition-all duration-300 group shadow-lg"
          aria-label="Next slide"
        >
          <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Slide Progress Indicator Circles with filling animation */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 sm:gap-3">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className="group p-1 focus:outline-none"
              aria-label={`Go to slide ${idx + 1}`}
            >
              <div className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border transition-all duration-300 overflow-hidden relative flex items-center justify-center ${
                idx === current ? "border-accent bg-accent/25 scale-110 shadow-sm" : "border-white/50 bg-white/20 hover:border-white"
              }`}>
                <div
                  className={`w-2 h-2 sm:w-2.5 sm:h-2.5 bg-accent rounded-full transition-all duration-300 ${
                    idx === current ? "scale-100 opacity-100" : "scale-0 opacity-0"
                  }`}
                />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Pakistani Brand Luxury Marquee Guarantee Ticker */}
      <div className="relative overflow-hidden bg-brand border-y border-stone-800 text-stone-300 py-3.5 text-[11px] sm:text-xs font-medium uppercase tracking-[0.25em] select-none">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-8">
          <span className="flex items-center gap-3">
            <span className="text-accent">✦</span>
            <span>EXPRESS NATIONWIDE DELIVERY ACROSS PAKISTAN (2-4 DAYS)</span>
          </span>
          <span className="flex items-center gap-3">
            <span className="text-accent">✦</span>
            <span>100% ORIGINAL ARTISANAL DESIGNER LAWN & RAW SILKS</span>
          </span>
          <span className="flex items-center gap-3">
            <span className="text-accent">✦</span>
            <span>CASH ON DELIVERY (COD) AVAILABLE NATIONWIDE</span>
          </span>
          <span className="flex items-center gap-3">
            <span className="text-accent">✦</span>
            <span>7-DAY HASSLE-FREE DOORSTEP EXCHANGE GUARANTEE</span>
          </span>
          <span className="flex items-center gap-3">
            <span className="text-accent">✦</span>
            <span>COMPLIMENTARY LUXURY GIFT PACKAGING</span>
          </span>
          <span className="flex items-center gap-3">
            <span className="text-accent">✦</span>
            <span>24/7 WHATSAPP CONCIERGE & STYLING ASSISTANCE</span>
          </span>

          {/* Repeat for seamless infinite scrolling loop */}
          <span className="flex items-center gap-3">
            <span className="text-accent">✦</span>
            <span>EXPRESS NATIONWIDE DELIVERY ACROSS PAKISTAN (2-4 DAYS)</span>
          </span>
          <span className="flex items-center gap-3">
            <span className="text-accent">✦</span>
            <span>100% ORIGINAL ARTISANAL DESIGNER LAWN & RAW SILKS</span>
          </span>
          <span className="flex items-center gap-3">
            <span className="text-accent">✦</span>
            <span>CASH ON DELIVERY (COD) AVAILABLE NATIONWIDE</span>
          </span>
          <span className="flex items-center gap-3">
            <span className="text-accent">✦</span>
            <span>7-DAY HASSLE-FREE DOORSTEP EXCHANGE GUARANTEE</span>
          </span>
          <span className="flex items-center gap-3">
            <span className="text-accent">✦</span>
            <span>COMPLIMENTARY LUXURY GIFT PACKAGING</span>
          </span>
          <span className="flex items-center gap-3">
            <span className="text-accent">✦</span>
            <span>24/7 WHATSAPP CONCIERGE & STYLING ASSISTANCE</span>
          </span>
        </div>
      </div>
    </div>
  )
}
