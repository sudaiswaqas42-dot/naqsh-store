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
      const allReviews: ReviewItem[] = sec.settings?.reviews || defaultReviews
      const approvedOnly = allReviews.filter((r) => r.is_approved === true)
      return res.json({
        title: sec.title || "Loved by Thousands",
        subtitle: sec.subtitle || "Real feedback from verified shoppers across Pakistan who trust NAQSH for celebratory moments.",
        is_active: sec.is_active,
        reviews: approvedOnly,
      })
    }

    // Initialize in DB if first time
    await homepageService.createHomepageSections({
      key: "customer_reviews",
      type: "customer_reviews",
      title: "Loved by Thousands",
      subtitle: "Real feedback from verified shoppers across Pakistan who trust NAQSH for celebratory moments.",
      rank: 6,
      is_active: true,
      settings: { reviews: defaultReviews },
    })

    return res.json({
      title: "Loved by Thousands",
      subtitle: "Real feedback from verified shoppers across Pakistan who trust NAQSH for celebratory moments.",
      is_active: true,
      reviews: defaultReviews,
    })
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
    const rating = Math.min(5, Math.max(1, Number(body.rating) || 5))
    const category = body.category || "lawn"

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
      verified: true,
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
      await homepageService.createHomepageSections({
        key: "customer_reviews",
        type: "customer_reviews",
        title: "Loved by Thousands",
        subtitle: "Real feedback from verified shoppers across Pakistan who trust NAQSH for celebratory moments.",
        rank: 6,
        is_active: true,
        settings: { reviews: [newReview, ...defaultReviews] },
      })
    }

    return res.status(201).json({ success: true, review: newReview })
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}
