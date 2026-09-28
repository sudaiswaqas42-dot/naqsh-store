import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { HOMEPAGE_MODULE } from "../../../modules/homepage"

const defaultLinks = {
  facebook: "https://www.facebook.com/share/1EgwjwJypC/",
  instagram: "https://www.instagram.com/naqsh._.store?stkn=NDFrMTE5b3YwODI2",
  tiktok: "https://tiktok.com/@naqsh._.store",
  pinterest: "https://pinterest.com/naqshbrand",
}

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const homepageService = req.scope.resolve(HOMEPAGE_MODULE) as any
    const sections = await homepageService.listHomepageSections({ key: "social_links" })
    if (sections && sections.length > 0 && sections[0].settings) {
      return res.json({ social_links: { ...defaultLinks, ...sections[0].settings } })
    }
    return res.json({ social_links: defaultLinks })
  } catch (error: any) {
    return res.json({ social_links: defaultLinks })
  }
}
