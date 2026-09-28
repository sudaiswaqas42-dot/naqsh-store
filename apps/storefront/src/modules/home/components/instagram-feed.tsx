"use client"

import React, { useState, useEffect, useRef } from "react"

export interface InstagramReel {
  id: string
  title?: string
  caption?: string
  thumbnail_url?: string
  media_url?: string
  permalink?: string
  timestamp?: string
  views?: string
  likes?: string
}

const DEFAULT_FOLLOW_URL = "https://www.instagram.com/shk_sub_18_/"
const DEFAULT_USERNAME = "@shk_sub_18_"

const FALLBACK_REELS: InstagramReel[] = [
  {
    id: "reel_1",
    title: "Handcrafted Zardozi & Resham Embroidery • Festive Edit",
    thumbnail_url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
    media_url: "/videos/reels/reel1.mp4",
    permalink: DEFAULT_FOLLOW_URL,
    views: "54.8K",
    likes: "4.2k",
  },
  {
    id: "reel_2",
    title: "Pure Chiffon & Hand-Printed Silk Dupattas in Motion",
    thumbnail_url: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
    media_url: "/videos/reels/reel2.mp4",
    permalink: DEFAULT_FOLLOW_URL,
    views: "67.5K",
    likes: "5.4k",
  },
  {
    id: "reel_3",
    title: "Master Tailoring: Jacquard Eastern Bandhgala Waistcoat",
    thumbnail_url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
    media_url: "/videos/reels/reel3.mp4",
    permalink: DEFAULT_FOLLOW_URL,
    views: "41.2K",
    likes: "3.1k",
  },
  {
    id: "reel_4",
    title: "Artisanal Dyeing & Pure Lawn Fabric Drape Workshop",
    thumbnail_url: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80",
    media_url: "/videos/reels/reel4.mp4",
    permalink: DEFAULT_FOLLOW_URL,
    views: "38.9K",
    likes: "2.9k",
  },
]

