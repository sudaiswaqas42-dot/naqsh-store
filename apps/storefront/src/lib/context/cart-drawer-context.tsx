"use client"

import React, { createContext, useCallback, useContext, useState } from "react"
import { HttpTypes } from "@medusajs/types"
import { addToCart, deleteLineItem, updateLineItem } from "@lib/data/cart"

type PendingItem = { id: string; title: string; thumbnail?: string | null; quantity: number; unit_price: number }
type AddItem = { variantId: string; quantity: number; countryCode: string; preview: Omit<PendingItem, "id" | "quantity"> }

interface CartDrawerContextType {
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  pendingItems: PendingItem[]
  latestCart: HttpTypes.StoreCart | null
  setLatestCart: React.Dispatch<React.SetStateAction<HttpTypes.StoreCart | null>>
  syncCart: (cart: HttpTypes.StoreCart | null) => void
  addItem: (input: AddItem) => Promise<void>
  removeItem: (lineId: string) => Promise<HttpTypes.StoreCart | null>
  updateQuantity: (lineId: string, quantity: number) => Promise<HttpTypes.StoreCart | null>
  totalItems: number
}

const CartDrawerContext = createContext<CartDrawerContextType | null>(null)

export const CartDrawerProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([])
  const [latestCart, setLatestCart] = useState<HttpTypes.StoreCart | null>(null)

  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])
  const toggleCart = useCallback(() => setIsOpen((value) => !value), [])

  const syncCart = useCallback((cart: HttpTypes.StoreCart | null) => {
    if (!cart) return
    setLatestCart((current) => {
      if (!current) return cart
      if (current.id !== cart.id) return cart
      return cart
    })
  }, [])

  const removeItem = useCallback(async (lineId: string) => {
    // 1. Optimistic instant removal (0ms delay for seamless UI sync)
    setLatestCart((current) => {
      if (!current || !current.items) return current
      const remainingItems = current.items.filter((item) => item.id !== lineId)
      const removedItem = current.items.find((item) => item.id === lineId)
      const removedTotal =
        (removedItem?.unit_price ||
          (removedItem?.total && removedItem?.quantity
            ? removedItem.total / removedItem.quantity
            : 0)) * (removedItem?.quantity || 1)
      const newSubtotal = Math.max(0, (current.subtotal || 0) - removedTotal)
      return {
        ...current,
        items: remainingItems,
        subtotal: newSubtotal,
        item_subtotal: newSubtotal,
        total: Math.max(0, (current.total || 0) - removedTotal),
      }
    })

    try {
      const updatedCart = await deleteLineItem(lineId)
      if (updatedCart) {
        setLatestCart(updatedCart)
      }
      return updatedCart
    } catch (err) {
      console.error("Failed to delete cart item:", err)
      throw err
    }
  }, [])

  const updateQuantity = useCallback(
    async (lineId: string, quantity: number) => {
      if (quantity <= 0) {
        return removeItem(lineId)
      }

      // 1. Optimistic instant quantity update
      setLatestCart((current) => {
        if (!current || !current.items) return current
        const newItems = current.items.map((item) => {
          if (item.id === lineId) {
            const unitPrice =
              item.unit_price ||
              (item.total && item.quantity ? item.total / item.quantity : 0)
            return {
              ...item,
              quantity,
              total: unitPrice * quantity,
            }
          }
          return item
        })
        const newSubtotal = newItems.reduce((acc, item) => {
          const unitPrice =
            item.unit_price ||
            (item.total && item.quantity ? item.total / item.quantity : 0)
          return acc + unitPrice * item.quantity
        }, 0)
        return {
          ...current,
          items: newItems,
          subtotal: newSubtotal,
          item_subtotal: newSubtotal,
        }
      })

      try {
        const updatedCart = await updateLineItem({ lineId, quantity })
        if (updatedCart) {
          setLatestCart(updatedCart)
        }
        return updatedCart
      } catch (err) {
        console.error("Failed to update cart item:", err)
        throw err
      }
    },
    [removeItem]
  )

  const addItem = useCallback(async ({ preview, ...input }: AddItem) => {
    const id = crypto.randomUUID()
    setPendingItems((items) => [...items, { ...preview, id, quantity: input.quantity }])
    setIsOpen(true)
    try {
      const cart = await addToCart(input)
      if (cart) setLatestCart(cart)
    } finally {
      setPendingItems((items) => items.filter((item) => item.id !== id))
    }
  }, [])

  const totalItems =
    ((latestCart?.items || []).reduce((acc, item) => acc + item.quantity, 0)) +
    pendingItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartDrawerContext.Provider
      value={{
        isOpen,
        openCart,
        closeCart,
        toggleCart,
        pendingItems,
        latestCart,
        setLatestCart,
        syncCart,
        addItem,
        removeItem,
        updateQuantity,
        totalItems,
      }}
    >
      {children}
    </CartDrawerContext.Provider>
  )
}

export const useCartDrawer = () => {
  const context = useContext(CartDrawerContext)
  if (!context) throw new Error("Cart drawer provider is missing")
  return context
}
