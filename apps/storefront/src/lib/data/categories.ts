import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

let categoryCache: { data: HttpTypes.StoreProductCategory[]; timestamp: number } | null = null

export const listCategories = async (query?: Record<string, unknown>) => {
  const isDefaultQuery = !query || (Object.keys(query).length === 1 && (query.limit === 100 || query.limit === "100"))
  const now = Date.now()
  if (isDefaultQuery && categoryCache && now - categoryCache.timestamp < 600000) {
    return categoryCache.data
  }

  const next = {
    ...(await getCacheOptions("categories")),
  }

  const limit = query?.limit || 100

  const defaultFields = query?.fields || "*category_children, *parent_category, name, handle, id, description, parent_category_id"

  return sdk.client
    .fetch<{ product_categories: HttpTypes.StoreProductCategory[] }>(
      "/store/product-categories",
      {
        query: {
          fields: defaultFields,
          limit,
          ...query,
        },
        next,
        cache: "force-cache",
      }
    )
    .then(({ product_categories }) => {
      if (isDefaultQuery) {
        categoryCache = { data: product_categories, timestamp: Date.now() }
      }
      return product_categories
    })
}

const categoryHandleCache = new Map<string, { data: HttpTypes.StoreProductCategory; timestamp: number }>()

export const getCategoryByHandle = async (categoryHandle: string[]) => {
  const fullHandle = `${categoryHandle.join("/")}`
  const leafHandle = categoryHandle[categoryHandle.length - 1]
  const now = Date.now()

  const cached = categoryHandleCache.get(fullHandle) || categoryHandleCache.get(leafHandle)
  if (cached && now - cached.timestamp < 600000) {
    return cached.data
  }

  // Check in full category cache if available
  if (categoryCache && now - categoryCache.timestamp < 600000) {
    const found =
      categoryCache.data.find((c) => c.handle === fullHandle) ||
      categoryCache.data.find((c) => c.handle === leafHandle)
    if (found) {
      categoryHandleCache.set(fullHandle, { data: found, timestamp: now })
      return found
    }
  }

  const next = {
    ...(await getCacheOptions("categories")),
  }

  // Try full handle first, fallback to leaf handle
  for (const h of [fullHandle, leafHandle]) {
    try {
      const { product_categories } = await sdk.client.fetch<HttpTypes.StoreProductCategoryListResponse>(
        `/store/product-categories`,
        {
          query: {
            fields: "id,name,handle,description,*category_children",
            handle: h,
          },
          next,
          cache: "force-cache",
        }
      )
      const cat = product_categories[0]
      if (cat) {
        categoryHandleCache.set(fullHandle, { data: cat, timestamp: Date.now() })
        categoryHandleCache.set(leafHandle, { data: cat, timestamp: Date.now() })
        return cat
      }
    } catch {
      // Continue to next handle attempt
    }
  }

  return undefined
}
