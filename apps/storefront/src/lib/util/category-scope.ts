export const menCategoryHandles = ["italian", "boski", "wash-wear", "wool", "kamalia-khaddar"]
export const womenCategoryHandles = ["dhanak", "khaddar", "linen", "karandi", "silk", "printed", "embroidery-waly", "2pc", "3pc"]

export function categoryDepartment(handle: string) {
  if (["men", "men-unstitched", ...menCategoryHandles].includes(handle)) return "men"
  if (["women", "women-unstitched", ...womenCategoryHandles].includes(handle)) return "women"
  return ""
}

export function scopedCategories<T extends { id: string; label: string; handle?: string }>(categories: T[], department: string) {
  const allowed = department === "men" ? menCategoryHandles : department === "women" ? womenCategoryHandles : null
  if (!allowed) return categories
  return categories.filter(category => {
    if (category.handle) return allowed.includes(category.handle)
    const label = category.label.toLowerCase().replace(/\s+unstitched(?:\s+fabric)?$/i, "").trim().replace(/\s*&\s*/g, "-").replace(/\s+/g, "-")
    return allowed.includes(category.id) || allowed.includes(label)
  })
}
