"use client"

import { useEffect, useRef, useState } from "react"

export interface ReelItem {
  caption?: string
  id: string
  media_url?: string
  thumbnail_url?: string
  permalink?: string
  timestamp?: string
}

type Account = { username: string; profile_url: string }

function ReelCard({
  reel,
  index,
  account,
  ctaLink,
}: {
  reel: ReelItem
  index: number
  account: Account | null
  ctaLink?: string | null
}) {
  const video = useRef<HTMLVideoElement>(null)
  const [active, setActive] = useState(false)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [isMuted, setIsMuted] = useState(true)

  // Target Instagram ID profile URL
  const instagramIdUrl =
    account?.profile_url || ctaLink || "https://www.instagram.com/itx_shk_selfish/"

  useEffect(() => {
    setReady(false)
    setFailed(false)
  }, [reel.media_url])

  useEffect(() => {
    const element = video.current
    if (!element) return

    element.muted = isMuted

    if (active && !failed) {
      const playPromise = element.play()
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // If browser blocked unmuted autoplay, smoothly fallback to muted
          if (!element.muted) {
            element.muted = true
            setIsMuted(true)
            element.play().catch(() => setActive(false))
          } else {
            setActive(false)
          }
        })
      }
    } else {
      element.pause()
      element.currentTime = 0
    }
  }, [active, failed, isMuted])

  const play = () => {
    setActive(true)
  }

  const toggleMute = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const nextMuted = !isMuted
    setIsMuted(nextMuted)

    if (video.current) {
      video.current.muted = nextMuted
      if (!nextMuted) {
        video.current.volume = 1.0
        if (!active) {
          setActive(true)
          video.current.play().catch(() => {})
        }
      }
    }
  }

  return (
    <a
      href={instagramIdUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block aspect-[9/16] overflow-hidden rounded-xl bg-[#0F2D22] border border-[#EBE1D6] shadow-sm hover:shadow-xl hover:border-[#B6975A] transition-all duration-300 cursor-pointer select-none"
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse" && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
          play()
        }
      }}
      onPointerLeave={() => setActive(false)}
      title="Click to view Instagram profile"
    >
      {/* Poster Image */}
      {reel.thumbnail_url && (
        <img
          src={reel.thumbnail_url}
          alt={`Instagram reel ${index + 1}`}
          loading="lazy"
          decoding="async"
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
            active && ready && !failed ? "opacity-0" : "opacity-100"
          }`}
        />
      )}

      {/* Video Element */}
      <video
        ref={video}
        src={reel.media_url}
        poster={reel.thumbnail_url}
        preload="metadata"
        muted={isMuted}
        loop
        playsInline
        onPlaying={() => setReady(true)}
        onError={() => {
          setFailed(true)
          setActive(false)
        }}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
          active && ready && !failed ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Center Play Indicator when not playing */}
      {!active && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/50 bg-black/40 text-white backdrop-blur-xs shadow-md transition-transform group-hover:scale-110"
            aria-hidden="true"
          >
            ▶
          </span>
        </div>
      )}

      {/* Top Left Badge */}
      <span className="pointer-events-none absolute left-3 top-3 z-20 rounded-full bg-black/60 px-3 py-1 text-[10px] uppercase tracking-widest text-white backdrop-blur-xs border border-white/10">
        {index === 0 ? "Latest reel" : "Reel"}
      </span>

      {/* Top Right Corner Volume / Audio Toggle Button */}
      <button
        type="button"
        onClick={toggleMute}
        aria-label={isMuted ? "Unmute reel audio" : "Mute reel audio"}
        title={isMuted ? "Click to turn sound ON" : "Click to mute"}
        className="pointer-events-auto absolute right-3 top-3 z-30 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md border border-white/25 transition-all hover:bg-black/90 hover:scale-105 active:scale-95 shadow-md"
      >
        {isMuted ? (
          <svg className="h-4 w-4 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        ) : (
          <svg className="h-4 w-4 text-[#E3C791]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            />
          </svg>
        )}
      </button>

      {/* Bottom Gradient Overlay */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 pt-12">
        {reel.caption && (
          <p className="mb-2 line-clamp-2 text-xs text-white/90 font-light">
            {reel.caption.split("\n")[0]}
          </p>
        )}
        {failed && (
          <p className="mb-2 text-xs text-stone-300">
            Preview unavailable. Click to watch on Instagram.
          </p>
        )}
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#E3C791]">
          <span>Watch on Instagram →</span>
          {!isMuted && (
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              AUDIO ON
            </span>
          )}
        </div>
      </div>
    </a>
  )
}

export default function InstagramReels({
  content,
}: {
  content?: {
    title?: string
    subtitle?: string | null
    cta_text?: string | null
    cta_link?: string | null
  }
}) {
  const [reels, setReels] = useState<ReelItem[]>([])
  const [account, setAccount] = useState<Account | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const controller = new AbortController()

    const refresh = async () => {
      if (document.hidden) return
      try {
        const response = await fetch("/api/instagram/reels", { signal: controller.signal })
        if (!response.ok) throw new Error("Reels unavailable")
        const body = await response.json()
        if (mounted && Array.isArray(body.reels)) {
          setReels(body.reels.slice(0, 8))
          setAccount(body.account || null)
        }
      } catch {
        // Preserve already loaded reels on transient outages.
      } finally {
        if (mounted) setLoading(false)
      }
    }

    void refresh()
    const interval = setInterval(refresh, 60_000)
    document.addEventListener("visibilitychange", refresh)
    return () => {
      mounted = false
      controller.abort()
      clearInterval(interval)
      document.removeEventListener("visibilitychange", refresh)
    }
  }, [])

  const profileUrl =
    content?.cta_link || account?.profile_url || "https://www.instagram.com/itx_shk_selfish/"

  return (
    <section className="bg-[#FAF9F6] py-16 font-sans border-t border-[#EBE1D6]">
      <div className="content-container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-5 border-b border-[#EBE1D6] pb-6 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#B6975A]">
              Latest Instagram reels
            </p>
            <h2 className="font-serif text-3xl text-[#0F2D22]">
              {content?.title ?? (account ? `Reels by @${account.username}` : "Latest Instagram reels")}
            </h2>
            <p className="mt-2 text-sm text-stone-600">
              {content?.subtitle ?? "The latest stories from our Instagram, newest first."}
            </p>
          </div>
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="self-start rounded-full bg-[#0F2D22] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#B6975A] sm:self-auto shadow-sm hover:shadow-md"
          >
            Follow on Instagram →
          </a>
        </div>

        <div
          className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fit,minmax(200px,260px))] justify-center gap-4 sm:gap-6"
          aria-busy={loading}
        >
          {loading
            ? Array.from({ length: 4 }, (_, index) => (
                <div
                  key={index}
                  className="aspect-[9/16] animate-pulse rounded-xl bg-stone-200"
                  aria-label="Loading reel"
                />
              ))
            : reels.map((reel, index) => (
                <ReelCard
                  key={reel.id}
                  reel={reel}
                  index={index}
                  account={account}
                  ctaLink={content?.cta_link}
                />
              ))}
        </div>

        {!loading && !reels.length && (
          <p className="py-10 text-center text-sm text-stone-600">
            Our reels are temporarily unavailable. Visit our Instagram for the latest videos.
          </p>
        )}
      </div>
    </section>
  )
}
