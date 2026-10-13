"use client"

import { HttpTypes } from "@medusajs/types"
import React, { useState } from "react"
import { formatSizeName } from "@lib/util/product-details"
import SizeGuideModal from "@modules/products/components/size-guide-modal"

type OptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (optionId: string, value: string) => void
  title: string
  disabled: boolean
  isOptionValueInStock?: (optionId: string, value: string) => boolean
  "data-testid"?: string
  validationShake?: boolean
}

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  disabled,
  isOptionValueInStock,
  "data-testid": dataTestId,
  validationShake,
}) => {
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false)
  const filteredOptions = Array.from(new Set((option.values ?? []).map((v) => v.value)))
  const isSize = /size/i.test(title)
  const currentDisplay = current ? (isSize ? formatSizeName(current) : current) : ""
  const isPending = !current && validationShake

  return (
    <div className={`flex flex-col gap-y-3 font-sans transition-all duration-300 rounded-lg p-1.5 ${
      isPending ? "bg-amber-50/70 ring-2 ring-amber-400 animate-shake" : ""
    }`}>
      <div className="flex items-center justify-between text-xs uppercase tracking-wider font-semibold text-stone-900">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-stone-500 font-medium">Select:</span>
          <span className="text-stone-900">{title}{currentDisplay ? `: ${currentDisplay}` : ""}</span>
          {!current && (
            <span className="text-[10px] text-amber-700 font-medium lowercase tracking-normal bg-amber-100/70 px-2 py-0.5 rounded-full">
              Required
            </span>
          )}
        </div>
        {isSize && (
          <>
            <button
              type="button"
              onClick={() => setIsSizeGuideOpen(true)}
              className="text-[11px] font-medium text-stone-500 underline underline-offset-2 hover:text-stone-900 normal-case tracking-normal transition-colors"
            >
              Size Guide
            </button>
            <SizeGuideModal isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />
          </>
        )}
      </div>

      <div
        className="flex flex-wrap items-center gap-2.5"
        data-testid={dataTestId}
      >
        {filteredOptions.map((v) => {
          const isSelected = v === current
          const inStock = isOptionValueInStock ? isOptionValueInStock(option.id, v) : true
          const displayValue = isSize ? formatSizeName(v) : v

          return (
            <button
              type="button"
              key={v}
              onClick={() => updateOption(option.id, v)}
              disabled={disabled}
              aria-pressed={isSelected}
              title={`${displayValue}${!inStock ? " (Out of Stock)" : ""}`}
              className={`relative px-4 py-1.5 rounded-full text-xs transition-all duration-150 ${
                isSelected
                  ? "bg-black text-white font-semibold shadow-xs border border-black"
                  : inStock
                  ? "border border-stone-400 bg-white text-stone-800 hover:border-black font-medium"
                  : "border border-stone-300 bg-stone-50 text-stone-400 font-normal line-through hover:border-stone-400"
              }`}
              data-testid="option-button"
            >
              <span>{displayValue}</span>
              {!inStock && (
                <span className="ml-1 text-[10px] text-red-600 font-semibold no-underline">
                  (Out of Stock)
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default OptionSelect
