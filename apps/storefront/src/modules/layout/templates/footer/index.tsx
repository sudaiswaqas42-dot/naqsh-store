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

            {/* Social Links matching circular outline buttons with official SVG icons */}
            <div className="flex items-center gap-3 pt-1">
              <a
                href={socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full border border-white/25 bg-white/5 text-stone-300 hover:text-white hover:border-[#C5A869] hover:bg-[#C5A869]/20 flex items-center justify-center transition-all duration-200"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full border border-white/25 bg-white/5 text-stone-300 hover:text-white hover:border-[#C5A869] hover:bg-[#C5A869]/20 flex items-center justify-center transition-all duration-200"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href={socialLinks.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="w-8 h-8 rounded-full border border-white/25 bg-white/5 text-stone-300 hover:text-white hover:border-[#C5A869] hover:bg-[#C5A869]/20 flex items-center justify-center transition-all duration-200"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.15 1.17 2.07 2.3 2.34.8.21 1.67.14 2.42-.23.86-.41 1.48-1.22 1.68-2.15.11-.47.16-.95.16-1.43V.02z"/>
                </svg>
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
            NAQSH &copy;2026 | Developed by{" "}
            <a
              href="https://afyradigital.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold underline text-stone-200 hover:text-[#C5A869] transition-colors"
            >
              Afyra Digital
            </a>
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
