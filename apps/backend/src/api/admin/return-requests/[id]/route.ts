import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { RETURN_MODULE } from "../../../../modules/returns"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const returnService = req.scope.resolve(RETURN_MODULE) as any
    const { id } = req.params
    const body = req.body as any
    const updated = await returnService.updateReturnRequests({
      id,
      ...body,
    })
    res.json({ return_request: updated })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}
