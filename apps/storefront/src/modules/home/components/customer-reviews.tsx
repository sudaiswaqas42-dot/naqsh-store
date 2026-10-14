"use client"

import React, { useState, useEffect } from "react"
import { useLoopingRail } from "@lib/hooks/use-looping-rail"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useToast } from "@lib/context/toast-context"

interface Review {
  id: string
  quote: string
  name: string
  city: string
  initials: string
  rating: number
  category: "all" | "lawn" | "3pc" | "2pc" | "pret" | "boski" | "formals" | "khaddar" | "gents"
  demo?: boolean
  verified: boolean
  date: string
}

const DEFAULT_UNSTITCHED_REVIEWS: Review[] = [
  {
    id: "rev_lawn_1",
    name: "Ayesha Malik",
    city: "Lahore",
    initials: "AM",
    quote: "The 3-piece embroidered lawn suit exceeded my expectations. Pure breathable pima lawn fabric and the chiffon dupatta drape is so graceful!",
    rating: 5,
    category: "3pc",
    verified: false,
    demo: true,
    date: "2 days ago",
  },
  {
    id: "rev_boski_1",
    name: "Chaudhry Salman",
    city: "Faisalabad",
    initials: "CS",
    quote: "Purchased the 8-pound pure silk Boski cut for Eid. Exceptional heirloom sheen, original pure silk feel, and exact 4.5-meter length.",
    rating: 5,
    category: "boski",
    verified: false,
    demo: true,
    date: "1 week ago",
  },
  {
    id: "rev_2pc_1",
    name: "Fatima Noor",
    city: "Karachi",
    initials: "FN",
    quote: "The 2-piece printed unstitched cut has vibrant colors that stayed sharp after multiple washes. Perfect summer fabric for daily luxury.",
    rating: 5,
    category: "2pc",
    verified: false,
    demo: true,
    date: "3 days ago",
  },
  {
    id: "rev_formals_1",
    name: "Zainab Tariq",
    city: "Islamabad",
    initials: "ZT",
    quote: "Heavy embroidered organza cut with hand-embellished zari work. Tailored it for my sister's wedding and everyone asked where the fabric was from!",
    rating: 5,
    category: "formals",
    verified: false,
    demo: true,
    date: "2 weeks ago",
  },
  {
    id: "rev_khaddar_1",
    name: "Hina Qureshi",
    city: "Rawalpindi",
    initials: "HQ",
    quote: "Traditional Kamalia Khaddar unstitched cut is so warm and soft. Genuine textured yarn weave that speaks timeless Pakistani heritage.",
    rating: 5,
    category: "khaddar",
    verified: false,
    demo: true,
    date: "5 days ago",
  },
  {
    id: "rev_gents_1",
    name: "Usman Raza",
    city: "Multan",
    initials: "UR",
    quote: "The Egyptian cotton wash & wear unstitched fabric is completely wrinkle-resistant. Tailored into a crisp shalwar kameez that stayed crease-free all day.",
    rating: 5,
    category: "gents",
    verified: false,
    demo: true,
    date: "4 days ago",
  },
]

