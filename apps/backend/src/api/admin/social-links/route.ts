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

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const homepageService = req.scope.resolve(HOMEPAGE_MODULE) as any
    const body = req.body as any
    const socialLinks = {
      facebook: body.facebook ?? defaultLinks.facebook,
      instagram: body.instagram ?? defaultLinks.instagram,
      tiktok: body.tiktok ?? defaultLinks.tiktok,
      pinterest: body.pinterest ?? defaultLinks.pinterest,
    }

    const sections = await homepageService.listHomepageSections({ key: "social_links" })
    if (sections && sections.length > 0) {
      await homepageService.updateHomepageSections({
        id: sections[0].id,
        settings: socialLinks,
      })
    } else {
      await homepageService.createHomepageSections({
        key: "social_links",
        type: "social_links",
        title: "Footer Social Links",
        rank: 99,
        is_active: true,
        settings: socialLinks,
      })
    }

    return res.json({ success: true, social_links: socialLinks })
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}
