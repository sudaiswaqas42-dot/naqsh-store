"use client"

import { useLayoutEffect } from "react"
import { usePathname } from "next/navigation"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

export default function ScrollReveal() {
  const pathname = usePathname()

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return
    gsap.registerPlugin(ScrollTrigger)
    const context = gsap.context(() => {})
    const seen = new WeakSet<Element>()
    let refreshFrame = 0
    const refresh = () => {
      cancelAnimationFrame(refreshFrame)
      refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh())
    }
    const sizes = new ResizeObserver(refresh)
    const selector = ".fade-up, .fade-in, .naqsh-scroll-section, .naqsh-product-card, [data-testid='product-wrapper'], .naqsh-reveal"
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible", "naqsh-reveal-visible")
        observer.unobserve(entry.target)
      }
    }), { threshold: 0.01, rootMargin: "0px 0px -48px 0px" })
    const register = (element: Element) => {
      if (seen.has(element) || element.closest(".naqsh-home-hero")) return
      // Homepage sections reveal as one unit, including headings and streamed products.
      const section = element.closest(".naqsh-scroll-section")
      if (section && section !== element) return
      seen.add(element)
      if (section === element) {
        const content = element.querySelector<HTMLElement>(".naqsh-scroll-content")
        if (!content) return
        // Observe the stationary wrapper; only the inner section moves.
        context.add(() => {
          const entrance = gsap.timeline({
            scrollTrigger: {
              trigger: element,
              start: "clamp(top 78%)",
              toggleActions: "play none none none",
              once: true,
              invalidateOnRefresh: true,
            },
          })
          // The entrance finishes even when scrolling stops, so its motion stays
          // visible instead of being consumed by a quick swipe.
          entrance.fromTo(content,
            { y: 120, opacity: 0 },
            { y: 0, duration: 1.55, ease: "power2.inOut", clearProps: "transform", immediateRender: true }, 0)
          entrance.to(content, { opacity: 1, duration: 0.75, ease: "sine.out", clearProps: "opacity" }, 0.1)
        })
        sizes.observe(element)
        refresh()
        return
      }
      if (!element.classList.contains("fade-up") && !element.classList.contains("fade-in")) {
        element.classList.add("naqsh-reveal-pending")
      }
      observer.observe(element)
    }
    document.querySelectorAll(selector).forEach(register)
    const mutations = new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => {
      if (!(node instanceof Element)) return
      if (node.matches(selector)) register(node)
      node.querySelectorAll(selector).forEach(register)
    })))
    mutations.observe(document.body, { childList: true, subtree: true })
    return () => { 
      observer.disconnect()
      mutations.disconnect()
      sizes.disconnect()
      cancelAnimationFrame(refreshFrame)
      context.revert()
      document.querySelectorAll(".naqsh-reveal-pending, .fade-up, .fade-in, .naqsh-scroll-section").forEach(element => {
        element.classList.remove("naqsh-reveal-pending")
      })
    }
  }, [pathname])
  return null
}
