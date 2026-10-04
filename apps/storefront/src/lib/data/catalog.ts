import "server-only"
import { getRegion, listRegions } from "./regions"
import { listCategories } from "./categories"
import { CatalogProduct, productPrice, optionValues, matchesVariantFilters, isDiscounted } from "@lib/util/catalog"

export type CatalogQuery = Record<string, string | string[] | undefined>
const fields =
  "id,title,handle,thumbnail,created_at,material,metadata,*collection,*categories,*images,*options,*options.values,*variants.options,*variants.calculated_price,+variants.inventory_quantity,variants.id,variants.title,variants.manage_inventory,variants.allow_backorder"

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

export async function getCatalog(
  countryCode: string,
  query: CatalogQuery = {},
  scope: { categoryIds?: string[]; collectionId?: string; isSalePage?: boolean } = {}
) {
  let region = await getRegion(countryCode).catch(() => null)
  if (!region) {
    const regions = await listRegions().catch(() => [])
    region = regions?.[0] || null
  }
  if (!region) {
    region = { id: "reg_default", currency_code: "pkr" } as any
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
  if (region?.id && region.id !== "reg_default") {
    searchParams.set("region_id", region.id)
  }
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
    selected("size").length > 0 ||
    selected("color").length > 0 ||
    selected("fabric").length > 0 ||
    !!value("min") ||
    !!value("max") ||
    value("stock") === "1" ||
    value("sale") === "1"

  if (!hasCustomFilter) {
    searchParams.set("offset", String(offset))
    searchParams.set("limit", String(limit))
  } else {
    searchParams.set("offset", "0")
    searchParams.set("limit", "100")
  }

  try {
    const response = await fetch(`${MEDUSA_URL}/store/products?${searchParams.toString()}`, {
      headers: { "x-publishable-api-key": pubKey },
      next: { revalidate: 30, tags: ["products", "catalog"] },
      signal: AbortSignal.timeout(8000),
    })

    if (!response.ok) {
      console.error(`Catalog request failed (${response.status})`)
      return { products: [], count: 0, page, facets: { sizes: [], colors: [], fabrics: [] } }
    }

    const data = await response.json()
    const rawProducts: any[] = data.products || []
    let totalCount: number = typeof data.count === "number" ? data.count : rawProducts.length

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
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    })

    const displayProducts = hasCustomFilter ? products.slice(offset, offset + limit) : products

    return {
      products: displayProducts,
      count: totalCount,
      page,
      facets,
    }
  } catch (err) {
    console.error("Catalog fetch error:", err)
    return { products: [], count: 0, page: 1, facets: { sizes: [], colors: [], fabrics: [] } }
  }
}
