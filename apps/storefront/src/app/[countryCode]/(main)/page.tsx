import { Suspense } from "react"
import { Metadata } from "next"
import { getHomepageSections, HomepageSection } from "@lib/data/homepage"
import { getCatalog } from "@lib/data/catalog"
import { listProducts } from "@lib/data/products"
import NaqshHeroSlider from "@modules/home/components/naqsh-hero-slider"
import ShopDepartments from "@modules/home/components/shop-departments"
import FeaturedBrands from "@modules/home/components/featured-brands"
import FabricCategoryStrip from "@modules/home/components/fabric-category-strip"
import CustomerReviews from "@modules/home/components/customer-reviews"
import JournalPreview from "@modules/home/components/journal-preview"
import HomeArrival from "@modules/home/components/home-arrival"
import NaqshProductCard from "@modules/products/components/naqsh-product-card"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "NAQSH — Pakistani Fashion & Fabrics",
  description: "Discover Pakistani brands, new arrivals and favourite fabrics for women, men and kids.",
}

export const revalidate = 60

export default async function Home({ params }: { params: Promise<{ countryCode: string }> }) {
  const { countryCode } = await params
  const sections = await getHomepageSections()
  const section = (key: string, type?: string) => sections.find(item => item.key === key) || sections.find(item => item.type === type)
  const hero = section("hero", "hero_slider")
  const departments = section("departments", "cards_grid")
  const brands = section("featured_brands")
  const arrivals = section("new_arrivals") || section("curated_tabs", "product_carousel")
  const bestSellers = section("best_sellers")
  const categories = section("fabric_strip", "fabric_strip")
  const journal = section("journal", "lookbook")
  const reviews = section("customer_reviews", "customer_reviews")

  return <div className="flex w-full flex-col">
    <HomeArrival />
    <nav aria-label="Shop departments" className="mobile-home-departments"><LocalizedClientLink href="/categories/women">Women</LocalizedClientLink><LocalizedClientLink href="/categories/men">Men</LocalizedClientLink><LocalizedClientLink href="/categories/children">Kids</LocalizedClientLink></nav>
    {hero?.is_active !== false && <NaqshHeroSlider section={hero} />}
    {departments?.is_active !== false && <ShopDepartments section={departments} />}
    {brands?.is_active !== false && <FeaturedBrands section={brands} />}
    {arrivals?.is_active !== false && <Suspense fallback={<CollectionSkeleton />}><ProductSection countryCode={countryCode} sortBy="newest" title={arrivals?.title || "New Arrivals"} section={arrivals} /></Suspense>}
    {bestSellers?.is_active !== false && <Suspense fallback={<CollectionSkeleton />}><ProductSection countryCode={countryCode} sortBy="best-selling" title={bestSellers?.title || "Best Sellers"} section={bestSellers} /></Suspense>}
    {categories?.is_active !== false && <FabricCategoryStrip section={categories ? { ...categories, title: categories.title || "Shop By Category" } : undefined} />}
    {journal?.is_active !== false && <JournalPreview section={journal} />}
    {reviews?.is_active !== false && <CustomerReviews section={reviews} />}
  </div>
}

function CollectionSkeleton() {
  return <div className="content-container grid grid-cols-2 gap-4 py-12 sm:grid-cols-4" role="status" aria-label="Loading products">{[0, 1, 2, 3].map(index => <div key={index} className="aspect-[3/4] bg-stone-100 motion-safe:animate-pulse" />)}</div>
}

async function ProductSection({ countryCode, sortBy, title, section }: { countryCode: string; sortBy: string; title: string; section?: HomepageSection }) {
  const ids: string[] | undefined = section?.settings?.product_ids
  let products: any[]
  if (ids?.length || section?.collection_id) {
    const result = await listProducts({ countryCode, queryParams: { ...(ids?.length ? { id: ids } : { collection_id: [section!.collection_id!] }), limit: 8, fields: "*variants.calculated_price,*images" } })
    products = result.response.products
    if (ids?.length) products.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id))
  } else {
    products = (await getCatalog(countryCode, { sortBy })).products.slice(0, 8)
  }
  return <section className="content-container py-12 sm:py-16">
    <div className="mb-7 flex items-end justify-between gap-4"><div><p className="text-[10px] uppercase tracking-[0.25em] text-accent">{sortBy === "newest" ? "Just landed" : "Customer favourites"}</p><h2 className="mt-2 font-serif text-3xl text-brand sm:text-4xl">{title}</h2></div><LocalizedClientLink href={"/store?sortBy=" + sortBy} className="text-xs underline underline-offset-4">View all</LocalizedClientLink></div>
    {products.length ? <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-4 sm:gap-x-6">{products.map(product => <NaqshProductCard key={product.id} product={product} />)}</div> : <p className="py-8 text-sm text-stone-500">New pieces will be available here soon.</p>}
  </section>
}
