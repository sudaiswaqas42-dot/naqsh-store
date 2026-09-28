import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getCollectionByHandle } from "@lib/data/collections"
import { CatalogQuery } from "@lib/data/catalog"
import CatalogTemplate from "@modules/store/templates/catalog"
type Props = { params: Promise<{ handle: string; countryCode: string }>; searchParams: Promise<CatalogQuery> }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params
  const collection = await getCollectionByHandle(handle)
  return { title: collection ? collection.title + " | NAQSH" : "Collection | NAQSH" }
}
export default async function CollectionPage({ params, searchParams }: Props) {
  const [{ handle, countryCode }, query] = await Promise.all([params, searchParams])
  const collection = await getCollectionByHandle(handle)
  if (!collection) notFound()
  return <CatalogTemplate countryCode={countryCode} query={query} collectionId={collection.id} title={collection.title} description="A considered collection of textures, silhouettes and finishing touches." />
}
