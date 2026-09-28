import { timingSafeEqual } from "node:crypto"
import nodemailer from "nodemailer"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const secret = process.env.EMAIL_RELAY_SECRET
  const actual = new TextEncoder().encode(request.headers.get("authorization") || "")
  const expected = new TextEncoder().encode(`Bearer ${secret || ""}`)
  if (!secret || actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    return NextResponse.json({ error: "Email delivery is not configured" }, { status: 503 })
  }
  let message
  try {
    const body = await request.text()
    if (body.length > 100000) return NextResponse.json({ error: "Message too large" }, { status: 413 })
    message = JSON.parse(body)
    if (typeof message.to !== "string" || !/^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/.test(message.to) ||
      ![message.subject, message.text, message.html].every((value) => typeof value === "string")) {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: "Invalid message" }, { status: 400 })
  }
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com", port: Number(process.env.SMTP_PORT || 465),
    secure: (process.env.SMTP_PORT || "465") === "465",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
    connectionTimeout: 10000, socketTimeout: 20000,
  })
  try {
    const result = await transport.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: message.to, subject: message.subject, text: message.text, html: message.html })
    return NextResponse.json({ id: result.messageId })
  } catch {
    return NextResponse.json({ error: "Email delivery failed" }, { status: 502 })
  } finally {
    transport.close()
  }
}
