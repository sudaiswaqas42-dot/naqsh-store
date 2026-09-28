import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { HOMEPAGE_MODULE } from "../../../../modules/homepage"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const homepageService = req.scope.resolve(HOMEPAGE_MODULE) as any
    const { id } = req.params
    const section = await homepageService.retrieveHomepageSection(id)
    res.json({ section })
  } catch (error: any) {
    res.status(404).json({ error: error.message })
  }
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const homepageService = req.scope.resolve(HOMEPAGE_MODULE) as any
    const { id } = req.params
    const body = req.body as any
    const updated = await homepageService.updateHomepageSections({
      id,
      ...body,
    })
    res.json({ section: updated })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

export const DELETE = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const homepageService = req.scope.resolve(HOMEPAGE_MODULE) as any
    const { id } = req.params
    await homepageService.deleteHomepageSections([id])
    res.json({ id, object: "homepage_section", deleted: true })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}
