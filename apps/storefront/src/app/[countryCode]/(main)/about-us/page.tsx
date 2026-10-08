import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import NaqshLogo from "@modules/common/components/naqsh-logo"

export const metadata: Metadata = {
  title: "About Us — NAQSH | Online Fashion Destination in Pakistan",
  description:
    "Welcome to NAQSH, your online destination for men's and women's fashion in Pakistan. Explore our story, curated multi-brand collections, quality, and nationwide delivery.",
}

export default function AboutUsPage() {
  const offerings = [
    { title: "Men's Unstitched", desc: "Pure Boski, Egyptian cotton, and wrinkle-free wash-and-wear 4.5-meter suit cuts for custom tailoring.", icon: "👔" },
    { title: "Women's Unstitched", desc: "Premium 3-piece luxury lawn, pure chiffon dupattas, and seasonal embroidered fabrics for every celebration.", icon: "👗" },
    { title: "Unstitched Collections", desc: "Premium lawn, pure organza, chiffon, and jacquard fabrics with embroidered borders.", icon: "🧵" },
    { title: "Seasonal Fashion", desc: "Curated summer lawn edits, festive Eid ensembles, and cozy winter shawls.", icon: "🌸" },
    { title: "Printed & Designer Articles", desc: "Exclusive digital prints and artisan motifs celebrating Pakistani heritage.", icon: "✨" },
    { title: "New Arrivals", desc: "Fresh weekly drops bringing the latest runway trends directly to your wardrobe.", icon: "🆕" },
    { title: "Trending Collections", desc: "The most sought-after silhouettes loved by fashion enthusiasts nationwide.", icon: "🔥" },
  ]

  const pillars = [
    { title: "Multi-Brand Fashion Collection", desc: "A diverse catalogue bringing together the best styles from multiple reputable labels." },
    { title: "Men's & Women's Fashion", desc: "Comprehensive wardrobes for both men and women across all celebratory and daily occasions." },
    { title: "Reasonable & Competitive Prices", desc: "Fair pricing that delivers genuine value without compromising on craftsmanship." },
    { title: "New & Seasonal Collections", desc: "Continuously updated collections keeping pace with dynamic fashion trends." },
    { title: "Wide Range of Styles & Designs", desc: "From minimalist solids to heavily embroidered couture pieces." },
    { title: "Convenient Online Ordering", desc: "Fast, seamless checkout with immediate WhatsApp and SMS order confirmation." },
    { title: "Delivery Across Pakistan", desc: "Doorstep delivery to Karachi, Lahore, Islamabad, and every town nationwide." },
    { title: "Customer-Focused Experience", desc: "30-day exchange facility, responsive helpline, and dedicated concierge care." },
  ]

  return (
    <div className="bg-[#FAF9F6] text-[#1A1A1A] font-sans">
      {/* Editorial Header */}
      <section className="relative py-20 lg:py-28 border-b border-stone-200/80 bg-gradient-to-b from-[#EBE1D6]/30 to-[#FAF9F6]">
        <div className="content-container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center space-y-4">
          <div className="flex justify-center mb-3">
            <NaqshLogo variant="dark" size="lg" />
          </div>
          <span className="inline-block text-[11px] font-semibold uppercase tracking-[0.3em] text-[#B6975A]">
            Premium • Minimal • Elegant • Timeless
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl text-[#0F2D22] font-medium leading-tight">
            About NAQSH
          </h1>
          <p className="text-sm sm:text-base text-stone-600 font-light leading-relaxed max-w-2xl mx-auto">
            Your online destination for men's and women's fashion in Pakistan.
          </p>
        </div>
      </section>

      {/* Main Introduction */}
      <section className="py-16 sm:py-20 border-b border-stone-200/80">
        <div className="content-container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl space-y-6 text-sm sm:text-base leading-relaxed text-stone-700">
          <p className="first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:text-[#0F2D22] text-stone-800">
            Welcome to <strong>NAQSH</strong>, your online destination for men's and women's fashion in Pakistan. We bring together a carefully selected range of clothing and fashion articles from different brands, giving customers the freedom to explore a wider variety of styles, designs, fabrics, and price ranges in one place.
          </p>
          <p>
            Our store is built for customers who want quality fashion without the hassle of visiting multiple stores or websites. Our collection includes men's and women's clothing, seasonal wear, new arrivals, and trending fashion articles from different brands and suppliers. We focus on offering products that combine style, quality, and value, with prices kept reasonable for our customers.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 sm:py-20 bg-white border-b border-stone-200/80">
        <div className="content-container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-5 space-y-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#B6975A]">
                Origin & Purpose
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#0F2D22] font-medium">
                Our Story
              </h2>
            </div>
            <div className="md:col-span-7 space-y-4 text-xs sm:text-sm text-stone-600 leading-relaxed">
              <p>
                We started with a simple idea: make branded and quality fashion easier to find and more accessible through online shopping.
              </p>
              <p>
                The fashion market offers countless brands and collections, but finding the right article at the right price can often take time. Our platform brings different options together so customers can browse, compare, and shop according to their personal style and budget.
              </p>
              <p>
                Rather than limiting our store to one particular brand, we continuously explore different brands, collections, and products to keep our catalogue diverse and relevant to changing fashion trends.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-16 sm:py-20 bg-[#FAF9F6] border-b border-stone-200/80">
        <div className="content-container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#B6975A]">
              Curated Portfolio
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl text-[#0F2D22] font-medium">
              What We Offer
            </h2>
            <p className="text-xs text-stone-500 font-light">
              Our online fashion store features a growing selection of products for both men and women.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {offerings.map((item, idx) => (
              <div
                key={idx}
                className="bg-white p-6 border border-stone-200 hover:border-[#0F2D22] transition-all duration-300 shadow-2xs group"
              >
                <div className="text-2xl mb-3 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="font-serif text-lg font-medium text-[#0F2D22] mb-1.5">
                  {item.title}
                </h3>
                <p className="text-xs text-stone-600 font-light leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-stone-500 font-light mt-8 italic">
            * Product availability and collections may change regularly depending on brands, seasons, and market demand.
          </p>
        </div>
      </section>

      {/* Quality & Value + A Wider Choice of Brands */}
      <section className="py-16 sm:py-20 bg-white border-b border-stone-200/80">
        <div className="content-container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Quality & Value */}
            <div className="p-8 bg-[#FAF9F6] border border-stone-200/90 space-y-4">
              <span className="w-10 h-10 rounded-full bg-[#0F2D22] text-[#B6975A] flex items-center justify-center font-serif text-lg font-bold">
                ✓
              </span>
              <h3 className="font-serif text-2xl text-[#0F2D22] font-medium">
                Quality & Value
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
                We understand that customers want more than just attractive designs. Quality, price, product details, and overall value are important when purchasing clothing online.
              </p>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
                For this reason, we aim to source and list products from reliable brands and suppliers while providing customers with clear product information. Our pricing strategy focuses on keeping products reasonably priced so customers can find suitable fashion options without unnecessary costs.
              </p>
            </div>

            {/* A Wider Choice of Brands */}
            <div className="p-8 bg-[#FAF9F6] border border-stone-200/90 space-y-4">
              <span className="w-10 h-10 rounded-full bg-[#B6975A] text-white flex items-center justify-center font-serif text-lg font-bold">
                ★
              </span>
              <h3 className="font-serif text-2xl text-[#0F2D22] font-medium">
                A Wider Choice of Brands
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
                One of the key features of our store is our multi-brand approach. Customers are not restricted to a single label or collection.
              </p>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
                By bringing products from different brands together, we provide more choices in terms of designs, fabrics, styles, collections, and price points. This allows customers to find products that better match their individual preferences and requirements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Online Fashion Shopping Across Pakistan & Customer Experience */}
      <section className="py-16 sm:py-20 bg-[#FAF9F6] border-b border-stone-200/80">
        <div className="content-container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl space-y-12">
          {/* Pakistan Wide Delivery */}
          <div className="space-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#B6975A]">
              Nationwide Reach
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#0F2D22] font-medium">
              Online Fashion Shopping Across Pakistan
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
              We proudly deliver orders throughout Pakistan. Whether you are shopping from a major city or another part of the country, you can browse our online collection, select your preferred products, place your order, and have it delivered to your doorstep.
            </p>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
              Our goal is to make fashion shopping accessible beyond traditional physical stores and provide customers across Pakistan with a convenient online shopping experience.
            </p>
          </div>

          {/* Customer Experience */}
          <div className="space-y-3 pt-6 border-t border-stone-200">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#B6975A]">
              Service Philosophy
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#0F2D22] font-medium">
              Customer Experience
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
              We believe online shopping should be straightforward and convenient. From discovering a product to placing an order, we aim to keep the process simple and user-friendly.
            </p>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-light">
              Our website is designed to help customers easily explore categories, view product information, check available options, and make purchasing decisions with confidence. Customer feedback also helps us understand changing preferences and improve our product selection and shopping experience.
            </p>
          </div>

          {/* Our Vision */}
          <div className="p-8 bg-[#0F2D22] text-[#FAF9F6] space-y-3 shadow-md">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#B6975A]">
              Looking Forward
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-white font-medium">
              Our Vision
            </h2>
            <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-light">
              Our vision is to establish <strong>NAQSH</strong> as a trusted online fashion destination in Pakistan, known for variety, reasonable pricing, convenient shopping, and a continuously evolving collection.
            </p>
            <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-light">
              As we grow, we plan to expand our product catalogue, introduce more brands and fashion categories, and continue improving our online shopping experience for customers across the country.
            </p>
          </div>
        </div>
      </section>

      {/* Why Shop With Us? */}
      <section className="py-16 sm:py-20 bg-white border-b border-stone-200/80">
        <div className="content-container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#B6975A]">
              The NAQSH Advantage
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl text-[#0F2D22] font-medium">
              Why Shop With Us?
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((p, idx) => (
              <div key={idx} className="p-5 border border-stone-200 bg-[#FAF9F6] space-y-2">
                <span className="text-xs font-mono font-bold text-[#B6975A]">
                  0{idx + 1}
                </span>
                <h3 className="font-serif text-base font-semibold text-[#0F2D22]">
                  {p.title}
                </h3>
                <p className="text-xs text-stone-600 font-light leading-relaxed">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA: Shop Fashion Online in Pakistan */}
      <section className="py-20 bg-[#0F2D22] text-white text-center">
        <div className="content-container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl space-y-5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#B6975A]">
            Discover NAQSH
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-medium">
            Shop Fashion Online in Pakistan
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 font-light max-w-xl mx-auto leading-relaxed">
            Explore our latest men's and women's clothing collections and discover fashion from different brands in one convenient online store. Browse our latest arrivals and find the right products for your style and budget.
          </p>
          <div className="pt-4">
            <LocalizedClientLink
              href="/store"
              className="inline-flex items-center gap-2 px-10 py-4 bg-[#B6975A] text-[#0F2D22] font-bold text-xs uppercase tracking-[0.25em] hover:bg-[#FAF9F6] transition-all duration-300 shadow-md transform hover:scale-105"
            >
              <span>Shop Now</span>
              <span>&rarr;</span>
            </LocalizedClientLink>
          </div>
        </div>
      </section>
    </div>
  )
}
