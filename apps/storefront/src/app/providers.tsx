"use client"

import React, { Suspense } from "react"
import { ToastProvider } from "@lib/context/toast-context"
import { WishlistProvider } from "@lib/context/wishlist-context"
import { CartDrawerProvider } from "@lib/context/cart-drawer-context"
import NavigationProgressBar from "@modules/layout/components/navigation-progress-bar"

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <WishlistProvider>
        <CartDrawerProvider>
          <Suspense fallback={null}>
            <NavigationProgressBar />
          </Suspense>
          {children}
        </CartDrawerProvider>
      </WishlistProvider>
    </ToastProvider>
  )
}
