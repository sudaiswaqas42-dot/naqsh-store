"use client"

import React, { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function OrderTrackPage() {
  const searchParams = useSearchParams()
  const initialOrderNo = searchParams.get("order_number") || searchParams.get("id") || ""
  const initialEmail = searchParams.get("email") || ""

  const [displayId, setDisplayId] = useState(initialOrderNo)
  const [email, setEmail] = useState(initialEmail)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderData, setOrderData] = useState<any | null>(null)

  const handleTrack = async (e?: React.FormEvent, customId?: string, customEmail?: string) => {
    if (e) e.preventDefault()
    const idToUse = customId || displayId
    const emailToUse = customEmail || email

    if (!idToUse) {
      setError("Please provide your Order Number.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/order/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_number: idToUse.replace("#", "").trim(),
          display_id: idToUse.replace("#", "").trim(),
          email: emailToUse ? emailToUse.trim() : undefined,
        }),
      })

      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(json.error || json.message || "Order not found. Please verify your order number.")
        setOrderData(null)
        return
      }

      if (json.order) {
        setOrderData(json.order)
      } else {
        setError("Unable to find order details. Please check your order number.")
        setOrderData(null)
      }
    } catch (err: any) {
      setError("Unable to connect to order tracking service. Please try again.")
      setOrderData(null)
    } finally {
      setLoading(false)
    }
  }

  // Auto-track if URL parameters provided
  useEffect(() => {
    if (initialOrderNo) {
      handleTrack(undefined, initialOrderNo, initialEmail)
    }
  }, [initialOrderNo, initialEmail])

  const fillDemoOrder = (id: string, mail: string) => {
    setDisplayId(id)
    setEmail(mail)
    handleTrack(undefined, id, mail)
  }

  return (
    <div className="content-container mx-auto px-4 sm:px-6 lg:px-8 py-14 max-w-4xl font-sans">
      {/* Page Header */}
      <div className="text-center max-w-xl mx-auto mb-10">
        <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-accent">
          Real-Time Tracking
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-brand font-medium mt-1">
          Track Your NAQSH Order
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-2 font-light">
          Enter your order number below to track your parcel from our Karachi fulfillment hub to your doorstep anywhere in Pakistan.
        </p>
      </div>

      {/* Lookup Form */}
      <div className="bg-white border border-stone-200 p-6 sm:p-8 shadow-xs mb-10">
        <form onSubmit={handleTrack} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
              Order Number *
            </label>
            <input
              type="text"
              value={displayId}
              onChange={(e) => setDisplayId(e.target.value)}
              placeholder="e.g. 1001 or #1001"
              className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-300 focus:bg-white focus:border-brand outline-none"
              required
            />
          </div>

          <div className="sm:col-span-5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
              Account / Customer Email (Optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. fatima.khan@example.com"
              className="w-full px-4 py-2.5 text-xs bg-stone-50 border border-stone-300 focus:bg-white focus:border-brand outline-none"
            />
          </div>

          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-brand text-white text-xs font-semibold uppercase tracking-wider hover:bg-black transition-colors disabled:opacity-50"
            >
              {loading ? "Searching..." : "Track Parcel"}
            </button>
          </div>
        </form>

        {/* Demo Fast Buttons */}
        <div className="mt-4 pt-4 border-t border-stone-100 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] text-stone-400 font-medium">Quick Demo Test:</span>
          <button
            type="button"
            onClick={() => fillDemoOrder("1001", "fatima.khan@example.com")}
            className="px-2.5 py-1 bg-stone-100 hover:bg-accent/15 text-stone-700 hover:text-accent text-[11px] transition-colors rounded-sm"
          >
            Order #1001 (Delivered • TCS)
          </button>
          <button
            type="button"
            onClick={() => fillDemoOrder("1002", "zainab.ahmed@example.com")}
            className="px-2.5 py-1 bg-stone-100 hover:bg-accent/15 text-stone-700 hover:text-accent text-[11px] transition-colors rounded-sm"
          >
            Order #1002 (Shipped • Leopards)
          </button>
          <button
            type="button"
            onClick={() => fillDemoOrder("1003", "bilal.siddiqui@example.com")}
            className="px-2.5 py-1 bg-stone-100 hover:bg-accent/15 text-stone-700 hover:text-accent text-[11px] transition-colors rounded-sm"
          >
            Order #1003 (Packed • TCS)
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Order Tracking Result View */}
      {orderData && (
        <div className="space-y-8 animate-fadeIn">
          {/* Status & Carrier Card */}
          <div className="bg-white border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-stone-100">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-accent">
                  Order #{orderData.display_id}
                </span>
                <h2 className="font-serif text-2xl font-medium text-brand mt-0.5">
                  Current Status: {orderData.custom_status_label || "In Processing"}
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Placed on {new Date(orderData.created_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>

              {orderData.tracking?.carrier && (
                <div className="text-right">
                  <div className="text-xs text-stone-500">Courier Partner</div>
                  <div className="font-semibold text-brand text-sm">
                    {orderData.tracking.carrier}
                  </div>
                  <div className="text-xs font-mono text-accent mt-0.5">
                    Waybill: #{orderData.tracking.tracking_number}
                  </div>
                </div>
              )}
            </div>

            {/* 7-Step Progression Bar */}
            <div className="py-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-6">
                Delivery Progression (7 Stages)
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {orderData.tracking?.steps?.map((step: any, idx: number) => {
                  const isDone = step.status === "completed"
                  const isCurrent = step.status === "current"

                  return (
                    <div
                      key={idx}
                      className={`p-3 border text-center transition-all ${
                        isDone
                          ? "bg-emerald-50/60 border-emerald-300 text-emerald-900"
                          : isCurrent
                          ? "bg-amber-50 border-accent text-accent shadow-xs"
                          : "bg-stone-50 border-stone-200 text-stone-400"
                      }`}
                    >
                      <div className="w-6 h-6 mx-auto mb-1.5 rounded-full flex items-center justify-center text-xs font-bold">
                        {isDone ? (
                          <span className="text-emerald-600">✓</span>
                        ) : isCurrent ? (
                          <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
                        ) : (
                          <span>{idx + 1}</span>
                        )}
                      </div>
                      <div className="text-[11px] font-medium leading-tight">
                        {step.name}
                      </div>
                      <div className="text-[9px] mt-1 opacity-75">
                        {isDone ? "Completed" : isCurrent ? "Active" : "Pending"}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Shipping Address & Help */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-stone-100 text-xs">
              <div className="space-y-1.5">
                <h4 className="font-semibold uppercase tracking-wider text-stone-500">
                  Shipping Address
                </h4>
                <p className="text-stone-800 font-medium">
                  {orderData.shipping_address?.first_name} {orderData.shipping_address?.last_name}
                </p>
                <p className="text-stone-600">{orderData.shipping_address?.address_1}</p>
                <p className="text-stone-600">
                  {orderData.shipping_address?.city}, {orderData.shipping_address?.province}
                </p>
                <p className="text-stone-500">Phone: {orderData.shipping_address?.phone || "N/A"}</p>
              </div>

              <div className="space-y-2 bg-stone-50 p-4 border border-stone-200">
                <h4 className="font-semibold uppercase tracking-wider text-stone-700">
                  Need Help With This Order?
                </h4>
                <p className="text-stone-500 text-[11px] leading-relaxed">
                  Our dedicated concierge team is available 24/7 on WhatsApp to assist with address updates, carrier coordination, and doorstep exchanges.
                </p>
                <a
                  href="https://wa.me/923001234567"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:underline pt-1"
                >
                  <span>Chat on WhatsApp</span>
                  <span>&rarr;</span>
                </a>
              </div>
            </div>
          </div>

          {/* Items In This Order */}
          <div className="bg-white border border-stone-200 p-6 sm:p-8 shadow-xs">
            <h3 className="font-serif text-lg font-medium text-brand mb-4">
              Items in this Shipment
            </h3>
            <div className="divide-y divide-stone-100">
              {orderData.items?.map((item: any) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-16 bg-stone-100 overflow-hidden flex-shrink-0 border border-stone-200">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-stone-400">
                          NAQSH
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-serif text-sm font-medium text-brand">
                        {item.title}
                      </div>
                      {item.variant_title && (
                        <div className="text-xs text-stone-500">
                          Variant: {item.variant_title}
                        </div>
                      )}
                      <div className="text-xs text-stone-400">Qty: {item.quantity}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-semibold text-brand">
                      Rs. {(item.unit_price || 6950).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
