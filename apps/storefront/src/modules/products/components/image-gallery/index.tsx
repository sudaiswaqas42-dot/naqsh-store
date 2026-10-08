"use client"

import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import React, { useState, useRef, useCallback } from "react"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
  isSoldOut?: boolean
}

export default function ImageGallery({ images, isSoldOut }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const [mouseCoord, setMouseCoord] = useState({ x: 0, y: 0, percentX: 50, percentY: 50 })
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const stageRef = useRef<HTMLDivElement>(null)

  const currentImage = images?.[selectedIndex] || images?.[0]

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!stageRef.current) return
    const rect = stageRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left))
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top))
    const percentX = (x / rect.width) * 100
    const percentY = (y / rect.height) * 100
    setMouseCoord({ x, y, percentX, percentY })
  }, [])

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-[3/4] bg-stone-100 flex items-center justify-center text-stone-400 font-serif text-xl tracking-widest">
        NAQSH COUTURE
      </div>
    )
  }

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setSelectedIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  // Lens dimensions
  const lensWidth = 180
  const lensHeight = 220

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-3 sm:gap-4 items-start relative select-none font-sans w-full">
      {/* 1. Left Thumbnail Column (Matching Image 1 & 2) */}
      {images.length > 1 && (
        <div className="hidden lg:flex lg:flex-col gap-2.5 overflow-x-auto lg:overflow-y-auto max-h-[750px] no-scrollbar py-1 w-full lg:w-20 sm:lg:w-24 flex-shrink-0">
          {images.map((img, idx) => (
            <button
              key={img.id || idx}
              onClick={() => setSelectedIndex(idx)}
              className={`relative aspect-[3/4] w-14 sm:w-16 lg:w-full flex-shrink-0 overflow-hidden border transition-all duration-200 ${
                idx === selectedIndex
                  ? "border-stone-900 shadow-sm opacity-100"
                  : "border-stone-200 opacity-60 hover:opacity-100 hover:border-stone-400"
              }`}
            >
              <Image
                src={img.url}
                alt={`Thumbnail ${idx + 1}`}
                fill
                className="object-cover object-top"
                sizes="96px"
              />
            </button>
          ))}
        </div>
      )}

      {/* 2. Main Stage (Hero Image with Zoom Lens) */}
      <div className="relative flex-1 w-full aspect-[4/5] lg:aspect-[3/4] max-h-[750px] bg-stone-100 overflow-hidden lg:border border-stone-200 group">
        <div
          ref={stageRef}
          className="relative w-full h-full cursor-crosshair overflow-hidden"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onMouseMove={handleMouseMove}
          onClick={() => setIsLightboxOpen(true)}
        >
          <Image
            src={currentImage.url}
            alt="Product view"
            fill
            priority
            className="w-full h-full object-cover object-top"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />

          {/* Sold Out Badge (Top Right as in Image 1) */}
          {isSoldOut && (
            <div className="absolute top-3 right-3 z-10 bg-black/90 text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 shadow-sm">
              Sold out
            </div>
          )}

          {/* Semi-transparent Zoom Lens Box (Following Cursor as in Image 2) */}
          {isHovering && (
            <div
              className="absolute pointer-events-none border border-stone-500/70 bg-white/25 shadow-md hidden lg:block"
              style={{
                width: `${lensWidth}px`,
                height: `${lensHeight}px`,
                left: `${Math.max(0, mouseCoord.x - lensWidth / 2)}px`,
                top: `${Math.max(0, mouseCoord.y - lensHeight / 2)}px`,
              }}
            />
          )}

          {/* Navigation Arrows on Left & Right edges (< and >) */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={prevImage}
                aria-label="Previous photo"
                className="hidden lg:flex absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 hover:bg-white text-stone-800 shadow-md border border-stone-300 flex items-center justify-center transition-all opacity-80 hover:opacity-100 active:scale-95 z-10"
              >
                <svg className="w-5 h-5 -translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                type="button"
                onClick={nextImage}
                aria-label="Next photo"
                className="hidden lg:flex absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 hover:bg-white text-stone-800 shadow-md border border-stone-300 flex items-center justify-center transition-all opacity-80 hover:opacity-100 active:scale-95 z-10"
              >
                <svg className="w-5 h-5 translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Fullscreen Expand Icon (Bottom Right as in Image 1 & 2) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setIsLightboxOpen(true)
            }}
            aria-label="Open Fullscreen Lightbox"
            className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-stone-800 shadow-md border border-stone-300 flex items-center justify-center transition-all opacity-90 hover:opacity-100 active:scale-95 z-10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
            </svg>
          </button>
        </div>
      </div>

      {images.length > 1 && <div className="absolute right-4 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-2 lg:hidden">{images.map((image, index) => <button key={image.id || index} aria-label={"View product photo " + (index + 1)} aria-pressed={selectedIndex === index} onClick={() => setSelectedIndex(index)} className="flex h-8 w-8 items-center justify-center"><span className={"w-1.5 rounded-full shadow-sm " + (index === selectedIndex ? "h-7 bg-brand" : "h-3 bg-white")} /></button>)}</div>}

      {/* 3. High-Definition Zoom Preview Window (Side-by-side as in Image 2) */}
      {isHovering && (
        <div className="hidden lg:block absolute left-[calc(100%+16px)] top-0 w-[520px] h-[650px] bg-white border-2 border-stone-300 shadow-2xl z-50 overflow-hidden pointer-events-none rounded-xs">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url(${currentImage.url})`,
              backgroundPosition: `${mouseCoord.percentX}% ${mouseCoord.percentY}%`,
              backgroundSize: "260%",
              backgroundRepeat: "no-repeat",
            }}
          />
          <div className="absolute bottom-2 right-2 px-2.5 py-1 bg-black/70 text-white text-[10px] uppercase tracking-wider font-semibold">
            HD Fabric Magnifier
          </div>
        </div>
      )}

      {/* 4. Fullscreen Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-8 animate-fadeIn">
          {/* Header Controls */}
          <div className="flex items-center justify-between text-white pb-4 border-b border-white/10 z-10">
            <span className="font-serif text-lg tracking-widest uppercase">
              NAQSH Editorial View ({selectedIndex + 1} / {images.length})
            </span>
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors"
            >
              &times;
            </button>
          </div>

          {/* Central Image View */}
          <div className="relative flex-1 w-full my-4 flex items-center justify-center">
            <div className="relative w-full max-w-4xl h-full max-h-[82vh]">
              <Image
                src={currentImage.url}
                alt="Product Fullscreen"
                fill
                className="object-contain"
                sizes="100vw"
              />
            </div>

            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/30 text-white flex items-center justify-center border border-white/20 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/30 text-white flex items-center justify-center border border-white/20 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Bottom Thumbnails */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto py-2 z-10">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedIndex(idx)}
                className={`relative w-12 h-16 rounded-xs overflow-hidden border-2 transition-all ${
                  idx === selectedIndex ? "border-amber-400 scale-105" : "border-white/20 opacity-50 hover:opacity-100"
                }`}
              >
                <Image src={img.url} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
