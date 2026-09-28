import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
    const apiKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

    const response = await fetch(`${backendUrl}/store/orders/track`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { "x-publishable-api-key": apiKey } : {}),
      },
      body: JSON.stringify(body),
      cache: "no-store",
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || data.message || "Order not found. Please verify your order number." },
        { status: response.status || 400 }
      )
    }

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json(
      { error: "Order tracking service is temporarily updating. Please retry in a moment." },
      { status: 503 }
    )
  }
}
