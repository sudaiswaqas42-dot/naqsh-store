"use client"

import { useEffect } from "react"

export default function ScrollReveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const seen = new WeakSet<Element>()
    const selector = ".fade-up, .fade-in, .naqsh-scroll-section, .naqsh-product-card, [data-testid='product-wrapper'], .naqsh-reveal"
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible", "naqsh-reveal-visible")
        observer.unobserve(entry.target)
      }
    }), { threshold: 0.08, rootMargin: "0px 0px -40px 0px" })
    const register = (element: Element) => {
      if (seen.has(element)) return
      seen.add(element)
      if (!element.classList.contains("fade-up") && !element.classList.contains("fade-in") && !element.classList.contains("naqsh-scroll-section")) {
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
      document.querySelectorAll(".naqsh-reveal-pending, .fade-up, .fade-in, .naqsh-scroll-section").forEach(element => {
        element.classList.remove("naqsh-reveal-pending")
      })
    }
  }, [])
  return null
}
