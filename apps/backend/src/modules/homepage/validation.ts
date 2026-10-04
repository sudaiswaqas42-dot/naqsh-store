import { MedusaError } from "@medusajs/framework/utils"

export const sectionTypes = [
  "hero_slider",
  "features_strip",
  "featured_categories",
  "product_carousel",
  "sale_banner",
  "flash_sale",
  "promo_banner",
  "lookbook",
  "customer_reviews",
  "fabric_strip",
  "instagram_feed",
  "cards_grid",
  "custom_cards",
]
const internalKeys = ["sale_discounts", "social_links"]

export function validateSection(input: any, creating = false) {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Section must be an object",
    )
  const allowed = [
    "title",
    "subtitle",
    "cta_text",
    "cta_link",
    "collection_id",
    "rank",
    "is_active",
    "settings",
    "restart_countdown",
    ...(creating ? ["key", "type"] : []),
  ]
  const data: Record<string, any> = {}
  for (const key of allowed)
    if (input[key] !== undefined) data[key] = input[key]
  if (
    creating &&
    (!sectionTypes.includes(data.type) ||
      typeof data.key !== "string" ||
      !data.key.trim() ||
      internalKeys.includes(data.key))
  )
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Choose a valid homepage section type and unique key",
    )
  if (creating && typeof data.title !== "string")
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "A heading is required",
    )
  for (const key of [
    "title",
    "subtitle",
    "cta_text",
    "cta_link",
    "collection_id",
  ]) {
    if (
      data[key] !== undefined &&
      data[key] !== null &&
      typeof data[key] !== "string"
    )
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `${key} must be text`,
      )
  }
  if (
    data.rank !== undefined &&
    (!Number.isInteger(data.rank) || data.rank < 0)
  )
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Position must be a non-negative integer",
    )
  if (data.is_active !== undefined && typeof data.is_active !== "boolean")
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Visibility must be true or false",
    )
  if (
    data.settings !== undefined &&
    data.settings !== null &&
    (typeof data.settings !== "object" || Array.isArray(data.settings))
  )
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Settings must be an object",
    )
  validateContent(data)
  for (const key of ["cards", "slides", "items", "product_ids"])
    if (
      data.settings?.[key] !== undefined &&
      !Array.isArray(data.settings[key])
    )
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `${key} must be a list`,
      )
  for (const key of ["cards", "slides", "items"]) {
    if (
      data.settings?.[key]?.some(
        (item: any) => !item || typeof item !== "object" || Array.isArray(item),
      )
    )
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `${key} must contain content items`,
      )
  }
  if (
    data.settings?.product_ids?.some(
      (id: any) => typeof id !== "string" || !id.startsWith("prod_"),
    )
  )
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Choose valid catalog products",
    )
  return data
}

function validateContent(value: any, key = "") {
  if (value === null || value === undefined) return
  if (
    ["link", "href", "cta_link", "image", "image_url"].includes(key) &&
    (typeof value !== "string" ||
      (value !== "" && !/^(https?:\/\/[^\s]+|\/(?!\/)[^\s]*)$/.test(value)))
  )
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Links and images must use https://, http://, or a local /path",
    )
  if (
    ["price", "original_price", "days", "hours", "minutes", "seconds"].includes(
      key,
    ) &&
    value !== "" &&
    (!Number.isFinite(Number(value)) || Number(value) < 0)
  )
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `${key} must be a non-negative number`,
    )
  if (typeof value === "object")
    for (const [childKey, child] of Object.entries(value))
      validateContent(child, childKey)
}

export function validateReorder(input: any) {
  if (
    !Array.isArray(input) ||
    input.some(
      (item) =>
        !item ||
        typeof item.id !== "string" ||
        !Number.isInteger(item.rank) ||
        item.rank < 0,
    ) ||
    new Set(input.map((item) => item.id)).size !== input.length ||
    new Set(input.map((item) => item.rank)).size !== input.length
  )
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Provide unique section IDs and positions",
    )
  return input.map(({ id, rank }) => ({ id, rank }))
}
