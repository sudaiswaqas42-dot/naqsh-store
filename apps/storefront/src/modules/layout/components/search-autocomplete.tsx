"use client"

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type Result = { id: string; title: string; handle: string; thumbnail?: string }
export default function SearchAutocomplete() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { countryCode } = useParams()
  useEffect(() => {
    if (!open || query.trim().length < 2) { setResults([]); setLoading(false); return }
    const controller = new AbortController()
    setLoading(true)
    setError("")
    const timer = setTimeout(async () => {
      try {
        const url = (process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000") + "/store/products?limit=6&fields=id,title,handle,thumbnail&q=" + encodeURIComponent(query.trim())
        const response = await fetch(url, { signal: controller.signal, headers: { "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "" } })
        if (!response.ok) throw new Error("Search is unavailable. Please try again.")
        const data = await response.json()
        if (!controller.signal.aborted) setResults(data.products || [])
      } catch (error) { if (!controller.signal.aborted) setError((error as Error).message) }
      finally { if (!controller.signal.aborted) setLoading(false) }
    }, 250)
    return () => { clearTimeout(timer); controller.abort() }
  }, [query, open])
  return <>
    <button
      aria-label="Search products"
      onClick={() => setOpen(true)}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-stone-100 text-charcoal hover:text-brand transition-all text-xs font-semibold uppercase tracking-wider group"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        className="text-stone-700 group-hover:text-brand transition-colors"
      >
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path strokeLinecap="round" d="m16 16 5 5" />
      </svg>
      <span className="hidden xl:inline text-[11px] font-semibold tracking-widest text-stone-700 group-hover:text-brand">Search</span>
    </button>
    <Dialog open={open} onClose={setOpen} className="relative z-[110]">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
      <div className="fixed inset-0 overflow-y-auto p-3 sm:p-8">
        <DialogPanel className="bg-[#faf8f5] max-w-4xl mx-auto mt-4 sm:mt-12 p-6 sm:p-12 shadow-xl">
          <div className="flex justify-between items-center mb-8"><DialogTitle className="font-serif text-3xl">Find your next favourite</DialogTitle><button onClick={() => setOpen(false)} aria-label="Close search" className="p-3 text-2xl">&times;</button></div>
          <form onSubmit={event => { event.preventDefault(); setOpen(false); router.push("/" + countryCode + "/search?q=" + encodeURIComponent(query.trim())) }} className="flex border-b-2 border-stone-900 pb-3 gap-3">
            <input autoFocus aria-label="Search the collection" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search pieces, colours, fabrics..." className="bg-transparent min-w-0 flex-1 text-lg sm:text-2xl outline-none" />
            <button className="text-xs uppercase tracking-widest">Search &rarr;</button>
          </form>
          <p className="text-xs uppercase tracking-widest text-stone-500 mt-8 mb-4">{query.length >= 2 ? "Matching pieces" : "Explore the collection"}</p>
          {loading && <p role="status" className="py-8 text-stone-500">Searching...</p>}
          {error && <p role="alert">{error}</p>}
          {!loading && results.length > 0 && <div className="grid sm:grid-cols-2 gap-4">{results.map(item => <LocalizedClientLink key={item.id} href={"/products/" + item.handle} onClick={() => setOpen(false)} className="flex items-center gap-4 bg-white p-3 border border-stone-200 hover:border-accent">{item.thumbnail && <img src={item.thumbnail} alt="" width={64} height={80} className="w-16 h-20 object-cover" loading="lazy" />}<span className="font-serif text-lg">{item.title}</span></LocalizedClientLink>)}</div>}
          {!loading && query.length >= 2 && !results.length && !error && <p className="py-8 text-stone-500">No matching pieces. Try a different keyword.</p>}
          {query.length < 2 && <div className="flex flex-wrap gap-3">{["Lawn", "Silk", "Kurta", "Shawls", "Unstitched"].map(term => <button key={term} onClick={() => setQuery(term)} className="border border-stone-300 px-5 py-3 hover:bg-white">{term}</button>)}</div>}
          <LocalizedClientLink href={"/search?q=" + encodeURIComponent(query)} onClick={() => setOpen(false)} className="block mt-8 text-xs uppercase tracking-widest">Explore all results &rarr;</LocalizedClientLink>
        </DialogPanel>
      </div>
    </Dialog>
  </>
}
