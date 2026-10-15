"use client"

import { HttpTypes } from "@medusajs/types"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import { selectableOptions } from "@lib/util/selectable-options"
import { useParams, usePathname, useSearchParams, useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import ProductFavorite from "../product-favorite"
import ProductPrice from "../product-price"
import { useCartDrawer } from "@lib/context/cart-drawer-context"
import { useToast } from "@lib/context/toast-context"
import ProductAttributes from "../product-attributes"
import { publicValue, formatSizeName } from "@lib/util/product-details"
import { fetchCodSettingsClient, normalizeWhatsApp, getWhatsAppUrl } from "@lib/util/whatsapp"

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

  const { addItem, closeCart } = useCartDrawer()
  const { showToast } = useToast()

  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [isAdding, setIsAdding] = useState(false)
  const [openAccordion, setOpenAccordion] = useState<"desc" | "care" | null>("desc")
  const [whatsappNumber, setWhatsappNumber] = useState("")
  const countryCode = useParams().countryCode as string

  useEffect(() => {
    let cancelled = false
    fetchCodSettingsClient().then(settings => {
      if (!cancelled && settings?.whatsapp_number) {
        setWhatsappNumber(settings.whatsapp_number)
      }
    })
    return () => { cancelled = true }
  }, [])

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
      window.dispatchEvent(new Event("naqsh_recently_viewed_updated"))
    } catch {}
  }, [product])

  const [validationShake, setValidationShake] = useState(false)
  const effectiveOptions = useMemo(() => selectableOptions(product), [product])
  const previousProduct = useRef("")
  useEffect(() => {
    const changed = previousProduct.current !== product.id
    previousProduct.current = product.id
    setOptions(previous => {
      const next = changed ? {} : { ...previous }
      for (const option of effectiveOptions) {
        const values = Array.from(new Set(option.values?.map(value => value.value)))
        if (values.length === 1) next[option.id] = values[0]
      }
      return next
    })
  }, [product.id, effectiveOptions])

  const selectedVariant = useMemo(() => {
    const candidates = (product.variants || []).filter(variant => effectiveOptions.every(option => {
      if (!product.options?.some(real => real.id === option.id)) return true
      return !!options[option.id] && variant.options?.some(value => value.option_id === option.id && value.value === options[option.id])
    }))
    const available = candidates.filter(variant => !variant.manage_inventory || variant.allow_backorder || (variant.inventory_quantity || 0) > 0)
    return (available.length ? available : candidates).sort((a, b) => (a.calculated_price?.calculated_amount || 0) - (b.calculated_price?.calculated_amount || 0))[0]
  }, [product, effectiveOptions, options])

  // update the options when a variant is selected
  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }))
  }

  // check if the selected options produce a valid variant
  const isValidVariant = !!selectedVariant

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
  const isOptionValueInStock = (optionId: string, val: string) => {
    // If option is synthesized from metadata or product has no defined variant options
    const isSynthesized = !product.options?.some((o) => o.id === optionId)
    if (isSynthesized) {
      if (!product.variants || product.variants.length === 0) return true
      return product.variants.some((v) => {
        if (!v.manage_inventory) return true
        if (v.allow_backorder) return true
        return (v.inventory_quantity || 0) > 0
      })
    }

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

  // add the selected variant to the cart
  const handleAddToCart = async (buyNow = false) => {
    if (isAdding || disabled) return
    if (!allOptionsSelected) {
      const missingTitles = missingOptions.map((o) => o.title || "Option").join(" & ")
      showToast(`Please select ${missingTitles} first.`, "info")
      setValidationShake(true)
      setTimeout(() => setValidationShake(false), 600)
      return null
    }

    if (!selectedVariant?.id || !isValidVariant || !inStock) {
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
        openDrawer: !buyNow,
        preview: { title: itemTitle, thumbnail: product.thumbnail || product.images?.[0]?.url, unit_price: selectedVariant.calculated_price?.calculated_amount ?? 0 },
      })
      if (buyNow) { closeCart(); router.push(`/${countryCode}/checkout`) }
      else showToast("Added to cart", "success")

    } catch (err: any) {
      showToast(err?.message || "Failed to add to cart.", "error")
    } finally {
      setIsAdding(false)
    }
  }

  const detailRows = [
    ["Shirt fabric", product.metadata?.shirt_fabric],
    ["Dupatta", product.metadata?.dupatta],
    ["Trouser", product.metadata?.trouser],
  ].filter(([, value]) => publicValue(value))
  return (
    <>
      <div className="product-detail-actions flex flex-col gap-y-4 font-sans text-stone-900" ref={actionsRef}>
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
                validationShake={validationShake}
              />
            </div>
          ))}
        </div>

        <div className="hidden lg:block"><ProductAttributes product={product} /></div>

        <div className={`product-buy-actions grid grid-cols-2 gap-3 pt-2 ${validationShake ? "animate-shake" : ""}`}>
          {/* 1. ADD TO CART BUTTON */}
          <button
            type="button"
            onClick={() => handleAddToCart(false)}
            disabled={isAdding || !!disabled || (allOptionsSelected && !inStock)}
            aria-disabled={!allOptionsSelected}
            className={`flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-300 ease-out ${
              !allOptionsSelected
                ? "bg-white text-stone-950 border-2 border-stone-800 shadow-xs hover:bg-stone-50 cursor-pointer"
                : inStock
                ? "bg-stone-950 hover:bg-black text-white border-2 border-stone-950 shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
                : "bg-stone-200 text-stone-500 border-2 border-stone-300 cursor-not-allowed"
            } ${validationShake && !allOptionsSelected ? "ring-2 ring-red-400" : ""}`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
              className="flex-shrink-0"
            >
              <path d="M5 8h14l1 13H4L5 8ZM8 8V6a4 4 0 0 1 8 0v2" />
            </svg>
            <span>
              {isAdding
                ? "Adding..."
                : allOptionsSelected && !inStock
                ? "Out of Stock"
                : "Add to Cart"}
            </span>
          </button>

          {/* 2. BUY NOW BUTTON */}
          <button
            type="button"
            onClick={() => handleAddToCart(true)}
            disabled={isAdding || !!disabled || (allOptionsSelected && !inStock)}
            aria-disabled={!allOptionsSelected}
            className={`flex min-h-12 items-center justify-center rounded-xl px-3 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-300 ease-out ${
              !allOptionsSelected
                ? "bg-white text-stone-950 border-2 border-stone-800 shadow-xs hover:bg-stone-50 cursor-pointer"
                : inStock
                ? "bg-[#B6975A] hover:bg-[#a38448] text-white border-2 border-[#B6975A] shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
                : "bg-stone-200 text-stone-500 border-2 border-stone-300 cursor-not-allowed"
            } ${validationShake && !allOptionsSelected ? "ring-2 ring-red-400" : ""}`}
          >
            <span>
              {isAdding
                ? "Processing..."
                : allOptionsSelected && !inStock
                ? "Out of Stock"
                : "Buy Now"}
            </span>
          </button>

          <ProductFavorite product={product} />

          {/* Validation Notice & Helper */}
          {!allOptionsSelected ? (
            <div
              className={`col-span-2 flex items-center gap-2 pt-1 transition-all duration-300 ${
                validationShake
                  ? "animate-shake text-amber-700 font-semibold"
                  : "text-stone-600"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full flex-shrink-0 ${
                  validationShake ? "bg-red-500 animate-ping" : "bg-amber-500 animate-pulse"
                }`}
              />
              <span className="text-xs">
                Please select{" "}
                <strong className="font-semibold text-stone-900">
                  {missingOptions.map((option) => option.title).join(" & ")}
                </strong>{" "}
                to enable Add to Cart and Buy Now.
              </span>
            </div>
          ) : inStock ? (
            <div className="col-span-2 flex items-center gap-1.5 pt-0.5 text-xs text-emerald-700 animate-fadeIn font-medium">
              <svg
                className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Option selected • In stock</span>
            </div>
          ) : null}
        </div>

        {/* 6. Advance Payment Notice (Matching Image 1: Note: A 50% advance payment is required...) */}
        <p className="hidden lg:block text-xs text-stone-800 leading-relaxed font-normal pt-1">
          <span className="font-bold text-stone-900">Note:</span> A 50% advance payment is required for order processing and stitching confirmation.
        </p>

        {/* 7. Accordions on soft light-gray bars with black square toggle (Matching Image 1 & 2) */}
        <div className="product-description space-y-2 pt-2">
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
        <p className="hidden lg:block text-xs text-stone-700 font-normal">
          International orders will not be available on COD.
        </p>

        {/* 10. SKU (Matching Image 1) */}
        <p className="text-xs text-stone-700 font-normal">
          SKU: <span className="text-stone-900 font-medium">{selectedVariant?.sku || product.handle || "00262"}</span>
        </p>

        {/* 11. Social Media Links (Matching Image 1: Facebook, Instagram, TikTok) */}
        <div className="hidden lg:flex items-center gap-4 text-stone-800 pt-1">
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
        <div className="product-inquiry pt-2">
          {(() => {
            const whatsapp = normalizeWhatsApp(whatsappNumber)
            const inquiryMsg = `Assalam-o-Alaikum NAQSH, I want to inquire about: ${product.title} (SKU: ${selectedVariant?.sku || product.handle}). Is this available for immediate dispatch?`
            const href = whatsapp.isValid
              ? getWhatsAppUrl(whatsapp.digits, inquiryMsg)
              : `/contact?subject=${encodeURIComponent(`Product Inquiry: ${product.title}`)}`
            return (
              <a
                href={href}
                target={whatsapp.isValid ? "_blank" : undefined}
                rel={whatsapp.isValid ? "noopener noreferrer" : undefined}
                className="w-full py-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 transition-colors rounded-none"
              >
                <svg className="w-4 h-4 fill-emerald-600" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.587 1.771.865 2.791.865 3.182 0 5.768-2.587 5.768-5.766 0-3.18-2.586-5.751-5.768-5.751zm0-2.172c4.418 0 8 3.582 8 8s-3.582 8-8 8c-1.42 0-2.753-.37-3.908-1.018l-5.092 1.332 1.356-4.957c-.742-1.218-1.176-2.651-1.176-4.182 0-4.418 3.582-8 8-8z" />
                </svg>
                <span>Inquire on WhatsApp</span>
              </a>
            )
          })()}
        </div>
      </div>

    </>
  )
}
