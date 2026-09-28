import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { createReturnRequestWorkflow } from "../../../workflows/create-return-request"

const schema = z.object({
  order_id: z.string().trim().min(1).max(100),
  customer_email: z.string().trim().toLowerCase().email(),
  customer_name: z.string().trim().max(120).optional(),
  items: z.array(z.object({ description: z.string().trim().min(1).max(1000) })).min(1).max(50),
  reason: z.string().trim().min(2).max(1000),
  action_requested: z.enum(["return", "exchange"]),
  notes: z.string().max(5000).optional(),
})
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: "Provide your order number, email, product, reason and requested action." })
  const { order_id, ...input } = parsed.data
  const { result } = await createReturnRequestWorkflow(req.scope).run({ input: { ...input, order_number: order_id } })
  return res.status(201).json({ return_request: result })
}
