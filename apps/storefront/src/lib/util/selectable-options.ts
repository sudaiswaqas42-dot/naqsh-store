import { HttpTypes } from "@medusajs/types"

export function isSizingEnabled(metadata?: Record<string, unknown> | null): boolean {
  if (!metadata) return false
  return (
    metadata.enable_sizing === true ||
    metadata.enable_sizing === "true" ||
    metadata.enable_sizing === 1 ||
    metadata.sizing === true ||
    metadata.sizing === "true"
  )
}

export function selectableOptions(product: HttpTypes.StoreProduct) {
  const sizing = isSizingEnabled(product.metadata)
  const options = (product.options || [])
    .filter(
      (option) =>
        option.title?.toLowerCase() !== "default option" &&
        (sizing || !/size|sizing/i.test(option.title || ""))
    )
    .map((option) => ({
      ...option,
      values: option.values?.length
        ? option.values
        : (product.variants || []).flatMap((variant) =>
            (variant.options || []).filter(
              (value) => value.option_id === option.id
            )
          ),
    }))
  if (!options.some((option) => /colou?r/i.test(option.title || ""))) {
    const raw =
      product.metadata?.colors ||
      product.metadata?.colours ||
      product.metadata?.color ||
      product.metadata?.colour
    const colors = (
      Array.isArray(raw) ? raw : typeof raw === "string" ? raw.split(",") : []
    )
      .map(String)
      .map((value) => value.trim())
      .filter(Boolean)
    if (colors.length)
      options.unshift({
        id: "metadata-color",
        title: "Color",
        values: colors.map((value) => ({ value })),
      } as typeof options[number])
  }
  return options.filter((option) => option.values?.length)
}
