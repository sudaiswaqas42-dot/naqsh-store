import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { trackOrderWorkflow } from "../../../../workflows/track-order"

export const POST = async (req: MedusaRequest<{ order_number?: string; display_id?: string; id?: string; email?: string }>, res: MedusaResponse) => {
  const body = req.body || {}
  const { result } = await trackOrderWorkflow(req.scope).run({
    input: { order_number: body.order_number || body.display_id || body.id || "", email: body.email || "" },
  })
  res.json({ order: result })
}
