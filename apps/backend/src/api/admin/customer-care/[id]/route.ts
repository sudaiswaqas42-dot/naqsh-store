import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { updateSupportWorkflow } from "../../../../workflows/customer-care"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const parsed = z.object({ status: z.enum(["open", "in_progress", "resolved"]), admin_notes: z.string().max(5000).optional() }).safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: "Invalid support status or notes." })
  const { result } = await updateSupportWorkflow(req.scope).run({ input: { id: req.params.id, ...parsed.data } })
  return res.json({ message: result })
}
