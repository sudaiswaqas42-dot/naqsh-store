"use client"

import React, { createContext, useContext, useState, useCallback } from "react"

interface Toast {
  id: string
  message: string
  type?: "success" | "info" | "error"
}

interface ToastContextType {
  showToast: (message: string, type?: "success" | "info" | "error") => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: "success" | "info" | "error" = "success") => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3200)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-md shadow-xl bg-brand text-white text-sm font-medium border border-white/10 animate-fade-in-top transition-all"
          >
            <span className="text-accent font-bold">
              {t.type === "error" ? "✕" : "✓"}
            </span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    return {
      showToast: (msg: string) => {
        if (typeof window !== "undefined") console.log("[Toast]:", msg)
      },
    }
  }
  return context
}
