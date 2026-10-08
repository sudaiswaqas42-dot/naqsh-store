"use client"

import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react"

const options = [
  { value: "newest", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "popular", label: "Popular This Month" },
  { value: "best-selling", label: "Best Selling" },
  { value: "title-asc", label: "Alphabetical (A - Z)" },
  { value: "recommended", label: "Recommended" },
]

export default function SortDropdown({ value, onChange, disabled = false }: {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}) {
  return (
    <Listbox value={value} onChange={onChange} disabled={disabled}>
      <div className="relative">
        <ListboxButton aria-label="Sort products" className="flex min-h-10 items-center gap-3 rounded-full border border-stone-300 bg-white px-4 py-2 text-xs text-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand disabled:opacity-50">
          {options.find(option => option.value === value)?.label || "Featured"}
          <span aria-hidden="true">⌄</span>
        </ListboxButton>
        <ListboxOptions modal={false} className="absolute right-0 top-full z-30 mt-2 w-56 max-w-[calc(100vw-2rem)] max-h-72 overflow-y-auto rounded-xl border border-stone-200 bg-white p-1.5 shadow-xl focus:outline-none">
          {options.map(option => (
            <ListboxOption key={option.value} value={option.value} className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-xs text-stone-700 data-[focus]:bg-stone-100 data-[selected]:bg-stone-50 data-[selected]:font-semibold">
              {({ selected }) => <>{option.label}<span aria-hidden="true">{selected ? "✓" : ""}</span></>}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  )
}
