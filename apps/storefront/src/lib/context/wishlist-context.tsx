"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useToast } from "./toast-context"

export interface WishlistItem {
  id: string
  title: string
  handle: string
  thumbnail?: string
  price?: number
  currency_code?: string
}

interface WishlistContextType {
  items: WishlistItem[]
  toggleWishlist: (item: WishlistItem) => void
  isInWishlist: (id: string) => boolean
  count: number
}

const WishlistContext = createContext<WishlistContextType | null>(null)

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<WishlistItem[]>([])
  const { showToast } = useToast()

  useEffect(() => {
    try {
      const stored = localStorage.getItem("naqsh_wishlist")
      if (stored) {
        setItems(JSON.parse(stored))
      }
    } catch {}
  }, [])

  const toggleWishlist = (item: WishlistItem) => {
    const exists = items.some((i) => i.id === item.id)
    const next = exists
      ? items.filter((i) => i.id !== item.id)
      : [...items, item]

    setItems(next)

    try {
      localStorage.setItem("naqsh_wishlist", JSON.stringify(next))
    } catch {}

    if (exists) {
      showToast(`Removed from wishlist: ${item.title}`, "info")
    } else {
      showToast(`Added to wishlist: ${item.title}`, "success")
    }
  }

  const isInWishlist = (id: string) => items.some((i) => i.id === id)

  return (
    <WishlistContext.Provider
      value={{
        items,
        toggleWishlist,
        isInWishlist,
        count: items.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => {
  const ctx = useContext(WishlistContext)
  if (!ctx) {
    return {
      items: [],
      toggleWishlist: () => {},
      isInWishlist: () => false,
      count: 0,
    }
  }
  return ctx
}
