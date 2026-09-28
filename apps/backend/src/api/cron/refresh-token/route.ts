import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { syncInstagramWorkflow } from "../../../workflows/sync-instagram"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const { result } = await syncInstagramWorkflow(req.scope).run({ input: { refreshToken: true } })
  res.status(result.success ? 200 : 503).json(result)
}
