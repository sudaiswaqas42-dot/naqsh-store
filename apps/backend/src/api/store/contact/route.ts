import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { createSupportWorkflow } from "../../../workflows/customer-care"

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().max(254),
  phone: z.string().trim().max(40).optional(),
  subject: z.string().trim().min(2).max(150),
  message: z.string().trim().min(10).max(5000),
})
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: "Enter a valid name, email and message (10-5000 characters)." })
  const { result } = await createSupportWorkflow(req.scope).run({ input: parsed.data })
  return res.status(201).json({ id: result.id })
}
