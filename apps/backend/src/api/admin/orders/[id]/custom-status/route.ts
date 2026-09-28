import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { updateOrderStatusWorkflow } from "../../../../../workflows/update-order-status"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { custom_status, tracking_number, carrier, internal_notes } = req.body as Record<string, string>
  const { result } = await updateOrderStatusWorkflow(req.scope).run({
    input: { id: req.params.id, custom_status, tracking_number, carrier, internal_notes },
  })
  res.json({ order: result })
}
