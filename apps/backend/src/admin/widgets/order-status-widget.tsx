import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Check, ArrowDownTray, PencilSquare, DocumentText } from "@medusajs/icons"
import { Container, Heading, Text, Badge, Button, Input, Select } from "@medusajs/ui"
import { useState } from "react"

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
  const [carrier, setCarrier] = useState<string>((metadata.carrier as string) || "TCS Express")
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

    const itemsHtml = (order.items || [])
      .map(
        (item: any) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${item.title || "Product"}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">Rs. ${Number(item.unit_price || 0).toLocaleString()}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;">Rs. ${(Number(item.unit_price || 0) * Number(item.quantity)).toLocaleString()}</td>
        </tr>
      `
      )
      .join("")

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - #${order.display_id || order.id}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1a1a1a; max-width: 800px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #1a1a1a; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 28px; font-weight: bold; letter-spacing: 2px; }
          .logo span { color: #c9a96e; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { text-align: left; background: #f8f8f6; padding: 10px; font-size: 12px; text-transform: uppercase; }
          .total-box { margin-top: 30px; float: right; width: 300px; }
          .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
          .grand-total { font-size: 18px; font-weight: bold; border-top: 2px solid #1a1a1a; padding-top: 8px; margin-top: 8px; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">NAQSH<span>.</span></div>
            <p style="font-size: 13px; color: #666; margin: 4px 0 0 0;">Pakistani Luxury Fashion & Apparel</p>
            <p style="font-size: 12px; color: #888;">Email: support@naqsh.pk · Tel: +92 (21) 3584-9000</p>
          </div>
          <div style="text-align: right;">
            <h2 style="margin: 0; font-size: 20px; text-transform: uppercase;">Official Invoice</h2>
            <p style="margin: 4px 0; font-size: 14px;"><strong>Order #:</strong> ${order.display_id || order.id}</p>
            <p style="margin: 4px 0; font-size: 13px; color: #666;"><strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
            <p style="margin: 4px 0; font-size: 13px;"><strong>Status:</strong> ${currentStatus}</p>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
          <div>
            <h4 style="margin: 0 0 6px 0; font-size: 12px; text-transform: uppercase; color: #888;">Billed / Shipped To:</h4>
            <p style="margin: 2px 0; font-weight: 600;">${order.shipping_address?.first_name || ""} ${order.shipping_address?.last_name || order.email || "Customer"}</p>
            <p style="margin: 2px 0; font-size: 13px;">${order.shipping_address?.address_1 || "Address Line 1"}</p>
            <p style="margin: 2px 0; font-size: 13px;">${order.shipping_address?.city || "Karachi"}, ${order.shipping_address?.province || "Sindh"}</p>
            <p style="margin: 2px 0; font-size: 13px;">${order.shipping_address?.phone || ""}</p>
          </div>
          <div style="text-align: right;">
            <h4 style="margin: 0 0 6px 0; font-size: 12px; text-transform: uppercase; color: #888;">Payment & Courier:</h4>
            <p style="margin: 2px 0; font-size: 13px;"><strong>Payment Method:</strong> Cash on Delivery (COD)</p>
            <p style="margin: 2px 0; font-size: 13px;"><strong>Courier Partner:</strong> ${carrier}</p>
            <p style="margin: 2px 0; font-size: 13px;"><strong>Tracking #:</strong> ${trackingNumber || "Assigned upon dispatch"}</p>
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
            <span>Rs. ${Number(order.subtotal || order.total).toLocaleString()}</span>
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

        <div style="clear: both; margin-top: 60px; border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; font-size: 12px; color: #888;">
          Thank you for choosing NAQSH. For inquiries or returns, visit naqsh.pk/order/track or WhatsApp +92 (300) 123-4567.
        </div>
      </body>
      </html>
    `
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }

  return (
    <Container style={{ padding: "20px", marginBottom: "20px", borderLeft: "4px solid #c9a96e" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <Heading level="h2" style={{ fontSize: "18px", fontWeight: "600" }}>
            NAQSH Fulfillment & Custom Order Status
          </Heading>
          <Text size="small" style={{ color: "#6b7280" }}>
            Control courier dispatch, custom tracking stages, and invoice generation
          </Text>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Button variant="secondary" size="small" onClick={printInvoice}>
            <ArrowDownTray /> Download Invoice PDF
          </Button>
          {savedMsg && <Badge color="green">Changes Saved ✓</Badge>}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", gap: "16px", alignItems: "flex-end" }}>
        <div>
          <Text size="xsmall" style={{ fontWeight: "600", marginBottom: "4px", color: "#374151" }}>
            Order Status Step
          </Text>
          <select
            value={currentStatus}
            onChange={(e) => setCurrentStatus(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid #d1d5db",
              backgroundColor: "#fff",
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
          <Text size="xsmall" style={{ fontWeight: "600", marginBottom: "4px", color: "#374151" }}>
            Courier Partner
          </Text>
          <select
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid #d1d5db",
              backgroundColor: "#fff",
              fontSize: "14px",
            }}
          >
            <option value="TCS Express">TCS Express</option>
            <option value="Leopards Courier">Leopards Courier</option>
            <option value="M&P Logistics">M&P Logistics</option>
            <option value="Trax Courier">Trax Courier</option>
            <option value="DHL Express">DHL Express</option>
          </select>
        </div>

        <div>
          <Text size="xsmall" style={{ fontWeight: "600", marginBottom: "4px", color: "#374151" }}>
            Tracking Number
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
          <Text size="xsmall" style={{ fontWeight: "600", marginBottom: "4px", color: "#374151" }}>
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
