import { Metadata } from "next"
import { CatalogQuery } from "@lib/data/catalog"
import CatalogTemplate from "@modules/store/templates/catalog"
export const metadata: Metadata = { title: "Search | NAQSH", description: "Find your next favourite NAQSH piece." }
export default async function SearchPage({ params, searchParams }: { params: Promise<{ countryCode: string }>; searchParams: Promise<CatalogQuery> }) {
  const [{ countryCode }, query] = await Promise.all([params, searchParams])
  return <CatalogTemplate countryCode={countryCode} query={query} title="Find your next favourite" description="Explore by piece, colour, collection or fabric. Refine the results to make them yours." search />
}
