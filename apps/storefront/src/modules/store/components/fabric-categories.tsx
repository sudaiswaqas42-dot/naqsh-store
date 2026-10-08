import LocalizedClientLink from "@modules/common/components/localized-client-link"

export interface FabricCardData {
  handle: string
  label: string
  subtitle: string
  badge: string
  image: string
}

export const gentsFabricCards: FabricCardData[] = [
  {
    handle: "italian",
    label: "Italian Suiting",
    subtitle: "Executive Drape & Finish",
    badge: "PREMIUM",
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=600&q=85",
  },
  {
    handle: "boski",
    label: "Pure Boski",
    subtitle: "Heirloom Silk 4.5m Cut",
    badge: "PURE SILK",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=85",
  },
  {
    handle: "wash-wear",
    label: "Wash & Wear",
    subtitle: "Wrinkle-Resistant Weave",
    badge: "POPULAR",
    image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=600&q=85",
  },
  {
    handle: "wool",
    label: "Winter Wool",
    subtitle: "Warm Blend Suit Cuts",
    badge: "WARM WEAVE",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=85",
  },
  {
    handle: "kamalia-khaddar",
    label: "Kamalia Khadar",
    subtitle: "Authentic Handspun Texture",
    badge: "HERITAGE",
    image: "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?auto=format&fit=crop&w=600&q=85",
  },
]

export const ladiesFabricCards: FabricCardData[] = [
  {
    handle: "dhanak",
    label: "Dhanak",
    subtitle: "Warm Winter Textured Cut",
    badge: "WINTER WEAVE",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=85",
  },
  {
    handle: "khaddar",
    label: "Khadar",
    subtitle: "Traditional Handspun Weave",
    badge: "CLASSIC",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=85",
  },
  {
    handle: "linen",
    label: "Linen",
    subtitle: "Breathable Pure Slub",
    badge: "ALL-SEASON",
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=600&q=85",
  },
  {
    handle: "karandi",
    label: "KARANDI",
    subtitle: "Embroidered Winter Classic",
    badge: "EMBROIDERED",
    image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=85",
  },
  {
    handle: "silk",
    label: "Silk",
    subtitle: "Festive Medium & Raw Silk",
    badge: "FESTIVE",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=85",
  },
  {
    handle: "printed",
    label: "Printed",
    subtitle: "Digital & Block Floral Cuts",
    badge: "TRENDING",
    image: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=600&q=85",
  },
  {
    handle: "embroidery-waly",
    label: "Embroidery Waly",
    subtitle: "Intricate Tilla & Resham Work",
    badge: "LUXURY",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=85",
  },
  {
    handle: "2pc",
    label: "2pc",
    subtitle: "Shirt & Dupatta / Trouser",
    badge: "2-PIECE",
    image: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=600&q=85",
  },
  {
    handle: "3pc",
    label: "3pc",
    subtitle: "Complete 3-Piece Luxury Suit",
    badge: "3-PIECE",
    image: "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?auto=format&fit=crop&w=600&q=85",
  },
]

// Backwards compatibility mappings for any legacy imports
export const gentsFabrics = gentsFabricCards.map((c) => [c.handle, c.label])
export const ladiesFabrics = ladiesFabricCards.map((c) => [c.handle, c.label])

export default function FabricCategories({
  gender,
  brand,
  active = "",
}: {
  gender: "men" | "women"
  brand?: string
  active?: string
}) {
  const cards = gender === "men" ? gentsFabricCards : ladiesFabricCards
  const href = (handle: string) =>
    brand
      ? `/brands/${brand}?gender=${gender}${handle ? "&category=" + handle : ""}`
      : `/categories/${handle || gender}`

  return (
    <section
      className="border-b border-stone-200 bg-white py-8 sm:py-12"
      aria-label={gender === "men" ? "Gents fabric categories" : "Ladies fabric categories"}
    >
      <div className="content-container">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#B6975A]">
              <span>Featured Fabrics</span>
              <span>•</span>
              <span>{gender === "men" ? "Gents Unstitched" : "Ladies Unstitched"}</span>
            </div>
            <h2 className="mt-1 font-serif text-2xl text-stone-900 sm:text-3xl">
              {gender === "men" ? "Gents" : "Ladies"} Categories
            </h2>
            <p className="mt-1 text-xs text-stone-500 sm:text-sm">
              Explore authentic unstitched cuts tailored for every seasonal occasion
            </p>
          </div>

          {active ? (
            <LocalizedClientLink
              href={href("")}
              className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-stone-50 px-4 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-100"
            >
              <span>Showing: <strong className="capitalize text-stone-900">{active.replace(/-/g, " ")}</strong></span>
              <span className="text-stone-400">✕ Clear</span>
            </LocalizedClientLink>
          ) : (
            <LocalizedClientLink
              href={href("")}
              className="text-xs font-medium text-stone-600 underline underline-offset-4 transition hover:text-stone-900"
            >
              View all {gender === "men" ? "gents" : "ladies"} cuts →
            </LocalizedClientLink>
          )}
        </div>

        {/* Categories Cards Carousel / Grid */}
        <div className="relative flex gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar sm:gap-6">
          {cards.map((item) => {
            const isSelected = active.toLowerCase() === item.handle.toLowerCase()

            return (
              <LocalizedClientLink
                key={item.handle}
                href={href(item.handle)}
                aria-current={isSelected ? "page" : undefined}
                className="group relative flex w-36 shrink-0 flex-col overflow-hidden rounded-2xl border bg-stone-50 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:w-48 lg:w-52"
                style={{
                  borderColor: isSelected ? "#B6975A" : "rgba(229, 231, 235, 0.8)",
                  boxShadow: isSelected
                    ? "0 10px 25px -5px rgba(182, 151, 90, 0.35), 0 8px 10px -6px rgba(182, 151, 90, 0.2)"
                    : undefined,
                }}
              >
                {/* Image Container with Dark Overlay */}
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-100">
                  <img
                    src={item.image}
                    alt={item.label}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                  {/* Top Badge */}
                  <div className="absolute left-2.5 top-2.5 z-10">
                    <span className="rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                      {item.badge}
                    </span>
                  </div>

                  {/* Selection Indicator Checkmark */}
                  {isSelected && (
                    <div className="absolute right-2.5 top-2.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[#B6975A] text-white shadow-md">
                      <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}

                  {/* Bottom Text Over Image */}
                  <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                    <h3 className="font-serif text-sm font-semibold text-white drop-shadow-sm sm:text-base">
                      {item.label}
                    </h3>
                    <p className="mt-0.5 line-clamp-1 text-[11px] text-stone-200 font-light">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                {/* Bottom Active Strip */}
                <div
                  className={`flex items-center justify-between border-t px-3 py-2 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                    isSelected
                      ? "border-[#B6975A]/30 bg-[#B6975A]/10 text-[#8C6D34]"
                      : "border-stone-100 bg-white text-stone-500 group-hover:text-[#B6975A]"
                  }`}
                >
                  <span>{isSelected ? "Selected" : "Browse"}</span>
                  <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </div>
              </LocalizedClientLink>
            )
          })}
        </div>
      </div>
    </section>
  )
}
