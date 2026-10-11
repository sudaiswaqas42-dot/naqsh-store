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
    setToast({ id: ++sequence.current, message, type })
    timer.current = setTimeout(() => setToast(null), 1000)
  }, [])

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed bottom-24 left-1/2 z-[9999] flex w-full max-w-[90vw] -translate-x-1/2 justify-center sm:bottom-8 sm:max-w-md"
      >
        {toast && (
          <div
            key={toast.id}
            className="naqsh-toast pointer-events-auto flex items-center gap-2.5 rounded-full border border-[#c1a16a]/30 bg-[#122f24]/95 px-5 py-2.5 text-xs sm:text-sm font-medium tracking-wide text-white shadow-2xl backdrop-blur-md"
            style={{
              boxShadow: "0 10px 30px -5px rgba(18, 47, 36, 0.45), 0 0 20px rgba(193, 161, 106, 0.25)",
            }}
          >
            <span
              aria-hidden="true"
              className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                toast.type === "error"
                  ? "bg-rose-500 text-white"
                  : toast.type === "info"
                  ? "bg-[#c1a16a]/25 text-[#e5caa0]"
                  : "bg-[#c1a16a] text-[#122f24]"
              }`}
            >
              {toast.type === "error" ? "!" : toast.type === "info" ? "ℹ" : "✓"}
            </span>
            <span>{toast.message}</span>
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
