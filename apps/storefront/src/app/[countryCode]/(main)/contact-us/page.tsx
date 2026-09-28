"use client"

import { submitSupportMessage } from "@lib/data/customer-care"
import React, { useState } from "react"
import { useToast } from "@lib/context/toast-context"

export default function ContactUsPage() {
  const { showToast } = useToast()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [subject, setSubject] = useState("Order Inquiry")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !message) {
      showToast("Please fill in all required fields.", "error")
      return
    }

    setLoading(true)
    try {
      const result = await submitSupportMessage({ name, email, phone, subject, message })
      if (result.error) {
        showToast(result.error, "error")
        return
      }
      setSubmitted(true)
      showToast("Your message has been saved for our customer care team.", "success")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="content-container mx-auto px-4 sm:px-6 lg:px-8 py-14 max-w-5xl font-sans">
      <div className="text-center max-w-xl mx-auto mb-14">
        <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-accent">
          Client Care
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-brand font-medium mt-1">
          Contact Concierge
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-2 font-light">
          Whether you need assistance with sizing, custom bridal inquiries, or tracking a parcel, our team is at your service.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Contact Info Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-stone-50 p-6 border border-stone-200 space-y-4">
            <h3 className="font-serif text-xl font-medium text-brand">
              Direct Concierge Lines
            </h3>

            <div className="space-y-3 text-xs text-stone-600">
              <div>
                <strong className="text-stone-900 block font-sans">Toll-Free Helpline:</strong>
                <a href="tel:080062774" className="hover:text-accent transition-colors font-mono">
                  0800-62774 (NAQSH)
                </a>
              </div>

              <div>
                <strong className="text-stone-900 block font-sans">WhatsApp Concierge:</strong>
                <a
                  href="https://wa.me/923001234567"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-700 font-semibold hover:underline inline-flex items-center gap-1"
                >
                  <span>+92 300 1234567</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                    Active Now
                  </span>
                </a>
              </div>

              <div>
                <strong className="text-stone-900 block font-sans">Client Email:</strong>
                <a href="mailto:concierge@naqsh-store.pk" className="hover:text-accent transition-colors">
                  concierge@naqsh-store.pk
                </a>
              </div>

              <div>
                <strong className="text-stone-900 block font-sans">Studio Timings:</strong>
                <p className="text-stone-500">
                  Monday through Saturday: 9:00 AM – 9:00 PM PKT
                </p>
              </div>
            </div>
          </div>

          {/* Studios */}
          <div className="p-6 bg-white border border-stone-200 space-y-3 text-xs">
            <h4 className="font-serif text-base font-semibold text-brand">
              Atelier Boutiques
            </h4>
            <div className="space-y-2 text-stone-600">
              <p>
                <strong className="text-stone-900">Lahore Atelier:</strong><br />
                12-C Main Boulevard, Gulberg III, Lahore
              </p>
              <p>
                <strong className="text-stone-900">Karachi Studio:</strong><br />
                Suite 402, Dolmen Mall Clifton, Karachi
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-white border border-stone-200 p-6 sm:p-8 shadow-xs">
          <h2 className="font-serif text-2xl font-medium text-brand mb-1">
            Send an Inquiry
          </h2>
          <p className="text-xs text-stone-500 mb-6">
            Fill in the details below and we will respond within 4 business hours.
          </p>

          {submitted ? (
            <div className="p-8 bg-emerald-50 border border-emerald-200 text-center space-y-3 animate-fadeIn">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-lg font-bold">
                ✓
              </div>
              <h3 className="font-serif text-xl font-medium text-emerald-900">
                Message Received
              </h3>
              <p className="text-xs text-emerald-800">
                Thank you for writing to NAQSH. A senior wardrobe consultant will contact you via email or WhatsApp shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-3 px-6 py-2 bg-emerald-800 text-white text-xs font-semibold uppercase tracking-wider hover:bg-emerald-900 transition-colors"
              >
                Send Another Note
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Fatima Khan"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 focus:bg-white focus:border-brand outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="fatima@example.com"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 focus:bg-white focus:border-brand outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    WhatsApp Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 focus:bg-white focus:border-brand outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    Inquiry Subject
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 focus:bg-white focus:border-brand outline-none"
                  >
                    <option value="Order Inquiry">Order Inquiry / Tracking</option>
                    <option value="Sizing Consultation">Sizing Consultation</option>
                    <option value="Custom Bridal / Couture">Custom Bridal / Couture</option>
                    <option value="Return / Exchange">Return or Exchange Question</option>
                    <option value="Wholesale / Diaspora Shipping">Wholesale / International Shipping</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-stone-700 mb-1">
                  Your Message *
                </label>
                <textarea
                  minLength={10}
                  maxLength={5000}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  placeholder="How may our wardrobe team assist you today?"
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 focus:bg-white focus:border-brand outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brand text-white text-xs font-semibold uppercase tracking-widest hover:bg-black transition-colors disabled:opacity-50"
              >
                {loading ? "Transmitting..." : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
