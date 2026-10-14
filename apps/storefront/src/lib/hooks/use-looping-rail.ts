"use client"

import { useEffect, useRef, useState } from "react"

export function useLoopingRail(count: number, speed = 28) {
  const rail = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const pauseUntil = useRef(0)
  const touching = useRef(false)
  const pause = () => { pauseUntil.current = Date.now() + 2500 }
  useEffect(() => {
    const element = rail.current
    if (!element || !count) return
    let frame = 0
    let previous = 0
    let fraction = 0
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
    const cycleWidth = () => {
      const first = element.children[0] as HTMLElement
      const next = element.children[count] as HTMLElement
      return first && next ? next.offsetLeft - first.offsetLeft : 0
    }
    element.scrollLeft = cycleWidth()
    const tick = (time: number) => {
      const cycle = cycleWidth()
      if (cycle > 0) {
        if (!touching.current && Date.now() > pauseUntil.current) {
          if (element.scrollLeft < cycle / 2) element.scrollLeft += cycle
          if (element.scrollLeft >= cycle * 2) element.scrollLeft -= cycle
          if (previous && !document.hidden && !reduced.matches && count > 1) {
            fraction += Math.min(time - previous, 50) * speed / 1000
            const pixels = Math.floor(fraction)
            element.scrollLeft += pixels
            fraction -= pixels
          }
        }
        setActive(Math.round((element.scrollLeft % cycle) / (cycle / count)) % count)
      }
      previous = time
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [count, speed])
  const jump = (index: number) => {
    const element = rail.current
    if (!element || !count) return
    const first = element.children[0] as HTMLElement
    const middle = element.children[count] as HTMLElement
    if (!first || !middle) return
    const cycle = middle.offsetLeft - first.offsetLeft
    pause()
    element.scrollTo({ left: cycle + index * cycle / count, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" })
  }
  const interactions = {
    onTouchStart: () => { touching.current = true },
    onTouchEnd: () => { touching.current = false; pause() },
    onTouchCancel: () => { touching.current = false; pause() },
    onWheel: pause,
    onFocusCapture: pause,
  }
  return { rail, active, jump, interactions }
}
