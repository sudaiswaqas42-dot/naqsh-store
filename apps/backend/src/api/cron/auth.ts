import { timingSafeEqual } from "node:crypto"
import { MedusaRequest, MedusaResponse, MedusaNextFunction } from "@medusajs/framework/http"

export function authenticateCron(req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) {
  const secret = process.env.CRON_SECRET
  const actual = new TextEncoder().encode(req.headers.authorization || "")
  const expected = new TextEncoder().encode(`Bearer ${secret || ""}`)
  if (!secret || actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    res.status(401).json({ error: "Unauthorized" })
    return
  }
  next()
}
