"use client"

import { useLayoutEffect, useRef } from "react"
import { gsap } from "gsap"

export default function BrandLoader({ fading = false }: { fading?: boolean }) {
  const root = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const media = gsap.matchMedia()
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const context = gsap.context(() => {
        gsap.fromTo(".brand-loader-content", { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.35 })
        gsap.timeline({ repeat: -1, repeatDelay: 0.3 })
          .fromTo(".brand-loader-fill", { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", duration: 1.7, ease: "power2.inOut" })
          .to(".brand-loader-fill", { opacity: 0.65, duration: 0.45, yoyo: true, repeat: 1 })
        gsap.fromTo(".brand-loader-line", { scaleX: 0, transformOrigin: "left" }, { scaleX: 1, duration: 2.6, repeat: -1, ease: "power1.inOut" })
      }, root)
      return () => context.revert()
    })
    return () => media.revert()
  }, [])

  return <div ref={root} role="status" aria-label="Loading NAQSH" className={"pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#faf8f3] transition-opacity duration-200 " + (fading ? "opacity-0" : "opacity-100")}>
    <div aria-hidden="true" className="absolute inset-x-6 inset-y-6 border border-[#c1a16a]/20 sm:inset-x-12 sm:inset-y-10" />
    <div className="brand-loader-content relative flex w-full max-w-2xl flex-col items-center px-8 pb-10 text-center">
      <p className="mb-2 text-[9px] font-medium uppercase tracking-[0.4em] text-[#967b46] sm:text-[11px]">The Unstitched Collection</p>
      <div className="relative w-[min(82vw,520px)]" aria-hidden="true">
        <img src="/images/naqsh-logo-tight.png" alt="" width={1447} height={505} className="block h-auto w-full opacity-[0.12] grayscale" />
        <img src="/images/naqsh-logo-tight.png" alt="" width={1447} height={505} className="brand-loader-fill absolute inset-0 h-auto w-full" />
      </div>
      <div className="relative mt-2 h-px w-32 overflow-hidden bg-[#c1a16a]/20 sm:w-48"><div className="brand-loader-line absolute inset-0 bg-[#ab8644]" /></div>
      <span className="mt-5 text-[10px] uppercase tracking-[0.25em] text-stone-500">Preparing your collection</span>
    </div>
  </div>
}
