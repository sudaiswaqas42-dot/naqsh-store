"use client"

import React, { useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function SizeGuidePage() {
  const [unit, setUnit] = useState<"in" | "cm">("in")
  const [activeTab, setActiveTab] = useState<"women" | "men">("women")

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
    <div className="content-container mx-auto px-4 sm:px-6 lg:px-8 py-14 max-w-4xl font-sans">
      <div className="text-center max-w-xl mx-auto mb-10">
        <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-accent">
          Fit & Measurements
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-brand font-medium mt-1">
          Size & Fit Guide
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-2 font-light">
          All NAQSH silhouettes are tailored with classic Pakistani ease. Review the chart below to find your ideal fit.
        </p>
      </div>

      {/* Controls: Gender Tab + Unit Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("women")}
            className={`px-5 py-2 text-xs uppercase tracking-wider font-semibold transition-colors ${
              activeTab === "women"
                ? "bg-brand text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            Women's Pret & Formals
          </button>
          <button
            onClick={() => setActiveTab("men")}
            className={`px-5 py-2 text-xs uppercase tracking-wider font-semibold transition-colors ${
              activeTab === "men"
                ? "bg-brand text-white"
                : "bg-stone-100 text-stone-600 hover:bg-stone-200"
            }`}
          >
            Men's Kurta & Waistcoat
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-xs bg-stone-100 p-1 border border-stone-200">
          <button
            onClick={() => setUnit("in")}
            className={`px-3 py-1 font-semibold transition-colors ${
              unit === "in" ? "bg-white text-brand shadow-xs" : "text-stone-500"
            }`}
          >
            Inches (in)
          </button>
          <button
            onClick={() => setUnit("cm")}
            className={`px-3 py-1 font-semibold transition-colors ${
              unit === "cm" ? "bg-white text-brand shadow-xs" : "text-stone-500"
            }`}
          >
            Centimeters (cm)
          </button>
        </div>
      </div>

      {/* Measurement Table */}
      <div className="bg-white border border-stone-200 shadow-xs overflow-x-auto mb-12">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200 text-stone-700 uppercase tracking-wider text-[11px]">
              <th className="p-4 font-semibold">Standard Size</th>
              {activeTab === "women" ? (
                <>
                  <th className="p-4 font-semibold">Bust</th>
                  <th className="p-4 font-semibold">Waist</th>
                  <th className="p-4 font-semibold">Hip</th>
                  <th className="p-4 font-semibold">Shoulder</th>
                  <th className="p-4 font-semibold">Shirt Length</th>
                </>
              ) : (
                <>
                  <th className="p-4 font-semibold">Chest</th>
                  <th className="p-4 font-semibold">Collar</th>
                  <th className="p-4 font-semibold">Waist</th>
                  <th className="p-4 font-semibold">Shoulder</th>
                  <th className="p-4 font-semibold">Kurta Length</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {(activeTab === "women" ? womenSizes : menSizes).map((row) => (
              <tr key={row.size} className="hover:bg-amber-50/30 transition-colors">
                <td className="p-4 font-serif font-bold text-sm text-brand">{row.size}</td>
                {activeTab === "women" ? (
                  <>
                    <td className="p-4 text-stone-700">{convert((row as any).bust)}</td>
                    <td className="p-4 text-stone-700">{convert((row as any).waist)}</td>
                    <td className="p-4 text-stone-700">{convert((row as any).hip)}</td>
                    <td className="p-4 text-stone-700">{convert((row as any).shoulder)}</td>
                    <td className="p-4 text-stone-700">{convert((row as any).length)}</td>
                  </>
                ) : (
                  <>
                    <td className="p-4 text-stone-700">{convert((row as any).chest)}</td>
                    <td className="p-4 text-stone-700">{convert((row as any).collar)}</td>
                    <td className="p-4 text-stone-700">{convert((row as any).waist)}</td>
                    <td className="p-4 text-stone-700">{convert((row as any).shoulder)}</td>
                    <td className="p-4 text-stone-700">{convert((row as any).length)}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* How to Measure Card */}
      <div className="bg-stone-50 border border-stone-200 p-6 sm:p-8 space-y-4 text-xs text-stone-600">
        <h3 className="font-serif text-lg font-medium text-brand">
          How to Take Your Measurements
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 leading-relaxed">
          <div>
            <strong className="text-stone-900 block mb-1">1. Bust / Chest:</strong>
            Measure around the fullest part of your chest, keeping the tape measure horizontal and relaxed under your arms.
          </div>
          <div>
            <strong className="text-stone-900 block mb-1">2. Waist:</strong>
            Measure around your natural waistline, where your trousers or shalwar comfortably sit.
          </div>
          <div>
            <strong className="text-stone-900 block mb-1">3. Hips:</strong>
            Measure around the fullest point of your hips while standing with feet together.
          </div>
          <div>
            <strong className="text-stone-900 block mb-1">4. Shirt Length:</strong>
            Measure vertically from the highest point of your shoulder down to the desired hemline.
          </div>
        </div>
      </div>

      {/* Concierge Assistance */}
      <div className="mt-8 text-center text-xs text-stone-500">
        Need custom sleeve length or custom tailoring advice?{" "}
        <LocalizedClientLink href="/contact-us" className="text-accent font-semibold hover:underline">
          Chat with our master tailor on WhatsApp &rarr;
        </LocalizedClientLink>
      </div>
    </div>
  )
}
