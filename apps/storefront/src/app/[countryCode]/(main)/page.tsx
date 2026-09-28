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

  // Default section blueprints if database has none
  const defaultSections: HomepageSection[] = [
    {
      id: "sec-hero",
      key: "hero",
      type: "hero_slider",
      title: "Dressed in Quiet Luxury",
      subtitle: "Handcrafted fabrics. Refined silhouettes. Elegance that whispers rather than shouts.",
      cta_text: "Explore Collection",
      cta_link: "/store",
      collection_id: null,
      rank: 0,
      is_active: true,
      settings: null,
    },
    {
      id: "sec-features",
      key: "features",
      type: "features_strip",
      title: "Our Guarantees",
      subtitle: "The NAQSH shopping experience",
      cta_text: null,
      cta_link: null,
      collection_id: null,
      rank: 1,
      is_active: true,
      settings: null,
    },
    {
      id: "sec-categories",
      key: "categories",
      type: "featured_categories",
      title: "Find Your Perfect Style",
      subtitle: "From unstitched luxury fabrics to ready-to-wear kurtas",
      cta_text: null,
      cta_link: null,
      collection_id: null,
      rank: 2,
      is_active: true,
      settings: null,
    },
    {
      id: "sec-curated",
      key: "curated",
      type: "product_carousel",
      title: "Curated for You",
      subtitle: "Hand-selected pieces from our latest designer collections",
      cta_text: "View All Products",
      cta_link: "/store",
      collection_id: null,
      rank: 3,
      is_active: true,
      settings: null,
    },
    {
      id: "sec-gala-banner",
      key: "gala_banner",
      type: "sale_banner",
      title: "Flat 20% Off Ready-to-Wear & Luxury Pret",
      subtitle: "Hand-spun pashmina wraps, pure chiffon dupattas, and intricate zari embroideries. Applicable at checkout.",
      cta_text: "Shop The Gala →",
      cta_link: "/store",
      collection_id: null,
      rank: 4,
      is_active: true,
      settings: {
        badge: "Limited Time Festive Gala",
        promo_code: "LUXE20",
        hours: 5,
        minutes: 41,
        seconds: 12,
      },
    },
    {
      id: "sec-banners",
      key: "banners",
      type: "promo_banner",
      title: "Seasonal Spotlights",
      subtitle: "Exclusive limited drops",
      cta_text: null,
      cta_link: null,
      collection_id: null,
      rank: 5,
      is_active: true,
      settings: null,
    },
    {
      id: "sec-lookbook",
      key: "lookbook",
      type: "lookbook",
      title: "The NAQSH Lookbook",
      subtitle: "Effortless styling across every season",
      cta_text: null,
      cta_link: null,
      collection_id: null,
      rank: 6,
      is_active: true,
      settings: null,
    },
    {
      id: "sec-reviews",
      key: "reviews",
      type: "customer_reviews",
      title: "Loved by Thousands",
      subtitle: "Real feedback from verified shoppers across Pakistan who trust NAQSH for celebratory moments.",
      cta_text: null,
      cta_link: null,
      collection_id: null,
      rank: 7,
      is_active: true,
      settings: null,
    },
    {
      id: "sec-fabric",
      key: "fabric",
      type: "fabric_strip",
      title: "Curated Fabric Strips",
      subtitle: null,
      cta_text: null,
      cta_link: null,
      collection_id: null,
      rank: 8,
      is_active: true,
      settings: null,
    },
    {
      id: "sec-instagram",
      key: "instagram",
      type: "instagram_feed",
      title: "Follow Our Journey",
      subtitle: "@itx_shk_selfish",
      cta_text: null,
      cta_link: null,
      collection_id: null,
      rank: 9,
      is_active: true,
      settings: null,
    },
  ]

  // Use backend sections connected to admin panel. Fallback to default sections only if backend has zero sections.
  let allSections: HomepageSection[] = []
  if (backendSections && backendSections.length > 0) {
    allSections = [...backendSections]
  } else {
    allSections = [...defaultSections]
  }

  // Deduplicate strictly: each section type should only appear once on the homepage
  const seenTypes = new Set<string>()
  allSections = allSections.filter((sec) => {
    if (sec.type === "cards_grid" || sec.type === "custom_cards") {
      return true
    }
    if (seenTypes.has(sec.type)) {
      return false // Remove doubling!
    }
    seenTypes.add(sec.type)
    return true
  })

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
          case "flash_sale":
            return (
              <FlashSaleCountdown
                key={sec.id}
                badge={sec.settings?.badge || "Limited Time Festive Gala"}
                headline={sec.title || "Flat 20% Off Ready-to-Wear & Luxury Pret"}
                subtitle={sec.subtitle || "Hand-spun pashmina wraps, pure chiffon dupattas, and intricate zari embroideries. Applicable at checkout."}
                code={sec.settings?.promo_code || "LUXE20"}
                ctaText={sec.cta_text || "Shop The Gala →"}
                ctaLink={sec.cta_link || "/store"}
                initialHours={sec.settings?.hours || 5}
                initialMinutes={sec.settings?.minutes || 41}
                initialSeconds={sec.settings?.seconds || 12}
              />
            )

          case "cards_grid":
          case "custom_cards":
            return (
              <DynamicCardsGrid
                key={sec.id}
                title={sec.title}
                subtitle={sec.subtitle || undefined}
                cta_text={sec.cta_text || undefined}
                cta_link={sec.cta_link || undefined}
                cards={sec.settings?.cards || []}
              />
            )

          case "product_carousel":
            return (
              <Suspense key={sec.id} fallback={<div className="h-96 bg-stone-50 animate-pulse" aria-label="Loading collection" />}>
                <CuratedSection section={sec} productsPromise={productsPromise} collectionsPromise={collectionsPromise} />
              </Suspense>
            )

          case "promo_banner":
            return <PromoBanners key={sec.id} section={sec} />

          case "lookbook":
            return <LookbookSection key={sec.id} />

          case "customer_reviews":
            return <CustomerReviews key={sec.id} />

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
                  subtitle={sec.subtitle || undefined}
                  cta_text={sec.cta_text || undefined}
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

async function CuratedSection({ section, productsPromise, collectionsPromise }: {
  section: HomepageSection
  productsPromise: ReturnType<typeof listProducts>
  collectionsPromise: ReturnType<typeof listCollections>
}) {
  const [products, collections, sales] = await Promise.all([productsPromise, collectionsPromise, getSalesConfig()])
  return <CuratedProductTabs section={section} products={products.response.products} collections={collections.collections} sales={sales} />
}


