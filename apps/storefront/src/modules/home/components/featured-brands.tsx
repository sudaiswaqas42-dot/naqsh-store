"use client"

import { useEffect, useRef, useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

import { HomepageSection } from "@lib/data/homepage"

const defaultBrands = [
  { name: "Khaadi", handle: "khaadi", image: "khaadi.svg" },
  { name: "Sapphire", handle: "sapphire", image: "sapphire.svg" },
  { name: "Gul Ahmed", handle: "gul-ahmed", image: "gul-ahmed.svg" },
  { name: "J.", handle: "j-dot", image: "j.svg" },
  { name: "Alkaram", handle: "alkaram", image: "alkaram.png" },
  { name: "Limelight", handle: "limelight", image: "limelight.svg" },
]

export default function FeaturedBrands({ section }: { section?: HomepageSection }) {
  const rail = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)
  const [active, setActive] = useState(0)
  const position = useRef(0)
  const jump = (index: number) => {
    const element = rail.current
    if (!element || element.children.length < 2) return
    const stride = (element.children[1] as HTMLElement).offsetLeft - (element.children[0] as HTMLElement).offsetLeft
    position.current = index
    setActive(index)
    element.scrollTo({ left: index * stride, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" })
  }

  const displayBrands = (section?.settings?.cards && section.settings.cards.length > 0)
    ? section.settings.cards.map((c: any) => ({
        name: c.title || "Brand",
        handle: c.link?.replace("/brands/", "") || c.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        image: c.image_url?.startsWith("/images/brands/") ? c.image_url.replace("/images/brands/", "") : c.image_url,
      }))
    : defaultBrands

  useEffect(() => {
    if (paused || displayBrands.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let reset: ReturnType<typeof setTimeout>
    const timer = setInterval(() => {
      const element = rail.current
      if (!element || element.children.length < 2 || document.hidden) return
      const stride = (element.children[1] as HTMLElement).offsetLeft - (element.children[0] as HTMLElement).offsetLeft
      position.current += 1
      setActive(position.current % displayBrands.length)
      element.scrollTo({ left: position.current * stride, behavior: "smooth" })
      if (position.current >= displayBrands.length) {
        reset = setTimeout(() => {
          element.scrollTo({ left: 0, behavior: "instant" })
          position.current = 0
        }, 650)
      }
    }, 1000)
    return () => { clearInterval(timer); clearTimeout(reset) }
  }, [paused, displayBrands.length])

  return (
    <section className="bg-[#FAF9F6] py-12 sm:py-16" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setPaused(false) }}>
      <div className="content-container">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-accent">Discover your favourites</p>
            <h2 className="mt-2 font-serif text-3xl text-brand sm:text-4xl">{section?.title || "Featured Brands"}</h2>
            <p className="mt-2 text-sm text-stone-500">{section?.subtitle || "Explore Pakistan's favourite labels, all in one place."}</p>
          </div>

        </div>
        <div ref={rail} onTouchStart={() => setPaused(true)} onTouchEnd={() => setPaused(false)} className="relative flex gap-6 overflow-x-auto pb-3 no-scrollbar sm:gap-10">
          {[...displayBrands, ...displayBrands].map((brand: any, index: number) => (
            <LocalizedClientLink key={brand.name + index} aria-hidden={index >= displayBrands.length ? true : undefined} tabIndex={index >= displayBrands.length ? -1 : 0} href={"/brands/" + brand.handle} className="group w-36 shrink-0 snap-start text-center sm:w-48 lg:w-56">
              <div className="flex aspect-square items-center justify-center rounded-full border-[5px] border-[#EDE5CE] bg-white p-6 shadow-sm transition-colors group-hover:border-accent sm:p-8">
                <img
                  src={brand.image.startsWith("http") || brand.image.startsWith("/") ? brand.image : "/images/brands/" + brand.image}
                  alt={brand.name + " logo"}
                  width={180}
                  height={100}
                  loading="lazy"
                  className="max-h-20 w-full object-contain"
                />
              </div>
              <h3 className="mt-4 font-serif text-lg text-brand">{brand.name}</h3>
              <p className="mt-1 text-xs text-stone-500">Explore collection</p>
            </LocalizedClientLink>
          ))}
        </div>
        <div className="mt-5 flex justify-center gap-1" aria-label="Choose featured brand">{displayBrands.map((brand: any, index: number) => <button key={brand.handle} onClick={() => jump(index)} aria-label={"Show " + brand.name} aria-current={active === index ? "true" : undefined} className="flex h-7 w-7 items-center justify-center"><span className={"h-2 rounded-full transition-all " + (active === index ? "w-5 bg-brand" : "w-2 bg-stone-300")} /></button>)}</div>
      </div>
    </section>
  )
}
