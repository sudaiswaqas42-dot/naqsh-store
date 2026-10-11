import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { manageParcelWorkflow } from "../../../../../workflows/manage-parcel"

export async function POST(req: MedusaRequest<{ action: "fulfill" | "ship" | "deliver" | "return"; fulfillment_id?: string; carrier?: string; tracking_number?: string; note?: string; custom_status?: string }>, res: MedusaResponse) {
  const { result } = await manageParcelWorkflow(req.scope).run({ input: { ...req.body, order_id: req.params.id } })
  res.json(result)
}
