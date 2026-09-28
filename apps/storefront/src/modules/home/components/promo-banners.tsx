import React from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

interface PromoBannersProps {
  section?: {
    settings?: {
      banner_left?: {
        label?: string
        title?: string
        cta?: string
        link?: string
        image?: string
      }
      banner_right?: {
        label?: string
        title?: string
        cta?: string
        link?: string
        image?: string
      }
    }
  }
}

export default function PromoBanners({ section }: PromoBannersProps) {
  // Always guarantee high-res Pakistani fashion photography even if DB only had text/gradient
  const left = {
    label: section?.settings?.banner_left?.label || "Limited Edition",
    title: section?.settings?.banner_left?.title || "Summer Unstitched Lawn Edit",
    cta: section?.settings?.banner_left?.cta || "Shop Now",
    link: section?.settings?.banner_left?.link || "/store?category=unstitched",
    image:
      (section?.settings?.banner_left?.image && section.settings.banner_left.image.startsWith("http"))
        ? section.settings.banner_left.image
        : "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1400&q=85",
  }

  const right = {
    label: section?.settings?.banner_right?.label || "New Arrivals",
    title: section?.settings?.banner_right?.title || "Contemporary Pret & Co-ords",
    cta: section?.settings?.banner_right?.cta || "Discover",
    link: section?.settings?.banner_right?.link || "/store?category=women",
    image:
      (section?.settings?.banner_right?.image && section.settings.banner_right.image.startsWith("http"))
        ? section.settings.banner_right.image
        : "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1400&q=85",
  }

  return (
    <section className="py-16 sm:py-20 bg-stone-50 border-t border-stone-200/80 font-sans">
      <div className="content-container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10 sm:mb-12">
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-accent">
            Seasonal Spotlights
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-brand font-medium mt-1">
            Curated Pakistani Couture
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-2 font-light">
            Designed for celebrations and daily understated sophistication
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Left Banner */}
          <LocalizedClientLink
            href={left.link}
            className="group relative h-[420px] sm:h-[480px] p-8 sm:p-12 flex flex-col justify-end text-white overflow-hidden shadow-md rounded-xs"
          >
            {/* Background image with hover zoom */}
            <img
              src={left.image}
              alt={left.title}
              className="absolute inset-0 w-full h-full object-cover object-top sm:object-center transition-transform duration-700 ease-out group-hover:scale-105"
            />
            {/* Multi-gradient luxury overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent group-hover:from-black/90 transition-colors" />

            <div className="relative z-10 space-y-3">
              <span className="inline-block px-3 py-1 bg-accent text-brand text-[10px] font-bold uppercase tracking-[0.25em] shadow-sm">
                {left.label}
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-white leading-tight drop-shadow-md">
                {left.title}
              </h3>
              <div className="pt-1">
                <span className="inline-flex items-center gap-2 px-6 py-3 bg-white text-brand text-xs font-bold uppercase tracking-widest group-hover:bg-accent group-hover:text-white transition-all shadow-md">
                  <span>{left.cta}</span>
                  <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                </span>
              </div>
            </div>
          </LocalizedClientLink>

          {/* Right Banner */}
          <LocalizedClientLink
            href={right.link}
            className="group relative h-[420px] sm:h-[480px] p-8 sm:p-12 flex flex-col justify-end text-white overflow-hidden shadow-md rounded-xs"
          >
            {/* Background image with hover zoom */}
            <img
              src={right.image}
              alt={right.title}
              className="absolute inset-0 w-full h-full object-cover object-top sm:object-center transition-transform duration-700 ease-out group-hover:scale-105"
            />
            {/* Multi-gradient luxury overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent group-hover:from-black/90 transition-colors" />

            <div className="relative z-10 space-y-3">
              <span className="inline-block px-3 py-1 bg-white text-brand text-[10px] font-bold uppercase tracking-[0.25em] shadow-sm">
                {right.label}
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-white leading-tight drop-shadow-md">
                {right.title}
              </h3>
              <div className="pt-1">
                <span className="inline-flex items-center gap-2 px-6 py-3 bg-white text-brand text-xs font-bold uppercase tracking-widest group-hover:bg-accent group-hover:text-white transition-all shadow-md">
                  <span>{right.cta}</span>
                  <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                </span>
              </div>
            </div>
          </LocalizedClientLink>
        </div>
      </div>
    </section>
  )
}
