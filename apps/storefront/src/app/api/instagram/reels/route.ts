import { NextResponse } from "next/server"

export async function GET() {
  const backend = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
  const key = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
  if (!key) return NextResponse.json({ reels: [] }, { status: 503 })
  try {
    const response = await fetch(`${backend}/store/instagram/reels`, {
      headers: { "x-publishable-api-key": key },
      next: { revalidate: 60 }, signal: AbortSignal.timeout(8000),
    })
    if (!response.ok) throw new Error("Reels unavailable")
    return NextResponse.json(await response.json())
  } catch {
    return NextResponse.json({ reels: [], error: "Reels temporarily unavailable" }, { status: 503 })
  }
}
