import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { HOMEPAGE_MODULE } from "../../../modules/homepage"
import { syncAndHydrateHomepageSections } from "../../../modules/homepage/sync-blueprint"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const homepageService = req.scope.resolve(HOMEPAGE_MODULE) as any
    const allSections = await syncAndHydrateHomepageSections(homepageService, false)
    const activeSections = allSections.filter((s: any) => s.is_active).map((section: any) => section.type === "customer_reviews" ? { ...section, settings: { ...section.settings, reviews: (section.settings?.reviews || []).filter((review: any) => review.is_approved === true) } } : section)
    res.json({ sections: activeSections })
  } catch (error: any) {
    res.status(500).json({ error: error.message, sections: [] })
  }
}

