"use client"

import { HttpTypes } from "@medusajs/types"
import React from "react"
import { formatSizeName } from "@lib/util/product-details"

type OptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (optionId: string, value: string) => void
  title: string
  disabled: boolean
  isOptionValueInStock?: (optionId: string, value: string) => boolean
  "data-testid"?: string
}

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  disabled,
  isOptionValueInStock,
  "data-testid": dataTestId,
}) => {
  const filteredOptions = Array.from(new Set((option.values ?? []).map((v) => v.value)))
  const isSize = /size/i.test(title)
  const currentDisplay = current ? (isSize ? formatSizeName(current) : current) : ""

  return (
    <div className="flex flex-col gap-y-3 font-sans">
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-stone-900">
        <span className="text-stone-500 font-medium">Select:</span>
        <span className="text-stone-900">{title}{currentDisplay ? `: ${currentDisplay}` : ""}</span>
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
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default OptionSelect
