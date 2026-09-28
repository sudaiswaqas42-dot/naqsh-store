import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { HOMEPAGE_MODULE } from "../../../modules/homepage"
import { ReviewItem } from "../../store/reviews/route"

const defaultReviews: ReviewItem[] = [
  {
    id: "1",
    name: "Sana Amir",
    city: "Lahore",
    initials: "SA",
    quote: "The fabric quality is absolutely outstanding. I ordered the embroidered lawn and it arrived beautifully packaged. The stitching detail is exquisite — I've received so many compliments wearing it.",
    rating: 5,
    category: "lawn",
    verified: true,
    is_approved: true,
    date: "Verified Purchase • 3 days ago",
  },
  {
    id: "2",
    name: "Maryam Rehman",
    city: "Islamabad",
    initials: "MR",
    quote: "Fast delivery, exactly as described, and the cash on delivery option made me feel completely safe shopping online for the first time. Will definitely order again.",
    rating: 5,
    category: "pret",
    verified: true,
    is_approved: true,
    date: "Verified Purchase • 1 week ago",
  },
  {
    id: "3",
    name: "Nadia Zahid",
    city: "Karachi",
    initials: "NZ",
    quote: "The co-ord set I bought fits perfectly. Love how the colours are true to the photos. The return process was also incredibly smooth when I needed to exchange a size.",
    rating: 5,
    category: "formals",
    verified: true,
    is_approved: true,
    date: "Verified Purchase • 2 weeks ago",
  },
  {
    id: "4",
    name: "Ayesha Malik",
    city: "Faisalabad",
    initials: "AM",
    quote: "NAQSH has become my go-to fashion brand. The lawn quality is on par with Sapphire and Khaadi, but the bespoke hand-embroidery makes it feel truly high-end and exclusive.",
    rating: 5,
    category: "lawn",
    verified: true,
    is_approved: true,
    date: "Verified Purchase • 5 days ago",
  },
  {
    id: "5",
    name: "Zainab Shah",
    city: "Peshawar",
    initials: "ZS",
    quote: "Ordered stitched pret for Eid. The master tailoring, neckline piping and sleeve finishing were flawless. Saved me a trip to the local darzi!",
    rating: 5,
    category: "pret",
    verified: true,
    is_approved: true,
    date: "Verified Purchase • 2 weeks ago",
  },
  {
    id: "6",
    name: "Hira Farooq",
    city: "Multan",
    initials: "HF",
    quote: "The raw silk formal outfit was the highlight of my cousin's wedding. Rich zari work and the organza dupatta had heavy embroidered borders. Pure luxury.",
    rating: 5,
    category: "formals",
    verified: true,
    is_approved: true,
    date: "Verified Purchase • 3 weeks ago",
  },
]

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const homepageService = req.scope.resolve(HOMEPAGE_MODULE) as any
    const sections = await homepageService.listHomepageSections({ key: "customer_reviews" })

    if (sections && sections.length > 0) {
      const sec = sections[0]
      const reviews: ReviewItem[] = sec.settings?.reviews || defaultReviews
      return res.json({
        id: sec.id,
        title: sec.title || "Loved by Thousands",
        subtitle: sec.subtitle || "Real feedback from verified shoppers across Pakistan who trust NAQSH for celebratory moments.",
        is_active: sec.is_active,
        reviews,
      })
    }

    // Auto-create if not yet in DB
    const created = await homepageService.createHomepageSections({
      key: "customer_reviews",
      type: "customer_reviews",
      title: "Loved by Thousands",
      subtitle: "Real feedback from verified shoppers across Pakistan who trust NAQSH for celebratory moments.",
      rank: 6,
      is_active: true,
      settings: { reviews: defaultReviews },
    })

    return res.json({
      id: created.id,
      title: created.title,
      subtitle: created.subtitle,
      is_active: created.is_active,
      reviews: defaultReviews,
    })
  } catch (error: any) {
    return res.status(500).json({ error: error.message, reviews: defaultReviews })
  }
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const homepageService = req.scope.resolve(HOMEPAGE_MODULE) as any
    const body = req.body as any
    const action = body.action || "edit"

    const sections = await homepageService.listHomepageSections({ key: "customer_reviews" })
    let sec = sections?.[0]

    if (!sec) {
      sec = await homepageService.createHomepageSections({
        key: "customer_reviews",
        type: "customer_reviews",
        title: "Loved by Thousands",
        subtitle: "Real feedback from verified shoppers across Pakistan who trust NAQSH for celebratory moments.",
        rank: 6,
        is_active: true,
        settings: { reviews: defaultReviews },
      })
    }

    let reviews: ReviewItem[] = [...(sec.settings?.reviews || defaultReviews)]

    // 1. Update Section Meta (title, subtitle, is_active)
    if (action === "update_section") {
      await homepageService.updateHomepageSections({
        id: sec.id,
        title: body.title !== undefined ? body.title : sec.title,
        subtitle: body.subtitle !== undefined ? body.subtitle : sec.subtitle,
        is_active: body.is_active !== undefined ? body.is_active : sec.is_active,
      })
      return res.json({ success: true, message: "Review section updated successfully." })
    }

    // 2. Add New Review
    if (action === "add") {
      const name = String(body.name || "").trim()
      const quote = String(body.quote || "").trim()
      const city = String(body.city || "Pakistan").trim()
      const rating = Math.min(5, Math.max(1, Number(body.rating) || 5))
      const category = body.category || "lawn"
      const initials = name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "NA"

      const newReview: ReviewItem = {
        id: "rev_" + Date.now(),
        name,
        city,
        initials,
        quote,
        rating,
        category,
        verified: body.verified !== false,
        is_approved: true,
        date: "Verified Purchase • Just now",
      }

      reviews = [newReview, ...reviews]
      await homepageService.updateHomepageSections({
        id: sec.id,
        settings: { ...sec.settings, reviews },
      })
      return res.json({ success: true, reviews })
    }

    // 3. Edit Existing Review
    if (action === "edit") {
      const reviewId = body.id
      reviews = reviews.map((r) => {
        if (r.id === reviewId) {
          const name = body.name !== undefined ? body.name : r.name
          const initials = name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2) || r.initials
          return {
            ...r,
            name,
            initials,
            city: body.city !== undefined ? body.city : r.city,
            quote: body.quote !== undefined ? body.quote : r.quote,
            rating: body.rating !== undefined ? Number(body.rating) : r.rating,
            category: body.category !== undefined ? body.category : r.category,
            is_approved: body.is_approved !== undefined ? body.is_approved : r.is_approved,
          }
        }
        return r
      })

      await homepageService.updateHomepageSections({
        id: sec.id,
        settings: { ...sec.settings, reviews },
      })
      return res.json({ success: true, reviews })
    }

    // 4. Toggle Visibility / Approval
    if (action === "toggle") {
      const reviewId = body.id
      reviews = reviews.map((r) => {
        if (r.id === reviewId) {
          return { ...r, is_approved: !r.is_approved }
        }
        return r
      })

      await homepageService.updateHomepageSections({
        id: sec.id,
        settings: { ...sec.settings, reviews },
      })
      return res.json({ success: true, reviews })
    }

    // 5. Delete Review
    if (action === "delete") {
      const reviewId = body.id
      reviews = reviews.filter((r) => r.id !== reviewId)

      await homepageService.updateHomepageSections({
        id: sec.id,
        settings: { ...sec.settings, reviews },
      })
      return res.json({ success: true, reviews })
    }

    return res.status(400).json({ error: "Invalid action." })
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}
