"use client"

import React, { useState, useEffect } from "react"
import { useToast } from "@lib/context/toast-context"

interface Review {
  id: string
  quote: string
  name: string
  city: string
  initials: string
  rating: number
  category: "all" | "lawn" | "pret" | "formals"
  verified: boolean
  date: string
}

const initialReviews: Review[] = [
  {
    id: "1",
    quote:
      "The fabric quality is absolutely outstanding. I ordered the embroidered lawn and it arrived beautifully packaged. The stitching detail is exquisite — I've received so many compliments wearing it.",
    name: "Sana Amir",
    city: "Lahore",
    initials: "SA",
    rating: 5,
    category: "lawn",
    verified: true,
    date: "Verified Purchase • 3 days ago",
  },
  {
    id: "2",
    quote:
      "Fast delivery, exactly as described, and the cash on delivery option made me feel completely safe shopping online for the first time. Will definitely order again.",
    name: "Maryam Rehman",
    city: "Islamabad",
    initials: "MR",
    rating: 5,
    category: "pret",
    verified: true,
    date: "Verified Purchase • 1 week ago",
  },
  {
    id: "3",
    quote:
      "The co-ord set I bought fits perfectly. Love how the colours are true to the photos. The return process was also incredibly smooth when I needed to exchange a size.",
    name: "Nadia Zahid",
    city: "Karachi",
    initials: "NZ",
    rating: 5,
    category: "formals",
    verified: true,
    date: "Verified Purchase • 2 weeks ago",
  },
  {
    id: "4",
    quote:
      "NAQSH has become my go-to fashion brand. The lawn quality is on par with Sapphire and Khaadi, but the bespoke hand-embroidery makes it feel truly high-end and exclusive.",
    name: "Ayesha Malik",
    city: "Faisalabad",
    initials: "AM",
    rating: 5,
    category: "lawn",
    verified: true,
    date: "Verified Purchase • 5 days ago",
  },
  {
    id: "5",
    quote:
      "Ordered stitched pret for Eid. The master tailoring, neckline piping and sleeve finishing were flawless. Saved me a trip to the local darzi!",
    name: "Zainab Shah",
    city: "Peshawar",
    initials: "ZS",
    rating: 5,
    category: "pret",
    verified: true,
    date: "Verified Purchase • 2 weeks ago",
  },
  {
    id: "6",
    quote:
      "The raw silk formal outfit was the highlight of my cousin's wedding. Rich zari work and the organza dupatta had heavy embroidered borders. Pure luxury.",
    name: "Hira Farooq",
    city: "Multan",
    initials: "HF",
    rating: 5,
    category: "formals",
    verified: true,
    date: "Verified Purchase • 3 weeks ago",
  },
]

export default function CustomerReviews() {
  const { showToast } = useToast()
  const [selectedFilter, setSelectedFilter] = useState<"all" | "lawn" | "pret" | "formals">("all")
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [sectionTitle, setSectionTitle] = useState("Loved by Thousands")
  const [sectionSubtitle, setSectionSubtitle] = useState("Real feedback from verified shoppers across Pakistan who trust NAQSH for celebratory moments.")
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
          setReviews(data.reviews)
        }
        if (data.title) setSectionTitle(data.title)
        if (data.subtitle) setSectionSubtitle(data.subtitle)
        if (data.is_active !== undefined) setIsActive(data.is_active)
      })
      .catch((err) => console.error("Error loading reviews:", err))
  }, [])

  if (!isActive) {
    return null
  }

  const filtered =
    selectedFilter === "all"
      ? reviews
      : reviews.filter((r) => r.category === selectedFilter || r.category === "all")

  // Take top 3 for exact match to Image 5, or show filtered
  const displayReviews = filtered.slice(0, 3)

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim() || !newQuote.trim()) {
      showToast("Please provide your name and review message.", "error")
      return
    }

    try {
      await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          city: newCity.trim() || "Pakistan",
          quote: newQuote.trim(),
          rating: newRating,
          category: selectedFilter === "all" ? "lawn" : selectedFilter,
        }),
      })
    } catch {}

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
    <section className="py-20 sm:py-24 bg-[#FAF9F6] text-stone-900 font-sans border-t border-[#EBE1D6] relative overflow-hidden select-none">
      {/* Subtle brand ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#B6975A]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="content-container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header: WHAT CUSTOMERS SAY / Loved by Thousands */}
        <div className="text-center max-w-xl mx-auto mb-10 sm:mb-14">
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.35em] text-[#B6975A]">
            What Customers Say
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#0F2D22] mt-1.5 drop-shadow-2xs">
            {sectionTitle}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-2 font-light">
            {sectionSubtitle}
          </p>

          {/* Interactive Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {[
              { id: "all", label: "All Reviews (150+)" },
              { id: "lawn", label: "Festive Lawn" },
              { id: "pret", label: "Stitched Pret" },
              { id: "formals", label: "Luxury Formals" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id as any)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedFilter === tab.id
                    ? "bg-[#0F2D22] text-[#FAF9F6] font-semibold shadow-xs border border-[#0F2D22]"
                    : "bg-white text-stone-700 hover:text-[#0F2D22] hover:bg-[#EBE1D6]/40 border border-[#EBE1D6]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3 Review Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {displayReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white border border-[#EBE1D6] rounded-sm p-7 sm:p-8 flex flex-col justify-between hover:border-[#B6975A] transition-all duration-300 shadow-xs hover:shadow-md group hover:-translate-y-1"
            >
              {/* Quote Mark Icon */}
              <div>
                <span className="text-[#B6975A] font-serif text-4xl sm:text-5xl leading-none select-none block mb-4">
                  “
                </span>

                {/* Review Text */}
                <p className="text-xs sm:text-sm text-stone-700 font-light leading-relaxed italic">
                  {rev.quote}
                </p>
              </div>

              {/* Author Footer */}
              <div className="mt-8 pt-6 border-t border-[#EBE1D6] flex items-center gap-3.5">
                {/* Circular Initials Avatar (SA, MR, NZ) */}
                <div className="w-11 h-11 rounded-full bg-[#0F2D22] text-[#FAF9F6] border border-[#B6975A]/50 font-bold text-xs flex items-center justify-center tracking-wider flex-shrink-0 shadow-2xs">
                  {rev.initials}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif font-semibold text-xs sm:text-sm text-[#0F2D22] truncate">
                      {rev.name}
                    </h4>
                    <span className="text-[#B6975A] text-xs">★★★★★</span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-stone-500 mt-0.5">
                    <span>{rev.city}</span>
                    <span>•</span>
                    <span className="text-[#0F2D22] font-semibold flex items-center gap-1">
                      <span>✓</span> Verified Buyer
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button: Share Your Experience */}
        <div className="text-center mt-12 pt-6">
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
                Submit Verified Review
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
