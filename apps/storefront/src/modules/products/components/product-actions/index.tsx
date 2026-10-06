"use client"

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
import ProductAttributes from "../product-attributes"
import { publicValue, formatSizeName } from "@lib/util/product-details"

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

  const { addItem } = useCartDrawer()
  const { showToast } = useToast()
  const { isInWishlist, toggleWishlist } = useWishlist()

  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [isAdding, setIsAdding] = useState(false)
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

  const prevProductIdRef = useRef(product.id)
  const isInitialMount = useRef(true)
  const [validationShake, setValidationShake] = useState(false)

  // Effective options: Combine real product options with metadata sizes/colors
  const effectiveOptions = useMemo(() => {
    const existing = (product.options || []).filter(
      (opt) => opt.title?.toLowerCase() !== "default option"
    )
    const hasColor = existing.some((o) => /colou?r/i.test(o.title || ""))
    const hasSize = existing.some((o) => /size/i.test(o.title || ""))

    const result = [...existing]

    if (!hasColor) {
      const rawColors =
        product.metadata?.colors ||
        product.metadata?.colours ||
        product.metadata?.color ||
        product.metadata?.colour ||
        ["Midnight Blue", "Sand Beige"]
      const colorValues = Array.isArray(rawColors)
        ? rawColors
        : String(rawColors)
            .split(",")
            .map((c) => c.trim())
            .filter(Boolean)

      result.unshift({
        id: "color",
        title: "Color",
        values: colorValues.map((v) => ({ id: `val-${v}`, value: v })),
      } as any)
    }

    if (!hasSize) {
      const rawSizes =
        product.metadata?.sizes ||
        product.metadata?.size ||
        ["Small", "Medium", "Large", "XL"]
      const sizeValues = Array.isArray(rawSizes)
        ? rawSizes
        : String(rawSizes)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)

      result.push({
        id: "size",
        title: "Size",
        values: sizeValues.map((v) => ({ id: `val-${v}`, value: v })),
      } as any)
    }

    // Sort to ensure Color comes before Size matching Image 1
    return result.sort((a, b) => {
      const order = ["color", "size"]
      const aIdx = order.indexOf((a.title || "").toLowerCase())
      const bIdx = order.indexOf((b.title || "").toLowerCase())
      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx
      if (aIdx !== -1) return -1
      if (bIdx !== -1) return 1
      return 0
    })
  }, [product.options, product.metadata])

  // Preselect from URL params on initial mount, or if single variant
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      const vId = searchParams.get("v_id")
      if (vId && product.variants?.length) {
        const found = product.variants.find((v) => v.id === vId)
        if (found) {
          setOptions(optionsAsKeymap(found.options) ?? {})
          return
        }
      }
      if (product.variants?.length === 1 && (product.options || []).length === 0) {
        // Preselect first available color and size
        const initialOpts: Record<string, string> = {}
        effectiveOptions.forEach((opt) => {
          if (opt.values?.[0]?.value) {
            initialOpts[opt.id] = opt.values[0].value
          }
        })
        if (Object.keys(initialOpts).length > 0) {
          setOptions(initialOpts)
          return
        }
      }
      if (product.variants?.length === 1) {
        const variantOptions = optionsAsKeymap(product.variants[0].options)
        setOptions(variantOptions ?? {})
      }
    }
  }, [searchParams, product.variants, effectiveOptions, product.options])

  // Only reset options when navigating to a DIFFERENT product
  useEffect(() => {
    if (prevProductIdRef.current !== product.id) {
      prevProductIdRef.current = product.id
      if (product.variants?.length === 1 && (product.options || []).length === 0) {
        const initialOpts: Record<string, string> = {}
        effectiveOptions.forEach((opt) => {
          if (opt.values?.[0]?.value) {
            initialOpts[opt.id] = opt.values[0].value
          }
        })
        setOptions(initialOpts)
      } else if (product.variants?.length === 1) {
        const variantOptions = optionsAsKeymap(product.variants[0].options)
        setOptions(variantOptions ?? {})
      } else {
        setOptions({})
      }
    }
  }, [product.id, product.variants, effectiveOptions, product.options])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    const found = product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })

    if (!found && product.variants.length === 1) {
      return product.variants[0]
    }

    return found || product.variants[0]
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
    if (product.variants?.length === 1) return true
    return product.variants?.some((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  // Options validation: all options configured on product must be chosen
  const missingOptions = useMemo(() => {
    return effectiveOptions.filter((opt) => !options[opt.id])
  }, [effectiveOptions, options])
  const allOptionsSelected = effectiveOptions.length === 0 || missingOptions.length === 0

  // Update URL search params safely without triggering Next.js RSC re-fetch
  useEffect(() => {
    if (typeof window === "undefined") return
    const value = isValidVariant ? selectedVariant?.id : null
    const url = new URL(window.location.href)
    const current = url.searchParams.get("v_id")

    if (current !== (value || null)) {
      if (value) {
        url.searchParams.set("v_id", value)
      } else {
        url.searchParams.delete("v_id")
      }
      window.history.replaceState(null, "", url.toString())
    }
  }, [selectedVariant, isValidVariant])

  // Context-aware option value stock checking:
  // When Color is selected, checks if Size is in stock for that specific Color
  const isOptionValueInStock = (optionId: string, val: string) => {
    const otherSelected = Object.entries(options).filter(
      ([key, v]) => key !== optionId && !!v
    )

    const matchingVariants = product.variants?.filter((v) => {
      const hasVal = v.options?.some((o) => o.option_id === optionId && o.value === val)
      if (!hasVal) return false

      if (otherSelected.length > 0) {
        return otherSelected.every(([otherId, otherVal]) =>
          v.options?.some((o) => o.option_id === otherId && o.value === otherVal)
        )
      }
      return true
    }) || []

    if (matchingVariants.length === 0) {
      const anyMatching = product.variants?.filter((v) =>
        v.options?.some((o) => o.option_id === optionId && o.value === val)
      ) || []
      return anyMatching.some((v) => {
        if (!v.manage_inventory) return true
        if (v.allow_backorder) return true
        return (v.inventory_quantity || 0) > 0
      })
    }

    return matchingVariants.some((v) => {
      if (!v.manage_inventory) return true
      if (v.allow_backorder) return true
      return (v.inventory_quantity || 0) > 0
    })
  }

  // check if the currently selected variant is in stock
  const inStock = useMemo(() => {
    if (!selectedVariant) {
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
    if (!allOptionsSelected) {
      const missingTitles = missingOptions.map((o) => o.title || "Option").join(" and ")
      showToast(`Please select ${missingTitles} before adding to bag.`, "info")
      setValidationShake(true)
      setTimeout(() => setValidationShake(false), 500)
      return null
    }

    if (!selectedVariant?.id) {
      showToast("Please select valid options first.", "info")
      return null
    }

    setIsAdding(true)

    try {
      const chosenColor = Object.entries(options).find(([k]) => {
        const opt = effectiveOptions.find(o => o.id === k)
        return opt && /colou?r/i.test(opt.title || "")
      })?.[1]

      const chosenSize = Object.entries(options).find(([k]) => {
        const opt = effectiveOptions.find(o => o.id === k)
        return opt && /size/i.test(opt.title || "")
      })?.[1]

      const variantDetails = [chosenColor, chosenSize ? formatSizeName(chosenSize) : null].filter(Boolean).join(" / ")
      const itemTitle = variantDetails ? `${product.title} (${variantDetails})` : product.title

      await addItem({
        variantId: selectedVariant.id,
        quantity: 1,
        countryCode,
        preview: { title: itemTitle, thumbnail: product.thumbnail || product.images?.[0]?.url, unit_price: selectedVariant.calculated_price?.calculated_amount ?? 0 },
      })
      showToast(`Added ${itemTitle} to your bag!`, "success")

    } catch (err: any) {
      showToast(err?.message || "Failed to add to bag.", "error")
    } finally {
      setIsAdding(false)
    }
  }

  const detailRows = [
    ["Shirt fabric", product.metadata?.shirt_fabric],
    ["Dupatta", product.metadata?.dupatta],
    ["Trouser", product.metadata?.trouser],
  ].filter(([, value]) => publicValue(value))
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
        {product.subtitle && <p className="text-sm text-stone-600">{product.subtitle}</p>}

        {/* 2. Product Price (Matching Image 1) */}
        <div className="text-xl sm:text-2xl font-serif text-stone-900 -mt-1">
          <ProductPrice product={product} variant={selectedVariant} />
        </div>



        {/* 4. Variant / Size Selectors with Full Word Pills (Matching Image 1) */}
        <div className="pt-2">
          {effectiveOptions.map((option) => (
            <div key={option.id} className="mb-3">
              <OptionSelect
                option={{ ...option, values: option.values?.length ? option.values :
                  (product.variants || []).flatMap((variant) => (variant.options || []).filter((value) => value.option_id === option.id)) }}
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

        <ProductAttributes product={product} />

        {/* 5. Action Buttons with Dynamic Enabled/Disabled State & Validation Animation */}
        <div className="space-y-3 pt-1">
          {/* If all options are chosen and that specific variant is out of stock */}
          {allOptionsSelected && selectedVariant && !inStock ? (
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
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                {/* 
                  When both/all options are NOT selected:
                  - Background: White (bg-white)
                  - Text: Dark Black (text-stone-950)
                  - Border: 2px dark border (border-2 border-stone-800)
                  - State: Disabled with cursor-not-allowed
                  - Clicking triggers validation toast & shake animation

                  When both/all options ARE selected:
                  - Background: Dark (bg-stone-950 hover:bg-black)
                  - Text: White (text-white)
                  - Border: Dark (border-2 border-stone-950)
                  - State: Enabled with active scale & shadow
                */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isAdding || !!disabled}
                  aria-disabled={!allOptionsSelected}
                  className={`flex-1 h-12 rounded-full font-bold text-xs uppercase tracking-widest transition-all duration-300 ease-out flex items-center justify-center ${
                    validationShake ? "animate-shake ring-2 ring-red-400" : ""
                  } ${
                    allOptionsSelected && isValidVariant && inStock
                      ? "bg-stone-950 hover:bg-black text-white border-2 border-stone-950 shadow-md hover:shadow-lg cursor-pointer active:scale-[0.99]"
                      : "bg-white text-stone-950 border-2 border-stone-800/80 shadow-xs cursor-not-allowed hover:bg-stone-50"
                  }`}
                >
                  {isAdding ? (
                    "ADDING TO BAG..."
                  ) : allOptionsSelected ? (
                    "ADD TO BAG"
                  ) : (
                    "ADD TO BAG"
                  )}
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

              {/* Validation helper badge when options are still pending */}
              {!allOptionsSelected && (
                <div className="flex items-center gap-1.5 text-[11px] text-stone-600 transition-all duration-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span>
                    Please select{" "}
                    <strong className="text-stone-900 font-semibold">
                      {missingOptions.map((o) => o.title).join(" & ")}
                    </strong>{" "}
                    to enable Add to Bag
                  </span>
                </div>
              )}
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
                <p>{product.description}</p>
                {detailRows.length > 0 && <dl className="divide-y divide-stone-100 border-t border-stone-100 pt-2 text-[11px]">
                  {detailRows.map(([label, value]) => <div key={String(label)} className="py-1 flex justify-between gap-4">
                    <dt>{String(label)}:</dt><dd className="text-stone-800">{publicValue(value)}</dd>
                  </div>)}
                </dl>}
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
                {publicValue(product.metadata?.care_instructions) ? <p className="whitespace-pre-line">{publicValue(product.metadata?.care_instructions)}</p> : <ul className="list-disc pl-4 space-y-1">
                  <li>Dry clean recommended for embellished & delicate fabrics.</li>
                  <li>Do not use any type of bleach or stain-removing chemicals.</li>
                  <li>Iron the clothes at moderate temperature.</li>
                  <li>Do not dry fabric in direct sunlight to maintain vibrant color fastness.</li>
                  <li>Wash colored and white fabrics separately.</li>
                </ul>}
              </div>
            )}
          </div>
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

    </>
  )
}
