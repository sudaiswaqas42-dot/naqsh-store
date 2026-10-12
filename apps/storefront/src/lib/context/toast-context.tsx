"use client"

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react"
import { createPortal } from "react-dom"

export type Toast = { id: number; message: string; type: "success" | "info" | "error" }
const ToastContext = createContext<{ showToast: (message: string, type?: Toast["type"]) => void } | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null)
  const [mounted, setMounted] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sequence = useRef(0)

  const dismiss = useCallback(() => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
    setToast(null)
  }, [])

  const showToast = useCallback((message: string, type: Toast["type"] = "success") => {
    if (timer.current) clearTimeout(timer.current)
    const id = ++sequence.current
    setToast({ id, message, type })
    timer.current = setTimeout(() => {
      if (sequence.current === id) setToast(null)
    }, 2000)
  }, [])

  useEffect(() => {
    setMounted(true)
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {mounted && createPortal(
        <div className="naqsh-notification-layer" role="status" aria-live="polite" aria-atomic="true">
          {toast && (
            <div key={toast.id} className="naqsh-notification" data-notification-type={toast.type}>
              <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-[#c1a16a]">
                {toast.type === "success" ? <path d="m5 12 4 4L19 6" /> : <><circle cx="12" cy="12" r="9" /><path d="M12 7v6m0 3v1" /></>}
              </svg>
              <span className="min-w-0 flex-1">{toast.message}</span>
              <button type="button" onClick={dismiss} aria-label="Dismiss notification" className="shrink-0 rounded-full p-2 hover:bg-white/10">
                <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 6 12 12M18 6 6 18" /></svg>
              </button>
            </div>
          )}
        </div>, document.body
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error("ToastProvider is missing")
  return context
}
