"use client"

import { useEffect, useRef, useState } from "react"

export interface ReelItem {
  id: string
  media_url?: string
  thumbnail_url?: string
  permalink?: string
  timestamp?: string
}

const ACCOUNT_URL = "https://www.instagram.com/shk_sub_18_/"

function ReelCard({ reel, index }: { reel: ReelItem; index: number }) {
  const video = useRef<HTMLVideoElement>(null)
  const [active, setActive] = useState(false)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [loadVideo, setLoadVideo] = useState(false)

  useEffect(() => {
    setReady(false)
    setFailed(false)
  }, [reel.media_url])

  useEffect(() => {
    const element = video.current
    if (!element) return
    if (active && !failed) {
      element.play().catch(() => setActive(false))
    } else {
      element.pause()
    }
  }, [active, loadVideo, failed])

  const play = () => {
    setLoadVideo(true)
    setActive(true)
  }

  return (
    <article className="group relative aspect-[9/16] overflow-hidden rounded-xl bg-[#0F2D22] border border-[#EBE1D6] shadow-sm"
      onPointerEnter={(event) => { if (event.pointerType === "mouse" && !matchMedia("(prefers-reduced-motion: reduce)").matches) play() }}
      onPointerLeave={() => setActive(false)}>
      {reel.thumbnail_url && <img src={reel.thumbnail_url} alt={`Instagram reel ${index + 1}`} loading="lazy" decoding="async"
        className={`absolute inset-0 h-full w-full object-cover transition-opacity ${active && ready && !failed ? "opacity-0" : "opacity-100"}`} />}
      <video ref={video} src={loadVideo ? reel.media_url : undefined} preload="none" muted loop playsInline
        onPlaying={() => setReady(true)} onError={() => { setFailed(true); setActive(false) }}
        className={`absolute inset-0 h-full w-full object-cover ${active && ready && !failed ? "opacity-100" : "opacity-0"}`} />
      <button type="button" aria-label={`${active ? "Pause" : "Play"} reel ${index + 1}`} aria-pressed={active}
        onClick={() => { if (active) setActive(false); else play() }} onBlur={() => setActive(false)}
        className="absolute inset-0 flex items-center justify-center text-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-[#B6975A] focus-visible:-outline-offset-4">
        {!active && <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/50 bg-black/40" aria-hidden="true">▶</span>}
      </button>
      <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/50 px-3 py-1 text-[10px] uppercase tracking-widest text-white">{index === 0 ? "Latest reel" : "Reel"}</span>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-4 pt-12">
        {failed && <p className="mb-2 text-xs text-white">Preview unavailable. Watch on Instagram.</p>}
        <a className="pointer-events-auto text-xs font-semibold uppercase tracking-wider text-[#E3C791] underline-offset-4 hover:underline"
          href={reel.permalink || ACCOUNT_URL} target="_blank" rel="noopener noreferrer">Watch on Instagram →</a>
      </div>
    </article>
  )
}

export default function InstagramReels() {
  const section = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)
  const [reels, setReels] = useState<ReelItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect() }
    }, { rootMargin: "300px" })
    if (section.current) observer.observe(section.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) return
    let mounted = true
    const controller = new AbortController()
    const refresh = async () => {
      if (document.hidden) return
      try {
        const response = await fetch("/api/instagram/reels", { signal: controller.signal })
        if (!response.ok) throw new Error("Reels unavailable")
        const body = await response.json()
        if (mounted && Array.isArray(body.reels)) setReels([...body.reels].sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp)).slice(0, 8))
      } catch {
        // Preserve already loaded reels on transient outages.
      } finally {
        if (mounted) setLoading(false)
      }
    }
    void refresh()
    const interval = setInterval(refresh, 60_000)
    document.addEventListener("visibilitychange", refresh)
    return () => { mounted = false; controller.abort(); clearInterval(interval); document.removeEventListener("visibilitychange", refresh) }
  }, [visible])

  return (
    <section ref={section} className="bg-[#FAF9F6] py-16 font-sans border-t border-[#EBE1D6]">
      <div className="content-container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-5 border-b border-[#EBE1D6] pb-6 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#B6975A]">Latest Instagram reels</p>
            <h2 className="font-serif text-3xl text-[#0F2D22]">Reels by @shk_sub_18_</h2>
            <p className="mt-2 text-sm text-stone-600">The latest stories from our Instagram, newest first.</p>
          </div>
          <a href={ACCOUNT_URL} target="_blank" rel="noopener noreferrer" className="self-start rounded-full bg-[#0F2D22] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#B6975A] sm:self-auto">Follow on Instagram →</a>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4" aria-busy={loading}>
          {loading ? Array.from({ length: 4 }, (_, index) => <div key={index} className="aspect-[9/16] animate-pulse rounded-xl bg-stone-200" aria-label="Loading reel" />)
            : reels.map((reel, index) => <ReelCard key={reel.id} reel={reel} index={index} />)}
        </div>
        {!loading && !reels.length && <p className="py-10 text-center text-sm text-stone-600">Our reels are temporarily unavailable. Visit our Instagram for the latest videos.</p>}
      </div>
    </section>
  )
}
