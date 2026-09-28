"use client"

import { HttpTypes } from "@medusajs/types"
import React from "react"

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

  return (
    <div className="flex flex-col gap-y-3 font-sans">
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-stone-900">
        <span className="text-stone-500 font-medium">Select:</span>
        <span className="text-stone-900">{title}{current ? `: ${current}` : ""}</span>
      </div>

      <div
        className="flex flex-wrap items-center gap-2.5"
        data-testid={dataTestId}
      >
        {filteredOptions.map((v) => {
          const isSelected = v === current
          const inStock = isOptionValueInStock ? isOptionValueInStock(option.id, v) : true
          const isShortSize = /size/i.test(title) && v.length <= 4

          if (isShortSize) {
            return (
              <button
                type="button"
                key={v}
                onClick={() => updateOption(option.id, v)}
                disabled={disabled}
                aria-pressed={isSelected}
                title={`${v}${!inStock ? " (Out of Stock)" : ""}`}
                className={`relative w-9 h-9 rounded-full flex items-center justify-center text-xs transition-all duration-150 ${
                  isSelected
                    ? "bg-black text-white border-2 border-black font-semibold shadow-xs"
                    : inStock
                    ? "border border-stone-400 bg-white text-stone-800 hover:border-black font-medium"
                    : "border border-stone-300 bg-stone-50 text-stone-400 font-normal hover:border-stone-400"
                }`}
                data-testid="option-button"
              >
                <span>{v}</span>

                {/* Diagonal strike-through slash when Out of Stock (Exact match to Image 1) */}
                {!inStock && !isSelected && (
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    viewBox="0 0 36 36"
                  >
                    <line
                      x1="8"
                      y1="28"
                      x2="28"
                      y2="8"
                      stroke="#78716c"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </button>
            )
          }

          // Longer pill format (e.g. "Unstitched", "Stitched", colors)
          return (
            <button
              type="button"
              key={v}
              onClick={() => updateOption(option.id, v)}
              disabled={disabled}
              aria-pressed={isSelected}
              className={`relative px-4 py-1.5 rounded-full text-xs transition-all duration-150 ${
                isSelected
                  ? "bg-black text-white font-semibold shadow-xs"
                  : inStock
                  ? "border border-stone-400 bg-white text-stone-800 hover:border-black font-medium"
                  : "border border-stone-300 bg-stone-50 text-stone-400 font-normal"
              }`}
              data-testid="option-button"
            >
              <span>{v}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default OptionSelect
