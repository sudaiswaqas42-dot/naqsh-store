import { Badge, Button, Container, Drawer, Heading, Input, Label, Text, toast } from "@medusajs/ui"
import { ArrowDownTray, Check, EllipsisHorizontal } from "@medusajs/icons"
import { useState, useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"

const CARRIERS = [
  "TCS Express",
  "Leopards Courier",
  "M&P Logistics",
  "Trax Courier",
  "DHL Express",
  "PostEx",
  "Pakistan Post",
]

const ALL_STATUS_STEPS = [
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
]

export default function OrderFulfillmentPanel({
  order,
  onPrint,
}: {
  order: any
  onPrint: () => void
}) {
  const cache = useQueryClient()
  const [busy, setBusy] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [view, setView] = useState<"status" | "dispatch" | "fulfill">("status")
  const [returnDrawerOpen, setReturnDrawerOpen] = useState(false)
  const [returnNote, setReturnNote] = useState("")

  const fulfillments = (order.fulfillments || []).filter(
    (item: any) => !item.canceled_at
  )
  const fulfillment = fulfillments[0]
  const remaining = (order.items || []).filter(
    (item: any) =>
      Number(item.quantity) > Number(item.detail?.fulfilled_quantity || 0)
  )

  const isShipped = Boolean(
    fulfillment?.shipped_at || order.fulfillment_status === "shipped"
  )
  const isDelivered = Boolean(
    fulfillment?.delivered_at || order.fulfillment_status === "delivered"
  )
  const isReturned = Boolean(
    fulfillment && order.metadata?.courier_returns?.[fulfillment.id]
  )

  const [statusStep, setStatusStep] = useState<string>(
    (order.metadata?.custom_status as string) ||
      (isDelivered
        ? "Delivered"
        : isShipped
        ? "Shipped"
        : "Processing")
  )
  const [carrier, setCarrier] = useState<string>(
    (order.metadata?.carrier as string) || "TCS Express"
  )
  const [trackingNumber, setTrackingNumber] = useState<string>(
    (fulfillment?.labels?.[0]?.tracking_number as string) ||
      (order.metadata?.tracking_number as string) ||
      ""
  )
  const [internalNotes, setInternalNotes] = useState<string>(
    (order.metadata?.internal_notes as string) || ""
  )

  // Hide duplicate native Medusa fulfillment sections
  useEffect(() => {
    const hideNative = () => {
      document.querySelectorAll("main > div > div, main div, main section").forEach((el) => {
        if (el.closest('[data-naqsh-fulfillment="true"]')) return
        const txt = el.textContent || ""
        const isNativeFulfillment =
          (txt.includes("Fulfillment #") ||
            txt.includes("Unfulfilled items") ||
            txt.includes("Awaiting fulfillment")) &&
          (txt.includes("Shipping from") ||
            txt.includes("Requires shipping") ||
            txt.includes("Manual") ||
            txt.includes("itemsToFulfill")) &&
          !el.querySelector('[data-naqsh-fulfillment="true"]')
        if (
          isNativeFulfillment &&
          (el.classList.contains("divide-y") ||
            el.getAttribute("role") === "region" ||
            el.classList.contains("p-0"))
        ) {
          ;(el as HTMLElement).style.display = "none"
        }
      })
    }
    hideNative()
    const interval = setInterval(hideNative, 600)
    return () => clearInterval(interval)
  }, [])

  // Sync state if order changes
  useEffect(() => {
    if (order?.metadata?.carrier) setCarrier(order.metadata.carrier)
    if (order?.metadata?.tracking_number)
      setTrackingNumber(order.metadata.tracking_number)
    if (order?.metadata?.internal_notes)
      setInternalNotes(order.metadata.internal_notes)
    if (order?.metadata?.custom_status)
      setStatusStep(order.metadata.custom_status)
  }, [order?.metadata])

  const applyAction = async (
    action: "fulfill" | "ship" | "deliver" | "return" | "update",
    payload?: {
      fulfillment_id?: string
      carrier?: string
      tracking_number?: string
      note?: string
      custom_status?: string
    }
  ) => {
    if (busy) return
    setBusy(true)
    try {
      const response = await fetch(`/admin/orders/${order.id}/parcel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          fulfillment_id: payload?.fulfillment_id || fulfillment?.id,
          carrier: payload?.carrier ?? carrier,
          tracking_number: payload?.tracking_number ?? trackingNumber,
          note: payload?.note,
          custom_status: payload?.custom_status ?? statusStep,
        }),
      })
      const result = await response.json()
      if (!response.ok)
        throw new Error(result.message || "Failed to update fulfillment")
      await cache.invalidateQueries({ queryKey: ["orders"] })
      toast.success(
        action === "fulfill"
          ? "Items fulfilled successfully"
          : action === "ship"
          ? "Parcel dispatched & order updated"
          : action === "deliver"
          ? "Order marked as delivered"
          : action === "update"
          ? "Order status updated successfully"
          : "Courier return recorded"
      )
      setView("status")
      setReturnDrawerOpen(false)
    } catch (err: any) {
      await cache.invalidateQueries({ queryKey: ["orders"] })
      toast.error(err.message || "Could not complete action")
    } finally {
      setBusy(false)
    }
  }

  const handleCancelFulfillment = async () => {
    if (!fulfillment?.id) return
    if (isShipped) {
      toast.error("Dispatched parcels cannot be canceled. Please use Courier Return.")
      return
    }
    const confirmed = window.confirm(
      "Are you sure you want to cancel this fulfillment? The items will revert to unfulfilled."
    )
    if (!confirmed) return

    setBusy(true)
    try {
      const response = await fetch(
        `/admin/orders/${order.id}/fulfillments/${fulfillment.id}/cancel`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ no_notification: true }),
        }
      )
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || "Failed to cancel fulfillment")
      }

      await fetch(`/admin/orders/${order.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metadata: {
            custom_status: "Processing",
            tracking_number: null,
            carrier: null,
          },
        }),
      }).catch(() => {})

      await cache.invalidateQueries({ queryKey: ["orders"] })
      toast.success("Fulfillment canceled successfully")
      setView("status")
    } catch (err: any) {
      await cache.invalidateQueries({ queryKey: ["orders"] })
      toast.error(err.message || "Could not cancel fulfillment")
    } finally {
      setBusy(false)
    }
  }

  // Determine current badge style
  const getBadge = () => {
    if (isReturned) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-500">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          Returned
        </span>
      )
    }
    if (isDelivered) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Delivered
        </span>
      )
    }
    if (isShipped) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Shipped
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-0.5 text-xs font-medium text-sky-400">
        <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
        Awaiting shipping
      </span>
    )
  }

  // Items display string (e.g. "1x S" or "1x Lawn Suit 3pc")
  const itemsDisplay = (
    fulfillment?.items && fulfillment.items.length > 0
      ? fulfillment.items
      : order.items || []
  )
    .map((it: any) => {
      const sizeOption = it.variant?.options?.find((o: any) =>
        /size/i.test(o.title || "")
      )?.value
      const label = sizeOption || it.title || "Item"
      return `${it.quantity || 1}x ${label}`
    })
    .join(", ")

  return (
    <div
      data-naqsh-fulfillment="true"
      className="relative w-full overflow-hidden rounded-xl border border-ui-border-base bg-ui-bg-base shadow-xs"
    >
      {/* Outer track that slides between views */}
      <div
        className="flex w-full transition-transform duration-500"
        style={{
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          transform:
            view === "dispatch"
              ? "translateX(-100%)"
              : view === "fulfill"
              ? "translateX(-200%)"
              : "translateX(0%)",
        }}
      >
        {/* PANEL 1: STATUS CARD (EXACT IMAGE 1 LAYOUT) */}
        <div className="w-full min-w-full shrink-0">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-ui-border-base px-6 py-4">
            <Heading level="h2">
              {fulfillment ? `Fulfillment #1` : `Fulfillment`}
            </Heading>
            <div className="flex items-center gap-3">
              {fulfillment ? (
                getBadge()
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-xs font-medium text-rose-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                  Awaiting fulfillment
                </span>
              )}
              <div className="relative">
                <Button
                  variant="transparent"
                  size="small"
                  disabled={busy}
                  onClick={() => setMenuOpen((prev) => !prev)}
                  title="Fulfillment options"
                  className="text-ui-fg-muted hover:text-ui-fg-base"
                >
                  <EllipsisHorizontal className="h-4 w-4" />
                </Button>
                {menuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full z-40 mt-1 min-w-[190px] rounded-lg border border-ui-border-base bg-ui-bg-base p-1 shadow-lg ring-1 ring-black/5 animate-in fade-in zoom-in-95">
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false)
                          onPrint()
                        }}
                        className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-xs font-medium text-ui-fg-base hover:bg-ui-bg-subtle transition-colors"
                      >
                        <ArrowDownTray className="h-3.5 w-3.5 text-ui-fg-muted" />
                        <span>Print Invoice</span>
                      </button>

                      {fulfillment && !isReturned && (
                        <>
                          <div className="my-1 border-t border-ui-border-base" />
                          <button
                            type="button"
                            disabled={busy || isShipped || isDelivered}
                            onClick={() => {
                              setMenuOpen(false)
                              handleCancelFulfillment()
                            }}
                            className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-left text-xs font-medium text-rose-500 hover:bg-rose-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            title={
                              isShipped
                                ? "Shipped fulfillments cannot be canceled (use Courier Return)"
                                : "Cancel this fulfillment"
                            }
                          >
                            <svg
                              className="h-3.5 w-3.5 text-rose-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                            <span>Cancel Fulfillment</span>
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Key-Value Details Grid */}
          <div className="divide-y divide-ui-border-base">
            <div className="grid grid-cols-2 items-center px-6 py-3.5 text-xs text-ui-fg-subtle">
              <span className="font-medium text-ui-fg-muted">Items</span>
              <span className="text-ui-fg-base">{itemsDisplay || "1x S"}</span>
            </div>

            <div className="grid grid-cols-2 items-center px-6 py-3.5 text-xs text-ui-fg-subtle">
              <span className="font-medium text-ui-fg-muted">Shipping from</span>
              <span className="text-ui-fg-interactive font-medium">
                NAQSH Central Fulfillment Hub (Karachi)
              </span>
            </div>

            <div className="grid grid-cols-2 items-center px-6 py-3.5 text-xs text-ui-fg-subtle">
              <span className="font-medium text-ui-fg-muted">Provider</span>
              <span className="text-ui-fg-base">Manual</span>
            </div>

            <div className="grid grid-cols-2 items-center px-6 py-3.5 text-xs text-ui-fg-subtle">
              <span className="font-medium text-ui-fg-muted">Tracking</span>
              <span className="text-ui-fg-base">
                {isShipped && trackingNumber
                  ? `${trackingNumber} (${carrier})`
                  : "-"}
              </span>
            </div>
          </div>

          {/* Bottom Actions Bar (Exact Buttons from Image 1) */}
          <div className="flex items-center justify-end gap-2.5 border-t border-ui-border-base bg-ui-bg-subtle/50 px-6 py-3.5">
            {!fulfillment ? (
              <Button
                size="small"
                disabled={busy}
                onClick={() => setView("fulfill")}
              >
                Fulfill items
              </Button>
            ) : !isShipped ? (
              <>
                <Button
                  variant="secondary"
                  size="small"
                  disabled={true}
                  title="Parcel must be dispatched with tracking before marking delivered"
                >
                  Mark as delivered
                </Button>
                <Button
                  size="small"
                  disabled={busy}
                  onClick={() => {
                    setStatusStep("Shipped")
                    setView("dispatch")
                  }}
                >
                  Mark as shipped
                </Button>
              </>
            ) : isReturned ? (
              <div className="flex w-full flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-amber-500">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="font-semibold">
                    Parcel Returned from Courier
                  </span>
                  {order.metadata?.return_note && (
                    <span className="text-ui-fg-muted italic">
                      — Reason: &ldquo;{String(order.metadata.return_note)}&rdquo;
                    </span>
                  )}
                </div>
                <span className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">
                  Items Safely Received Back Into Inventory
                </span>
              </div>
            ) : (
              <>
                <Button
                  variant="secondary"
                  size="small"
                  disabled={busy || isDelivered}
                  onClick={() => setReturnDrawerOpen(true)}
                  title={isDelivered ? "Courier return is disabled for delivered parcels" : undefined}
                >
                  Courier Return
                </Button>
                {!isDelivered && (
                  <Button
                    size="small"
                    isLoading={busy}
                    disabled={busy}
                    onClick={() => applyAction("deliver")}
                  >
                    Mark as delivered
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* PANEL 2: DISPATCH / CUSTOM ORDER STATUS (EXACT IMAGE 3 LAYOUT) */}
        <div className="w-full min-w-full shrink-0 border-l-4 border-[#c1a16a] bg-ui-bg-base p-6">
          {/* Header Row with Print PDF Button */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <Heading level="h2" className="text-base font-semibold">
                NAQSH Fulfillment &amp; Custom Order Status
              </Heading>
              <p className="mt-1 text-xs text-ui-fg-subtle">
                Enter a courier and tracking ID when dispatching. Tracking is shown
                to customers only after shipment.
              </p>
              <p className="mt-1.5 text-xs text-ui-fg-muted">
                Tracking labels do not execute financial operations. Use the order
                actions to cancel, return or refund an order and update
                inventory/payments.
              </p>
            </div>
            <Button
              variant="secondary"
              size="small"
              onClick={onPrint}
              className="flex items-center gap-1.5 shrink-0"
            >
              <ArrowDownTray className="h-4 w-4" />
              <span>Print / Save invoice PDF</span>
            </Button>
          </div>

          {/* Form Grid (Order Status Step, Courier Partner, Tracking ID) */}
          {(() => {
            const isShippedSelected = statusStep === "Shipped"

            return (
              <>
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {/* 1. Order Status Step */}
                  <div>
                    <Label className="text-xs font-semibold text-ui-fg-subtle">
                      Order Status Step
                    </Label>
                    <select
                      value={statusStep}
                      onChange={(e) => setStatusStep(e.target.value)}
                      className="mt-1.5 w-full rounded-md border border-ui-border-base bg-white dark:bg-[#0F2D22] px-3 py-2 text-xs text-[#1A1A1A] dark:text-[#FAF9F6] focus:border-ui-border-interactive focus:outline-none"
                    >
                      {ALL_STATUS_STEPS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 2. Courier Partner (Only enabled when status is Shipped) */}
                  <div>
                    <Label className="text-xs font-semibold text-ui-fg-subtle">
                      Courier Partner {!isShippedSelected && <span className="font-normal text-ui-fg-muted">(Shipped only)</span>}
                    </Label>
                    <select
                      value={carrier}
                      disabled={!isShippedSelected || busy}
                      onChange={(e) => setCarrier(e.target.value)}
                      className={`mt-1.5 w-full rounded-md border border-ui-border-base bg-white dark:bg-[#0F2D22] px-3 py-2 text-xs text-[#1A1A1A] dark:text-[#FAF9F6] focus:border-ui-border-interactive focus:outline-none ${
                        !isShippedSelected
                          ? "opacity-50 cursor-not-allowed bg-ui-bg-subtle"
                          : ""
                      }`}
                    >
                      <option value="">
                        Select courier at dispatch
                      </option>
                      {CARRIERS.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 3. Tracking ID (Only enabled when status is Shipped) */}
                  <div>
                    <Label htmlFor="tracking-id-input" className="text-xs font-semibold text-ui-fg-subtle">
                      Tracking ID {!isShippedSelected && <span className="font-normal text-ui-fg-muted">(Shipped only)</span>}
                    </Label>
                    <Input
                      id="tracking-id-input"
                      value={trackingNumber}
                      disabled={!isShippedSelected || busy}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder={isShippedSelected ? "e.g. 774910281" : "Only required for Shipped status"}
                      className={`mt-1.5 text-xs ${
                        !isShippedSelected
                          ? "opacity-50 cursor-not-allowed bg-ui-bg-subtle"
                          : ""
                      }`}
                    />
                  </div>
                </div>

                {/* Action Buttons: Cancel and Update Order */}
                <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-ui-border-base pt-4">
                  <Button
                    variant="secondary"
                    size="small"
                    disabled={busy}
                    onClick={() => setView("status")}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="small"
                    isLoading={busy}
                    disabled={
                      busy ||
                      (isShippedSelected && (!carrier || !trackingNumber.trim()))
                    }
                    onClick={() => {
                      const actionToUse =
                        statusStep === "Shipped"
                          ? "ship"
                          : statusStep === "Delivered"
                          ? "deliver"
                          : "update"
                      applyAction(actionToUse, {
                        carrier: isShippedSelected ? carrier : undefined,
                        tracking_number: isShippedSelected ? trackingNumber : undefined,
                        custom_status: statusStep,
                      })
                    }}
                    className="flex items-center gap-1.5"
                  >
                    <Check className="h-4 w-4" />
                    <span>Update Order</span>
                  </Button>
                </div>
              </>
            )
          })()}
        </div>

        {/* PANEL 3: IN-PLACE FULFILLMENT CREATION FLOW */}
        <div className="w-full min-w-full shrink-0 p-6">
          <div className="flex items-center justify-between border-b border-ui-border-base pb-4">
            <div>
              <Heading level="h2">Create Fulfillment</Heading>
              <Text className="mt-1 text-xs text-ui-fg-subtle">
                Confirm fulfillment from NAQSH Central Fulfillment Hub (Karachi)
              </Text>
            </div>
            <Button
              variant="secondary"
              size="small"
              onClick={() => setView("status")}
            >
              Back
            </Button>
          </div>

          <div className="my-5 space-y-3">
            <Heading level="h3" className="text-xs font-semibold text-ui-fg-muted">
              Items to fulfill:
            </Heading>
            {remaining.map((item: any) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-lg border border-ui-border-base bg-ui-bg-subtle/40 px-4 py-2.5 text-xs text-ui-fg-base"
              >
                <span>{item.title}</span>
                <span className="font-semibold">
                  {Number(item.quantity) -
                    Number(item.detail?.fulfilled_quantity || 0)}
                  x
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 border-t border-ui-border-base pt-4">
            <Button
              variant="secondary"
              size="small"
              disabled={busy}
              onClick={() => setView("status")}
            >
              Cancel
            </Button>
            <Button
              size="small"
              isLoading={busy}
              disabled={busy}
              onClick={() => applyAction("fulfill")}
            >
              Create Fulfillment
            </Button>
          </div>
        </div>
      </div>

      {/* Courier Return Drawer */}
      <Drawer
        open={returnDrawerOpen}
        onOpenChange={(open) => {
          if (!open && !busy) setReturnDrawerOpen(false)
        }}
      >
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>Receive Courier Return</Drawer.Title>
          </Drawer.Header>
          <Drawer.Body className="space-y-4 p-6">
            <Text className="text-xs text-ui-fg-subtle">
              Confirm that this parcel has returned from the courier. Items will
              be safely received back into stock inventory.
            </Text>
            <div>
              <Label htmlFor="return-note-input" className="text-xs">
                Return Reason / Note
              </Label>
              <Input
                id="return-note-input"
                value={returnNote}
                onChange={(e) => setReturnNote(e.target.value)}
                placeholder="e.g. Customer unavailable at address, refused on delivery..."
                className="mt-1.5 text-xs"
              />
            </div>
          </Drawer.Body>
          <Drawer.Footer>
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => setReturnDrawerOpen(false)}
            >
              Cancel
            </Button>
            <Button
              isLoading={busy}
              disabled={busy || !returnNote.trim()}
              onClick={() =>
                applyAction("return", {
                  note: returnNote,
                  custom_status: "Returned",
                })
              }
            >
              Receive Return
            </Button>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>
    </div>
  )
}
