import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { RETURN_MODULE } from "../../../modules/returns"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const returnService = req.scope.resolve(RETURN_MODULE) as any
    const return_requests = await returnService.listReturnRequests(
      {},
      { order: { created_at: "DESC" } }
    )
    res.json({ return_requests })
  } catch (error: any) {
    res.status(500).json({ error: error.message, return_requests: [] })
  }
}
