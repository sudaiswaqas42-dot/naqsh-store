import { timingSafeEqual } from "node:crypto"
import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const maxDuration = 60

export async function GET(request: Request, { params }: { params: Promise<{ job: string }> }) {
  const secret = process.env.CRON_SECRET
  const actual = new TextEncoder().encode(request.headers.get("authorization") || "")
  const expected = new TextEncoder().encode(`Bearer ${secret || ""}`)
  if (!secret || actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { job } = await params
  if (!["sync-reels", "refresh-token"].includes(job)) return NextResponse.json({ error: "Not found" }, { status: 404 })
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL}/cron/${job}`, {
      headers: { Authorization: `Bearer ${secret}` }, cache: "no-store", signal: AbortSignal.timeout(55000),
    })
    if (!response.ok) throw new Error("Sync unavailable")
    return NextResponse.json(await response.json())
  } catch {
    return NextResponse.json({ error: "Scheduled task failed; retry after backend startup" }, { status: 503 })
  }
}
