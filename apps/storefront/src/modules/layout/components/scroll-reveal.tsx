"use client"

import { useEffect } from "react"

export default function ScrollReveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const seen = new WeakSet<Element>()
    const selector = ".naqsh-product-card, [data-testid='product-wrapper'], .naqsh-reveal"
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("naqsh-reveal-visible")
        observer.unobserve(entry.target)
      }
    }), { threshold: 0.1 })
    const register = (element: Element) => {
      if (seen.has(element)) return
      seen.add(element)
      element.classList.add("naqsh-reveal-pending")
      observer.observe(element)
    }
    document.querySelectorAll(selector).forEach(register)
    const mutations = new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => {
      if (!(node instanceof Element)) return
      if (node.matches(selector)) register(node)
      node.querySelectorAll(selector).forEach(register)
    })))
    mutations.observe(document.body, { childList: true, subtree: true })
    return () => { observer.disconnect(); mutations.disconnect(); document.querySelectorAll(".naqsh-reveal-pending").forEach(element => element.classList.remove("naqsh-reveal-pending")) }
  }, [])
  return null
}
