"use client"

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react"

export type Toast = { id: number; message: string; type: "success" | "info" | "error" }
const ToastContext = createContext<{ showToast: (message: string, type?: Toast["type"]) => void } | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sequence = useRef(0)

  const showToast = useCallback((message: string, type: Toast["type"] = "success") => {
    if (timer.current) clearTimeout(timer.current)
    const id = ++sequence.current
    setToast({ id, message, type })
    timer.current = setTimeout(() => {
      if (sequence.current === id) {
        setToast(null)
      }
    }, 4500)
  }, [])

  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; type?: Toast["type"] }>
      if (customEvent.detail?.message) {
        showToast(customEvent.detail.message, customEvent.detail.type || "success")
      }
    }
    window.addEventListener("naqsh:toast", handler)
    return () => {
      window.removeEventListener("naqsh:toast", handler)
      if (timer.current) clearTimeout(timer.current)
    }
  }, [showToast])

  const isWishlist = toast?.message.toLowerCase().includes("wishlist")
  const isRemoved = toast?.message.toLowerCase().includes("removed")

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed top-20 sm:top-8 left-1/2 flex w-full max-w-[92vw] -translate-x-1/2 justify-center sm:max-w-md"
        style={{ zIndex: 2147483647 }}
      >
        {toast && (
          <div
            key={toast.id}
            role="status"
            className="naqsh-toast pointer-events-auto flex items-center gap-3 rounded-full border-2 border-[#c1a16a] bg-[#122f24] px-5 py-3 text-sm font-medium tracking-wide text-white shadow-2xl backdrop-blur-md"
            style={{
              boxShadow:
                "0 14px 40px -4px rgba(0, 0, 0, 0.75), 0 0 25px rgba(193, 161, 106, 0.5)",
            }}
          >
            <span
              aria-hidden="true"
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shrink-0 ${
                toast.type === "error"
                  ? "bg-rose-500 text-white"
                  : isWishlist && isRemoved
                  ? "bg-stone-800 text-stone-200"
                  : "bg-[#c1a16a] text-[#122f24]"
              }`}
            >
              {toast.type === "error" ? (
                "✕"
              ) : isWishlist ? (
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill={isRemoved ? "none" : "#e11d48"}
                  stroke={isRemoved ? "currentColor" : "#e11d48"}
                  strokeWidth="2"
                >
                  <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
                </svg>
              ) : (
                "✓"
              )}
            </span>
            <span className="font-sans font-medium tracking-wide text-white text-sm">
              {toast.message}
            </span>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="ml-2 rounded-full p-1 text-stone-400 hover:text-white transition-colors"
              aria-label="Dismiss notification"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error("ToastProvider is missing")
  return context
}
