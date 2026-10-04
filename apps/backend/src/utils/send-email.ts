import nodemailer from "nodemailer"

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
        return { messageId: data.id || "relay-sent" }
      }
    } catch (relayErr: any) {
      console.warn("[Email Relay] Failed, falling back to direct nodemailer:", relayErr?.message)
    }
  }

  const user = process.env.EMAIL_USER || process.env.SMTP_USER
  const pass = process.env.EMAIL_PASS || process.env.SMTP_PASSWORD
  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass: pass?.replace(/\s/g, "") },
    connectionTimeout: 10000,
    socketTimeout: 20000,
  })

  try {
    if (!user || !pass) throw new Error("Missing email credentials (EMAIL_USER or EMAIL_PASS)")
    const result = await transport.sendMail({
      ...message,
      from: process.env.SMTP_FROM || `"NAQSH" <${user}>`,
    })
    console.log(`[Email] Successfully delivered email to ${message.to} via nodemailer (id: ${result.messageId})`)
    return result
  } catch (err: any) {
    console.error("[Email] Delivery failed via nodemailer:", err?.message || err)
    return null
  } finally {
    transport.close()
  }
}
