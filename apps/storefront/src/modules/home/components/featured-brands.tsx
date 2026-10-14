"use client"

import { useLoopingRail } from "@lib/hooks/use-looping-rail"
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
  const displayBrands = (section?.settings?.cards && section.settings.cards.length > 0)
    ? section.settings.cards.map((c: any) => ({
        name: c.title || "Brand",
        handle: c.link?.replace("/brands/", "") || c.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        image: c.image_url?.startsWith("/images/brands/") ? c.image_url.replace("/images/brands/", "") : c.image_url,
      }))
    : defaultBrands

  const { rail, active, jump, interactions } = useLoopingRail(displayBrands.length)

  return (
    <section className="bg-[#FAF9F6] py-12 sm:py-16">
      <div className="content-container">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-accent">Discover your favourites</p>
            <h2 className="mt-2 font-serif text-3xl text-brand sm:text-4xl">{section?.title || "Featured Brands"}</h2>
            <p className="mt-2 text-sm text-stone-500">{section?.subtitle || "Explore Pakistan's favourite labels, all in one place."}</p>
          </div>

        </div>
        <div className="relative">
          {/* Soft shadow / fade cut on the right edge so brand cards don't have a sharp cut */}
          <div className="pointer-events-none absolute -top-4 -bottom-4 right-0 z-10 w-24 sm:w-44 bg-gradient-to-l from-[#FAF9F6] via-[#FAF9F6]/85 to-transparent" />
          <div className="pointer-events-none absolute -top-4 -bottom-4 left-0 z-10 w-12 sm:w-24 bg-gradient-to-r from-[#FAF9F6] to-transparent" />

          <div ref={rail} {...interactions} className="relative flex gap-6 overflow-x-auto pb-3 no-scrollbar sm:gap-10">
            {[...displayBrands, ...displayBrands, ...displayBrands, ...displayBrands].map((brand: any, index: number) => (
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
        </div>
        <div className="mt-5 flex justify-center gap-1" aria-label="Choose featured brand">{displayBrands.map((brand: any, index: number) => <button key={brand.handle} onClick={() => jump(index)} aria-label={"Show " + brand.name} aria-current={active === index ? "true" : undefined} className="flex h-7 w-7 items-center justify-center"><span className={"h-2 rounded-full transition-all " + (active === index ? "w-5 bg-brand" : "w-2 bg-stone-300")} /></button>)}</div>
      </div>
    </section>
  )
}
