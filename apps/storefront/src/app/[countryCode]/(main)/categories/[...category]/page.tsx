import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getCategoryByHandle, listCategories } from "@lib/data/categories"
import { CatalogQuery } from "@lib/data/catalog"
import CatalogTemplate from "@modules/store/templates/catalog"

type Props = {
  params: Promise<{ category: string[]; countryCode: string }>
  searchParams: Promise<CatalogQuery>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params
  const rawCat = resolvedParams?.category
  const categoryArray = Array.isArray(rawCat) ? rawCat : typeof rawCat === "string" ? [rawCat] : []
  const item = categoryArray.length ? await getCategoryByHandle(categoryArray).catch(() => undefined) : undefined
  return {
    title: item ? item.name + " | NAQSH" : "Collection | NAQSH",
    description: item?.description || "Discover the NAQSH collection.",
  }
}

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function CategoryPage({ params, searchParams }: Props) {
  const resolvedParams = await params
  const query = (await searchParams) || {}
  const countryCode = resolvedParams?.countryCode || "pk"
  const rawCategory = resolvedParams?.category
  const categoryArray = Array.isArray(rawCategory)
    ? rawCategory
    : typeof rawCategory === "string"
    ? [rawCategory]
    : []

  if (!categoryArray.length) {
    notFound()
  }

  const [categoriesList, item] = await Promise.all([
    listCategories().catch(() => []),
    getCategoryByHandle(categoryArray).catch(() => undefined),
  ])

  let finalItem = item
  if (!finalItem) {
    const handleKey = categoryArray[categoryArray.length - 1]?.toLowerCase()
    const fallbackMap: Record<string, { id: string; name: string; handle: string; description: string }> = {
      sale: { id: "pcat_01M3EW9AH4V6S14CNHCRM6H2YK", name: "End of Season Sale", handle: "sale", description: "Explore handcrafted luxury pret, unstitched fabrics, and festive formals on exclusive seasonal sale." },
      women: { id: "pcat_01M3EW9AGX87DJN0W7RP7Z6041", name: "Women", handle: "women", description: "Explore our latest Women's luxury pret, stitched ensembles, and unstitched fabrics." },
      men: { id: "pcat_01M3EW9AGYE2YT2P17ZSGFVTB9", name: "Men", handle: "men", description: "Discover handcrafted men's kurtas, waistcoats, and premium unstitched fabrics." },
      unstitched: { id: "pcat_01M3EW9AK9WFT37D60F729CTDM", name: "Unstitched Fabric", handle: "unstitched", description: "Fine lawn, pure silk dupattas & embroidered unstitched fabrics." },
      children: { id: "pcat_01M3mukykbr2612d80c6d0983", name: "Children", handle: "children", description: "Handcrafted festive ghararas, kurtas & eastern kids collection." },
      "women-stitched": { id: "pcat_01M3mukykbq301fda21fe108f", name: "Women's Stitched Pret", handle: "women-stitched", description: "Ready to wear luxury pret and embroidered ensembles." },
      "women-unstitched": { id: "pcat_01M3mukykbqv18abc7547c99d", name: "Women's Unstitched Lawn & Silks", handle: "women-unstitched", description: "Fine lawn, pure silk dupattas & embroidered 3-piece unstitched fabrics." },
      "men-stitched": { id: "pcat_01M3mukykbqx1004649b19db4", name: "Men's Stitched Eastern", handle: "men-stitched", description: "Bespoke stitched kurtas, shalwar kameez & waistcoats." },
      "men-unstitched": { id: "pcat_01M3mukykbr04bb73bd499a58", name: "Men's Unstitched Fabric", handle: "men-unstitched", description: "Premium Egyptian cotton & wash and wear fabrics." },
      // Gents Unstitched Subcategories (Image 1)
      italian: { id: "pcat_gents_italian", name: "Italian Unstitched", handle: "italian", description: "Premium Italian luxury suit fabrics." },
      boski: { id: "pcat_gents_boski", name: "Pure Boski", handle: "boski", description: "Traditional pure silk boski unstitched fabric." },
      "wash-wear": { id: "pcat_gents_wash_wear", name: "Wash & Wear", handle: "wash-wear", description: "Easy care wrinkle-resistant wash & wear suit cuts." },
      wool: { id: "pcat_gents_wool", name: "Warm Wool", handle: "wool", description: "Winter warm wool blend unstitched fabric." },
      "kamalia-khaddar": { id: "pcat_gents_kamalia_khaddar", name: "Kamalia Khaddar", handle: "kamalia-khaddar", description: "Authentic handspun Kamalia Khaddar cuts." },
      // Ladies Unstitched Subcategories (Image 1)
      dhanak: { id: "pcat_ladies_dhanak", name: "Dhanak", handle: "dhanak", description: "Warm winter Dhanak embroidered unstitched suits." },
      khaddar: { id: "pcat_ladies_khaddar", name: "Khaddar", handle: "khaddar", description: "Traditional winter Khaddar printed & embroidered suits." },
      linen: { id: "pcat_ladies_linen", name: "Linen", handle: "linen", description: "Pure slub linen unstitched collection." },
      karandi: { id: "pcat_ladies_karandi", name: "Karandi", handle: "karandi", description: "Winter classic Karandi embroidered suit cuts." },
      silk: { id: "pcat_ladies_silk", name: "Pure Silk", handle: "silk", description: "Luxury festive pure silk unstitched ensembles." },
      printed: { id: "pcat_ladies_printed", name: "Printed Lawn & Khaddar", handle: "printed", description: "Vibrant digital printed unstitched 2pc & 3pc suits." },
      "embroidery-waly": { id: "pcat_ladies_embroidery_waly", name: "Embroidery Waly Suits", handle: "embroidery-waly", description: "Heavily embroidered formal and festive unstitched suits." },
      "2pc": { id: "pcat_ladies_2pc", name: "2-Piece Unstitched", handle: "2pc", description: "Unstitched shirt & dupatta / trouser 2-piece suits." },
      "3pc": { id: "pcat_ladies_3pc", name: "3-Piece Luxury Unstitched", handle: "3pc", description: "Complete 3-piece luxury unstitched designer suits." },
      "co-ords": { id: "pcat_01M3EW9AKC27MD5FVK1FVCNJ93", name: "Co-ords Sets", handle: "co-ords", description: "Modern matching separates in pure cotton and silk." },
      "festive-formals": { id: "pcat_01M3EW9AKEV37FT2AXXHQBD3QJ", name: "Festive Formals", handle: "festive-formals", description: "Zardozi hand-embellished raw silks and wedding wear." },
      "kurta-shalwar": { id: "pcat_01M3EW9AKGNTFR4VVGMS0Y3DXH", name: "Kurta & Shalwar", handle: "kurta-shalwar", description: "Traditional Pakistani kurtas and shalwars." },
      waistcoats: { id: "pcat_01M3EW9AKJHZJPE2F2Y96R25YH", name: "Waistcoats", handle: "waistcoats", description: "Festive and formal eastern waistcoats." },
    }
    if (fallbackMap[handleKey]) {
      finalItem = {
        ...fallbackMap[handleKey],
        category_children: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
        parent_category_id: null,
        rank: 0,
      } as any
    }
  }

  if (!finalItem) notFound()

  const categories = categoriesList || []
  const isSaleCategory = finalItem.handle === "sale" || categoryArray.includes("sale")

  if (isSaleCategory) {
    return (
      <CatalogTemplate
        countryCode={countryCode}
        query={query}
        title={finalItem.name || "End of Season Sale"}
        description={
          finalItem.description ||
          "Explore handcrafted luxury pret, unstitched fabrics, and festive formals on exclusive seasonal sale."
        }
        categoryIds={undefined}
        links={(finalItem.category_children || []).map((child) => ({
          href: "/categories/" + child.handle,
          label: child.name,
        }))}
        isSalePage={true}
      />
    )
  }

  const ids = new Set([finalItem.id])
  let changed = true
  while (changed) {
    changed = false
    for (const candidate of categories) {
      if (
        candidate.parent_category_id &&
        ids.has(candidate.parent_category_id) &&
        !ids.has(candidate.id)
      ) {
        ids.add(candidate.id)
        changed = true
      }
    }
  }
  for (const child of finalItem.category_children || []) ids.add(child.id)

  // Strict category scoping:
  // 1. Women category must NEVER include general unstitched (which contains men) or any men categories
  if (finalItem.handle === "women") {
    for (const candidate of categories) {
      if (candidate.handle === "unstitched" || candidate.handle.startsWith("men")) {
        ids.delete(candidate.id)
      }
    }
  }

  // 2. Unstitched category must include general unstitched as well as women-unstitched and men-unstitched
  if (finalItem.handle === "unstitched") {
    for (const candidate of categories) {
      if (candidate.handle === "women-unstitched" || candidate.handle === "men-unstitched") {
        ids.add(candidate.id)
      }
    }
  }

  // 3. Men category must NEVER include women categories
  if (finalItem.handle === "men") {
    for (const candidate of categories) {
      if (candidate.handle === "unstitched" || candidate.handle.startsWith("women")) {
        ids.delete(candidate.id)
      }
    }
  }

  return (
    <CatalogTemplate
      countryCode={countryCode}
      query={query}
      title={finalItem.name}
      categoryHandle={finalItem.handle}
      description={finalItem.description || "Explore the collection. Find the details that feel like you."}
      categoryIds={Array.from(ids)}
      links={(finalItem.category_children || []).map((child) => ({
        href: "/categories/" + child.handle,
        label: child.name,
      }))}
    />
  )
}
