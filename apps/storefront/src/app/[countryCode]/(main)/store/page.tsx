import { Metadata } from "next"
import { CatalogQuery } from "@lib/data/catalog"
import CatalogTemplate from "@modules/store/templates/catalog"
export const metadata: Metadata = { title: "Shop the Collection | NAQSH", description: "Explore NAQSH clothing, fabrics and accessories." }
export const dynamic = "force-dynamic"
export const revalidate = 0
export default async function StorePage({ params, searchParams }: { params: Promise<{ countryCode: string }>; searchParams: Promise<CatalogQuery> }) {
  const [{ countryCode }, query] = await Promise.all([params, searchParams])
  return <CatalogTemplate countryCode={countryCode} query={query} title="The complete collection" description="Considered details. Effortless silhouettes. Discover your next NAQSH piece." />
}
