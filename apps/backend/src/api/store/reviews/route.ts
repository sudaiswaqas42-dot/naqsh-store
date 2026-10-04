import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { HOMEPAGE_MODULE } from "../../../modules/homepage"

export interface ReviewItem {
  id: string
  name: string
  city: string
  initials: string
  quote: string
  rating: number
  category: "all" | "lawn" | "pret" | "formals"
  verified: boolean
  is_approved: boolean
  date: string
}

const defaultReviews: ReviewItem[] = []

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const homepageService = req.scope.resolve(HOMEPAGE_MODULE) as any
    const sections = await homepageService.listHomepageSections({ key: "customer_reviews" })

    if (sections && sections.length > 0) {
      const sec = sections[0]
      const allReviews: ReviewItem[] = sec.settings?.reviews || defaultReviews
      const approvedOnly = allReviews.filter((r) => r.is_approved === true)
      return res.json({
        title: sec.title || "Loved by Thousands",
        subtitle: sec.subtitle || "Real feedback from verified shoppers across Pakistan who trust NAQSH for celebratory moments.",
        is_active: sec.is_active,
        reviews: approvedOnly,
      })
    }

    return res.json({ is_active: false, reviews: [] })
  } catch (error: any) {
    return res.json({
      title: "Loved by Thousands",
      subtitle: "Real feedback from verified shoppers across Pakistan who trust NAQSH for celebratory moments.",
      is_active: true,
      reviews: defaultReviews,
    })
  }
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const homepageService = req.scope.resolve(HOMEPAGE_MODULE) as any
    const body = req.body as any

    const name = String(body.name || "").trim()
    const quote = String(body.quote || "").trim()
    const city = String(body.city || "Pakistan").trim()
    const rating = Math.round(Math.min(5, Math.max(1, Number(body.rating) || 5)))
    const category = ["all", "lawn", "pret", "formals"].includes(body.category) ? body.category : "all"

    if (!name || !quote) {
      return res.status(400).json({ error: "Name and review message are required." })
    }

    const initials = name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "CU"

    const newReview: ReviewItem = {
      id: "rev_" + Date.now(),
      name,
      city,
      initials,
      quote,
      rating,
      category,
      verified: false,
      is_approved: false, // Must be approved by admin in /app/reviews before publishing live
      date: "Pending Admin Confirmation",
    }

    const sections = await homepageService.listHomepageSections({ key: "customer_reviews" })
    if (sections && sections.length > 0) {
      const sec = sections[0]
      const currentList: ReviewItem[] = sec.settings?.reviews || defaultReviews
      const updated = [newReview, ...currentList]

      await homepageService.updateHomepageSections({
        id: sec.id,
        settings: {
          ...sec.settings,
          reviews: updated,
        },
      })
    } else {
      return res.status(409).json({ error: "Reviews are currently unavailable." })
    }

    return res.status(201).json({ success: true, review: newReview })
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}
