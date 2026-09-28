import { AbstractNotificationProviderService } from "@medusajs/framework/utils"
import { ProviderSendNotificationDTO } from "@medusajs/framework/types"
import nodemailer from "nodemailer"

export function escapeHtml(value: unknown) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[character]!))
}

export function renderOrderEmail(template: string, data: Record<string, any>) {
  const delivered = template === "order-delivered"
  const subject = `NAQSH | Order #${data.display_id} ${delivered ? "delivered" : "confirmed"}`
  const message = delivered
    ? "Your order has been delivered. Thank you for shopping with NAQSH. If anything needs attention, reply to this email and we will help."
    : "Thank you for your order. We have received it and will prepare it for dispatch. We will keep you updated on its progress."
  const items = (data.items || []).map((item: any) => `${item.title} (${item.variant_title || ""}) x ${item.quantity}`).join("\n")
  const total = new Intl.NumberFormat("en-PK", { style: "currency", currency: data.currency_code || "PKR" }).format(Number(data.total || 0))
  const text = `Hello ${data.name || "there"},\n\n${message}\n\nOrder #${data.display_id}\n${items}\n\nTotal: ${total}\n\nNAQSH Customer Care`
  const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#0F2D22"><h1 style="letter-spacing:4px">NAQSH</h1><h2>Order ${delivered ? "delivered" : "confirmed"}</h2><p>Hello ${escapeHtml(data.name || "there")},</p><p>${message}</p><p><strong>Order #${escapeHtml(data.display_id)}</strong></p><ul>${(data.items || []).map((item: any) => `<li>${escapeHtml(item.title)} — ${escapeHtml(item.variant_title)} × ${escapeHtml(item.quantity)}</li>`).join("")}</ul><p><strong>Total: ${escapeHtml(total)}</strong></p><hr><p>Thank you,<br>NAQSH Customer Care</p></div>`
  return { subject, text, html }
}

export default class EmailProvider extends AbstractNotificationProviderService {
  static identifier = "naqsh-email"

  async send(notification: ProviderSendNotificationDTO) {
    const message = { to: notification.to, ...renderOrderEmail(notification.template, notification.data || {}) }
    if (process.env.EMAIL_RELAY_URL) {
      const response = await fetch(process.env.EMAIL_RELAY_URL, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.EMAIL_RELAY_SECRET}` },
        body: JSON.stringify(message), signal: AbortSignal.timeout(20000),
      })
      if (!response.ok) throw new Error("Email relay failed; notification remains failed for retry")
      return { id: (await response.json()).id }
    }
    if (!process.env.SMTP_PASSWORD || !process.env.SMTP_USER) throw new Error("SMTP credentials are not configured")
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com", port: Number(process.env.SMTP_PORT || 465),
      secure: (process.env.SMTP_PORT || "465") === "465",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
      connectionTimeout: 10000, socketTimeout: 20000,
    })
    try {
      const result = await transport.sendMail({ ...message, from: process.env.SMTP_FROM || process.env.SMTP_USER })
      return { id: result.messageId }
    } catch {
      throw new Error("SMTP delivery failed; verify Gmail App Password and sender configuration")
    } finally {
      transport.close()
    }
  }
}
