import { listProducts } from "@lib/data/products"
import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import NaqshCatalogView from "../components/naqsh-catalog-view"

export default async function StoreTemplate({
  countryCode,
}: {
  countryCode: string
  sortBy?: any
  page?: string
  optionValueIds?: any
}) {
  const [productsData, categories, collectionsData] = await Promise.all([
    listProducts({
      countryCode,
      queryParams: {
        limit: 50,
        fields:
          "*variants.calculated_price,*variants.prices,+variants.inventory_quantity,*variants.options,*images,*categories,*collection",
      },
    }).catch(() => ({ response: { products: [] } })),
    listCategories({ limit: 100 }).catch(() => []),
    listCollections().catch(() => ({ collections: [] })),
  ])

  const products = productsData.response.products || []
  const collections = collectionsData.collections || []

  return (
    <NaqshCatalogView
      initialProducts={products}
      title="The Complete NAQSH Collection"
      description="Handcrafted silhouettes, pure lawn embroideries, and couture Pakistani fashion designed for effortless distinction."
      categories={categories}
      collections={collections}
    />
  )
}
