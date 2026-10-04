type ProductDetails = {
  material?: string | null
  metadata?: Record<string, unknown> | null
  options?: { id: string; title: string; values?: { value: string }[] }[] | null
  variants?: { options?: { option_id?: string | null; value: string }[] | null }[] | null
}

export function publicValue(value: unknown): string {
  if (Array.isArray(value)) return value.map(publicValue).filter(Boolean).join(", ")
  return typeof value === "string" || typeof value === "number" ? String(value) : ""
}

export function productAttributes(product: ProductDetails) {
  const attributes = (product.options || []).map((option) => ({
    label: option.title,
    value: Array.from(new Set([
      ...(option.values || []).map((value) => value.value),
      ...(product.variants || []).flatMap((variant) => (variant.options || [])
        .filter((value) => value.option_id === option.id).map((value) => value.value)),
    ])).filter(Boolean).join(", "),
  })).filter((attribute) => attribute.value && attribute.label.toLowerCase() !== "default option")
  const metadata = product.metadata || {}
  // Only known customer-facing metadata is exposed; internal notes stay private.
  for (const [label, value] of [
    ["Size", metadata.sizes || metadata.size],
    ["Color", metadata.colors || metadata.colours || metadata.color || metadata.colour],
    ["Material", product.material || metadata.material || metadata.fabric],
    ["Fabric type", metadata.fabric_type],
  ]) {
    const text = publicValue(value)
    if (text && !attributes.some((attribute) => attribute.label.toLowerCase().replace("colour", "color") === String(label).toLowerCase())) {
      attributes.push({ label: String(label), value: text })
    }
  }
  return attributes
}