export default function InstagramFeed({ section }: { section?: any }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [reels, setReels] = useState<InstagramReel[]>([])
  const [loading, setLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredReelId, setHoveredReelId] = useState<string | null>(null)
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null)
  const [isMuted, setIsMuted] = useState(true)

  const profileUrl = section?.settings?.profile_url || DEFAULT_FOLLOW_URL
  const username = section?.settings?.username || DEFAULT_USERNAME

  // 1. Lazy load: IntersectionObserver triggers video availability only within 300px of viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: "300px" }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // 2. Fetch latest reels from API endpoint (connected to MongoDB)
  useEffect(() => {
    let isMounted = true

    async function loadReels() {
      try {
        setLoading(true)
        const res = await fetch("/api/instagram/reels", {
          signal: AbortSignal.timeout(4000),
        })

        if (!res.ok) throw new Error("HTTP error " + res.status)

        const json = await res.json()
        if (isMounted) {
          if (json && Array.isArray(json.reels) && json.reels.length > 0) {
            setReels(json.reels)
          } else {
            setReels(FALLBACK_REELS)
          }
        }
      } catch {
        if (isMounted) setReels(FALLBACK_REELS)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadReels()
    return () => {
      isMounted = false
    }
  }, [])

  const displayReels = reels.length > 0 ? reels.slice(0, 6) : FALLBACK_REELS

  return (
    <section
      ref={containerRef}
      className="py-16 sm:py-20 bg-[#FAF9F6] border-t border-[#EBE1D6] font-sans select-none relative overflow-hidden"
    >
      <div className="content-container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10 pb-6 border-b border-[#EBE1D6]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 flex items-center justify-center text-white text-xs shadow-2xs">
                <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </span>
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#B6975A]">
                Latest Instagram Reels
              </span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#0F2D22] font-normal mt-1">
              {section?.title || "Live from Instagram"}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 font-light mt-1">
              {section?.subtitle || "Watch our latest couture stories, bespoke drape techniques, and festive atelier cuts."}
            </p>
          </div>

          {/* Follow on Instagram Button */}
          <a
            href="https://www.instagram.com/shk_sub_18_/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0F2D22] hover:bg-[#B6975A] text-white hover:text-[#0F2D22] text-xs font-semibold uppercase tracking-widest transition-all shadow-md hover:shadow-lg rounded-full transform active:scale-98"
          >
            <span>Follow on Instagram</span>
            <span>&rarr;</span>
          </a>
        </div>

        {/* Responsive 9:16 Fixed Aspect Ratio Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[9/16] bg-stone-200/80 rounded-xl overflow-hidden animate-pulse flex flex-col justify-end p-4 border border-[#EBE1D6]"
              >
                <div className="h-3 w-14 bg-stone-300 rounded-xs mb-2" />
                <div className="h-4 w-3/4 bg-stone-300 rounded-xs mb-1" />
                <div className="h-3 w-1/2 bg-stone-300 rounded-xs" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-6">
            {displayReels.map((reel) => {
              const isHovered = hoveredReelId === reel.id
              const isPlaying = isHovered || activePlayingId === reel.id
              const videoSrc = (isHovered || isVisible) ? reel.media_url : undefined

              return (
                <div
                  key={reel.id}
                  onMouseEnter={() => setHoveredReelId(reel.id)}
                  onMouseLeave={() => setHoveredReelId(null)}
                  onClick={() => {
                    // Mobile Touch Interaction: Tap to play inline
                    if (activePlayingId === reel.id) {
                      setActivePlayingId(null)
                    } else {
                      setActivePlayingId(reel.id)
                    }
                  }}
                  className="group relative aspect-[9/16] bg-stone-900 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-[#EBE1D6]"
                >
                  {/* Thumbnail Poster with Lazy Loading */}
                  <img
                    src={reel.thumbnail_url || reel.media_url}
                    alt={reel.title || reel.caption || "NAQSH Instagram Reel"}
                    loading="lazy"
                    className={`absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105 ${
                      isPlaying && videoSrc ? "opacity-0" : "opacity-100"
                    } transition-opacity duration-300`}
                  />

                  {/* Video: Swaps on desktop hover or mobile tap */}
                  {videoSrc && (
                    <video
                      src={videoSrc}
                      muted={isMuted}
                      loop
                      playsInline
                      autoPlay={isPlaying}
                      ref={(el) => {
                        if (el) {
                          if (isPlaying) {
                            el.play().catch(() => {})
                          } else {
                            el.pause()
                            el.currentTime = 0
                          }
                        }
                      }}
                      className={`absolute inset-0 w-full h-full object-cover ${
                        isPlaying ? "opacity-100" : "opacity-0"
                      } transition-opacity duration-300`}
                    />
                  )}

                  {/* Top Reel Badge & Mute Toggle */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between z-20 pointer-events-none">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full text-white text-[10px] font-semibold tracking-wider uppercase">
                      <svg className="w-3 h-3 text-pink-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                      </svg>
                      <span>Reel</span>
                    </div>

                    {isPlaying && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsMuted(!isMuted)
                        }}
                        className="pointer-events-auto p-1.5 bg-black/60 backdrop-blur-md rounded-full text-white hover:text-[#B6975A] transition-colors"
                        title={isMuted ? "Unmute" : "Mute"}
                      >
                        {isMuted ? (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Center Play Icon when paused */}
                  {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                      <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white border border-white/30 group-hover:scale-110 transition-transform">
                        <svg className="w-4 h-4 translate-x-0.5 fill-white" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Bottom Gradient Overlay */}
                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-20 flex flex-col justify-end text-white">
                    <p className="text-[11px] text-stone-100 font-light line-clamp-2 leading-snug drop-shadow-xs mb-1.5">
                      {reel.title || reel.caption || "Watch Reel on Instagram"}
                    </p>

                    <a
                      href={reel.permalink || "https://www.instagram.com/shk_sub_18_/"}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[10px] text-[#B6975A] hover:underline font-semibold uppercase tracking-wider flex items-center gap-1"
                    >
                      <span>Watch on IG</span>
                      <span>&rarr;</span>
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Footer Note */}
        <div className="text-center mt-10 pt-4">
          <p className="text-xs text-stone-500 font-light">
            Tag <strong className="text-[#0F2D22] font-medium">@shk_sub_18_</strong> or <strong className="text-[#0F2D22] font-medium">#NAQSHWoman</strong> to be featured on our official channel.
          </p>
        </div>
      </div>
    </section>
  )
}
