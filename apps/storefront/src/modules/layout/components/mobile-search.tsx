"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import SearchAutocomplete from "./search-autocomplete"

export default function MobileSearch() {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()
  useEffect(() => { setOpen(false) }, [pathname])
  useEffect(() => { if (open) root.current?.querySelector("input")?.focus() }, [open])
  const close = () => { setOpen(false); trigger.current?.focus() }
  return <>
    <button ref={trigger} type="button" aria-label="Open search" aria-expanded={open} onClick={() => setOpen(true)} className="flex h-10 w-10 items-center justify-center">
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg>
    </button>
    {open && <div ref={root} onKeyDown={event => { if (event.key === "Escape") close() }} className="absolute inset-x-0 top-0 z-50 flex min-h-full items-center gap-2 bg-white px-3 py-2">
      <SearchAutocomplete />
      <button type="button" onClick={close} aria-label="Close search" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-2xl">×</button>
    </div>}
  </>
}
