import "server-only"
import { matchesCatalogScope } from "@lib/util/catalog-scope"
import { getRegion, listRegions } from "./regions"
import { listCategories } from "./categories"
import { CatalogProduct, productPrice, optionValues, matchesVariantFilters, isDiscounted } from "@lib/util/catalog"

export type CatalogQuery = Record<string, string | string[] | undefined>
const fields =
  "id,title,handle,thumbnail,created_at,material,metadata,*collection,*categories,*images,*options,*options.values,*variants.options,*variants.calculated_price,+variants.inventory_quantity,variants.id,variants.title,variants.manage_inventory,variants.allow_backorder"

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

// Fast in-memory cache for scanned catalogs (TTL: 60s) to make filter clicks instant
interface CatalogCacheEntry {
  rawProducts: any[]
  totalCount: number
  timestamp: number
}

const GLOBAL_CATALOG_CACHE: Map<string, CatalogCacheEntry> =
  (globalThis as any).__NAQSH_CATALOG_CACHE__ || new Map()
;(globalThis as any).__NAQSH_CATALOG_CACHE__ = GLOBAL_CATALOG_CACHE
const CACHE_TTL_MS = 60 * 1000 // 60 seconds

// Concurrency pool helper for parallel batch loading
async function runWithConcurrency<T>(tasks: (() => Promise<T>)[], concurrency = 5): Promise<T[]> {
  const results: T[] = new Array(tasks.length)
  let index = 0
  const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, async () => {
    while (index < tasks.length) {
      const currentIndex = index++
      results[currentIndex] = await tasks[currentIndex]()
    }
  })
  await Promise.all(workers)
  return results
}

