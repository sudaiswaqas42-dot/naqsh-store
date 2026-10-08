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
  const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER
  const emailPass = process.env.EMAIL_PASS || process.env.SMTP_PASSWORD
  if (!emailUser || !emailPass) {
    return NextResponse.json({ error: "Email delivery is not configured" }, { status: 503 })
  }
  let message
  try {
    const body = await request.text()
    if (body.length > 100000) return NextResponse.json({ error: "Message too large" }, { status: 413 })
    message = JSON.parse(body)
    if (!message || typeof message.to !== "string" || !/^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/.test(message.to) ||
      typeof message.subject !== "string" || !message.subject.trim() ||
      (message.text !== undefined && typeof message.text !== "string") ||
      (message.html !== undefined && typeof message.html !== "string") ||
      ![message.text, message.html].some((value) => typeof value === "string" && value.trim())) {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: "Invalid message" }, { status: 400 })
  }
  const transport = nodemailer.createTransport({
    ...(process.env.SMTP_HOST ? {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_PORT === "465",
    } : { service: "gmail" }),
    auth: { user: emailUser, pass: emailPass.replace(/\s/g, "") },
    connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 20000,
  })
  try {
    const result = await transport.sendMail({ from: process.env.SMTP_FROM || emailUser,
      to: message.to, subject: message.subject, text: message.text, html: message.html })
    if (!result.accepted?.length) throw new Error("SMTP recipient was not accepted")
    return NextResponse.json({ id: result.messageId })
  } catch (error) {
    const failure = error as { code?: string; responseCode?: number }
    console.error("Email relay delivery failed", { code: failure.code, responseCode: failure.responseCode })
    return NextResponse.json({ error: "Email delivery failed" }, { status: 502 })
  } finally {
    transport.close()
  }
}
