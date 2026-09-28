export type CatalogVariant = {
  id: string
  title?: string
  manage_inventory?: boolean
  allow_backorder?: boolean
  inventory_quantity?: number
  calculated_price?: { calculated_amount?: number; original_amount?: number; currency_code?: string }
  options?: { value: string; option_id?: string; option?: { title?: string } }[]
}
export type CatalogProduct = {
  id: string
  handle: string
  title: string
  thumbnail?: string | null
  created_at?: string
  material?: string | null
  metadata?: Record<string, unknown> | null
  collection?: { id: string; title: string } | null
  categories?: { id: string; name: string }[]
  options?: { id: string; title: string }[]
  variants?: CatalogVariant[]
  images?: { url: string }[]
}
export function variantAvailable(variant: CatalogVariant) {
  return variant.manage_inventory === false || variant.allow_backorder === true || (variant.inventory_quantity ?? 0) > 0
}
export function productPrice(product: CatalogProduct) {
  const prices = (product.variants || []).map(v => v.calculated_price?.calculated_amount).filter((value): value is number => typeof value === "number" && Number.isFinite(value))
  return prices.length ? Math.min(...prices) : null
}
export function optionValues(product: CatalogProduct, name: string) {
  const ids = (product.options || []).filter(option => option.title.toLowerCase() === name || (name === "color" && option.title.toLowerCase() === "colour")).map(option => option.id)
  return Array.from(new Set((product.variants || []).flatMap(variant => (variant.options || []).filter(option => ids.includes(option.option_id || "") || option.option?.title?.toLowerCase() === name).map(option => option.value))))
}
export function matchesVariantFilters(product: CatalogProduct, sizes: string[], colors: string[], inStock: boolean) {
  if (!sizes.length && !colors.length && !inStock) return true
  return (product.variants || []).some(variant => {
    const variantProduct = { ...product, variants: [variant] }
    return (!sizes.length || optionValues(variantProduct, "size").some(value => sizes.includes(value))) &&
      (!colors.length || optionValues(variantProduct, "color").some(value => colors.includes(value))) &&
      (!inStock || variantAvailable(variant))
  })
}
export function isDiscounted(product: CatalogProduct) {
  return (product.variants || []).some(variant => {
    const price = variant.calculated_price
    return price?.calculated_amount != null && price.original_amount != null && price.calculated_amount < price.original_amount
  })
}
