import { Metadata } from "next"
import { notFound } from "next/navigation"
import { Suspense, cache } from "react"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import ProductTemplate from "@modules/products/templates"
import { HttpTypes } from "@medusajs/types"
import ProductLoading from "./loading"

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
  searchParams: Promise<{ v_id?: string }>
}

export async function generateStaticParams() {
  return []
}

export const revalidate = 60

const getCachedProduct = cache(async (countryCode: string, handle: string) => {
  return listProducts({
    countryCode,
    queryParams: { handle },
  })
    .then(({ response }) => response.products[0])
    .catch(() => null)
})

function getImagesForVariant(
  product: HttpTypes.StoreProduct,
  selectedVariantId?: string
) {
  if (!selectedVariantId || !product.variants) {
    return product.images
  }

  const variant = product.variants!.find((v) => v.id === selectedVariantId)
  if (!variant || !variant.images?.length) {
    return product.images
  }

  const imageIdsMap = new Map(variant.images!.map((i) => [i.id, true]))
  return product.images?.filter((i) => imageIdsMap.has(i.id)) ?? null
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { handle, countryCode } = params

  const product = await getCachedProduct(countryCode, handle)

  if (!product) {
    return {
      title: "NAQSH — Haute Couture & Pret",
      description: "Artisanal luxury Pakistani couture",
    }
  }

  return {
    title: `${product.title} | NAQSH`,
    description: `${product.description || product.title}`,
    openGraph: {
      title: `${product.title} | NAQSH`,
      description: `${product.description || product.title}`,
      images: product.thumbnail ? [product.thumbnail] : [],
    },
  }
}

export default async function ProductPage(props: Props) {
  const params = await props.params
  const searchParams = await props.searchParams

  return (
    <Suspense fallback={<ProductLoading />}>
      <AsyncProductContent params={params} searchParams={searchParams} />
    </Suspense>
  )
}

async function AsyncProductContent({
  params,
  searchParams,
}: {
  params: { countryCode: string; handle: string }
  searchParams: { v_id?: string }
}) {
  const region = await getRegion(params.countryCode)
  if (!region) {
    notFound()
  }

  const pricedProduct = await getCachedProduct(params.countryCode, params.handle)
  if (!pricedProduct) {
    notFound()
  }

  let images = getImagesForVariant(pricedProduct, searchParams.v_id) || []
  if (images.length === 0 && pricedProduct.thumbnail) {
    images = [{ id: `img_${pricedProduct.id}_thumb`, url: pricedProduct.thumbnail } as any]
  }

  return (
    <ProductTemplate
      product={pricedProduct}
      region={region}
      countryCode={params.countryCode}
      images={images}
    />
  )
}
