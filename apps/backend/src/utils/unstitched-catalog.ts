export function unstitchedProductTitle(title: string) {
  const normalized = title.replace(/\bready[ -]to[ -]wear\b/gi, "Unstitched").replace(/\bstitched\b/gi, "Unstitched")
  return /\bunstitched\b/i.test(normalized) ? normalized : `${normalized} — Unstitched Fabric`
}

export function productDepartment(product: any) {
  const metadata = String(product.metadata?.gender || product.metadata?.department || "").toLowerCase()
  if (["women", "ladies", "female", "men", "gents", "male", "boys", "girls", "kids", "children"].includes(metadata)) {
    return ["ladies", "female"].includes(metadata) ? "women" : ["gents", "male"].includes(metadata) ? "men" : metadata === "kids" ? "children" : metadata
  }
  const text = `${product.title} ${(product.categories || []).map((category: any) => category.handle).join(" ")}`.toLowerCase()
  if (/\bgirls?\b/.test(text)) return "girls"
  if (/\bboys?\b/.test(text)) return "boys"
  if (/\b(women|ladies|female)\b/.test(text)) return "women"
  if (/\b(men|gents|male|boski|wash.wear|italian|kamalia)\b/.test(text)) return "men"
  if (/\b(kids|children|junior)\b/.test(text)) return "children"
  if (/\b(lawn|chiffon|schiffli|chikankari|organza|3.piece|2.piece|tunic|dress|saree)\b/.test(text)) return "women"
  return ""
}

export const nonFabricProduct = (title: string) => /\b(jhumka|jewel(?:lery|ry)|khussa|shoe|sandal|handbag|earring|necklace)\b/i.test(title)
