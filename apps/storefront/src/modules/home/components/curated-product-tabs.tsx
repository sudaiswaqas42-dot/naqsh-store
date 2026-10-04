"use client"

import React, { useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import NaqshProductCard from "@modules/products/components/naqsh-product-card"

import { computeDiscountForProduct, SalesConfig } from "@lib/data/sales"

interface CuratedTabsProps {
  section?: {
    settings?: { eyebrow?: string }
    title: string
    subtitle: string | null
    cta_text: string | null
    cta_link: string | null
  }
  products: any[]
  collections: any[]
  sales?: SalesConfig
}

export default function CuratedProductTabs({
  section,
  products,
  collections,
  sales,
}: CuratedTabsProps) {
  const [activeTab, setActiveTab] = useState("all")

  // Filter products based on active tab
  const filteredProducts =
    activeTab === "all"
      ? products
      : products.filter((p) => {
          const colHandle = p.collection?.handle || ""
          const colTitle = p.collection?.title || ""
          return (
            colHandle.toLowerCase() === activeTab.toLowerCase() ||
            colTitle.toLowerCase().includes(activeTab.toLowerCase())
          )
        })

  const tabs = [
    { id: "all", label: "All Curations" },
    ...collections.map((c) => ({ id: c.handle, label: c.title })),
  ]

  return (
    <section className="py-20 bg-stone-50/50 border-t border-stone-200/60">
      <div className="content-container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-accent">
            {section?.settings?.eyebrow ?? "Handcrafted luxury"}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-brand font-medium mt-1">
            {section?.title ?? "Curated For You"}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-2 font-light">
            {section?.subtitle ?? "Hand-selected pieces from our latest designer collections"}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mb-12">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2.5 text-xs uppercase tracking-wider font-semibold transition-all rounded-none ${
                  isActive
                    ? "bg-brand text-white shadow-sm"
                    : "bg-white text-stone-600 border border-stone-200 hover:border-brand hover:text-brand"
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Products Grid with Dynamic Discount and Per-Product Sale Toggling */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {filteredProducts.map((product) => {
            const discountData = sales
              ? computeDiscountForProduct(product, sales)
              : { discountPercent: 20, isSale: true, customSalePrice: undefined, customOriginalPrice: undefined }

            return (
              <NaqshProductCard
                key={product.id}
                product={product}
                showSale={discountData.isSale}
                discountPercent={discountData.discountPercent}
                customSalePrice={discountData.customSalePrice}
                customOriginalPrice={discountData.customOriginalPrice}
              />
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 text-center">
          <LocalizedClientLink
            href={section?.cta_link || "/store"}
            className="inline-flex items-center justify-center px-10 py-3.5 bg-brand text-white text-xs font-semibold uppercase tracking-widest hover:bg-black transition-colors shadow-sm"
          >
            <span>{section?.cta_text ?? "Explore All Pieces"}</span>
            <span className="ml-2">&rarr;</span>
          </LocalizedClientLink>
        </div>
      </div>
    </section>
  )
}