export async function getCatalog(
  countryCode: string,
  query: CatalogQuery = {},
  scope: { categoryIds?: string[]; collectionId?: string; isSalePage?: boolean } = {}
) {
  let region = await getRegion(countryCode).catch(() => null)
  if (!region || !region.id) {
    const regions = await listRegions().catch(() => [])
    region = regions?.[0] || null
  }
  if (!region || !region.id) {
    region = { id: "reg_01M3EW98QY2SGP87H13WFBDRM5", currency_code: "pkr" } as any
  }

  const value = (key: string) => {
    const item = query[key]
    return Array.isArray(item) ? item[0] || "" : item || ""
  }
  const selected = (key: string) => value(key).split(",").filter(Boolean)

  const page = Math.max(1, Math.floor(Number(value("page"))) || 1)
  const limit = 12
  const offset = (page - 1) * limit

  const pubKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
  const searchParams = new URLSearchParams()
  if (region?.id) {
    searchParams.set("region_id", region.id)
  }
  const effectiveFields = region?.id
    ? fields
    : fields.replace(",*variants.calculated_price", "")
  searchParams.set("fields", effectiveFields)

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
  let targetCategoryIds = scope.categoryIds || []
  if (selected("category").length) {
    const categories = await listCategories().catch(() => [])
    const wanted = selected("category")
    const ids = new Set(
      categories
        .filter((category) => wanted.includes(category.id) || wanted.includes(category.handle))
        .map((category) => category.id)
    )
    let expanded = true
    while (expanded) {
      expanded = false
      for (const category of categories) {
        if (category.parent_category_id && ids.has(category.parent_category_id) && !ids.has(category.id)) {
          ids.add(category.id)
          expanded = true
        }
      }
    }
    targetCategoryIds = Array.from(ids).filter(
      (id) => !scope.categoryIds?.length || scope.categoryIds.includes(id)
    )
    if (!targetCategoryIds.length) {
      return { products: [], count: 0, page, facets: { sizes: [], colors: [], fabrics: [] } }
    }
  }
  for (const id of targetCategoryIds) searchParams.append("category_id[]", id)

  // Collection filter
  if (scope.collectionId) {
    searchParams.set("collection_id", scope.collectionId)
  } else if (selected("collection").length > 0) {
    for (const id of selected("collection")) searchParams.append("collection_id[]", id)
  }

  const hasCustomFilter =
    !!value("brand") || !!value("gender") ||
    selected("size").length > 0 ||
    selected("color").length > 0 ||
    selected("fabric").length > 0 ||
    !!value("min") ||
    !!value("max") ||
    value("stock") === "1" ||
    value("sale") === "1" ||
    scope.isSalePage === true

  const scanCatalog =
    hasCustomFilter ||
    ["price-asc", "price-desc", "popular", "best-selling", "recommended"].includes(sort)
  const batchSize = 250

  if (!scanCatalog) {
    searchParams.set("offset", String(offset))
    searchParams.set("limit", String(limit))
  } else {
    searchParams.set("offset", "0")
    searchParams.set("limit", String(batchSize))
    searchParams.set("fields", effectiveFields.replace(",*images", ""))
  }

  try {
    const readPage = async (params: URLSearchParams) => {
      for (let attempt = 0; ; attempt++) {
        try {
          const response = await fetch(`${MEDUSA_URL}/store/products?${params}`, {
            headers: { "x-publishable-api-key": pubKey },
            next: { revalidate: 60, tags: ["products", "catalog"] },
            signal: AbortSignal.timeout(10000),
          })
          if (!response.ok) {
            throw Object.assign(new Error(`Catalog request failed (${response.status})`), {
              status: response.status,
            })
          }
          return await response.json()
        } catch (error) {
          const status = (error as { status?: number }).status
          if (attempt >= 1 || (status && status !== 408 && status !== 429 && status < 500)) throw error
          await new Promise((resolve) => setTimeout(resolve, 200))
        }
      }
    }

    let rawProducts: any[] = []
    let totalCount = 0

    if (scanCatalog) {
      // Check in-memory catalog cache for lightning-fast filter responses (< 5ms)
      const cacheKey = `${region?.id}_${targetCategoryIds.slice().sort().join(",")}_${scope.collectionId || ""}_${term}`
      const cached = GLOBAL_CATALOG_CACHE.get(cacheKey)

      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        rawProducts = [...cached.rawProducts]
        totalCount = cached.totalCount
      } else {
        const firstBatch = await readPage(searchParams)
        rawProducts = firstBatch.products || []
        totalCount = typeof firstBatch.count === "number" ? firstBatch.count : rawProducts.length

        if (totalCount > batchSize) {
          const offsets: number[] = []
          for (let o = batchSize; o < totalCount; o += batchSize) {
            offsets.push(o)
          }

          const tasks = offsets.map((off) => async () => {
            const p = new URLSearchParams(searchParams)
            p.set("offset", String(off))
            const batch = await readPage(p)
            return batch.products || []
          })

          const remainingBatches = await runWithConcurrency(tasks, 5)
          for (const batch of remainingBatches) {
            rawProducts.push(...batch)
          }
        }

        // Cache for 60s
        GLOBAL_CATALOG_CACHE.set(cacheKey, {
          rawProducts: [...rawProducts],
          totalCount,
          timestamp: Date.now(),
        })
      }
    } else {
      const data = await readPage(searchParams)
      rawProducts = data.products || []
      totalCount = typeof data.count === "number" ? data.count : rawProducts.length
    }

    let products: CatalogProduct[] = rawProducts.map((product: any) => ({
      id: product.id,
      title: product.title,
      handle: product.handle,
      thumbnail: product.thumbnail,
      images: product.images,
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
        handle: category.handle,
      })),
      options: product.options?.map((option: any) => ({
        id: option.id,
        title: option.title,
        values: option.values,
      })),
      variants: product.variants?.map((variant: any) => ({
        id: variant.id,
        title: variant.title,
        manage_inventory: variant.manage_inventory,
        allow_backorder: variant.allow_backorder,
        inventory_quantity: variant.inventory_quantity ?? 0,
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

    const facets = {
      sizes: Array.from(new Set(products.flatMap((product) => optionValues(product, "size")))).sort(),
      colors: Array.from(new Set(products.flatMap((product) => optionValues(product, "color")))).sort(),
      fabrics: Array.from(
        new Set(
          products
            .map((product) => product.material)
            .filter((material): material is string => !!material)
        )
      ).sort(),
    }

    if (hasCustomFilter) {
      products = products.filter((product) => {
        const price = productPrice(product)
        return (
          matchesCatalogScope(product, value("brand"), value("gender")) &&
          matchesVariantFilters(product, selected("size"), selected("color"), value("stock") === "1") &&
          (!selected("fabric").length || selected("fabric").includes(product.material || "")) &&
          (!value("min") || (price !== null && price >= Number(value("min")))) &&
          (!value("max") || (price !== null && price <= Number(value("max")))) &&
          (!(scope.isSalePage || value("sale") === "1") || isDiscounted(product))
        )
      })
      totalCount = products.length
    }

    let rankings: Record<string, { sold: number; recent: number }> = {}
    if (["popular", "best-selling", "recommended"].includes(sort)) {
      try {
        const response = await fetch(`${MEDUSA_URL}/store/catalog-rankings`, {
          headers: { "x-publishable-api-key": pubKey },
          next: { revalidate: 60 },
          signal: AbortSignal.timeout(5000),
        })
        if (response.ok) rankings = (await response.json()).rankings || {}
      } catch {}
    }

    products.sort((a, b) => {
      if (sort === "price-asc" || sort === "price-desc") {
        const left = productPrice(a)
        const right = productPrice(b)
        if (left === null) return right === null ? 0 : 1
        if (right === null) return -1
        return sort === "price-asc" ? left - right : right - left
      }
      if (sort === "title-asc") return a.title.localeCompare(b.title)
      if (sort === "recommended") {
        const featured = Number(b.metadata?.recommended === true) - Number(a.metadata?.recommended === true)
        if (featured) return featured
      }
      if (["popular", "best-selling", "recommended"].includes(sort)) {
        const metric = sort === "popular" ? "recent" : "sold"
        const difference = (rankings[b.id]?.[metric] || 0) - (rankings[a.id]?.[metric] || 0)
        if (difference) return difference
      }
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime() || a.id.localeCompare(b.id)
    })

    const displayProducts = scanCatalog ? products.slice(offset, offset + limit) : products

    return {
      products: displayProducts,
      count: totalCount,
      page,
      facets,
    }
  } catch (err) {
    console.error("Catalog fetch error:", err)
    throw err
  }
}
