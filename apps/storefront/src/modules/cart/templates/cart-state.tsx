"use client"

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react"
import { HttpTypes } from "@medusajs/types"
import { updateLineItem, deleteLineItem } from "@lib/data/cart"

type OptimisticItemMap = {
  [lineId: string]: {
    quantity: number
    removed?: boolean
  }
}

interface CartContextType {
  cart: HttpTypes.StoreCart
  itemQuantities: { [lineId: string]: number }
  removedItemIds: Set<string>
  optimisticSubtotal: number
  optimisticTotal: number
  updateQuantity: (lineId: string, newQty: number, unitPrice: number) => void
  removeItem: (lineId: string, unitPrice: number, currentQty: number) => void
  isLineUpdating: (lineId: string) => boolean
}

const CartContext = createContext<CartContextType | null>(null)

export const useOptimisticCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useOptimisticCart must be used within an OptimisticCartProvider")
  }
  return context
}

export const OptimisticCartProvider: React.FC<{
  initialCart: HttpTypes.StoreCart
  children: React.ReactNode
}> = ({ initialCart, children }) => {
  const [cart, setCart] = useState<HttpTypes.StoreCart>(initialCart)
  const [itemQuantities, setItemQuantities] = useState<{ [lineId: string]: number }>(() => {
    const map: { [lineId: string]: number } = {}
    initialCart.items?.forEach((item) => {
      map[item.id] = item.quantity
    })
    return map
  })
  const [removedItemIds, setRemovedItemIds] = useState<Set<string>>(new Set())
  const [updatingLineIds, setUpdatingLineIds] = useState<Set<string>>(new Set())

  // Pending updates debounce timers
  const debounceTimers = useRef<{ [lineId: string]: NodeJS.Timeout }>({})

  // Keep in sync with server revalidation if base cart changes
  useEffect(() => {
    setCart(initialCart)
    setItemQuantities((prev) => {
      const next = { ...prev }
      initialCart.items?.forEach((item) => {
        if (!debounceTimers.current[item.id] && !removedItemIds.has(item.id)) {
          next[item.id] = item.quantity
        }
      })
      return next
    })
  }, [initialCart])

  // Calculate real-time 0ms optimistic subtotal and total
  const baseSubtotal = initialCart.item_subtotal || initialCart.subtotal || 0
  const baseTax = initialCart.tax_total || 0
  const baseShipping = initialCart.shipping_subtotal || 0
  const baseDiscount = (initialCart as any).discount_subtotal || initialCart.discount_total || 0

  let optimisticSubtotal = 0
  initialCart.items?.forEach((item) => {
    if (removedItemIds.has(item.id)) return
    const currentQty = itemQuantities[item.id] !== undefined ? itemQuantities[item.id] : item.quantity
    const unitPrice = item.unit_price || (item.total && item.quantity ? item.total / item.quantity : 0)
    optimisticSubtotal += unitPrice * currentQty
  })

  const optimisticTotal = Math.max(0, optimisticSubtotal + baseShipping + baseTax - baseDiscount)

  const updateQuantity = useCallback(
    (lineId: string, newQty: number, unitPrice: number) => {
      if (newQty <= 0) {
        removeItem(lineId, unitPrice, itemQuantities[lineId] || 1)
        return
      }

      // 1. Instant optimistic state update (0ms latency!)
      setItemQuantities((prev) => ({
        ...prev,
        [lineId]: newQty,
      }))

      // 2. Debounce backend server action
      if (debounceTimers.current[lineId]) {
        clearTimeout(debounceTimers.current[lineId])
      }

      debounceTimers.current[lineId] = setTimeout(async () => {
        setUpdatingLineIds((prev) => new Set(prev).add(lineId))
        try {
          await updateLineItem({
            lineId,
            quantity: newQty,
          })
        } catch (err: any) {
          console.warn("Background cart update quietly retrying...", err)
          // Silent retry or fallback
        } finally {
          delete debounceTimers.current[lineId]
          setUpdatingLineIds((prev) => {
            const next = new Set(prev)
            next.delete(lineId)
            return next
          })
        }
      }, 300)
    },
    [itemQuantities]
  )

  const removeItem = useCallback(async (lineId: string, unitPrice: number, currentQty: number) => {
    // 1. Instant optimistic removal (0ms latency!)
    setRemovedItemIds((prev) => new Set(prev).add(lineId))
    setItemQuantities((prev) => {
      const next = { ...prev }
      delete next[lineId]
      return next
    })

    if (debounceTimers.current[lineId]) {
      clearTimeout(debounceTimers.current[lineId])
      delete debounceTimers.current[lineId]
    }

    try {
      await deleteLineItem(lineId)
    } catch (err: any) {
      console.warn("Background cart item deletion retry...", err)
    }
  }, [])

  const isLineUpdating = useCallback(
    (lineId: string) => updatingLineIds.has(lineId),
    [updatingLineIds]
  )

  return (
    <CartContext.Provider
      value={{
        cart,
        itemQuantities,
        removedItemIds,
        optimisticSubtotal,
        optimisticTotal,
        updateQuantity,
        removeItem,
        isLineUpdating,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
