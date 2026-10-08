"use client"

import { ensureStandardDelivery } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function Shipping({ cart }: { cart: HttpTypes.StoreCart; availableShippingMethods?: unknown }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [error, setError] = useState("")
  const [attempt, setAttempt] = useState(0)
  const hasAddress = !!cart.shipping_address?.address_1
  const hasShipping = !!cart.shipping_methods?.length
  const step = searchParams.get("step")

  useEffect(() => {
    if (!hasAddress || step === "address") return
    let active = true
    if (hasShipping) {
      if (!step || step === "delivery") router.replace(pathname + "?step=payment", { scroll: false })
      return
    }
    setError("")
    ensureStandardDelivery(cart.id).then(() => {
      if (active) {
        router.replace(pathname + "?step=payment", { scroll: false })
        router.refresh()
      }
    }).catch(error => { if (active) setError(error.message || "Unable to arrange delivery.") })
    return () => { active = false }
  }, [cart.id, hasAddress, hasShipping, step, pathname, router, attempt])

  if (!hasAddress || step === "address" || hasShipping) return null
  return <div role={error ? "alert" : "status"} className="text-sm text-stone-600">
    {error || "Arranging delivery..."}
    {error && <button className="ml-3 underline" onClick={() => setAttempt(value => value + 1)}>Retry</button>}
  </div>
}
