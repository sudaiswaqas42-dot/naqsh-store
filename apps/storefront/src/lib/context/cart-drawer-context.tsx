"use client"

import React, { createContext, useContext, useState } from "react"

interface CartDrawerContextType {
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
}

const CartDrawerContext = createContext<CartDrawerContextType>({
  isOpen: false,
  openCart: () => {},
  closeCart: () => {},
  toggleCart: () => {},
})

export const CartDrawerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const openCart = () => setIsOpen(true)
  const closeCart = () => setIsOpen(false)
  const toggleCart = () => setIsOpen((prev) => !prev)

  return (
    <CartDrawerContext.Provider
      value={{ isOpen, openCart, closeCart, toggleCart }}
    >
      {children}
    </CartDrawerContext.Provider>
  )
}

export const useCartDrawer = () => useContext(CartDrawerContext)
