"use client"

import { useEffect, useId, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type Result = { id: string; title: string; handle: string; thumbnail?: string }

export default function SearchAutocomplete() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const root = useRef<HTMLDivElement>(null)
  const resultsId = useId()
  const router = useRouter()
  const { countryCode } = useParams()

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener("pointerdown", close)
    return () => document.removeEventListener("pointerdown", close)
  }, [])

  useEffect(() => {
    setResults([])
    setError("")
    if (!open || query.trim().length < 2) { setLoading(false); return }
    const controller = new AbortController()
    setLoading(true)
    const timer = setTimeout(async () => {
      try {
        const url = (process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000") + "/store/products?limit=5&fields=id,title,handle,thumbnail&q=" + encodeURIComponent(query.trim())
        const response = await fetch(url, { signal: controller.signal, headers: { "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "" } })
        if (!response.ok) throw new Error("Search is unavailable. Please try again.")
        const data = await response.json()
        if (!controller.signal.aborted) setResults(data.products || [])
      } catch (error) {
        if (!controller.signal.aborted) setError((error as Error).message)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, 250)
    return () => { clearTimeout(timer); controller.abort() }
  }, [query, open])

  return (
    <div ref={root} className="relative w-full" onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false)
    }} onKeyDown={event => { if (event.key === "Escape") setOpen(false) }}>
      <form role="search" onSubmit={event => {
        event.preventDefault()
        if (!query.trim()) return
        setOpen(false)
        router.push("/" + (countryCode || "pk") + "/search?q=" + encodeURIComponent(query.trim()))
      }} className="flex h-10 w-full overflow-hidden rounded-full border border-stone-300 bg-stone-50 focus-within:border-brand focus-within:ring-1 focus-within:ring-brand/20">
        <input type="search" aria-label="Search products" aria-expanded={open && query.trim().length >= 2} aria-controls={resultsId} autoComplete="off" value={query} onFocus={() => setOpen(true)} onChange={event => { setQuery(event.target.value); setOpen(true) }} placeholder="Search products..." className="min-w-0 flex-1 bg-transparent pl-4 pr-2 text-base lg:text-sm text-stone-900 outline-none" />
        <button aria-label="Submit search" className="flex w-12 shrink-0 items-center justify-center border-l border-stone-200 bg-stone-100 text-brand hover:bg-stone-200">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path strokeLinecap="round" d="m16 16 5 5" /></svg>
        </button>
      </form>
      {open && query.trim().length >= 2 && (
        <div id={resultsId} className="absolute inset-x-0 top-full z-50 mt-2 max-h-[min(45dvh,360px)] overflow-y-auto rounded-xl border border-stone-200 bg-white p-2 shadow-lg">
          {loading && <p role="status" className="p-3 text-sm text-stone-500">Searching...</p>}
          {error && <p role="alert" className="p-3 text-sm text-red-700">{error}</p>}
          {!loading && results.map(item => <LocalizedClientLink key={item.id} href={"/products/" + item.handle} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-lg p-2 hover:bg-stone-50 focus:bg-stone-50">
            {item.thumbnail && <img src={item.thumbnail} alt="" width={40} height={48} className="h-12 w-10 rounded object-cover" />}
            <span className="text-sm text-stone-800">{item.title}</span>
          </LocalizedClientLink>)}
          {!loading && !error && !results.length && <p className="p-3 text-sm text-stone-500">No matching products.</p>}
          <LocalizedClientLink href={"/search?q=" + encodeURIComponent(query.trim())} onClick={() => setOpen(false)} className="block border-t border-stone-100 p-3 text-xs font-medium text-brand">View all results &rarr;</LocalizedClientLink>
        </div>
      )}
    </div>
  )
}
