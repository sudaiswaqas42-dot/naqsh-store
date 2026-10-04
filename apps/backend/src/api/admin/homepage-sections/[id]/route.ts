import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { HOMEPAGE_MODULE } from "../../../../modules/homepage"
import { manageHomepageWorkflow } from "../../../../workflows/manage-homepage"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve(HOMEPAGE_MODULE) as any
  res.json({ section: await service.retrieveHomepageSection(req.params.id) })
}
export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const { result } = await manageHomepageWorkflow(req.scope).run({ input: { action: "update", id: req.params.id, data: req.body } })
  res.json(result)
}
export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  const { result } = await manageHomepageWorkflow(req.scope).run({ input: { action: "delete", id: req.params.id } })
  res.json(result)
}
