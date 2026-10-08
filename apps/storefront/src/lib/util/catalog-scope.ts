const normalize = (value: unknown) => String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "")

const aliases: Record<string, string[]> = {
  khaadi: ["khaadi"], sapphire: ["sapphire"], "gul-ahmed": ["gulahmed", "ideas"],
  "j-dot": ["j", "jdot", "junaidjamshed", "jjunaidjamshed"], alkaram: ["alkaram", "alkaramstudio"], limelight: ["limelight"],
}

export function matchesCatalogScope(product: any, brand: string, gender: string) {
  if (brand) {
    const accepted = aliases[brand] || [normalize(brand)]
    const declared = [product.metadata?.brand, product.metadata?.brand_name, product.metadata?.designer, product.collection?.title, ...(product.categories || []).flatMap((category: any) => [category.name, category.handle])].map(normalize)
    if (!accepted.some(alias => declared.includes(alias))) return false
  }
  if (gender) {
    const declared = [product.metadata?.gender, product.metadata?.department, ...(product.categories || []).flatMap((category: any) => [category.name, category.handle])].join(" ").toLowerCase()
    const wanted = gender === "men" ? /\b(men|mens|gents|male)\b/ : /\b(women|womens|ladies|female)\b/
    const opposite = gender === "men" ? /\b(women|womens|ladies|girls|female)\b/ : /\b(men|mens|gents|boys|male)\b/
    if (!wanted.test(declared) || opposite.test(declared)) return false
  }
  return true
}
