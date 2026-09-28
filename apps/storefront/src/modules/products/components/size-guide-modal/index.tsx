"use client"

import React, { useState, useEffect } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

interface SizeGuideModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SizeGuideModal({ isOpen, onClose }: SizeGuideModalProps) {
  const [unit, setUnit] = useState<"in" | "cm">("in")
  const [activeTab, setActiveTab] = useState<"women" | "men">("women")

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      document.body.style.overflow = "hidden"
      window.addEventListener("keydown", handleKeyDown)
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const convert = (val: number) => {
    return unit === "in" ? `${val}"` : `${Math.round(val * 2.54)} cm`
  }

  const womenSizes = [
    { size: "XS", bust: 34, waist: 28, hip: 38, shoulder: 14, length: 39 },
    { size: "S", bust: 36, waist: 30, hip: 40, shoulder: 14.5, length: 40 },
    { size: "M", bust: 39, waist: 33, hip: 43, shoulder: 15, length: 41 },
    { size: "L", bust: 42, waist: 36, hip: 46, shoulder: 15.5, length: 42 },
    { size: "XL", bust: 45, waist: 39, hip: 49, shoulder: 16, length: 42 },
  ]

  const menSizes = [
    { size: "S", chest: 38, collar: 14.5, waist: 36, shoulder: 17.5, length: 40 },
    { size: "M", chest: 40, collar: 15.5, waist: 38, shoulder: 18.5, length: 42 },
    { size: "L", chest: 43, collar: 16.5, waist: 41, shoulder: 19.5, length: 43 },
    { size: "XL", chest: 46, collar: 17.5, waist: 44, shoulder: 20.5, length: 44 },
  ]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="size-guide-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden max-h-[90vh] flex flex-col transform transition-all duration-300 scale-100 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50/50">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-accent block">
              Silhouettes & Fit Guide
            </span>
            <h2 id="size-guide-modal-title" className="font-serif text-xl sm:text-2xl font-medium text-brand">
              Garment Measurement Chart
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-900 transition-colors rounded-full hover:bg-stone-200/50"
            aria-label="Close size guide"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Controls: Gender Tab + Unit Switcher */}
        <div className="px-6 py-3 border-b border-stone-100 flex flex-wrap items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("women")}
              className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeTab === "women"
                  ? "bg-brand text-white shadow-xs"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              Women's Pret & Formals
            </button>
            <button
              onClick={() => setActiveTab("men")}
              className={`px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeTab === "men"
                  ? "bg-brand text-white shadow-xs"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
            >
              Men's Kurta & Waistcoat
            </button>
          </div>

          <div className="flex items-center text-xs bg-stone-100 p-0.5 border border-stone-200">
            <button
              onClick={() => setUnit("in")}
              className={`px-2.5 py-1 font-semibold transition-colors ${
                unit === "in" ? "bg-white text-brand shadow-xs" : "text-stone-500"
              }`}
            >
              Inches
            </button>
            <button
              onClick={() => setUnit("cm")}
              className={`px-2.5 py-1 font-semibold transition-colors ${
                unit === "cm" ? "bg-white text-brand shadow-xs" : "text-stone-500"
              }`}
            >
              CM
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Measurement Table */}
          <div className="border border-stone-200 overflow-x-auto shadow-xs">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-700 uppercase tracking-wider text-[10px]">
                  <th className="p-3 font-semibold">Size</th>
                  {activeTab === "women" ? (
                    <>
                      <th className="p-3 font-semibold">Bust</th>
                      <th className="p-3 font-semibold">Waist</th>
                      <th className="p-3 font-semibold">Hip</th>
                      <th className="p-3 font-semibold">Shoulder</th>
                      <th className="p-3 font-semibold">Shirt Length</th>
                    </>
                  ) : (
                    <>
                      <th className="p-3 font-semibold">Chest</th>
                      <th className="p-3 font-semibold">Collar</th>
                      <th className="p-3 font-semibold">Waist</th>
                      <th className="p-3 font-semibold">Shoulder</th>
                      <th className="p-3 font-semibold">Kurta Length</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {(activeTab === "women" ? womenSizes : menSizes).map((row) => (
                  <tr key={row.size} className="hover:bg-amber-50/30 transition-colors">
                    <td className="p-3 font-serif font-bold text-sm text-brand">{row.size}</td>
                    {activeTab === "women" ? (
                      <>
                        <td className="p-3 text-stone-700">{convert((row as any).bust)}</td>
                        <td className="p-3 text-stone-700">{convert((row as any).waist)}</td>
                        <td className="p-3 text-stone-700">{convert((row as any).hip)}</td>
                        <td className="p-3 text-stone-700">{convert((row as any).shoulder)}</td>
                        <td className="p-3 text-stone-700">{convert((row as any).length)}</td>
                      </>
                    ) : (
                      <>
                        <td className="p-3 text-stone-700">{convert((row as any).chest)}</td>
                        <td className="p-3 text-stone-700">{convert((row as any).collar)}</td>
                        <td className="p-3 text-stone-700">{convert((row as any).waist)}</td>
                        <td className="p-3 text-stone-700">{convert((row as any).shoulder)}</td>
                        <td className="p-3 text-stone-700">{convert((row as any).length)}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Quick Fit Advice */}
          <div className="bg-stone-50 border border-stone-200 p-4 rounded-xs text-xs text-stone-600 space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-brand">
              <span>💡</span>
              <span>Pakistani Couture Sizing Tip:</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              All NAQSH silhouettes include <strong>1.5 to 2 inches of relaxed ease</strong> beyond body measurements for comfortable daily wear. If you prefer a tailored slim fit, order one size down.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <LocalizedClientLink
            href="/size-guide"
            onClick={onClose}
            className="text-accent hover:underline font-semibold flex items-center gap-1"
          >
            <span>Open Dedicated Size Guide Page</span>
            <span>&rarr;</span>
          </LocalizedClientLink>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-brand text-white text-xs font-semibold uppercase tracking-wider hover:bg-black transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  )
}
