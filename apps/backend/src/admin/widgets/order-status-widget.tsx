import OrderFulfillmentPanel from "../components/order-fulfillment-panel"
import "../styles/brand.css"
import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Check, ArrowDownTray, PencilSquare, DocumentText } from "@medusajs/icons"
import { Container, Heading, Text, Badge, Button, Input, Select } from "@medusajs/ui"
import { useState } from "react"
import naqshLogo from "../assets/naqsh-logo.png"

const ALL_STATUSES = [
  "Processing",
  "Shipped",
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

    if (order?.status === "canceled") return "Cancelled"
    return "Processing"
  }

  const [currentStatus, setCurrentStatus] = useState<string>(getInitialStatus())
  const [carrier, setCarrier] = useState<string>((metadata.carrier as string) || "")
  const [trackingNumber, setTrackingNumber] = useState<string>((metadata.tracking_number as string) || "")
  const [internalNotes, setInternalNotes] = useState<string>((metadata.internal_notes as string) || "")
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState(false)

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
        <title>Invoice - #${escape(Number(order.display_id) >= 1310 ? order.display_id : order.custom_display_id || order.display_id || order.id)}</title>
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
            <p style="margin: 4px 0; font-size: 13px;"><strong>Status:</strong> ${escape(order.metadata?.custom_status || getInitialStatus())}</p>
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
            <p style="margin: 2px 0; font-size: 13px;"><strong>Courier Partner:</strong> ${escape(order.metadata?.carrier || "Assigned at dispatch")}</p>
            <p style="margin: 2px 0; font-size: 13px;"><strong>Tracking #:</strong> ${escape(order.metadata?.tracking_number || "Assigned upon dispatch")}</p>
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

  return <OrderFulfillmentPanel order={order} onPrint={printInvoice} />
}

export const config = defineWidgetConfig({
  zone: "order.details.after",
})

export default OrderStatusWidget
