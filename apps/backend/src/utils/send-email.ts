import nodemailer from "nodemailer"
import { MedusaError } from "@medusajs/framework/utils"

export async function sendEmail(message: { to: string; subject: string; html: string; text?: string }) {
  if (!message.to) return null

  // Check email relay if configured (for serverless/hosted deployments)
  if (process.env.EMAIL_RELAY_URL) {
    try {
      const response = await fetch(process.env.EMAIL_RELAY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.EMAIL_RELAY_SECRET ? { Authorization: `Bearer ${process.env.EMAIL_RELAY_SECRET}` } : {}),
        },
        body: JSON.stringify(message),
        signal: AbortSignal.timeout(20000),
      })
      if (response.ok) {
        const data = await response.json()
        if (typeof data.id === "string" && data.id) return { messageId: data.id }
        console.error("[Email Relay] Delivery response is missing the message ID")
      } else {
        console.error(`[Email Relay] Delivery failed (${response.status})`)
      }
    } catch {
      console.error("[Email Relay] Request failed or timed out")
    }
    // A timed-out relay may already have sent the email. Do not send it twice
    // through another transport or claim success without an acknowledgement.
    return null
  }

  const user = process.env.EMAIL_USER || process.env.SMTP_USER
  const pass = process.env.EMAIL_PASS || process.env.SMTP_PASSWORD
  const transport = nodemailer.createTransport({
    ...(process.env.SMTP_HOST ? {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_PORT === "465",
    } : { service: "gmail" }),
    auth: { user, pass: pass?.replace(/\s/g, "") },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
  })

  try {
    if (!user || !pass) throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, "Missing email credentials (EMAIL_USER or EMAIL_PASS)")
    const result = await transport.sendMail({
      ...message,
      from: process.env.SMTP_FROM || `"NAQSH" <${user}>`,
    })
    if (!result.accepted?.length) throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, "SMTP recipient was not accepted")
    console.log(`[Email] Successfully delivered email to ${message.to} via nodemailer (id: ${result.messageId})`)
    return result
  } catch (err: any) {
    console.error("[Email] Delivery failed via nodemailer:", err?.message || err)
    return null
  } finally {
    transport.close()
  }
}
