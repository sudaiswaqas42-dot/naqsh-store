import "server-only"
import { getRegion } from "./regions"
import { CatalogProduct } from "@lib/util/catalog"

export type CatalogQuery = Record<string, string | string[] | undefined>
const fields =
  "id,title,handle,thumbnail,created_at,material,metadata,*collection,*categories,*options,*variants.options,*variants.calculated_price,+variants.inventory_quantity,variants.id,variants.title,variants.manage_inventory,variants.allow_backorder"

const DEFAULT_PUBLISHABLE_KEY = "pk_f5e00e96956d20bf784d23ee9052f3bf80ebab9ad4b48167b399385c4fea50a0"
const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

const DEFAULT_FACETS = {
  sizes: ["XS", "S", "M", "L", "XL", "Free Size", "Unstitched"],
  colors: ["Black", "Crimson", "Emerald", "Gold", "Ivory", "Midnight Blue", "Mustard", "Navy", "Rose", "Teal"],
  fabrics: ["Chiffon", "Cotton", "Jacquard", "Khaddar", "Lawn", "Organza", "Raw Silk", "Silk", "Velvet"],
}

export async function getCatalog(
  countryCode: string,
  query: CatalogQuery = {},
  scope: { categoryIds?: string[]; collectionId?: string; isSalePage?: boolean } = {}
) {
  const region = await getRegion(countryCode)
  if (!region) throw new Error("Shopping region is unavailable")

  const value = (key: string) => {
    const item = query[key]
    return Array.isArray(item) ? item[0] || "" : item || ""
  }
  const selected = (key: string) => value(key).split(",").filter(Boolean)

  const page = Math.max(1, Math.floor(Number(value("page"))) || 1)
  const limit = 12
  const offset = (page - 1) * limit

  const pubKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || DEFAULT_PUBLISHABLE_KEY
  const searchParams = new URLSearchParams()
  searchParams.set("region_id", region.id)
  searchParams.set("limit", String(limit))
  searchParams.set("offset", String(offset))
  searchParams.set("fields", fields)

  // Order
  const sort = value("sortBy") || "newest"
  if (sort === "title-asc") {
    searchParams.set("order", "title")
  } else {
    searchParams.set("order", "-created_at")
  }

  // Search query
  const term = value("q").trim()
  if (term) {
    searchParams.set("q", term)
  }

  // Category filter
  const targetCategoryIds = scope.categoryIds?.length
    ? scope.categoryIds
    : selected("category")

  if (targetCategoryIds.length > 0) {
    for (const catId of targetCategoryIds) {
      searchParams.append("category_id[]", catId)
    }
  }

  // Collection filter
  if (scope.collectionId) {
    searchParams.set("collection_id", scope.collectionId)
  } else if (selected("collection").length > 0) {
    searchParams.set("collection_id", selected("collection")[0])
  }

  try {
    const response = await fetch(`${MEDUSA_URL}/store/products?${searchParams.toString()}`, {
      headers: {
        "x-publishable-api-key": pubKey,
      },
      next: { revalidate: 30, tags: ["products", "catalog"] },
      signal: AbortSignal.timeout(6000),
    })

    if (!response.ok) {
      console.warn("Direct catalog fetch returned status:", response.status)
      return { products: [], count: 0, page, facets: DEFAULT_FACETS }
    }

    const data = await response.json()
    const rawProducts = data.products || []
    let count = typeof data.count === "number" ? data.count : rawProducts.length

    let products: CatalogProduct[] = rawProducts.map((product: any) => ({
      id: product.id,
      title: product.title,
      handle: product.handle,
      thumbnail: product.thumbnail,
      created_at: product.created_at,
      material: product.material,
      metadata: product.metadata,
      collection: product.collection && {
        id: product.collection.id,
        title: product.collection.title,
      },
      categories: product.categories?.map((category: any) => ({
        id: category.id,
        name: category.name,
      })),
      options: product.options?.map((option: any) => ({
        id: option.id,
        title: option.title,
      })),
      variants: product.variants?.map((variant: any) => ({
        id: variant.id,
        title: variant.title,
        manage_inventory: variant.manage_inventory,
        allow_backorder: variant.allow_backorder,
        inventory_quantity: variant.inventory_quantity ?? 100,
        options: variant.options?.map((option: any) => ({
          value: option.value,
          option_id: option.option_id,
        })),
        calculated_price: variant.calculated_price && {
          calculated_amount: variant.calculated_price.calculated_amount,
          original_amount: variant.calculated_price.original_amount,
          currency_code: variant.calculated_price.currency_code,
        },
      })),
    }))

    // If on End of Season Sale page, strictly show only products with sale status
    if (scope.isSalePage || value("sale") === "1") {
      products = products.filter((p) => p.metadata?.is_sale === true)
      // Approximate total sale count based on 28% of total catalog
      count = Math.round(count * 0.28)
    }

    return { products, count, page, facets: DEFAULT_FACETS }
  } catch (err) {
    console.error("Catalog fetch error:", err)
    return { products: [], count: 0, page, facets: DEFAULT_FACETS }
  }
}
