import { AbstractNotificationProviderService } from "@medusajs/framework/utils"
import { ProviderSendNotificationDTO } from "@medusajs/framework/types"
import { sendEmail } from "../../utils/send-email"

export function escapeHtml(value: unknown) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[character]!))
}

export function renderOrderEmail(template: string, data: Record<string, any>) {
  const kind = template.replace("order-", "").toLowerCase()
  const money = (amount: unknown) =>
    new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: data.currency_code || "PKR",
    }).format(Number(amount || 0))

  const address = data.shipping_address || {}
  const addressLines = [
    [address.first_name, address.last_name].filter(Boolean).join(" "),
    address.address_1,
    address.address_2,
    [address.city, address.province, address.postal_code].filter(Boolean).join(", "),
    address.country_code?.toUpperCase(),
  ].filter(Boolean)

  const customerName = escapeHtml(data.name || address.first_name || "Valued Customer")
  const displayId = escapeHtml(data.display_id || "")

  let subject = `Order Update - #${displayId}`
  let headerTitle = "Order Notification"
  let message = "We have an update regarding your order with NAQSH."
  let extraBox = ""

  if (template.includes("welcome") || kind === "welcome" || kind === "customer-welcome") {
    subject = "Welcome to NAQSH - Where Identity Begins"
    headerTitle = "Account Created"
    message = `Welcome to the world of NAQSH. Your account has been registered successfully with email: <strong>${escapeHtml(
      data.email || ""
    )}</strong>. You can now seamlessly track orders, save delivery addresses, and enjoy bespoke concierge shopping.`
  } else if (kind === "confirmed") {
    subject = `Order Confirmed - #${displayId}`
    headerTitle = "Booking Confirmed"
    message = "Thank you for shopping with NAQSH. We have received your order and our atelier is preparing your pieces for fulfillment."
  } else if (kind === "shipped") {
    subject = `Your Order Has Shipped - #${displayId}`
    headerTitle = "Parcel Dispatched"
    message = `Great news! Your package has been handed over to ${escapeHtml(
      data.carrier || "our courier partner"
    )} and is on its way to your destination.`
    if (data.tracking_number) {
      extraBox = `<div style="background:#FAF9F5;border:1px dashed #B6975A;border-radius:6px;padding:16px;margin:20px 0;text-align:center;">
        <span style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#8c7851;display:block;">Tracking Information</span>
        <strong style="font-size:16px;letter-spacing:2px;color:#0F2D22;">${escapeHtml(data.tracking_number)}</strong>
        <span style="display:block;font-size:12px;color:#666;margin-top:4px;">Courier: ${escapeHtml(data.carrier || "TCS Express")}</span>
      </div>`
    }
  } else if (kind === "out_for_delivery") {
    subject = `Order Out for Delivery - #${displayId}`
    headerTitle = "Out for Delivery Today"
    message = "Your parcel is out for delivery today with the courier rider. Please ensure your contact phone is available for handover."
  } else if (kind === "delivered") {
    subject = `Order Delivered - #${displayId}`
    headerTitle = "Delivered to Doorstep"
    message = "Your order has been safely delivered. Thank you for choosing NAQSH for your wardrobe. If anything needs attention or assistance, we are always here to help."
  } else if (kind === "cancelled" || kind === "canceled") {
    subject = `Order Cancellation Notice - #${displayId}`
    headerTitle = "Order Cancelled"
    message = `Your order #${displayId} has been cancelled. If any payment was captured, your refund is being initiated according to our policy.`
  } else if (kind === "refunded") {
    subject = `Refund Confirmation - #${displayId}`
    headerTitle = "Refund Processed"
    message = `Your refund for order #${displayId} amounting to ${escapeHtml(money(data.total))} has been processed successfully.`
  } else if (kind === "packed") {
    subject = `Order Packed & Ready - #${displayId}`
    headerTitle = "Order Packed"
    message = `Your items for order #${displayId} have passed quality inspection and are packed in our signature packaging ready for dispatch.`
  } else if (kind === "processing") {
    subject = `Order in Processing - #${displayId}`
    headerTitle = "Processing in Atelier"
    message = `Your order #${displayId} is currently being prepared and stitched by our master artisans.`
  } else {
    const statusLabel = data.custom_status || "Updated"
    subject = `Order Status: ${statusLabel} - #${displayId}`
    headerTitle = `Status: ${escapeHtml(statusLabel)}`
    message = `Your order status has been updated to <strong>${escapeHtml(statusLabel)}</strong>.`
  }

  const items = (data.items || []).map(
    (item: any) => `${item.title} x ${item.quantity} — ${money(item.unit_price)} each`
  ).join("\n")

  const text = `Hello ${customerName},\n\n${message.replace(/<[^>]*>?/gm, "")}\n\nOrder #${displayId}\n${items}\nTotal: ${money(
    data.total
  )}\nDelivery address: ${addressLines.join(", ")}\n\nNAQSH Customer Care`

  const rows = (data.items || []).map(
    (item: any) => `<tr>
      <td style="padding:12px;border-bottom:1px solid #eee;">
        <strong>${escapeHtml(item.title)}</strong><br>
        <small style="color:#777;">${escapeHtml(item.variant_title || "Standard")}</small>
      </td>
      <td style="padding:12px;border-bottom:1px solid #eee;text-align:center;">${escapeHtml(item.quantity)}</td>
      <td style="padding:12px;border-bottom:1px solid #eee;text-align:right;">${escapeHtml(money(item.unit_price))}</td>
    </tr>`
  ).join("")

  const isOrderSpecific = !template.includes("welcome") && data.display_id

  const html = `<!doctype html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f6f5f1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0F2D22;">
  <div style="max-width:600px;margin:30px auto;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);border:1px solid #eae7dc;">
    
    <!-- Brand Header -->
    <div style="padding:32px 24px;background-color:#0F2D22;text-align:center;">
      <h1 style="margin:0;font-family:Georgia,serif;font-size:26px;letter-spacing:6px;color:#B6975A;text-transform:uppercase;">NAQSH</h1>
      <p style="margin:6px 0 0 0;font-size:11px;letter-spacing:2px;color:#ffffff;text-transform:uppercase;opacity:0.85;">Where Identity Begins</p>
    </div>

    <!-- Content Card -->
    <div style="padding:36px 32px;">
      <h2 style="margin:0 0 16px 0;font-family:Georgia,serif;font-size:20px;color:#0F2D22;font-weight:600;">${headerTitle}</h2>
      
      <p style="margin:0 0 16px 0;font-size:14px;color:#333;line-height:1.6;">Hello ${customerName},</p>
      
      <p style="margin:0 0 20px 0;font-size:14px;line-height:1.6;color:#4a5568;">${message}</p>

      ${extraBox}

      ${
        isOrderSpecific
          ? `
        <div style="margin:24px 0;padding:16px;background:#FAF9F5;border-radius:6px;border:1px solid #f0ede4;">
          <p style="margin:0;font-size:13px;color:#0F2D22;">
            <strong>Order Reference:</strong> #${displayId}
          </p>
        </div>

        ${
          rows
            ? `
          <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:16px;">
            <thead>
              <tr style="background:#f6f5f1;text-align:left;color:#0F2D22;">
                <th style="padding:10px 12px;">Item</th>
                <th style="padding:10px 12px;text-align:center;">Qty</th>
                <th style="padding:10px 12px;text-align:right;">Price</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
          <p style="text-align:right;font-size:15px;margin:12px 0 24px 0;">
            <strong>Grand Total: ${escapeHtml(money(data.total))}</strong>
          </p>
        `
            : ""
        }

        ${
          addressLines.length > 0
            ? `
          <div style="margin-top:20px;padding-top:16px;border-top:1px solid #eee;">
            <h4 style="margin:0 0 6px 0;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#888;">Delivery Destination</h4>
            <p style="margin:0;font-size:13px;line-height:1.6;color:#4a5568;">
              ${addressLines.map(escapeHtml).join("<br>")}
            </p>
          </div>
        `
            : ""
        }
      `
          : ""
      }

      <hr style="border:none;border-top:1px solid #eee;margin:28px 0;" />

      <p style="margin:0;font-size:12px;color:#718096;line-height:1.5;">
        With gratitude,<br>
        <strong style="color:#0F2D22;">NAQSH Concierge Team</strong><br>
        <span style="color:#a0aec0;font-size:11px;">Karachi, Pakistan</span>
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color:#fbfaf8;padding:16px 24px;border-top:1px solid #eae7dc;text-align:center;font-size:11px;color:#a0aec0;">
      © ${new Date().getFullYear()} NAQSH Luxury Brand. All rights reserved.
    </div>

  </div>
</body>
</html>`

  return { subject, text, html }
}

export default class EmailProvider extends AbstractNotificationProviderService {
  static identifier = "naqsh-email"

  async send(notification: ProviderSendNotificationDTO) {
    const message = {
      to: notification.to,
      ...renderOrderEmail(notification.template, notification.data || {}),
    }

    if (process.env.EMAIL_RELAY_URL) {
      try {
        const response = await fetch(process.env.EMAIL_RELAY_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(process.env.EMAIL_RELAY_SECRET
              ? { Authorization: `Bearer ${process.env.EMAIL_RELAY_SECRET}` }
              : {}),
          },
          body: JSON.stringify(message),
          signal: AbortSignal.timeout(20000),
        })
        if (response.ok) {
          const data = await response.json()
          return { id: data.id || "relay-sent" }
        }
      } catch (relayErr: any) {
        console.warn("[Email Relay] Failed, falling back to nodemailer:", relayErr?.message)
      }
    }

    const result = await sendEmail(message)
    if (!result) {
      console.warn(`[Notification] sendEmail to ${notification.to} completed or recorded for delivery.`)
      return { id: `local-${Date.now()}` }
    }
    return { id: result.messageId }
  }
}
