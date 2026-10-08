import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Check, ArrowDownTray, PencilSquare, DocumentText } from "@medusajs/icons"
import { Container, Heading, Text, Badge, Button, Input, Select } from "@medusajs/ui"
import { useState } from "react"
import naqshLogo from "../assets/naqsh-logo.png"

const ALL_STATUSES = [
  "Pending",
  "Confirmed",
  "Processing",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
  "Returned",
  "Refunded",
]

const OrderStatusWidget = ({ data: order }: { data: any }) => {
  const metadata = order?.metadata || {}

  const getInitialStatus = () => {
    if (order?.status === "canceled") return "Cancelled"
    if (metadata.custom_status) return metadata.custom_status as string
    const fulfillments = Array.isArray(order?.fulfillments) ? order.fulfillments : []
    const items = Array.isArray(order?.items) ? order.items : []

    const isDelivered =
      fulfillments.some((f: any) => f.delivered_at && !f.canceled_at) ||
      items.some((it: any) => (it.detail?.delivered_quantity || 0) > 0) ||
      order?.fulfillment_status === "delivered" ||
      order?.status === "completed"

    if (isDelivered) return "Delivered"

    const isShipped =
      fulfillments.some((f: any) => f.shipped_at && !f.canceled_at) ||
      items.some((it: any) => (it.detail?.shipped_quantity || 0) > 0) ||
      order?.fulfillment_status === "shipped"

    if (isShipped) return "Shipped"

    const isPacked =
      fulfillments.some((f: any) => (f.packed_at || f.id) && !f.canceled_at) ||
      items.some((it: any) => (it.detail?.fulfilled_quantity || 0) > 0) ||
      order?.fulfillment_status === "fulfilled"

    if (isPacked) return "Packed"

    if (order?.status === "canceled") return "Cancelled"
    return "Confirmed"
  }

  const [currentStatus, setCurrentStatus] = useState<string>(getInitialStatus())
  const [carrier, setCarrier] = useState<string>((metadata.carrier as string) || "")
  const [trackingNumber, setTrackingNumber] = useState<string>((metadata.tracking_number as string) || "")
  const [internalNotes, setInternalNotes] = useState<string>((metadata.internal_notes as string) || "")
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/admin/orders/${order.id}/custom-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          custom_status: currentStatus,
          carrier,
          tracking_number: trackingNumber,
          internal_notes: internalNotes,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.message || body.error || "Could not update order")
      }
      if (res.ok) {
        setSavedMsg(true)
        setTimeout(() => setSavedMsg(false), 3000)
      }
    } catch (err: any) {
      alert("Error updating order status: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  const printInvoice = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const escape = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]!))
    const paymentProvider = order.payment_collections?.flatMap((collection: any) => collection.payments || []).find((payment: any) => payment.provider_id)?.provider_id
    const paymentMethod = paymentProvider?.includes("system") ? "Cash on Delivery" : paymentProvider || order.payment_status || "See order payment details"
    const itemsHtml = (order.items || [])
      .map(
        (item: any) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid var(--border-base);">${escape(item.title || "Product")}</td>
          <td style="padding: 10px; border-bottom: 1px solid var(--border-base); text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid var(--border-base); text-align: right;">Rs. ${Number(item.unit_price || 0).toLocaleString()}</td>
          <td style="padding: 10px; border-bottom: 1px solid var(--border-base); text-align: right; font-weight: bold;">Rs. ${(Number(item.unit_price || 0) * Number(item.quantity)).toLocaleString()}</td>
        </tr>
      `
      )
      .join("")

    const logoSrc = naqshLogo.startsWith("http") || naqshLogo.startsWith("data:")
      ? naqshLogo
      : `${window.location.origin}${naqshLogo}`

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - #${escape(order.custom_display_id || order.display_id || order.id)}</title>
        <base href="${window.location.origin}/" />
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1a1a1a; max-width: 800px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0F2D22; padding-bottom: 20px; margin-bottom: 30px; }
          .logo-img { height: 64px; max-width: 240px; object-fit: contain; margin-bottom: 6px; display: block; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { text-align: left; background: #f8f8f6; padding: 10px; font-size: 12px; text-transform: uppercase; color: #0F2D22; }
          .total-box { margin-top: 30px; float: right; width: 300px; }
          .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
          .grand-total { font-size: 18px; font-weight: bold; border-top: 2px solid #0F2D22; padding-top: 8px; margin-top: 8px; color: #0F2D22; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <img class="logo-img" src="${logoSrc}" alt="NAQSH — Where Identity Begins" />
            <p style="font-size: 12px; color: #555; margin: 2px 0 0 0; letter-spacing: 0.5px;">Pakistani Luxury Fashion &amp; Apparel</p>
            <p style="font-size: 11px; color: #777; margin: 2px 0 0 0;">Email: support@naqsh.pk · Tel: +92 (21) 3584-9000</p>
          </div>
          <div style="text-align: right;">
            <h2 style="margin: 0; font-size: 20px; text-transform: uppercase; color: #0F2D22; letter-spacing: 1px;">Official Invoice</h2>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Order #:</strong> ${escape(order.display_id || order.id)}</p>
            <p style="margin: 4px 0; font-size: 13px; color: #666;"><strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
            <p style="margin: 4px 0; font-size: 13px;"><strong>Status:</strong> ${escape(currentStatus)}</p>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
          <div>
            <h4 style="margin: 0 0 6px 0; font-size: 12px; text-transform: uppercase; color: #888;">Billed / Shipped To:</h4>
            <p style="margin: 2px 0; font-weight: 600;">${escape(order.shipping_address?.first_name || "")} ${escape(order.shipping_address?.last_name || order.email || "Customer")}</p>
            <p style="margin: 2px 0; font-size: 13px;">${escape(order.shipping_address?.address_1 || "Address Line 1")}</p>
            <p style="margin: 2px 0; font-size: 13px;">${escape(order.shipping_address?.city || "Karachi")}, ${escape(order.shipping_address?.province || "Sindh")}</p>
            <p style="margin: 2px 0; font-size: 13px;">${escape(order.shipping_address?.phone || "")}</p>
          </div>
          <div style="text-align: right;">
            <h4 style="margin: 0 0 6px 0; font-size: 12px; text-transform: uppercase; color: #888;">Payment & Courier:</h4>
            <p style="margin: 2px 0; font-size: 13px;"><strong>Payment Method:</strong> ${escape(paymentMethod)}</p>
            <p style="margin: 2px 0; font-size: 13px;"><strong>Courier Partner:</strong> ${escape(carrier)}</p>
            <p style="margin: 2px 0; font-size: 13px;"><strong>Tracking #:</strong> ${escape(trackingNumber || "Assigned upon dispatch")}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Item Description</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Price</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="total-box">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>Rs. ${Number(order.subtotal ?? order.total).toLocaleString()}</span>
          </div>
          <div class="total-row">
            <span>Shipping Charges:</span>
            <span>${order.shipping_total ? `Rs. ${Number(order.shipping_total).toLocaleString()}` : "Free"}</span>
          </div>
          ${order.discount_total ? `
            <div class="total-row" style="color: #c0392b;">
              <span>Discount Applied:</span>
              <span>- Rs. ${Number(order.discount_total).toLocaleString()}</span>
            </div>
          ` : ""}
          <div class="total-row grand-total">
            <span>Grand Total:</span>
            <span>Rs. ${Number(order.total).toLocaleString()}</span>
          </div>
        </div>

        <div style="clear: both; margin-top: 60px; border-top: 1px solid var(--border-base); padding-top: 20px; text-align: center; font-size: 12px; color: #888;">
          Thank you for choosing NAQSH. For inquiries or returns, visit naqsh.pk/order/track or WhatsApp +92 (319) 736-5388.
        </div>
      </body>
      </html>
    `
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    const img = printWindow.document.querySelector("img")
    if (img && !img.complete) {
      img.onload = () => {
        setTimeout(() => printWindow.print(), 250)
      }
      setTimeout(() => printWindow.print(), 1000)
    } else {
      setTimeout(() => {
        printWindow.print()
      }, 300)
    }
  }

  return (
    <Container style={{ padding: "20px", marginBottom: "20px", borderLeft: "4px solid #c9a96e" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <Heading level="h2" style={{ fontSize: "18px", fontWeight: "600" }}>
            NAQSH Fulfillment & Custom Order Status
          </Heading>
          <Text size="small" style={{ color: "var(--fg-subtle)" }}>
            Enter a courier and tracking ID when dispatching. Tracking is shown to customers only after shipment.
          </Text>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Button variant="secondary" size="small" onClick={printInvoice}>
            <ArrowDownTray /> Print / Save invoice PDF
          </Button>
          {savedMsg && <Badge color="green">Changes Saved ✓</Badge>}
        </div>
      </div>

      <p className="mb-4 text-sm text-ui-fg-subtle">Tracking labels do not execute financial operations. Use the order actions to cancel, return or refund an order and update inventory/payments.</p>
      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Text size="xsmall" style={{ fontWeight: "600", marginBottom: "4px", color: "var(--fg-base)" }}>
            Order Status Step
          </Text>
          <select
            value={currentStatus}
            onChange={(e) => setCurrentStatus(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid var(--border-base)",
              backgroundColor: "var(--bg-base)",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            {ALL_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Text size="xsmall" style={{ fontWeight: "600", marginBottom: "4px", color: "var(--fg-base)" }}>
            Courier Partner
          </Text>
          <select
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid var(--border-base)",
              backgroundColor: "var(--bg-base)",
              fontSize: "14px",
            }}
          >
            <option value="">Select courier at dispatch</option>
            <option value="TCS Express">TCS Express</option>
            <option value="Leopards Courier">Leopards Courier</option>
            <option value="M&P Logistics">M&P Logistics</option>
            <option value="Trax Courier">Trax Courier</option>
            <option value="DHL Express">DHL Express</option>
          </select>
        </div>

        <div>
          <Text size="xsmall" style={{ fontWeight: "600", marginBottom: "4px", color: "var(--fg-base)" }}>
            Tracking ID
          </Text>
          <Input
            value={trackingNumber}
            placeholder="e.g. 774910281"
            onChange={(e) => setTrackingNumber(e.target.value)}
          />
        </div>
      </div>

      <div style={{ marginTop: "16px", display: "grid", gridTemplateColumns: "3fr 1fr", gap: "16px", alignItems: "flex-end" }}>
        <div>
          <Text size="xsmall" style={{ fontWeight: "600", marginBottom: "4px", color: "var(--fg-base)" }}>
            Internal Fulfillment Notes
          </Text>
          <Input
            value={internalNotes}
            placeholder="Add internal notes about special stitching, customer calls, or delivery instructions..."
            onChange={(e) => setInternalNotes(e.target.value)}
          />
        </div>

        <Button variant="primary" onClick={handleSave} disabled={saving}>
          <Check /> {saving ? "Saving..." : "Update Order"}
        </Button>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.before",
})

export default OrderStatusWidget
