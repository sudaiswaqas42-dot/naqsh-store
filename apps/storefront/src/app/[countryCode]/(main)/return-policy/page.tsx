"use client"

import React, { useState } from "react"
import { useToast } from "@lib/context/toast-context"
import NaqshLogo from "@modules/common/components/naqsh-logo"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function ReturnPolicyPage() {
  const { showToast } = useToast()
  const [orderId, setOrderId] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [type, setType] = useState<"exchange" | "return">("exchange")
  const [reason, setReason] = useState("Sizing / Fit Issue")
  const [items, setItems] = useState("")
  const [comments, setComments] = useState("")
  const [loading, setLoading] = useState(false)
  const [submittedRequest, setSubmittedRequest] = useState<any | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderId || !email || !name) {
      showToast("Please provide your Order Number, Name, and Email.", "error")
      return
    }

    setLoading(true)
    try {
      const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
      const apiKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
      const res = await fetch(`${backendUrl}/store/return-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": apiKey,
        },
        body: JSON.stringify({
          order_id: orderId.replace("#", "").trim(),
          customer_name: name.trim(),
          customer_email: email.trim(),
          customer_phone: phone.trim(),
          action_requested: type,
          reason,
          items: items ? [{ description: items }] : [],
          notes: comments,
        }),
      })

      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.message || json.error || "Failed to submit request.")
      }

      setSubmittedRequest(json.return_request || { id: "req_" + Date.now(), customer_email: email })
      showToast("Your return/exchange request has been logged successfully!", "success")
    } catch (err: any) {
      console.error(err)
      showToast(err.message || "Could not submit return request.", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#FAF9F6] text-[#1A1A1A] font-sans py-14 sm:py-20">
      <div className="content-container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <div className="flex justify-center mb-2">
            <NaqshLogo variant="dark" size="md" />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#B6975A]">
            Customer Assurance
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#0F2D22] font-medium">
            Return & Exchange Policy
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-light">
            Last Updated: January 2025
          </p>
        </div>

        {/* Intro */}
        <div className="bg-white p-6 sm:p-8 border border-stone-200 shadow-2xs mb-10 text-xs sm:text-sm leading-relaxed text-stone-700 space-y-3">
          <p>
            At <strong>NAQSH</strong>, we aim to make your shopping experience simple and reliable. We offer an exchange facility on all eligible products and a return/refund facility on selected products, subject to the conditions below.
          </p>
        </div>

        {/* Key Guarantee Badges matching Image 1 & PDF */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 text-xs">
          <div className="p-6 bg-white border-2 border-[#0F2D22] space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#0F2D22] text-[#B6975A] flex items-center justify-center font-bold text-sm font-mono">
              30D
            </div>
            <h3 className="font-serif text-lg font-medium text-[#0F2D22]">
              30-Day Exchange on All Products
            </h3>
            <p className="text-stone-600 leading-relaxed font-light">
              We offer a 30-day exchange policy on all products. If you need a different size, color, or article, we make the exchange process effortless.
            </p>
          </div>

          <div className="p-6 bg-white border border-stone-200 space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#EBE1D6] text-[#0F2D22] flex items-center justify-center font-bold text-sm font-mono">
              15D
            </div>
            <h3 className="font-serif text-lg font-medium text-[#0F2D22]">
              15-Day Return & Refund (Eligible Articles)
            </h3>
            <p className="text-stone-600 leading-relaxed font-light">
              Return and refund are available on products specifically eligible for returns within 15 days of receiving the order.
            </p>
          </div>
        </div>

        {/* Policy Detail Sections (PDF Pages 19-22) */}
        <div className="space-y-8 text-xs sm:text-sm text-stone-700 leading-relaxed mb-16">
          {/* Section 1 */}
          <section className="bg-white p-6 sm:p-8 border border-stone-200/90 space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#0F2D22] font-medium">
              1. Exchange Policy – 30 Days
            </h2>
            <p>
              We offer a <strong>30-day exchange policy on all products</strong>.
            </p>
            <p>
              Customers can request an exchange within 30 days of receiving their order, provided that the product is:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-stone-600">
              <li>Unused and unworn</li>
              <li>Unwashed and unaltered</li>
              <li>In its original condition</li>
              <li>With original tags and packaging, where applicable</li>
            </ul>
            <p className="text-stone-500 text-xs pt-1 italic">
              * Exchange requests are subject to product availability.
            </p>
          </section>

          {/* Section 2 */}
          <section className="bg-white p-6 sm:p-8 border border-stone-200/90 space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#0F2D22] font-medium">
              2. Return & Refund Policy – 15 Days
            </h2>
            <p>
              Return and refund are available <strong>only on products specifically eligible for returns</strong>.
            </p>
            <p>
              For eligible products, customers can request a return within <strong>15 days of receiving the order</strong>. The product must be unused, unworn, unwashed, unaltered, and returned in its original condition with tags and packaging where applicable.
            </p>
            <p className="text-stone-500 text-xs pt-1">
              Products that are not marked or listed as eligible for return will not qualify for a return/refund, but may remain eligible for exchange under our 30-day exchange policy.
            </p>
          </section>

          {/* Section 3 */}
          <section className="bg-white p-6 sm:p-8 border border-stone-200/90 space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#0F2D22] font-medium">
              3. If The Mistake Is From Our Side
            </h2>
            <p>If you receive:</p>
            <ul className="list-disc pl-5 space-y-1 text-stone-600">
              <li>The wrong product</li>
              <li>A damaged product</li>
              <li>A defective product</li>
              <li>A different size, color, or variant than what you ordered due to our error</li>
            </ul>
            <p className="text-stone-800 font-medium pt-1">
              We will arrange the return/exchange process <strong>at our own expense</strong>.
            </p>
            <p>
              If the product is eligible for a refund, we will also bear the applicable return shipping cost. Customers should contact us as soon as possible after receiving the order and provide the order details and required photographs/videos for verification.
            </p>
          </section>

          {/* Section 4 */}
          <section className="bg-white p-6 sm:p-8 border border-stone-200/90 space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#0F2D22] font-medium">
              4. Change of Mind
            </h2>
            <p>
              If you want to return or exchange a product simply because of a change of mind, personal preference, or because you no longer want the product, the applicable return/exchange shipping charges will be <strong>paid by the customer</strong>. The product must still meet all applicable return/exchange conditions.
            </p>
          </section>

          {/* Section 5 */}
          <section className="bg-white p-6 sm:p-8 border border-stone-200/90 space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#0F2D22] font-medium">
              5. Non-Returnable / Non-Exchangeable Condition
            </h2>
            <p>A product may not be accepted for return or exchange if it has been:</p>
            <ul className="list-disc pl-5 space-y-1 text-stone-600">
              <li>Worn or used</li>
              <li>Washed</li>
              <li>Altered or damaged by the customer</li>
              <li>Returned without required tags or packaging</li>
              <li>Damaged due to improper handling after delivery</li>
            </ul>
            <p className="text-stone-500 text-xs pt-1">
              Products specifically marked as non-returnable or final sale may also be excluded.
            </p>
          </section>

          {/* Section 6 */}
          <section className="bg-white p-6 sm:p-8 border border-stone-200/90 space-y-3">
            <h2 className="font-serif text-xl sm:text-2xl text-[#0F2D22] font-medium">
              6. How to Request a Return or Exchange
            </h2>
            <p>
              To request a return or exchange, contact us within the applicable time period or complete the online portal below:
            </p>
            <div className="bg-[#FAF9F6] p-4 border border-stone-200 space-y-1.5 text-xs">
              <div><strong>Email:</strong> info@naqsh.pk</div>
              <div><strong>Phone / WhatsApp:</strong> +92 300 1234567</div>
            </div>
            <p className="pt-1">Please provide:</p>
            <ul className="list-disc pl-5 space-y-1 text-stone-600">
              <li>Order number</li>
              <li>Customer name</li>
              <li>Contact number</li>
              <li>Reason for return/exchange</li>
              <li>Photos or videos of the product, if requested</li>
            </ul>
            <p className="text-stone-500 text-xs">
              Our team will review the request and guide you through the next steps.
            </p>
          </section>

          {/* Section 7 & 8 */}
          <section className="bg-white p-6 sm:p-8 border border-stone-200/90 space-y-4">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl text-[#0F2D22] font-medium mb-2">
                7. Refund Process
              </h2>
              <p>
                Once an eligible return is received and inspected, the refund will be processed if the return meets the requirements of this policy. Refund timing may vary depending on the payment method and processing arrangements.
              </p>
            </div>

            <div className="pt-4 border-t border-stone-200">
              <h2 className="font-serif text-xl text-[#0F2D22] font-medium mb-2">
                8. Important Note
              </h2>
              <div className="p-4 bg-[#0F2D22]/5 border-l-4 border-[#0F2D22] text-xs sm:text-sm text-stone-800 space-y-1.5">
                <p>
                  The <strong>30-day exchange policy applies to all products</strong>, while the <strong>15-day return and refund policy applies only to products specifically eligible for returns</strong>.
                </p>
                <p className="text-stone-600 text-xs">
                  Where the issue is caused by NAQSH, the applicable return/exchange shipping expenses will be covered by us. For customer-requested changes, including change of mind, applicable shipping charges will be the customer's responsibility.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Online Request Submission Portal */}
        <div className="bg-white border-2 border-[#0F2D22] p-6 sm:p-10 shadow-md">
          <div className="border-b border-stone-200 pb-6 mb-8">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#B6975A]">
              Self-Service Portal
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#0F2D22] mt-1">
              Submit Return or Exchange Request
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Initiate your doorstep request in under 60 seconds. Our concierge reviews all requests within 24 hours.
            </p>
          </div>

          {submittedRequest ? (
            <div className="p-8 bg-[#0F2D22]/5 border border-[#0F2D22]/30 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#0F2D22] text-white flex items-center justify-center mx-auto text-xl font-bold">
                ✓
              </div>
              <h3 className="font-serif text-2xl font-medium text-[#0F2D22]">
                Request Successfully Logged
              </h3>
              <p className="text-xs text-stone-700 max-w-md mx-auto leading-relaxed">
                Reference ID: <strong className="font-mono font-bold">#{submittedRequest.id?.slice(0, 10) || "REQ-NAQSH"}</strong>.
                Our logistics coordinator will reach out to you at <strong>{submittedRequest.customer_email || email}</strong> to schedule courier pickup.
              </p>
              <button
                onClick={() => setSubmittedRequest(null)}
                className="mt-4 px-6 py-2.5 bg-[#0F2D22] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#B6975A] transition-colors"
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                    Order Number *
                  </label>
                  <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="e.g. 1024"
                    className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-stone-300 focus:bg-white focus:border-[#0F2D22] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ayesha Malik"
                    className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-stone-300 focus:bg-white focus:border-[#0F2D22] outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                    Account Email Address *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. ayesha@example.com"
                    className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-stone-300 focus:bg-white focus:border-[#0F2D22] outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                    WhatsApp Contact Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +92 300 1234567"
                    className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-stone-300 focus:bg-white focus:border-[#0F2D22] outline-none"
                  />
                </div>
              </div>

              {/* Type selector */}
              <div>
                <label className="block font-semibold uppercase tracking-wider text-stone-700 mb-2">
                  Request Type *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label
                    className={`p-4 border text-center cursor-pointer transition-colors ${
                      type === "exchange"
                        ? "border-[#0F2D22] bg-[#0F2D22]/5 font-semibold text-[#0F2D22]"
                        : "border-stone-200 text-stone-600 hover:border-stone-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="requestType"
                      checked={type === "exchange"}
                      onChange={() => setType("exchange")}
                      className="sr-only"
                    />
                    <div>🔄 30-Day Product Exchange</div>
                    <div className="text-[10px] text-stone-500 font-normal mt-0.5">
                      Applicable to all products
                    </div>
                  </label>

                  <label
                    className={`p-4 border text-center cursor-pointer transition-colors ${
                      type === "return"
                        ? "border-[#0F2D22] bg-[#0F2D22]/5 font-semibold text-[#0F2D22]"
                        : "border-stone-200 text-stone-600 hover:border-stone-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="requestType"
                      checked={type === "return"}
                      onChange={() => setType("return")}
                      className="sr-only"
                    />
                    <div>💰 15-Day Return & Refund</div>
                    <div className="text-[10px] text-stone-500 font-normal mt-0.5">
                      On eligible products only
                    </div>
                  </label>
                </div>
              </div>

              {/* Reason selector */}
              <div>
                <label className="block font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  Primary Reason *
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-stone-300 focus:bg-white focus:border-[#0F2D22] outline-none"
                >
                  <option value="Sizing / Fit Issue">Sizing / Fit Issue (Requires different size)</option>
                  <option value="Defective / Damaged">Defective / Damaged (Free return by NAQSH)</option>
                  <option value="Wrong item delivered">Wrong Item Delivered (Free return by NAQSH)</option>
                  <option value="Color / Fabric Difference">Different Color / Variant than Ordered</option>
                  <option value="Change of Mind">Change of Mind (Customer pays return shipping)</option>
                </select>
              </div>

              {/* Item details */}
              <div>
                <label className="block font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  Article Details (Name, Size, Color)
                </label>
                <input
                  type="text"
                  value={items}
                  onChange={(e) => setItems(e.target.value)}
                  placeholder="e.g. Classic Kurta (Forest Green) - Size M"
                  className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-stone-300 focus:bg-white focus:border-[#0F2D22] outline-none"
                />
              </div>

              {/* Comments */}
              <div>
                <label className="block font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  Additional Notes / Reason Details
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={3}
                  placeholder="Please describe any issues or exchange preferences..."
                  className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-stone-300 focus:bg-white focus:border-[#0F2D22] outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#0F2D22] text-white text-xs font-semibold uppercase tracking-[0.2em] hover:bg-[#B6975A] hover:text-[#0F2D22] transition-colors disabled:opacity-50 shadow-sm"
              >
                {loading ? "Logging Request..." : "Submit Exchange / Return Request"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
