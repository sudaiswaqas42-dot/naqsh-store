"use client"

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react"
import { createPortal } from "react-dom"

type Toast = { id: number; message: string; type: "success" | "info" | "error" }
const ToastContext = createContext<{ showToast: (message: string, type?: Toast["type"]) => void } | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null)
  const [fading, setFading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const sequence = useRef(0)
  const showToast = useCallback((message: string, type: Toast["type"] = "success") => {
    timers.current.forEach(clearTimeout)
    const id = ++sequence.current
    setFading(false)
    setToast({ id, message, type })
    timers.current = [
      setTimeout(() => { if (sequence.current === id) setFading(true) }, 800),
      setTimeout(() => { if (sequence.current === id) setToast(null) }, 1000),
    ]
  }, [])
  useEffect(() => {
    setMounted(true)
    return () => timers.current.forEach(clearTimeout)
  }, [])
  return <ToastContext.Provider value={{ showToast }}>
    {children}
    {mounted && createPortal(
      <div aria-live="polite" aria-atomic="true" className="pointer-events-none fixed bottom-24 left-1/2 flex w-[min(90vw,440px)] -translate-x-1/2 justify-center sm:bottom-8" style={{ zIndex: 2147483647 }}>
        {toast && <div key={toast.id} role="status" className="flex items-center gap-3 rounded-2xl border border-[#c1a16a]/50 bg-[#122f24] px-5 py-3 text-sm font-medium text-white shadow-xl" style={{ opacity: fading ? 0 : 1, transition: fading ? "opacity 200ms ease-out" : "none" }}>
          <span aria-hidden="true" className="text-[#dfbf7f]">{toast.type === "error" ? "!" : "✓"}</span>
          <span>{toast.message}</span>
        </div>}
      </div>, document.body)}
  </ToastContext.Provider>
}
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error("ToastProvider is missing")
  return context
}
