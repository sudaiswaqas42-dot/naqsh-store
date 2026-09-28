import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { subscribeWorkflow } from "../../../workflows/customer-care"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const parsed = z.object({ email: z.string().trim().toLowerCase().email().max(254), consent: z.literal(true) }).safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: "A valid email address and consent are required." })
  await subscribeWorkflow(req.scope).run({ input: { email: parsed.data.email } })
  return res.status(200).json({ subscribed: true })
}
