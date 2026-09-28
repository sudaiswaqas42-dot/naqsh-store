const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"

export type ProductSaleOverride = {
  on_sale: boolean
  sale_price?: number
  original_price?: number
  discount_percent?: number
}

export type SalesConfig = {
  active: boolean
  default_discount: number
  category_discounts: Record<string, number>
  product_discounts: Record<string, number>
  products?: Record<string, ProductSaleOverride>
}

const defaultSales: SalesConfig = {
  active: true,
  default_discount: 20,
  category_discounts: {
    "Ready-to-Wear": 20,
    "Luxury Pret": 25,
    "Summer Lawn '25": 30,
    "Festive Formals": 30,
    "Pret Edit": 20,
    "Bestsellers": 25,
    "Unstitched": 30,
    "Men": 20,
    "Women": 20,
  },
  product_discounts: {},
  products: {},
}

let memorySalesCache: { data: SalesConfig; timestamp: number } | null = null

export async function getSalesConfig(): Promise<SalesConfig> {
  const now = Date.now()
  if (memorySalesCache && now - memorySalesCache.timestamp < 300000) {
    return memorySalesCache.data
  }

  try {
    const res = await fetch(`${BACKEND_URL}/store/sales`, {
      headers: {
        "x-publishable-api-key":
          process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
      },
      next: { revalidate: 30, tags: ["sales"] },
    })
    if (!res.ok) return defaultSales
    const data = await res.json()
    const result = data.sales || defaultSales
    memorySalesCache = { data: result, timestamp: Date.now() }
    return result
  } catch {
    return defaultSales
  }
}

export function computeDiscountForProduct(
  product: any,
  sales: SalesConfig
): {
  discountPercent: number
  isSale: boolean
  customSalePrice?: number
  customOriginalPrice?: number
} {
  if (!sales || !sales.active) {
    return { discountPercent: 0, isSale: false }
  }

  // 1. Direct product override in sales.products (allows "kuch per lagao kuch per na lagao")
  const prodKey = product.id || product.handle
  const prodOverride =
    sales.products?.[product.id] || sales.products?.[product.handle]

  if (prodOverride) {
    if (!prodOverride.on_sale) {
      return { discountPercent: 0, isSale: false }
    }
    return {
      discountPercent: prodOverride.discount_percent || 20,
      isSale: true,
      customSalePrice: prodOverride.sale_price,
      customOriginalPrice: prodOverride.original_price,
    }
  }

  // 2. Direct product discount by ID or handle
  if (product.id && sales.product_discounts[product.id] != null) {
    return { discountPercent: sales.product_discounts[product.id], isSale: true }
  }
  if (product.handle && sales.product_discounts[product.handle] != null) {
    return { discountPercent: sales.product_discounts[product.handle], isSale: true }
  }

  // 3. Category discount
  const categoryNames = [
    ...(product.categories?.map((c: any) => c.name) || []),
    product.collection?.title,
    product.type?.value,
  ].filter(Boolean)

  for (const cat of categoryNames) {
    for (const [key, pct] of Object.entries(sales.category_discounts)) {
      if (
        cat.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(cat.toLowerCase())
      ) {
        return { discountPercent: pct, isSale: true }
      }
    }
  }

  // 4. Fallback to default store discount
  return { discountPercent: sales.default_discount || 20, isSale: true }
}