export default function CustomerReviews({ section, fullPage = false }: { section?: any; fullPage?: boolean }) {
  const { showToast } = useToast()
  const [reviews, setReviews] = useState<Review[]>(DEFAULT_UNSTITCHED_REVIEWS)
  const [sectionTitle, setSectionTitle] = useState("Loved by Thousands")
  const [sectionSubtitle, setSectionSubtitle] = useState("Discover the NAQSH experience. Sample reviews are labelled as demos.")
  const [isActive, setIsActive] = useState(true)

  const [showModal, setShowModal] = useState(false)
  const [newRating, setNewRating] = useState(5)
  const [newName, setNewName] = useState("")
  const [newCity, setNewCity] = useState("")
  const [newQuote, setNewQuote] = useState("")

  useEffect(() => {
    fetch("/api/reviews")
      .then((res) => res.json())
      .then((data) => {
        if (data.reviews && Array.isArray(data.reviews) && data.reviews.length > 0) {
          setReviews([...data.reviews, ...DEFAULT_UNSTITCHED_REVIEWS])
        }
        if (data.title) setSectionTitle(data.title)
        if (data.subtitle) setSectionSubtitle(data.subtitle)
        if (data.is_active !== undefined) setIsActive(data.is_active)
      })
      .catch((err) => console.error("Error loading reviews:", err))
  }, [])

  const { rail, interactions } = useLoopingRail(fullPage ? 0 : Math.min(reviews.length, 9), 32)

  if (!section && !isActive) return null
  const displayReviews = fullPage ? reviews : reviews.slice(0, 9)

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim() || !newQuote.trim()) {
      showToast("Please provide your name and review message.", "error")
      return
    }

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          city: newCity.trim() || "Pakistan",
          quote: newQuote.trim(),
          rating: newRating,
          category: "all",
        }),
      })
      if (!response.ok) throw new Error("Review submission failed")
    } catch {
      showToast("Your review could not be submitted. Please try again.", "error")
      return
    }

    setShowModal(false)
    setNewName("")
    setNewCity("")
    setNewQuote("")
    showToast(
      "Shukriya! Aap ka review NAQSH admin panel ko confirmation ke liye bhej diya gaya hai aur approval ke baad live publish hoga.",
      "success"
    )
  }

  return (
    <section className="naqsh-customer-reviews py-20 sm:py-24 bg-[#FAF9F6] text-stone-900 font-sans border-t border-[#EBE1D6] relative overflow-hidden select-none">
      {/* Subtle brand ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#B6975A]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="content-container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header: WHAT CUSTOMERS SAY / Loved by Thousands */}
        <div className="text-center max-w-xl mx-auto mb-10 sm:mb-14">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.35em] text-[#B6975A]">
            {section?.settings?.eyebrow ?? "What Customers Say"}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#0F2D22] mt-1.5 drop-shadow-2xs">
            {section?.title ?? sectionTitle}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-2 font-light">
            {section?.subtitle ?? sectionSubtitle}
          </p>

        </div>

        {/* Reviews Cards: Continuous marquee on homepage, static grid on fullPage */}
        {fullPage ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white border border-[#EBE1D6] rounded-sm p-7 sm:p-8 flex flex-col justify-between hover:border-[#B6975A] transition-colors duration-300 shadow-xs"
              >
                {/* Quote Mark Icon */}
                <div>
                  <span className="text-[#B6975A] font-serif text-4xl sm:text-5xl leading-none select-none block mb-4">
                    “
                  </span>
                  <p className="text-xs sm:text-sm text-stone-700 font-light leading-relaxed italic">
                    {rev.quote}
                  </p>
                </div>

                {/* Author Footer */}
                <div className="mt-8 pt-6 border-t border-[#EBE1D6] flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-[#0F2D22] text-[#FAF9F6] border border-[#B6975A]/50 font-bold text-xs flex items-center justify-center tracking-wider flex-shrink-0 shadow-2xs">
                    {rev.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif font-semibold text-xs sm:text-sm text-[#0F2D22] truncate">
                        {rev.name}
                      </h4>
                      <span className="text-[#B6975A] text-xs" aria-label={`${rev.rating} out of 5`}>
                        {"★".repeat(Math.min(5, Math.max(0, Math.round(rev.rating))))}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-stone-500 mt-0.5">
                      <span>{rev.city}</span>
                      <span>•</span>
                      <span className="text-[#0F2D22] font-semibold flex items-center gap-1">
                        {rev.demo ? "Demo review" : rev.verified ? "Verified Buyer" : "Customer review"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative w-full overflow-hidden py-2 select-none">
            {/* Subtle ambient edge fade for elegant continuous flow */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-8 sm:w-20 bg-gradient-to-r from-[#FAF9F6] to-transparent z-10" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-8 sm:w-20 bg-gradient-to-l from-[#FAF9F6] to-transparent z-10" />

            <div ref={rail} {...interactions} className="relative flex gap-6 overflow-x-auto no-scrollbar">
              {/* Repeated reviews list ensures uninterrupted continuous infinite motion */}
              {[...displayReviews, ...displayReviews, ...displayReviews, ...displayReviews].map((rev, idx) => (
                <div
                  key={`${rev.id}-${idx}`}
                  className="bg-white border border-[#EBE1D6] rounded-sm p-7 sm:p-8 flex flex-col justify-between hover:border-[#B6975A] transition-colors duration-300 shadow-xs shrink-0 w-[300px] sm:w-[360px] lg:w-[400px]"
                >
                  {/* Quote Mark Icon */}
                  <div>
                    <span className="text-[#B6975A] font-serif text-4xl sm:text-5xl leading-none select-none block mb-4">
                      “
                    </span>
                    <p className="text-xs sm:text-sm text-stone-700 font-light leading-relaxed italic">
                      {rev.quote}
                    </p>
                  </div>

                  {/* Author Footer */}
                  <div className="mt-8 pt-6 border-t border-[#EBE1D6] flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-full bg-[#0F2D22] text-[#FAF9F6] border border-[#B6975A]/50 font-bold text-xs flex items-center justify-center tracking-wider flex-shrink-0 shadow-2xs">
                      {rev.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-serif font-semibold text-xs sm:text-sm text-[#0F2D22] truncate">
                          {rev.name}
                        </h4>
                        <span className="text-[#B6975A] text-xs" aria-label={`${rev.rating} out of 5`}>
                          {"★".repeat(Math.min(5, Math.max(0, Math.round(rev.rating))))}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-stone-500 mt-0.5">
                        <span>{rev.city}</span>
                        <span>•</span>
                        <span className="text-[#0F2D22] font-semibold flex items-center gap-1">
                          {rev.demo ? "Demo review" : rev.verified ? "Verified Buyer" : "Customer review"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button: Share Your Experience */}
        <div className="text-center mt-8 pt-6">
          {!fullPage && (
            <LocalizedClientLink
              href="/reviews"
              className="block w-fit mx-auto mb-5 text-sm font-semibold text-[#B6975A] underline underline-offset-4 hover:opacity-85 transition-opacity drop-shadow-[0_1px_1px_rgba(15,45,34,0.15)]"
            >
              See More
            </LocalizedClientLink>
          )}
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="px-7 py-3 bg-[#0F2D22] hover:bg-[#B6975A] text-[#FAF9F6] hover:text-[#0F2D22] border border-[#0F2D22] hover:border-[#B6975A] text-xs font-semibold uppercase tracking-widest transition-all shadow-xs"
          >
            Write a Review
          </button>
        </div>
      </div>

      {/* Interactive Write a Review Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF9F6] border border-[#EBE1D6] w-full max-w-md p-6 sm:p-8 rounded-sm shadow-2xl relative text-left">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-stone-500 hover:text-[#0F2D22] text-2xl"
            >
              &times;
            </button>

            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#B6975A]">
              Community Review
            </span>
            <h3 className="font-serif text-2xl text-[#0F2D22] mt-1 mb-4">
              Share Your Experience
            </h3>

            <form onSubmit={handleAddReview} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-700 mb-1 font-medium">Your Rating</label>
                <div className="flex items-center gap-2 text-xl text-[#B6975A] cursor-pointer">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewRating(star)}
                      className={star <= newRating ? "text-[#B6975A]" : "text-stone-300"}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-medium">Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Ayesha Khan"
                  className="w-full bg-white border border-[#EBE1D6] px-3 py-2 text-stone-900 text-xs focus:outline-none focus:border-[#0F2D22]"
                />
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-medium">City</label>
                <input
                  type="text"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  placeholder="e.g. Lahore / Karachi / Islamabad"
                  className="w-full bg-white border border-[#EBE1D6] px-3 py-2 text-stone-900 text-xs focus:outline-none focus:border-[#0F2D22]"
                />
              </div>

              <div>
                <label className="block text-stone-700 mb-1 font-medium">Your Feedback</label>
                <textarea
                  required
                  rows={4}
                  value={newQuote}
                  onChange={(e) => setNewQuote(e.target.value)}
                  placeholder="Tell us about the fabric quality, stitching, fitting, or delivery experience..."
                  className="w-full bg-white border border-[#EBE1D6] px-3 py-2 text-stone-900 text-xs focus:outline-none focus:border-[#0F2D22]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#0F2D22] text-[#FAF9F6] hover:bg-[#B6975A] hover:text-[#0F2D22] text-xs font-bold uppercase tracking-widest transition-colors mt-2"
              >
                Submit Review
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
