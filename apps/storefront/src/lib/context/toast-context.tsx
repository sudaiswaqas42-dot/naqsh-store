"use client"

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react"

type Toast = { id: number; message: string; type: "success" | "info" | "error" }
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
    }, 2400)
  }, [])

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  const isWishlist = toast?.message.toLowerCase().includes("wishlist")

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed bottom-24 sm:bottom-10 left-1/2 z-[999999] flex w-full max-w-[92vw] -translate-x-1/2 justify-center sm:max-w-md"
      >
        {toast && (
          <div
            key={toast.id}
            role="status"
            className="naqsh-toast pointer-events-auto flex items-center gap-3 rounded-full border border-[#c1a16a]/60 bg-[#122f24]/95 px-5 py-3 text-xs sm:text-sm font-medium tracking-wide text-white shadow-2xl backdrop-blur-md"
            style={{
              boxShadow:
                "0 12px 36px -4px rgba(18, 47, 36, 0.65), 0 0 25px rgba(193, 161, 106, 0.45)",
            }}
          >
            <span
              aria-hidden="true"
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold shrink-0 ${
                toast.type === "error"
                  ? "bg-rose-500 text-white"
                  : isWishlist
                  ? "bg-[#c1a16a] text-[#122f24]"
                  : toast.type === "info"
                  ? "bg-[#c1a16a]/30 text-[#e5caa0]"
                  : "bg-[#c1a16a] text-[#122f24]"
              }`}
            >
              {toast.type === "error" ? (
                "!"
              ) : isWishlist ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              ) : toast.type === "info" ? (
                "ℹ"
              ) : (
                "✓"
              )}
            </span>
            <span className="font-serif sm:font-sans tracking-wide text-stone-100">{toast.message}</span>
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
