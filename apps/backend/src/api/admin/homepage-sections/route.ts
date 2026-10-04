import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { HOMEPAGE_MODULE } from "../../../modules/homepage"
import { syncAndHydrateHomepageSections } from "../../../modules/homepage/sync-blueprint"
import { manageHomepageWorkflow } from "../../../workflows/manage-homepage"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve(HOMEPAGE_MODULE)
  res.json({ sections: await syncAndHydrateHomepageSections(service, false) })
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const body = (req.body || {}) as any
  const action = body.action === "reset_blueprint" || body.sync_blueprint ? "reset" : body.reorder ? "reorder" : "create"
  const { result } = await manageHomepageWorkflow(req.scope).run({ input: { action, data: action === "reorder" ? body.sections : body } })
  res.status(action === "create" ? 201 : 200).json(result)
}
