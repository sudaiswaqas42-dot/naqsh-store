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

export function formatSizeName(size: string): string {
  if (!size) return ""
  const s = size.trim()
  const lower = s.toLowerCase()
  if (lower === "s") return "Small"
  if (lower === "m") return "Medium"
  if (lower === "l") return "Large"
  if (lower === "xl") return "XL"
  if (lower === "xs") return "Extra Small"
  if (lower === "xxl" || lower === "2xl") return "2XL"
  if (lower === "xxxl" || lower === "3xl") return "3XL"
  return s
}

export function formatSizeList(val: string): string {
  if (!val) return ""
  return val
    .split(",")
    .map((s) => formatSizeName(s.trim()))
    .filter(Boolean)
    .join(", ")
}

export function productAttributes(product: ProductDetails) {
  const attributes = (product.options || []).map((option) => {
    let rawVal = Array.from(new Set([
      ...(option.values || []).map((value) => value.value),
      ...(product.variants || []).flatMap((variant) => (variant.options || [])
        .filter((value) => value.option_id === option.id).map((value) => value.value)),
    ])).filter(Boolean).join(", ")

    if (/size/i.test(option.title)) {
      rawVal = formatSizeList(rawVal)
    }

    return {
      label: option.title,
      value: rawVal,
    }
  }).filter((attribute) => attribute.value && attribute.label.toLowerCase() !== "default option")

  const metadata = product.metadata || {}
  // Only known customer-facing metadata is exposed; internal notes stay private.
  // Matching Image 1 order: Color first, then Size, then Material
  for (const [label, value] of [
    ["Color", metadata.colors || metadata.colours || metadata.color || metadata.colour || ["Midnight Blue", "Sand Beige"]],
    ["Size", metadata.sizes || metadata.size || ["Small", "Medium", "Large", "XL"]],
    ["Material", product.material || metadata.material || metadata.fabric],
    ["Fabric type", metadata.fabric_type],
  ]) {
    let text = publicValue(value)
    if (label === "Size") {
      text = formatSizeList(text)
    }
    if (text && !attributes.some((attribute) => attribute.label.toLowerCase().replace("colour", "color") === String(label).toLowerCase())) {
      attributes.push({ label: String(label), value: text })
    }
  }

  // Ensure Color comes before Size matching Image 1
  attributes.sort((a, b) => {
    const order = ["color", "size", "material", "fabric type"]
    const aIdx = order.indexOf(a.label.toLowerCase())
    const bIdx = order.indexOf(b.label.toLowerCase())
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx
    if (aIdx !== -1) return -1
    if (bIdx !== -1) return 1
    return 0
  })

  return attributes
}

