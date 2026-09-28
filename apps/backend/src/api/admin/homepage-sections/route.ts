import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { HOMEPAGE_MODULE } from "../../../modules/homepage"
import { syncAndHydrateHomepageSections } from "../../../modules/homepage/sync-blueprint"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const homepageService = req.scope.resolve(HOMEPAGE_MODULE) as any
    const sections = await syncAndHydrateHomepageSections(homepageService, false)
    res.json({ sections })
  } catch (error: any) {
    res.status(500).json({ error: error.message, sections: [] })
  }
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const homepageService = req.scope.resolve(HOMEPAGE_MODULE) as any
    const body = req.body as any

    if (body.action === "reset_blueprint" || body.sync_blueprint) {
      const sections = await syncAndHydrateHomepageSections(homepageService, true)
      return res.json({ sections, message: "Homepage reset to reference blueprint with all cards!" })
    }

    if (body.reorder && Array.isArray(body.sections)) {
      // Reordering multiple sections
      for (const item of body.sections) {
        await homepageService.updateHomepageSections({
          id: item.id,
          rank: item.rank,
        })
      }
      const sections = await homepageService.listHomepageSections(
        {},
        { order: { rank: "ASC" } }
      )
      return res.json({ sections: sections.filter((s: any) => s.key !== "sale_discounts") })
    }

    const created = await homepageService.createHomepageSections(body)
    res.status(201).json({ section: created })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}

