import BrandDepartments from "@modules/store/components/brand-departments"
import FabricCategories from "@modules/store/components/fabric-categories"
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { CatalogQuery, getCatalog } from "@lib/data/catalog"
import CatalogGridView from "@modules/store/components/catalog-grid-view"
import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

interface BrandInfo {
  name: string
  handle: string
  subtitle: string
  image: string
  coverImage: string
}

const BRANDS_DIRECTORY: Record<string, BrandInfo> = {
  khaadi: {
    name: "Khaadi",
    handle: "khaadi",
    subtitle: "Artisanal unstitched fabrics, signature prints, and heritage embroidery.",
    image: "khaadi.svg",
    coverImage: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1600&q=85",
  },
  sapphire: {
    name: "Sapphire",
    handle: "sapphire",
    subtitle: "Luxury lawn, daily unstitched cuts, silk dupattas, and seasonal formal edits.",
    image: "sapphire.svg",
    coverImage: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1600&q=85",
  },
  "gul-ahmed": {
    name: "Gul Ahmed",
    handle: "gul-ahmed",
    subtitle: "Timeless lawn, fine latha, executive wash & wear, and heirloom unstitched collections.",
    image: "gul-ahmed.svg",
    coverImage: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1600&q=85",
  },
  "j-dot": {
    name: "J. Junaid Jamshed",
    handle: "j-dot",
    subtitle: "Pure Boski, executive wash & wear suit lengths, and traditional festive eastern fabrics.",
    image: "j.svg",
    coverImage: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1600&q=85",
  },
  j: {
    name: "J. Junaid Jamshed",
    handle: "j-dot",
    subtitle: "Pure Boski, executive wash & wear suit lengths, and traditional festive eastern fabrics.",
    image: "j.svg",
    coverImage: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1600&q=85",
  },
  alkaram: {
    name: "Alkaram Studio",
    handle: "alkaram",
    subtitle: "Exquisite embroidered 3-piece luxury lawn, digital prints, and premium winter weaves.",
    image: "alkaram.png",
    coverImage: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=1600&q=85",
  },
  limelight: {
    name: "Limelight",
    handle: "limelight",
    subtitle: "Contemporary eastern silhouettes, vibrant unstitched cuts, and trendy festive ensembles.",
    image: "limelight.svg",
    coverImage: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=85",
  },
}

type Props = {
  params: Promise<{ brand: string; countryCode: string }>
  searchParams: Promise<CatalogQuery>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brand } = await params
  const brandData = BRANDS_DIRECTORY[brand.toLowerCase()]
  if (!brandData) {
    return { title: "Brands | NAQSH" }
  }
  return {
    title: `${brandData.name} Collection | NAQSH`,
    description: brandData.subtitle,
  }
}

export default async function BrandPage({ params, searchParams }: Props) {
  const [{ brand, countryCode }, query] = await Promise.all([params, searchParams])
  const brandKey = brand.toLowerCase()
  const brandData = BRANDS_DIRECTORY[brandKey]

  if (!brandData) {
    notFound()
  }

  const genderFilter = typeof query.gender === "string" ? query.gender.toLowerCase() : ""

  // Query catalog using brand search term and optional gender filter
  const effectiveQuery: CatalogQuery = {
    ...query,
    brand: brandData.handle,
    gender: ["men", "women"].includes(genderFilter) ? genderFilter : "",
  }

  const [result, categories, collections] = await Promise.all([
    getCatalog(countryCode, effectiveQuery),
    listCategories().catch(() => []),
    listCollections().catch(() => ({ collections: [], count: 0 })),
  ])

  const displayProducts = result.products
  const displayCount = result.count
  const pages = Math.ceil(displayCount / 12) || 1

  return (
    <main className="bg-[#FAF9F6] min-h-[75vh]">
      {/* Brand Hero Banner */}
      <section className="relative overflow-hidden min-h-[300px] sm:min-h-[360px] md:min-h-[400px] flex items-center justify-center border-b border-[#B6975A]/30">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
          style={{ backgroundImage: `url('${brandData.coverImage}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#081B14] via-[#0F2D22]/85 to-black/60" />
        <div className="absolute inset-0 bg-radial from-transparent via-[#081B14]/40 to-[#081B14]/80 pointer-events-none" />

        <div className="content-container mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 relative z-10 text-center">
          {/* Brand Logo & Pill */}
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-[#B6975A]/40 mb-4 shadow-xs">
            <img
              src={`/images/brands/${brandData.image}`}
              alt={brandData.name}
              className="h-5 w-auto object-contain brightness-0 invert"
            />
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#FAF9F6]">
              Featured Brand Partner
            </span>
          </div>

          {/* Grand Brand Name */}
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl text-white font-normal drop-shadow-md tracking-tight">
            {brandData.name}
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm md:text-base text-stone-200 leading-relaxed max-w-2xl mx-auto mt-3 font-light drop-shadow-2xs">
            {brandData.subtitle}
          </p>


        </div>
      </section>

      <BrandDepartments brand={brandData.handle} selected={genderFilter} />
      {genderFilter === "men" && (
        <FabricCategories gender="men" brand={brandData.handle} active={String(query.category || "")} />
      )}
      {genderFilter === "women" && (
        <FabricCategories gender="women" brand={brandData.handle} active={String(query.category || "")} />
      )}
      {!genderFilter && (
        <>
          <FabricCategories gender="women" brand={brandData.handle} active={String(query.category || "")} />
          <FabricCategories gender="men" brand={brandData.handle} active={String(query.category || "")} />
        </>
      )}

      {/* Product Cards Grid */}
      <CatalogGridView
        products={displayProducts}
        count={displayCount}
        categories={categories.map((c) => ({ id: c.id, label: c.name }))}
        collections={collections.collections.map((c) => ({ id: c.id, label: c.title }))}
        facets={result.facets}
        page={result.page}
        pages={pages}
        query={effectiveQuery}
      />
    </main>
  )
}
