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

export const revalidate = 60

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

  if (!item) notFound()

  const categories = categoriesList || []
  const isSaleCategory = item.handle === "sale" || categoryArray.includes("sale")

  if (isSaleCategory) {
    return (
      <CatalogTemplate
        countryCode={countryCode}
        query={query}
        title={item.name || "End of Season Sale"}
        description={
          item.description ||
          "Explore handcrafted luxury pret, unstitched fabrics, and festive formals on exclusive seasonal sale."
        }
        categoryIds={undefined}
        links={(item.category_children || []).map((child) => ({
          href: "/categories/" + child.handle,
          label: child.name,
        }))}
        isSalePage={true}
      />
    )
  }

  const ids = new Set([item.id])
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
  for (const child of item.category_children || []) ids.add(child.id)

  // Strict category scoping:
  // 1. Women category must NEVER include general unstitched (which contains men) or any men categories
  if (item.handle === "women") {
    for (const candidate of categories) {
      if (candidate.handle === "unstitched" || candidate.handle.startsWith("men")) {
        ids.delete(candidate.id)
      }
    }
  }

  // 2. Unstitched category must include general unstitched as well as women-unstitched and men-unstitched
  if (item.handle === "unstitched") {
    for (const candidate of categories) {
      if (candidate.handle === "women-unstitched" || candidate.handle === "men-unstitched") {
        ids.add(candidate.id)
      }
    }
  }

  // 3. Men category must NEVER include women categories
  if (item.handle === "men") {
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
      title={item.name}
      categoryHandle={item.handle}
      description={item.description || "Explore the collection. Find the details that feel like you."}
      categoryIds={Array.from(ids)}
      links={(item.category_children || []).map((child) => ({
        href: "/categories/" + child.handle,
        label: child.name,
      }))}
    />
  )
}
