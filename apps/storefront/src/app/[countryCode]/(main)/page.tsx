import { Suspense } from "react"
import { Metadata } from "next"
import { getHomepageSections, HomepageSection } from "@lib/data/homepage"
import { listProducts } from "@lib/data/products"
import { listCollections } from "@lib/data/collections"
import NaqshHeroSlider from "@modules/home/components/naqsh-hero-slider"
import FeaturesStrip from "@modules/home/components/features-strip"
import FabricCategoryStrip from "@modules/home/components/fabric-category-strip"
import FlashSaleCountdown from "@modules/home/components/flash-sale-countdown"
import CategoryGrid from "@modules/home/components/category-grid"
import CuratedProductTabs from "@modules/home/components/curated-product-tabs"
import PromoBanners from "@modules/home/components/promo-banners"
import LookbookSection from "@modules/home/components/lookbook-section"
import CustomerReviews from "@modules/home/components/customer-reviews"
import InstagramFeed from "@modules/home/components/instagram-feed"
import RecentlyViewedPopup from "@modules/home/components/recently-viewed-popup"

import DynamicCardsGrid from "@modules/home/components/dynamic-cards-grid"

export const metadata: Metadata = {
  title: "NAQSH — Pakistani Luxury Pret & Haute Couture",
  description:
    "Artisanal lawn, pure silks, and intricate embroideries. Explore the Summer '25 Collection and Festive Formals.",
}

export const revalidate = 60

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params

  const backendSections = await getHomepageSections()
  const productsPromise = listProducts({
    countryCode,
    queryParams: { limit: 12, fields: "*variants.calculated_price,+variants.inventory_quantity,*variants.options,*images,*categories,*collection" },
  })
  const collectionsPromise = listCollections()

  const allSections: HomepageSection[] = [...backendSections]

  // Sort strictly by rank ASC
  allSections.sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))

  return (
    <div className="flex flex-col w-full">
      {allSections.map((sec) => {
        if (!sec.is_active) return null

        switch (sec.type) {
          case "hero_slider":
            return <NaqshHeroSlider key={sec.id} section={sec} />

          case "features_strip":
            return <FeaturesStrip key={sec.id} section={sec} />

          case "featured_categories":
            return <CategoryGrid key={sec.id} section={sec} />

          case "sale_banner":
          case "flash_sale": {
            const endsAt: string | null = sec.settings?.ends_at || null
            if (!endsAt || new Date(endsAt).getTime() <= Date.now()) {
              return null
            }
            return (
              <FlashSaleCountdown
                key={sec.id}
                badge={sec.settings?.badge ?? "Limited Time Festive Gala"}
                headline={sec.title ?? "Flat 20% Off Ready-to-Wear & Luxury Pret"}
                subtitle={sec.subtitle ?? "Hand-spun pashmina wraps, pure chiffon dupattas, and intricate zari embroideries. Applicable at checkout."}
                code={sec.settings?.promo_code ?? "LUXE20"}
                ctaText={sec.cta_text ?? "Shop The Gala"}
                ctaLink={sec.cta_link || "/store"}
                endsAt={endsAt}
                imageUrl={sec.settings?.image_url}
              />
            )
          }

          case "cards_grid":
          case "custom_cards":
            return (
              <DynamicCardsGrid
                key={sec.id}
                title={sec.title}
                eyebrow={sec.settings?.eyebrow}
                subtitle={sec.subtitle ?? undefined}
                cta_text={sec.cta_text ?? undefined}
                cta_link={sec.cta_link || undefined}
                cards={sec.settings?.cards || []}
              />
            )

          case "product_carousel":
            return (
              <Suspense key={sec.id} fallback={<div className="h-96 bg-stone-50 animate-pulse" aria-label="Loading collection" />}>
                <CuratedSection section={sec} countryCode={countryCode} productsPromise={productsPromise} collectionsPromise={collectionsPromise} />
              </Suspense>
            )

          case "promo_banner":
            return <PromoBanners key={sec.id} section={sec} />

          case "lookbook":
            return <LookbookSection key={sec.id} section={sec} />

          case "customer_reviews":
            return <CustomerReviews key={sec.id} section={sec} />

          case "fabric_strip":
            return <FabricCategoryStrip key={sec.id} section={sec} />

          case "instagram_feed":
            return <InstagramFeed key={sec.id} section={sec} />

          default:
            // Custom or unrecognized section with custom cards
            if (sec.settings?.cards && sec.settings.cards.length > 0) {
              return (
                <DynamicCardsGrid
                  key={sec.id}
                  title={sec.title}
                eyebrow={sec.settings?.eyebrow}
                  subtitle={sec.subtitle ?? undefined}
                  cta_text={sec.cta_text ?? undefined}
                  cta_link={sec.cta_link || undefined}
                  cards={sec.settings.cards}
                />
              )
            }
            return null
        }
      })}

      {/* Floating Recently Viewed Popup */}
      <RecentlyViewedPopup />
    </div>
  )
}

import { getSalesConfig } from "@lib/data/sales"

async function CuratedSection({ section, countryCode, productsPromise, collectionsPromise }: {
  section: HomepageSection
  countryCode: string
  productsPromise: ReturnType<typeof listProducts>
  collectionsPromise: ReturnType<typeof listCollections>
}) {
  const ids: string[] | undefined = section.settings?.product_ids
  const selectedPromise = ids ? (ids.length ? listProducts({ countryCode, queryParams: { id: ids, limit: ids.length } }) : Promise.resolve({ response: { products: [] } })) : section.collection_id ? listProducts({ countryCode, queryParams: { collection_id: [section.collection_id], limit: 100 } }) : productsPromise
  const [products, collections, sales] = await Promise.all([selectedPromise, collectionsPromise, getSalesConfig()])
  if (ids) products.response.products.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id))
  return <CuratedProductTabs section={section} products={products.response.products} collections={collections.collections} sales={sales} />
}


