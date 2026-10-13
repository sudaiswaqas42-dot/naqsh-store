import { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
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

  // Entire brand is 100% Unstitched: Redirect legacy /categories/unstitched to Women's category
  if (categoryArray[0]?.toLowerCase() === "unstitched") {
    redirect(`/${countryCode}/categories/women`)
  }

  const [categoriesList, item] = await Promise.all([
    listCategories().catch(() => []),
    getCategoryByHandle(categoryArray).catch(() => undefined),
  ])

  let finalItem = item
  if (!finalItem) {
    const handleKey = categoryArray[categoryArray.length - 1]?.toLowerCase()
    const fallbackMap: Record<string, { id: string; name: string; handle: string; description: string }> = {
      sale: { id: "pcat_01M3EW9AH4V6S14CNHCRM6H2YK", name: "End of Season Sale", handle: "sale", description: "Explore handcrafted unstitched fabrics and festive cuts on exclusive seasonal sale." },
      women: { id: "pcat_01M3EW9AGX87DJN0W7RP7Z6041", name: "Women", handle: "women", description: "Explore our latest Women's luxury unstitched lawn, pure silks, and festive fabrics." },
      men: { id: "pcat_01M3EW9AGYE2YT2P17ZSGFVTB9", name: "Men", handle: "men", description: "Discover handcrafted men's pure boski, Egyptian cotton, and premium unstitched fabrics." },
      unstitched: { id: "pcat_01M3EW9AK9WFT37D60F729CTDM", name: "Unstitched Fabric", handle: "unstitched", description: "Fine lawn, pure silk dupattas & embroidered unstitched fabrics." },
      children: { id: "pcat_01M3mukykbr2612d80c6d0983", name: "Children", handle: "children", description: "Handcrafted festive unstitched fabrics for girls and boys." },
      "women-unstitched": { id: "pcat_01M3mukykbqv18abc7547c99d", name: "Women's Unstitched Lawn & Silks", handle: "women-unstitched", description: "Fine lawn, pure silk dupattas & embroidered 3-piece unstitched fabrics." },
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
      // Children Categories: Girls & Boys (100% Unstitched Fabric Cuts)
      girls: { id: "pcat_01M3EW9AKN2TK634D7T4SZS573", name: "Girls Unstitched Fabrics", handle: "girls", description: "Fine fabrics and handcrafted festive unstitched cuts for girls." },
      "girls-eastern": { id: "pcat_01M3EW9AKN2TK634D7T4SZS573", name: "Girls Unstitched Fabrics", handle: "girls-eastern", description: "Fine fabrics and handcrafted festive unstitched cuts for girls." },
      "girls-unstitched": { id: "pcat_01M3EW9AKN2TK634D7T4SZS573", name: "Girls Unstitched", handle: "girls-unstitched", description: "Fine fabrics and unstitched gharara & frock cuts for girls." },
      "girls-3pc": { id: "pcat_girls_3pc", name: "Girls 3-Piece Unstitched", handle: "girls-3pc", description: "Complete 3-piece unstitched festive suit for girls." },
      "girls-2pc": { id: "pcat_girls_2pc", name: "Girls 2-Piece Unstitched", handle: "girls-2pc", description: "Coordinated unstitched frock & trousers cut for girls." },
      "girls-silk": { id: "pcat_girls_silk", name: "Girls Pure Silk & Chiffon", handle: "girls-silk", description: "Festive silk and chiffon unstitched fabric for girls." },
      "girls-embroidery": { id: "pcat_girls_embroidery", name: "Girls Festive Embroidery Suits", handle: "girls-embroidery", description: "Zari and resham embroidered girls fabric." },
      "girls-printed": { id: "pcat_girls_printed", name: "Girls Printed Lawn Cuts", handle: "girls-printed", description: "Gentle floral prints on soft lawn for girls." },
      "girls-linen": { id: "pcat_girls_linen", name: "Girls Soft Linen & Dhanak", handle: "girls-linen", description: "Warm gentle winter cuts for girls." },
      boys: { id: "pcat_01M3EW9AKQY520YNZN4B7M0NQ6", name: "Boys Unstitched Kurta Fabrics", handle: "boys", description: "Traditional unstitched kurta & shalwar fabrics and suit cuts for boys." },
      "boys-eastern": { id: "pcat_01M3EW9AKQY520YNZN4B7M0NQ6", name: "Boys Unstitched Kurta Fabrics", handle: "boys-eastern", description: "Traditional unstitched kurta & shalwar fabrics and suit cuts for boys." },
      "boys-unstitched": { id: "pcat_01M3EW9AKQY520YNZN4B7M0NQ6", name: "Boys Unstitched Fabrics", handle: "boys-unstitched", description: "Premium unstitched kurta & shalwar fabrics for boys." },
      "boys-boski": { id: "pcat_boys_boski", name: "Boys Pure Silk Boski", handle: "boys-boski", description: "Pure silk heirloom kurta cuts for young boys." },
      "boys-wash-wear": { id: "pcat_boys_wash_wear", name: "Boys Executive Wash & Wear", handle: "boys-wash-wear", description: "Wrinkle-resistant durable kurta pajama fabric." },
      "boys-kurta": { id: "pcat_boys_kurta", name: "Boys Traditional Kurta Fabric", handle: "boys-kurta", description: "Classic cotton kurta fabric cuts for boys." },
      "boys-khaddar": { id: "pcat_boys_khaddar", name: "Boys Kamalia Khaddar", handle: "boys-khaddar", description: "Authentic cotton winter khaddar for boys." },
      "boys-wool": { id: "pcat_boys_wool", name: "Boys Winter Wool Blend", handle: "boys-wool", description: "Warm winter fabric for boys waistcoats & kurtas." },
      // Sale Categories
      "sale-women": { id: "pcat_sale_women", name: "Ladies Unstitched Sale", handle: "sale-women", description: "Special discounts on Women unstitched fabrics." },
      "sale-men": { id: "pcat_sale_men", name: "Gents Unstitched Sale", handle: "sale-men", description: "Special discounts on Men unstitched fabrics." },
      clearance: { id: "pcat_01M3EW9AKXGM7NG6EV4ZWEJ9ME", name: "Clearance Unstitched Cuts", handle: "clearance", description: "Final markdowns on end-of-season cuts." },
      "special-offers": { id: "pcat_01M3EW9AKXZXVTMN34FYFH4MVY", name: "Special Festive Offers", handle: "special-offers", description: "Limited edition festive bundle offers." },
      // Brand Root & Brand Specific Categories
      brands: { id: "pcat_brands_root", name: "Brands & Designer Labels", handle: "brands", description: "Original Pakistani Designer Unstitched Collections." },
      "brand-khaadi": { id: "pcat_brand_khaadi", name: "Khaadi", handle: "brand-khaadi", description: "Khaadi Original Unstitched Fabrics." },
      "khaadi-women": { id: "pcat_brand_khaadi_women", name: "Khaadi Ladies Unstitched", handle: "khaadi-women", description: "Khaadi Ladies Unstitched Luxury Suits." },
      "khaadi-men": { id: "pcat_brand_khaadi_men", name: "Khaadi Gents Unstitched", handle: "khaadi-men", description: "Khaadi Gents Unstitched Fabrics." },
      "brand-sapphire": { id: "pcat_brand_sapphire", name: "Sapphire", handle: "brand-sapphire", description: "Sapphire Unstitched Lawn & Silk Collections." },
      "sapphire-women": { id: "pcat_brand_sapphire_women", name: "Sapphire Ladies Unstitched", handle: "sapphire-women", description: "Sapphire Ladies Unstitched Luxury Suits." },
      "sapphire-men": { id: "pcat_brand_sapphire_men", name: "Sapphire Gents Unstitched", handle: "sapphire-men", description: "Sapphire Gents Unstitched Fabrics." },
      "brand-gul-ahmed": { id: "pcat_brand_gul_ahmed", name: "Gul Ahmed", handle: "brand-gul-ahmed", description: "Gul Ahmed Original Lawn & Chairman Latha." },
      "gul-ahmed-women": { id: "pcat_brand_gul_ahmed_women", name: "Gul Ahmed Ladies Unstitched", handle: "gul-ahmed-women", description: "Gul Ahmed Ladies Unstitched Luxury Suits." },
      "gul-ahmed-men": { id: "pcat_brand_gul_ahmed_men", name: "Gul Ahmed Gents Unstitched", handle: "gul-ahmed-men", description: "Gul Ahmed Chairman Latha & Cotton Cuts." },
      "brand-j-dot": { id: "pcat_brand_j_dot", name: "J. Junaid Jamshed", handle: "brand-j-dot", description: "J. Traditional Heirloom Unstitched Fabrics." },
      "j-dot-women": { id: "pcat_brand_j_dot_women", name: "J. Ladies Unstitched", handle: "j-dot-women", description: "J. Ladies Unstitched Luxury Suits." },
      "j-dot-men": { id: "pcat_brand_j_dot_men", name: "J. Gents Unstitched", handle: "j-dot-men", description: "J. Pure Silk Boski & Gents Unstitched Cuts." },
      "brand-alkaram": { id: "pcat_brand_alkaram", name: "Alkaram Studio", handle: "brand-alkaram", description: "Alkaram Studio Premium Unstitched Weaves." },
      "alkaram-women": { id: "pcat_brand_alkaram_women", name: "Alkaram Ladies Unstitched", handle: "alkaram-women", description: "Alkaram Ladies Unstitched Luxury Suits." },
      "alkaram-men": { id: "pcat_brand_alkaram_men", name: "Alkaram Gents Unstitched", handle: "alkaram-men", description: "Alkaram Italian Superfine Cotton & Wash & Wear." },
      "brand-limelight": { id: "pcat_brand_limelight", name: "Limelight", handle: "brand-limelight", description: "Limelight Contemporary Unstitched Cuts." },
      "limelight-women": { id: "pcat_brand_limelight_women", name: "Limelight Ladies Unstitched", handle: "limelight-women", description: "Limelight Ladies Unstitched Printed Cuts." },
      "limelight-men": { id: "pcat_brand_limelight_men", name: "Limelight Gents Unstitched", handle: "limelight-men", description: "Limelight Easy-Care Wash & Wear." },
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
