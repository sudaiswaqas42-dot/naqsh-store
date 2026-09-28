"use client"

import { addToCart } from "@lib/data/cart"
import { useIntersection } from "@lib/hooks/use-in-view"
import { HttpTypes } from "@medusajs/types"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import { isEqual } from "lodash"
import { useParams, usePathname, useSearchParams, useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import ProductPrice from "../product-price"
import MobileActions from "./mobile-actions"
import { useCartDrawer } from "@lib/context/cart-drawer-context"
import { useToast } from "@lib/context/toast-context"
import { useWishlist } from "@lib/context/wishlist-context"
import SizeGuideModal from "@modules/products/components/size-guide-modal"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt) => {
    if (varopt.option_id) acc[varopt.option_id] = varopt.value
    return acc
  }, {})
}

export default function ProductActions({
  product,
  disabled,
}: ProductActionsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const { openCart } = useCartDrawer()
  const { showToast } = useToast()
  const { isInWishlist, toggleWishlist } = useWishlist()

  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [isAdding, setIsAdding] = useState(false)
  const [showSizeGuide, setShowSizeGuide] = useState(false)
  const [openAccordion, setOpenAccordion] = useState<"desc" | "care" | null>("desc")
  const countryCode = useParams().countryCode as string


  // Track recently viewed products for Task 5
  useEffect(() => {
    if (!product || !product.id) return
    try {
      const stored = localStorage.getItem("naqsh_recently_viewed")
      const list = stored ? JSON.parse(stored) : []
      const filtered = list.filter((p: any) => p.id !== product.id)
      const newItem = {
        id: product.id,
        title: product.title,
        handle: product.handle,
        thumbnail: product.thumbnail || product.images?.[0]?.url,
        price:
          product.variants?.[0]?.calculated_price?.calculated_amount ??
          (product.variants?.[0] as any)?.prices?.[0]?.amount ??
          0,
        currency_code: "pkr",
        viewedAt: Date.now(),
      }
      const updated = [newItem, ...filtered].slice(0, 10)
      localStorage.setItem("naqsh_recently_viewed", JSON.stringify(updated))
    } catch {}
  }, [product])

  // If there is only 1 variant, preselect the options
  useEffect(() => {
    if (product.variants?.length === 1) {
      const variantOptions = optionsAsKeymap(product.variants[0].options)
      setOptions(variantOptions ?? {})
    } else {
      setOptions({})
    }
  }, [product.variants])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  // update the options when a variant is selected
  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }))
  }

  // check if the selected options produce a valid variant
  const isValidVariant = useMemo(() => {
    return product.variants?.some((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    const value = isValidVariant ? selectedVariant?.id : null

    if (params.get("v_id") === value) {
      return
    }

    if (value) {
      params.set("v_id", value)
    } else {
      params.delete("v_id")
    }

    router.replace(pathname + "?" + params.toString())
  }, [selectedVariant, isValidVariant])

  // check if an individual option value is in stock
  const isOptionValueInStock = (optionId: string, val: string) => {
    const matchingVariants = product.variants?.filter((v) => {
      return v.options?.some((o) => o.option_id === optionId && o.value === val)
    }) || []

    if (matchingVariants.length === 0) return false

    return matchingVariants.some((v) => {
      if (!v.manage_inventory) return true
      if (v.allow_backorder) return true
      return (v.inventory_quantity || 0) > 0
    })
  }

  // check if the currently selected variant is in stock
  const inStock = useMemo(() => {
    if (!selectedVariant) {
      // If no variant selected, check if any variant is in stock
      return product.variants?.some((v) => {
        if (!v.manage_inventory) return true
        if (v.allow_backorder) return true
        return (v.inventory_quantity || 0) > 0
      }) ?? false
    }

    if (!selectedVariant.manage_inventory) {
      return true
    }

    if (selectedVariant.allow_backorder) {
      return true
    }

    if (
      selectedVariant.manage_inventory &&
      (selectedVariant.inventory_quantity || 0) > 0
    ) {
      return true
    }

    return false
  }, [selectedVariant, product.variants])

  const actionsRef = useRef<HTMLDivElement>(null)
  const inView = useIntersection(actionsRef, "0px")

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) {
      showToast("Please select a size / variant first.", "info")
      return null
    }

    setIsAdding(true)

    try {
      await addToCart({
        variantId: selectedVariant.id,
        quantity: 1,
        countryCode,
      })
      showToast(`Added ${product.title} to your bag!`, "success")
      openCart()
    } catch (err: any) {
      showToast(err?.message || "Failed to add to bag.", "error")
    } finally {
      setIsAdding(false)
    }
  }

  const isFavorited = isInWishlist(product.id)

  const handleWishlistToggle = () => {
    const rawPrice =
      selectedVariant?.calculated_price?.calculated_amount ?? 0

    toggleWishlist({
      id: product.id,
      title: product.title,
      handle: product.handle,
      thumbnail: product.thumbnail || product.images?.[0]?.url,
      price: rawPrice,
      currency_code: "pkr",
    })
    showToast(isFavorited ? "Removed from Wishlist" : "Saved to Wishlist", "info")
  }

  const handleNotifyMe = () => {
    showToast("We will notify you immediately once this item is restocked!", "success")
  }

  return (
    <>
      <div className="flex flex-col gap-y-4 font-sans text-stone-900 select-none" ref={actionsRef}>
        {/* 1. Product Title (Matching Image 1) */}
        <h1 className="text-2xl sm:text-3xl font-serif font-medium tracking-tight text-stone-900">
          {product.title}
        </h1>

        {/* 2. Product Price (Matching Image 1) */}
        <div className="text-xl sm:text-2xl font-serif text-stone-900 -mt-1">
          <ProductPrice product={product} variant={selectedVariant} />
        </div>



        {/* 4. Variant / Size Selectors with Exact Strike-Through Circles for Out-of-Stock (Matching Image 1) */}
        <div className="pt-2">
          {(product.options || []).map((option) => (
            <div key={option.id} className="mb-3">
              <OptionSelect
                option={option}
                current={options[option.id]}
                updateOption={setOptionValue}
                title={option.title ?? ""}
                data-testid="product-options"
                disabled={!!disabled || isAdding}
                isOptionValueInStock={isOptionValueInStock}
              />
            </div>
          ))}
        </div>

        {/* 5. Action Buttons (Exact Match to Image 1: OUT OF STOCK gray button + Heart circle + NOTIFY ME button) */}
        <div className="space-y-3 pt-1">
          {!inStock ? (
            <>
              {/* Row: Gray OUT OF STOCK button + Heart circle */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled
                  className="flex-1 h-12 bg-[#78716c] text-white text-xs font-bold uppercase tracking-widest rounded-full shadow-xs cursor-not-allowed flex items-center justify-center"
                >
                  OUT OF STOCK
                </button>

                <button
                  type="button"
                  onClick={handleWishlistToggle}
                  aria-label="Save to Wishlist"
                  className="w-12 h-12 rounded-full border border-stone-400 hover:border-black flex items-center justify-center text-stone-700 hover:text-black transition-colors flex-shrink-0"
                >
                  <svg
                    className={`w-5 h-5 ${isFavorited ? "fill-red-500 text-red-500" : "fill-none"}`}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
              </div>

              {/* Full width black NOTIFY ME WHEN AVAILABLE button (from Image 1) */}
              <button
                type="button"
                onClick={handleNotifyMe}
                className="w-full h-12 bg-stone-950 hover:bg-black text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all duration-200 shadow-xs flex items-center justify-center active:scale-[0.99]"
              >
                NOTIFY ME WHEN AVAILABLE
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAdding || !!disabled || !isValidVariant || !inStock}
                className="flex-1 h-12 bg-stone-950 hover:bg-black text-white text-xs font-bold uppercase tracking-widest rounded-full transition-all duration-200 shadow-xs flex items-center justify-center active:scale-[0.99]"
              >
                {isAdding ? "ADDING TO BAG..." : "ADD TO BAG"}
              </button>

              <button
                type="button"
                onClick={handleWishlistToggle}
                aria-label="Save to Wishlist"
                className="w-12 h-12 rounded-full border border-stone-400 hover:border-black flex items-center justify-center text-stone-700 hover:text-black transition-colors flex-shrink-0"
              >
                <svg
                  className={`w-5 h-5 ${isFavorited ? "fill-red-500 text-red-500" : "fill-none"}`}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* 6. Advance Payment Notice (Matching Image 1: Note: A 50% advance payment is required...) */}
        <p className="text-xs text-stone-800 leading-relaxed font-normal pt-1">
          <span className="font-bold text-stone-900">Note:</span> A 50% advance payment is required for order processing and stitching confirmation.
        </p>

        {/* 7. Accordions on soft light-gray bars with black square toggle (Matching Image 1 & 2) */}
        <div className="space-y-2 pt-2">
          {/* Description Accordion */}
          <div className="border border-stone-200/60 overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenAccordion(openAccordion === "desc" ? null : "desc")}
              className="w-full bg-[#f5f5f4] hover:bg-[#e7e5e4] px-4 py-3.5 flex items-center justify-between transition-colors text-left"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-800">
                Description
              </span>
              <span className="w-6 h-6 bg-black text-white flex items-center justify-center text-sm font-bold">
                {openAccordion === "desc" ? "−" : "+"}
              </span>
            </button>

            {openAccordion === "desc" && (
              <div className="p-4 bg-white text-xs text-stone-600 leading-relaxed space-y-3 animate-fadeIn">
                <p>{product.description || "Crafted from Pakistan's most premium textile mills, this ensemble features artisanal motifs, bespoke needlework, and fine drape finish."}</p>
                <div className="divide-y divide-stone-100 border-t border-stone-100 pt-2 text-[11px]">
                  <div className="py-1 flex justify-between">
                    <span className="font-medium text-stone-500">Shirt Fabric:</span>
                    <span className="text-stone-800 font-medium">3.0m Embroidered Fine Lawn / Cotton</span>
                  </div>
                  <div className="py-1 flex justify-between">
                    <span className="font-medium text-stone-500">Dupatta:</span>
                    <span className="text-stone-800 font-medium">2.5m Pure Silk / Chiffon with Printed Borders</span>
                  </div>
                  <div className="py-1 flex justify-between">
                    <span className="font-medium text-stone-500">Trouser:</span>
                    <span className="text-stone-800 font-medium">2.5m Dyed Cambric Cotton</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Care instruction Accordion */}
          <div className="border border-stone-200/60 overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenAccordion(openAccordion === "care" ? null : "care")}
              className="w-full bg-[#f5f5f4] hover:bg-[#e7e5e4] px-4 py-3.5 flex items-center justify-between transition-colors text-left"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-800">
                Care instruction
              </span>
              <span className="w-6 h-6 bg-black text-white flex items-center justify-center text-sm font-bold">
                {openAccordion === "care" ? "−" : "+"}
              </span>
            </button>

            {openAccordion === "care" && (
              <div className="p-4 bg-white text-xs text-stone-600 leading-relaxed space-y-2 animate-fadeIn text-[11px]">
                <ul className="list-disc pl-4 space-y-1">
                  <li>Dry clean recommended for embellished & delicate fabrics.</li>
                  <li>Do not use any type of bleach or stain-removing chemicals.</li>
                  <li>Iron the clothes at moderate temperature.</li>
                  <li>Do not dry fabric in direct sunlight to maintain vibrant color fastness.</li>
                  <li>Wash colored and white fabrics separately.</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* 8. Solid Black Size Guide Button (Matching Image 1 & 2) */}
        <div>
          <button
            type="button"
            onClick={() => setShowSizeGuide(true)}
            className="bg-black text-white px-5 py-2 text-xs font-bold uppercase tracking-wider hover:bg-stone-800 transition-colors inline-block shadow-2xs"
          >
            Size Guide
          </button>
        </div>

        {/* 9. COD Notice (Matching Image 1) */}
        <p className="text-xs text-stone-700 font-normal">
          International orders will not be available on COD.
        </p>

        {/* 10. SKU (Matching Image 1) */}
        <p className="text-xs text-stone-700 font-normal">
          SKU: <span className="text-stone-900 font-medium">{selectedVariant?.sku || product.handle || "00262"}</span>
        </p>

        {/* 11. Social Media Links (Matching Image 1: Facebook, Instagram, TikTok) */}
        <div className="flex items-center gap-4 text-stone-800 pt-1">
          {/* Facebook */}
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on Facebook"
            className="w-7 h-7 flex items-center justify-center hover:text-blue-600 transition-colors"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.7 5H18V0h-3.808C10.592 0 9 1.583 9 4.615V8z" />
            </svg>
          </a>

          {/* Instagram */}
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow on Instagram"
            className="w-7 h-7 flex items-center justify-center hover:text-pink-600 transition-colors"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>

          {/* TikTok */}
          <a
            href="https://tiktok.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow on TikTok"
            className="w-7 h-7 flex items-center justify-center hover:text-black transition-colors"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 00-1-.08A6.34 6.34 0 003 15.66a6.34 6.34 0 0010.82 4.47 6.27 6.27 0 001.88-4.47V8.77a8.28 8.28 0 004.89 1.57V6.89a4.88 4.88 0 01-1-.2z" />
            </svg>
          </a>
        </div>

        {/* WhatsApp Direct Product Inquiry Button */}
        <div className="pt-2">
          <a
            href={`https://wa.me/923197365388?text=${encodeURIComponent(
              `Assalam-o-Alaikum NAQSH, I want to inquire about: ${product.title} (SKU: ${selectedVariant?.sku || product.handle}). Is this available for immediate dispatch?`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 transition-colors rounded-none"
          >
            <svg className="w-4 h-4 fill-emerald-600" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.587 1.771.865 2.791.865 3.182 0 5.768-2.587 5.768-5.766 0-3.18-2.586-5.751-5.768-5.751zm0-2.172c4.418 0 8 3.582 8 8s-3.582 8-8 8c-1.42 0-2.753-.37-3.908-1.018l-5.092 1.332 1.356-4.957c-.742-1.218-1.176-2.651-1.176-4.182 0-4.418 3.582-8 8-8z" />
            </svg>
            <span>Inquire on WhatsApp</span>
          </a>
        </div>

        <MobileActions
          product={product}
          variant={selectedVariant}
          options={options}
          updateOptions={setOptionValue}
          inStock={inStock}
          handleAddToCart={handleAddToCart}
          isAdding={isAdding}
          show={!inView}
          optionsDisabled={!!disabled || isAdding}
        />
      </div>

      <SizeGuideModal
        isOpen={showSizeGuide}
        onClose={() => setShowSizeGuide(false)}
      />
    </>
  )
}
