import React from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import FooterNewsletter from "./footer-newsletter"
import { getSocialLinks } from "@lib/data/homepage"
import NaqshLogo from "@modules/common/components/naqsh-logo"

export default async function Footer() {
  const socialLinks = await getSocialLinks()

  return (
    <>
    <section aria-label="Newsletter" className="border-t border-stone-200 bg-[#f2eee6] py-12 sm:py-16"><div className="content-container"><FooterNewsletter /></div></section>
    <footer className="bg-[#0B2219] text-[#FAF9F6] border-t border-[#071710] font-sans">
      <div className="content-container mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        {/* Brand Header & Insiders Circle Top Row */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] items-center gap-10 lg:gap-24 pb-12 border-b border-white/10">
          <div className="flex flex-col items-start gap-4 max-w-lg">
            <LocalizedClientLink href="/" className="inline-block transition-opacity hover:opacity-90">
              <NaqshLogo variant="light" size="lg" />
            </LocalizedClientLink>
            <p className="text-xs sm:text-sm text-stone-300 font-light leading-relaxed">
              Premium men&apos;s and women&apos;s fashion in Pakistan. An homage to timeless heritage craftsmanship, reimagined for the contemporary wardrobe.
            </p>

            {/* Social Links matching circular outline buttons */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href={socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full border border-white/25 bg-white/5 text-stone-300 hover:text-white hover:border-[#C5A869] hover:bg-[#C5A869]/20 flex items-center justify-center text-xs font-serif lowercase transition-all duration-200"
              >
                f
              </a>
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full border border-white/25 bg-white/5 text-stone-300 hover:text-white hover:border-[#C5A869] hover:bg-[#C5A869]/20 flex items-center justify-center text-xs font-serif lowercase transition-all duration-200"
              >
                in
              </a>
              <a
                href={socialLinks.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="w-8 h-8 rounded-full border border-white/25 bg-white/5 text-stone-300 hover:text-white hover:border-[#C5A869] hover:bg-[#C5A869]/20 flex items-center justify-center text-xs font-serif lowercase transition-all duration-200"
              >
                tk
              </a>
              <a
                href={socialLinks.pinterest}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pinterest"
                className="w-8 h-8 rounded-full border border-white/25 bg-white/5 text-stone-300 hover:text-white hover:border-[#C5A869] hover:bg-[#C5A869]/20 flex items-center justify-center text-xs font-serif lowercase transition-all duration-200"
              >
                p
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 lg:gap-6">
            {[
              { title: "Unstitched, always", text: "Fabric collections for women, men and children." },
              { title: "Across Pakistan", text: "Delivered to your doorstep, wherever you call home." },
              { title: "Here to help", text: "Get support with fabrics, delivery and your order." },
            ].map((item, index) => <div key={item.title} className="border-t border-[#c5a869]/40 pt-4"><span className="text-[10px] tracking-widest text-[#c5a869]">0{index + 1}</span><h3 className="mt-2 font-serif text-base text-white">{item.title}</h3><p className="mt-2 text-xs leading-relaxed text-stone-300/80">{item.text}</p></div>)}
          </div>
        </div>

        {/* 4 Navigation Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 py-12 text-xs">
          {/* 1. COLLECTIONS */}
          <div className="space-y-4">
            <h4 className="font-serif text-xs font-semibold text-white tracking-[0.2em] uppercase">
              Collections
            </h4>
            <ul className="space-y-2.5 text-stone-300/80 font-light">
              <li>
                <LocalizedClientLink href="/categories/women" className="hover:text-[#C5A869] transition-colors">
                  Women&apos;s Unstitched Fabrics
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/categories/boski" className="hover:text-[#C5A869] transition-colors">
                  Pure Silk Boski &amp; Heirloom Cuts
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/categories/3pc" className="hover:text-[#C5A869] transition-colors">
                  3-Piece Luxury Suits
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/categories/2pc" className="hover:text-[#C5A869] transition-colors">
                  2-Piece Printed &amp; Embroidered
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/categories/men" className="hover:text-[#C5A869] transition-colors">
                  Men&apos;s Unstitched Fabrics
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/categories/children" className="hover:text-[#C5A869] transition-colors">
                  Kids Unstitched Fabrics
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/categories/wool" className="hover:text-[#C5A869] transition-colors">
                  Wool &amp; Winter Fabrics
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/categories/sale" className="text-[#C5A869] font-medium hover:text-amber-300 transition-colors">
                  Sale &amp; Clearance
                </LocalizedClientLink>
              </li>
            </ul>
          </div>

          {/* 2. CUSTOMER CARE */}
          <div className="space-y-4">
            <h4 className="font-serif text-xs font-semibold text-white tracking-[0.2em] uppercase">
              Customer Care
            </h4>
            <ul className="space-y-2.5 text-stone-300/80 font-light">
              <li>
                <LocalizedClientLink href="/customer-service" className="hover:text-[#C5A869] transition-colors">
                  Customer Service
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/account" className="hover:text-[#C5A869] transition-colors">
                  Order History &amp; Status
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/return-policy" className="hover:text-[#C5A869] transition-colors">
                  Return &amp; Exchange Portal
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/size-guide" className="hover:text-[#C5A869] transition-colors">
                  Size Guide &amp; Measurements
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/shipping-policy" className="hover:text-[#C5A869] transition-colors">
                  Shipping &amp; Delivery Info
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/faq" className="hover:text-[#C5A869] transition-colors">
                  Frequently Asked Questions
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/contact" className="hover:text-[#C5A869] transition-colors">
                  Contact Us &amp; WhatsApp
                </LocalizedClientLink>
              </li>
            </ul>
          </div>

          {/* 3. ABOUT NAQSH */}
          <div className="space-y-4">
            <h4 className="font-serif text-xs font-semibold text-white tracking-[0.2em] uppercase">
              About NAQSH
            </h4>
            <ul className="space-y-2.5 text-stone-300/80 font-light">
              <li>
                <LocalizedClientLink href="/about-us" className="hover:text-[#C5A869] transition-colors">
                  Our Heritage &amp; Story
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/blog" className="hover:text-[#C5A869] transition-colors">
                  The Editorial Journal
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/privacy-policy" className="hover:text-[#C5A869] transition-colors">
                  Privacy Policy
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/terms" className="hover:text-[#C5A869] transition-colors">
                  Terms of Service
                </LocalizedClientLink>
              </li>
            </ul>
          </div>

          {/* 4. CONCIERGE */}
          <div className="space-y-4">
            <h4 className="font-serif text-xs font-semibold text-white tracking-[0.2em] uppercase">
              Concierge
            </h4>
            <div className="space-y-3 text-stone-300/80 font-light text-xs">
              <p>
                <span className="font-medium text-stone-200">Customer Helpline:</span><br />
                <LocalizedClientLink href="/contact" className="text-stone-300 underline underline-offset-4">Contact customer care</LocalizedClientLink>
              </p>
              <p>
                <span className="font-medium text-stone-200">WhatsApp Concierge:</span><br />
                <span className="text-stone-300">+92 319 7365388</span>
              </p>
              <p>
                <span className="font-medium text-stone-200">Hours:</span><br />
                <span className="text-stone-300">Mon - Sat: 9:00 AM - 9:00 PM PKT</span>
              </p>
              <div className="pt-2">
                <span className="inline-block border border-[#C5A869]/50 text-[#C5A869] bg-[#071710]/50 text-[10px] uppercase tracking-[0.15em] font-medium px-3 py-1.5 rounded-none">
                  Cash on Delivery Across Pakistan
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links Strip: About | Contact | Shipping & Returns | Privacy Policy | Terms & Conditions */}
        <div className="py-6 border-t border-white/10 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-stone-300/90 font-light">
          <LocalizedClientLink href="/about-us" className="hover:text-[#C5A869] transition-colors">
            About
          </LocalizedClientLink>
          <span className="text-white/20">|</span>
          <LocalizedClientLink href="/contact" className="hover:text-[#C5A869] transition-colors">
            Contact
          </LocalizedClientLink>
          <span className="text-white/20">|</span>
          <LocalizedClientLink href="/shipping-policy" className="hover:text-[#C5A869] transition-colors">
            Shipping &amp; Returns
          </LocalizedClientLink>
          <span className="text-white/20">|</span>
          <LocalizedClientLink href="/privacy-policy" className="hover:text-[#C5A869] transition-colors">
            Privacy Policy
          </LocalizedClientLink>
          <span className="text-white/20">|</span>
          <LocalizedClientLink href="/terms" className="hover:text-[#C5A869] transition-colors">
            Terms &amp; Conditions
          </LocalizedClientLink>
        </div>

        {/* Bottom Bar: Copyright on left, Payment badges on right */}
        <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <div className="text-center md:text-left leading-relaxed">
            &copy; 2026 NAQSH Apparel (Private) Limited. All rights reserved. &bull; Where Identity Begins.
          </div>

          {/* Payment Badges styled cleanly like Image 2 */}
          <div className="flex flex-wrap justify-center md:justify-end items-center gap-2 text-[11px] text-stone-300">
            <span className="flex items-center gap-1 px-2.5 py-1 bg-black/50 border border-white/10 text-stone-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              Cash on Delivery
            </span>
            <span className="px-2.5 py-1 bg-black/50 border border-white/10 font-bold text-white tracking-wider">
              VISA
            </span>
            <span className="px-2.5 py-1 bg-black/50 border border-white/10 font-bold text-white tracking-wider">
              Mastercard
            </span>
            <span className="px-2.5 py-1 bg-black/50 border border-white/10 font-bold text-amber-400 tracking-wider">
              JazzCash
            </span>
            <span className="px-2.5 py-1 bg-black/50 border border-white/10 font-bold text-emerald-400 tracking-wider">
              EasyPaisa
            </span>
          </div>
        </div>
      </div>
    </footer>
    </>
  )
}
