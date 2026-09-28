import React, { Suspense } from "react"
import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import RelatedProducts from "@modules/products/components/related-products"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import ProductActionsWrapper from "./product-actions-wrapper"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
  images,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  // Check if completely out of stock across all variants
  const isOutOfStock = !product.variants?.some(
    (v) => !v.manage_inventory || v.allow_backorder || (v.inventory_quantity || 0) > 0
  )

  // Ensure gallery has images: fallback to product thumbnail if images array is empty
  const galleryImages = (images && images.length > 0)
    ? images
    : (product.thumbnail ? [{ id: "thumb", url: product.thumbnail } as any] : [])

  return (
    <>
      <div
        className="content-container mx-auto px-4 sm:px-6 lg:px-8 py-6 relative"
        data-testid="product-container"
      >
        {/* Breadcrumb Navigation matching Image 1: Home / Collection / Product */}
        <nav className="flex items-center text-xs text-stone-500 mb-6 gap-2 font-sans">
          <LocalizedClientLink href="/" className="hover:text-stone-900 transition-colors">
            Home
          </LocalizedClientLink>
          <span>/</span>
          {product.collection && (
            <>
              <LocalizedClientLink
                href={`/collections/${product.collection.handle}`}
                className="hover:text-stone-900 transition-colors"
              >
                {product.collection.title}
              </LocalizedClientLink>
              <span>/</span>
            </>
          )}
          <span className="text-stone-900 font-medium truncate max-w-xs">{product.title}</span>
        </nav>

        {/* 2-Column Luxury Layout Matching Image 1 & Image 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start relative">
          {/* Left Column: Image Gallery with Vertical Thumbnails, Zoom Lens & Side Preview (58% width) */}
          <div className="lg:col-span-7 w-full relative">
            <ImageGallery images={galleryImages} isSoldOut={isOutOfStock} />
          </div>

          {/* Right Column: Title, Price, Live Viewers, Options, Buttons & Details (42% width) */}
          <div className="lg:col-span-5 w-full lg:sticky lg:top-28">
            <Suspense
              fallback={
                <ProductActions
                  disabled={true}
                  product={product}
                  region={region}
                />
              }
            >
              <ProductActionsWrapper id={product.id} region={region} />
            </Suspense>
          </div>
        </div>
      </div>

      <div
        className="content-container my-16 small:my-28"
        data-testid="related-products-container"
      >
        <Suspense fallback={<SkeletonRelatedProducts />}>
          <RelatedProducts product={product} countryCode={countryCode} />
        </Suspense>
      </div>
    </>
  )
}

export default ProductTemplate
