"use client"

import SortDropdown from "./sort-dropdown"

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState, useTransition } from "react"

type Choice = { id: string; label: string }
type Props = { count: number; categories: Choice[]; collections: Choice[]; facets: { sizes: string[]; colors: string[]; fabrics: string[] } }
export default function CatalogControls({ count, categories, collections, facets }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [pending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString())
    if (value) next.set(key, value)
    else next.delete(key)
    next.delete("page")
    startTransition(() => router.replace(pathname + "?" + next, { scroll: false }))
  }
  const EXCLUDED_CATEGORY_KEYS = new Set([
    "shirts", "sweatshirts", "merch", "pants", "women", "men", "kids", "sale",
    "ready to wear", "ready-to-wear", "co-ords sets", "co-ords", "festive formals",
    "kurta & shalwar", "kurta-shalwar", "waistcoats", "casual shirts", "casual-men",
    "special offers", "special-offers", "clearance", "children", "children eastern collection",
    "girls ready to wear", "girls-stitched", "boys ready to wear", "boys-stitched",
    "women's stitched pret", "women-stitched", "men's stitched eastern", "men-stitched",
    "unstitched fabric", "unstitched", "women's unstitched lawn & silks", "women-unstitched",
    "men's unstitched fabric", "men-unstitched", "girls eastern", "girls-eastern", "boys eastern", "boys-eastern"
  ])

  const FRIENDLY_UNSTITCHED_LABELS: Record<string, string> = {
    italian: "Italian Suiting", boski: "Pure Boski", "wash-wear": "Wash & Wear",
    wool: "Winter Wool", "kamalia-khaddar": "Kamalia Khaddar", dhanak: "Dhanak",
    khaddar: "Khaddar", linen: "Linen", karandi: "Karandi", silk: "Festive Silk",
    printed: "Printed Cuts", "embroidery-waly": "Embroidery Waly",
    "2pc": "2-Piece Unstitched", "3pc": "3-Piece Luxury Unstitched",
    "girls-unstitched": "Girls Unstitched", "boys-unstitched": "Boys Unstitched",
  }

  const unstitchedCategories = categories
    .filter(c => !EXCLUDED_CATEGORY_KEYS.has(c.label.toLowerCase().trim()) && !EXCLUDED_CATEGORY_KEYS.has(c.id.toLowerCase().trim()))
    .map(c => {
      const labelKey = c.label.toLowerCase().trim()
      const idKey = c.id.toLowerCase().trim()
      const matched = Object.entries(FRIENDLY_UNSTITCHED_LABELS).find(([key]) => labelKey === key || idKey === key || labelKey.includes(key) || idKey.includes(key))
      return { id: c.id, label: matched ? matched[1] : c.label }
    })

  const groups = [
    { key: "category", title: "Unstitched Category", choices: unstitchedCategories },
    { key: "collection", title: "Collection", choices: collections },
    { key: "size", title: "Size", choices: facets.sizes.map(value => ({ id: value, label: value })) },
    { key: "color", title: "Colour", choices: facets.colors.map(value => ({ id: value, label: value })) },
    { key: "fabric", title: "Fabric", choices: facets.fabrics.map(value => ({ id: value, label: value })) },
  ]
  const filterKeys = ["category", "collection", "size", "color", "fabric", "min", "max", "stock", "sale"]
  const active = filterKeys.filter(key => params.has(key)).length
  const clear = () => {
    const next = new URLSearchParams(params.toString())
    filterKeys.concat("page").forEach(key => next.delete(key))
    startTransition(() => router.replace(pathname + "?" + next, { scroll: false }))
  }
  const filters = <div className="space-y-6">
    <div className="flex justify-between items-center"><h2 className="text-sm uppercase tracking-[0.15em]">Refine your edit</h2>{active > 0 && <button onClick={clear} className="text-xs underline text-stone-500">Clear all</button>}</div>
    {groups.filter(group => group.choices.length > 0).map(group => <details open key={group.key} className="border-b border-stone-200 pb-5"><summary className="cursor-pointer text-sm font-medium mb-4">{group.title}</summary><div className="space-y-3 max-h-56 overflow-auto pr-2">{group.choices.map(choice => {
      const selected = (params.get(group.key) || "").split(",").filter(Boolean)
      return <label key={choice.id} className="flex items-center gap-3 text-sm text-stone-600 cursor-pointer"><input type="checkbox" disabled={pending} checked={selected.includes(choice.id)} onChange={() => update(group.key, (selected.includes(choice.id) ? selected.filter(value => value !== choice.id) : [...selected, choice.id]).join(","))} className="accent-stone-900 w-4 h-4" />{choice.label}</label>
    })}</div></details>)}
    <form key={params.get("min") + ":" + params.get("max")} onSubmit={event => { event.preventDefault(); const data = new FormData(event.currentTarget); const next = new URLSearchParams(params.toString()); for (const key of ["min", "max"]) { const value = String(data.get(key) || ""); if (value) next.set(key, value); else next.delete(key) } next.delete("page"); startTransition(() => router.replace(pathname + "?" + next, { scroll: false })) }} className="border-b border-stone-200 pb-5 space-y-3">
      <h3 className="text-sm font-medium">Price range (PKR)</h3><div className="flex gap-2"><input aria-label="Minimum price" name="min" type="number" min="0" defaultValue={params.get("min") || ""} placeholder="Min" className="w-1/2 min-w-0 bg-white border border-stone-300 p-2 text-sm" /><input aria-label="Maximum price" name="max" type="number" min="0" defaultValue={params.get("max") || ""} placeholder="Max" className="w-1/2 min-w-0 bg-white border border-stone-300 p-2 text-sm" /></div><button disabled={pending} className="w-full border border-stone-800 py-2 text-xs uppercase tracking-wider">Apply price</button>
    </form>
    {[{ key: "stock", label: "In stock only" }, { key: "sale", label: "On sale" }].map(item => <label key={item.key} className="flex items-center gap-3 text-sm"><input type="checkbox" className="accent-stone-900 w-4 h-4" disabled={pending} checked={params.get(item.key) === "1"} onChange={event => update(item.key, event.target.checked ? "1" : "")} />{item.label}</label>)}
  </div>
  return <>
    <div className="col-span-full flex items-center justify-between gap-4 border-y border-stone-200 py-4">
      <div className="flex items-center gap-4"><button className="lg:hidden text-xs uppercase tracking-widest border border-stone-300 px-4 py-2" onClick={() => setOpen(true)}>Filters {active > 0 ? "(" + active + ")" : ""}</button><p role="status" className="text-xs sm:text-sm text-stone-500">{pending ? "Updating your edit..." : count + (count === 1 ? " piece" : " pieces")}</p></div>
      <div className="flex items-center gap-2 text-xs"><span className="hidden sm:inline text-stone-500">Sort by</span><SortDropdown disabled={pending} value={params.get("sortBy") || "newest"} onChange={value => update("sortBy", value)} /></div>
    </div>
    <aside className="hidden lg:block lg:sticky lg:top-40 self-start">{filters}</aside>
    <Dialog open={open} onClose={setOpen} className="relative z-[100]"><div className="fixed inset-0 bg-black/50" aria-hidden="true" /><div className="fixed inset-0 flex justify-end"><DialogPanel className="h-[100dvh] w-[min(90vw,420px)] bg-[#faf8f5] flex flex-col"><div className="flex justify-between p-6 border-b"><DialogTitle className="font-serif text-2xl">Filters</DialogTitle><button aria-label="Close filters" onClick={() => setOpen(false)} className="text-2xl">&times;</button></div><div className="p-6 flex-1 min-h-0 overflow-auto">{filters}</div><button onClick={() => setOpen(false)} className="m-5 p-4 bg-stone-900 text-white text-sm">View {count} pieces</button></DialogPanel></div></Dialog>
  </>
}
