"use client"

import { Dialog, DialogPanel } from "@headlessui/react"
import { useToast } from "@lib/context/toast-context"
import React, { useEffect, useState, useRef } from "react"
import { useCartDrawer } from "@lib/context/cart-drawer-context"
import { HttpTypes } from "@medusajs/types"
import { updateLineItem, deleteLineItem } from "@lib/data/cart"
import { convertToLocale } from "@lib/util/money"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import Spinner from "@modules/common/icons/spinner"
import { usePathname } from "next/navigation"

export default function CartDrawer({
  cart: initialCart,
}: {
  cart: HttpTypes.StoreCart | null
}) {
  const { isOpen, closeCart, pendingItems, latestCart, syncCart, removeItem, updateQuantity } = useCartDrawer()
  useEffect(() => { syncCart(initialCart) }, [initialCart, syncCart])
  const cart = latestCart !== null ? latestCart : initialCart
  const pathname = usePathname()
  const { showToast } = useToast()
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // Auto-close on page navigation
  useEffect(() => {
    closeCart()
  }, [pathname])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeCart()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, closeCart])

  const items = cart?.items || []
  const pendingQty = pendingItems.reduce((acc, p) => acc + p.quantity, 0)
  const totalItems =
    items.reduce((acc, item) => acc + item.quantity, 0) + pendingQty

  const pendingSubtotal = pendingItems.reduce(
    (acc, p) => acc + (p.unit_price * p.quantity),
    0
  )
  const itemsSubtotal = items.reduce((acc, item) => {
    const unit = item.unit_price || (item.total ? item.total / item.quantity : 0)
    return acc + unit * item.quantity
  }, 0)
  const subtotal =
    (itemsSubtotal + pendingSubtotal) || (cart?.subtotal ?? 0)
  const currencyCode = cart?.currency_code || "pkr"

  // Free shipping threshold: Rs. 4,999
  const freeShippingThreshold = 4999
  const amountNeeded = Math.max(0, freeShippingThreshold - subtotal)
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))

  const handleQuantity = async (lineId: string, currentQty: number, delta: number) => {
    const newQty = currentQty + delta
    if (newQty <= 0) {
      handleRemove(lineId)
      return
    }

    try {
      setUpdatingId(lineId)
      await updateQuantity(lineId, newQty)
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Unable to update your bag. Please try again.", "error")
    } finally {
      setUpdatingId(null)
    }
  }

  const handleRemove = async (lineId: string) => {
    try {
      setUpdatingId(lineId)
      await removeItem(lineId)
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Unable to update your bag. Please try again.", "error")
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <Dialog open={isOpen} onClose={closeCart} className="relative z-[100]">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <DialogPanel
        className={`fixed top-0 right-0 z-50 h-[100dvh] w-full max-w-md bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Bag"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-2xl font-semibold tracking-wide text-brand">
              Shopping Bag
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-accent/10 text-accent">
              {totalItems} {totalItems === 1 ? "item" : "items"}
            </span>
          </div>
          <button
            onClick={closeCart}
            className="p-2 text-gray-400 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100"
            aria-label="Close cart drawer"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div className="bg-surface/60 p-4 border-b border-gray-100">
          <div className="flex justify-between items-center text-xs mb-1.5 font-medium">
            {amountNeeded > 0 ? (
              <span className="text-gray-700">
                Add{" "}
                <strong className="text-accent">
                  {convertToLocale({ amount: amountNeeded, currency_code: currencyCode })}
                </strong>{" "}
                for <strong>FREE Nationwide Delivery</strong>
              </span>
            ) : (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <span>✨</span> You've unlocked FREE Nationwide Shipping!
              </span>
            )}
            <span className="text-gray-500 font-mono text-[11px]">
              {progressPercent}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                amountNeeded === 0 ? "bg-emerald-600" : "bg-accent"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 min-h-0 overflow-y-auto p-5 divide-y divide-gray-100">
          {pendingItems.map((item) => (
            <div key={item.id} className="py-4 flex gap-4 first:pt-0 last:pb-0 opacity-95">
              <div className="w-20 h-24 flex-shrink-0 bg-surface rounded overflow-hidden relative border border-gray-100">
                <Thumbnail thumbnail={item.thumbnail} size="full" />
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-serif text-sm font-medium text-brand line-clamp-1">
                      {item.title}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-accent/10 text-accent">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
                      Added
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-brand mt-1">
                    {convertToLocale({
                      amount: item.unit_price,
                      currency_code: currencyCode,
                    })}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 text-xs text-stone-500">
                  <span>Qty: {item.quantity}</span>
                  <span className="font-semibold text-brand">
                    {convertToLocale({
                      amount: item.unit_price * item.quantity,
                      currency_code: currencyCode,
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && pendingItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center text-accent">
                <svg
                  className="w-10 h-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <h3 className="font-serif text-xl font-medium text-brand">
                Your Bag is Empty
              </h3>
              <p className="text-sm text-gray-500 max-w-xs">
                Explore our curated luxury collections and find your next statement piece.
              </p>
              <LocalizedClientLink
                href="/store"
                className="mt-2 inline-flex items-center justify-center px-6 py-3 bg-brand text-white text-xs font-semibold uppercase tracking-widest hover:bg-black transition-colors rounded-none"
              >
                Shop New Arrivals
              </LocalizedClientLink>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="py-4 flex gap-4 first:pt-0 last:pb-0">
                <div className="w-20 h-24 flex-shrink-0 bg-surface rounded overflow-hidden relative border border-gray-100">
                  <LocalizedClientLink href={`/products/${item.product_handle}`}>
                    <Thumbnail
                      thumbnail={item.thumbnail}
                      images={item.variant?.product?.images}
                      size="full"
                    />
                  </LocalizedClientLink>
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <LocalizedClientLink
                        href={`/products/${item.product_handle}`}
                        className="font-serif text-sm font-medium text-brand hover:text-accent line-clamp-1 transition-colors"
                      >
                        {item.title}
                      </LocalizedClientLink>
                      <button
                        onClick={() => handleRemove(item.id)}
                        disabled={updatingId === item.id}
                        className="text-gray-400 hover:text-red-500 transition-colors p-0.5"
                        title="Remove item"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>

                    {item.variant?.title && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        Variant: {item.variant.title}
                      </p>
                    )}

                    <div className="text-xs font-semibold text-brand mt-1">
                      {convertToLocale({
                        amount: item.unit_price,
                        currency_code: currencyCode,
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-gray-200 rounded">
                      <button
                        onClick={() => handleQuantity(item.id, item.quantity, -1)}
                        className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 text-sm font-semibold transition-colors active:scale-90"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-semibold text-stone-900 select-none">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantity(item.id, item.quantity, 1)}
                        className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-100 text-sm font-semibold transition-colors active:scale-90"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <span className="text-sm font-semibold text-brand">
                      {convertToLocale({
                        amount:
                          (item.unit_price ||
                            (item.total && item.quantity
                              ? item.total / item.quantity
                              : 0)) * item.quantity,
                        currency_code: currencyCode,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer / Checkout */}
        {(items.length > 0 || pendingItems.length > 0) && (
          <div className="p-5 border-t border-gray-100 bg-surface/30 space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold text-brand">
                  {convertToLocale({ amount: subtotal, currency_code: currencyCode })}
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Shipping</span>
                <span>
                  {amountNeeded === 0 ? (
                    <strong className="text-emerald-700">FREE</strong>
                  ) : (
                    "Calculated at checkout"
                  )}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <LocalizedClientLink
                href="/checkout"
                prefetch={true}
                onClick={closeCart}
                className="w-full py-3.5 bg-brand text-white text-xs font-semibold uppercase tracking-widest hover:bg-black transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Proceed to Checkout</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </LocalizedClientLink>

              <LocalizedClientLink
                href="/cart"
                prefetch={true}
                onClick={closeCart}
                className="w-full py-2.5 bg-white text-brand border border-gray-300 text-xs font-semibold uppercase tracking-wider hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                View Shopping Bag
              </LocalizedClientLink>
            </div>

            <div className="flex items-center justify-center gap-4 text-[11px] text-gray-400">
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
                </svg>
                Cash on Delivery Available
              </span>
              <span>•</span>
              <span>Easy 7-Day Exchange</span>
            </div>
          </div>
        )}
      </DialogPanel>
    </Dialog>
  )
}
