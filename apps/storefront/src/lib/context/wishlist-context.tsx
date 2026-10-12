"use client"

import React, { createContext, useContext, useState, useEffect, useRef } from "react"
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
  const currentItems = useRef<WishlistItem[]>([])
  const { showToast } = useToast()

  useEffect(() => {
    try {
      const stored = localStorage.getItem("naqsh_wishlist")
      if (stored) {
        currentItems.current = JSON.parse(stored)
        setItems(currentItems.current)
      }
    } catch {}
  }, [])

  const toggleWishlist = (item: WishlistItem) => {
    const exists = currentItems.current.some((i) => i.id === item.id)
    const next = exists
      ? currentItems.current.filter((i) => i.id !== item.id)
      : [...currentItems.current, item]

    currentItems.current = next
    setItems(next)

    try {
      localStorage.setItem("naqsh_wishlist", JSON.stringify(next))
    } catch {}

    showToast(exists ? "Removed from wishlist" : "Added to wishlist", exists ? "info" : "success")
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
