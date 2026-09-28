import React from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import FooterNewsletter from "./footer-newsletter"
import { getSocialLinks } from "@lib/data/homepage"
import NaqshLogo from "@modules/common/components/naqsh-logo"

export default async function Footer() {
  const socialLinks = await getSocialLinks()

  return (
    <footer className="bg-[#0F2D22] text-[#FAF9F6] border-t border-[#081B14] font-sans">
      {/* Brand Guarantee Bar (Image 1) */}
      <div className="border-b border-white/10 bg-[#081B14]/60 py-8">
        <div className="content-container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center space-y-1.5 p-2">
              <span className="text-2xl text-[#B6975A]">🚚</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-white">
                Fast & Reliable Delivery
              </span>
              <span className="text-[11px] text-stone-300 font-light">
                Nationwide express delivery
              </span>
            </div>

            <div className="flex flex-col items-center space-y-1.5 p-2">
              <span className="text-2xl text-[#B6975A]">🛡️</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-white">
                Secure Payments
              </span>
              <span className="text-[11px] text-stone-300 font-light">
                Cash on Delivery & Bank transfer
              </span>
            </div>

            <div className="flex flex-col items-center space-y-1.5 p-2">
              <span className="text-2xl text-[#B6975A]">🔄</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-white">
                Easy Exchange (30 Days)
              </span>
              <span className="text-[11px] text-stone-300 font-light">
                Hassle-free doorstep exchange
              </span>
            </div>

            <div className="flex flex-col items-center space-y-1.5 p-2">
              <span className="text-2xl text-[#B6975A]">🎧</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-white">
                Dedicated Support
              </span>
              <span className="text-[11px] text-stone-300 font-light">
                Mon - Sat: 9 AM to 9 PM PKT
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="content-container mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        {/* Top Newsletter & Brand Statement */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-16 border-b border-white/10">
          <div className="lg:col-span-5 space-y-4">
            <LocalizedClientLink href="/" className="inline-block">
              <NaqshLogo variant="light" size="lg" />
            </LocalizedClientLink>
            <p className="text-xs sm:text-sm text-stone-300 font-light leading-relaxed max-w-sm">
              Premium men's and women's fashion in Pakistan. An homage to timeless heritage craftsmanship, reimagined for the contemporary wardrobe.
            </p>

            {/* Social Links matching circular buttons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href={socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full border border-white/20 bg-white/5 text-stone-200 hover:text-white hover:border-[#B6975A] hover:bg-[#B6975A]/20 flex items-center justify-center text-xs font-semibold lowercase tracking-tight transition-all duration-300 hover:scale-105 shadow-xs"
              >
                f
              </a>
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full border border-white/20 bg-white/5 text-stone-200 hover:text-white hover:border-[#B6975A] hover:bg-[#B6975A]/20 flex items-center justify-center text-xs font-semibold lowercase tracking-tight transition-all duration-300 hover:scale-105 shadow-xs"
              >
                in
              </a>
              <a
                href={socialLinks.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="w-9 h-9 rounded-full border border-white/20 bg-white/5 text-stone-200 hover:text-white hover:border-[#B6975A] hover:bg-[#B6975A]/20 flex items-center justify-center text-xs font-semibold lowercase tracking-tight transition-all duration-300 hover:scale-105 shadow-xs"
              >
                tk
              </a>
              <a
                href={socialLinks.pinterest}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pinterest"
                className="w-9 h-9 rounded-full border border-white/20 bg-white/5 text-stone-200 hover:text-white hover:border-[#B6975A] hover:bg-[#B6975A]/20 flex items-center justify-center text-xs font-semibold lowercase tracking-tight transition-all duration-300 hover:scale-105 shadow-xs"
              >
                p
              </a>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col justify-center">
            <FooterNewsletter />
          </div>
        </div>

        {/* Navigation Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-14 border-b border-stone-800 text-xs">
          {/* Shop */}
          <div className="space-y-4">
            <h4 className="font-serif text-base text-white tracking-wider uppercase font-semibold">
              Collections
            </h4>
            <ul className="space-y-2.5 text-stone-400">
              <li>
                <LocalizedClientLink href="/categories/women" className="hover:text-accent transition-colors">
                  Women's Pret & Formals
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/categories/unstitched" className="hover:text-accent transition-colors">
                  Unstitched Luxury Lawn
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/categories/co-ords" className="hover:text-accent transition-colors">
                  Printed Silk Co-ords
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/categories/men" className="hover:text-accent transition-colors">
                  Men's Kurta & Waistcoats
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/categories/kids" className="hover:text-accent transition-colors">
                  Kids Festive Eastern
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/categories/accessories" className="hover:text-accent transition-colors">
                  Shawls, Khussas & Jewellery
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/categories/sale" className="text-amber-500 hover:text-amber-400 transition-colors">
                  Sale & Clearance
                </LocalizedClientLink>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-4">
            <h4 className="font-serif text-base text-white tracking-wider uppercase font-semibold">
              Customer Care
            </h4>
            <ul className="space-y-2.5 text-stone-400">
              <li><LocalizedClientLink href="/customer-service" className="hover:text-accent transition-colors">Customer Service</LocalizedClientLink></li>
              <li>
                <LocalizedClientLink href="/account" className="hover:text-accent transition-colors flex items-center gap-1.5">
                  Order History & Status
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/return-policy" className="hover:text-accent transition-colors">
                  Return & Exchange Portal
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/size-guide" className="hover:text-accent transition-colors">
                  Size Guide & Measurements
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/shipping-policy" className="hover:text-accent transition-colors">
                  Shipping & Delivery Info
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/faq" className="hover:text-accent transition-colors">
                  Frequently Asked Questions
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/contact-us" className="hover:text-accent transition-colors">
                  Contact Us & WhatsApp
                </LocalizedClientLink>
              </li>
            </ul>
          </div>

          {/* About NAQSH */}
          <div className="space-y-4">
            <h4 className="font-serif text-base text-white tracking-wider uppercase font-semibold">
              About NAQSH
            </h4>
            <ul className="space-y-2.5 text-stone-400">
              <li>
                <LocalizedClientLink href="/about-us" className="hover:text-accent transition-colors">
                  Our Heritage & Story
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/blog" className="hover:text-accent transition-colors">
                  The Editorial Journal
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/privacy-policy" className="hover:text-accent transition-colors">
                  Privacy Policy
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink href="/terms" className="hover:text-accent transition-colors">
                  Terms of Service
                </LocalizedClientLink>
              </li>
            </ul>
          </div>

          {/* Store Concierge & Guarantees */}
          <div className="space-y-4">
            <h4 className="font-serif text-base text-white tracking-wider uppercase font-semibold">
              Concierge
            </h4>
            <div className="space-y-3 text-stone-400 text-xs">
              <p>
                <strong className="text-stone-200">Customer Helpline:</strong><br />
                0800-62774 (NAQSH)
              </p>
              <p>
                <strong className="text-stone-200">WhatsApp Concierge:</strong><br />
                +92 300 1234567
              </p>
              <p>
                <strong className="text-stone-200">Hours:</strong><br />
                Mon - Sat: 9:00 AM - 9:00 PM PKT
              </p>
              <div className="pt-1">
                <span className="inline-block bg-accent/20 text-accent border border-accent/30 text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1">
                  Cash on Delivery Across Pakistan
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Image 1 Quick Links Strip: About | Contact | Shipping & Returns | Privacy Policy | Terms & Conditions */}
        <div className="py-6 border-t border-white/10 border-b border-white/10 my-4 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-stone-300 font-light select-none">
          <LocalizedClientLink href="/about-us" className="hover:text-[#B6975A] transition-colors">
            About
          </LocalizedClientLink>
          <span className="text-white/20">|</span>
          <LocalizedClientLink href="/contact" className="hover:text-[#B6975A] transition-colors">
            Contact
          </LocalizedClientLink>
          <span className="text-white/20">|</span>
          <LocalizedClientLink href="/shipping-policy" className="hover:text-[#B6975A] transition-colors">
            Shipping & Returns
          </LocalizedClientLink>
          <span className="text-white/20">|</span>
          <LocalizedClientLink href="/privacy-policy" className="hover:text-[#B6975A] transition-colors">
            Privacy Policy
          </LocalizedClientLink>
          <span className="text-white/20">|</span>
          <LocalizedClientLink href="/terms" className="hover:text-[#B6975A] transition-colors">
            Terms & Conditions
          </LocalizedClientLink>
        </div>

        {/* Bottom Bar: Payment icons & Copyright */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <div>
            © {new Date().getFullYear()} NAQSH Apparel (Private) Limited. All rights reserved. • Where Identity Begins.
          </div>

          {/* Payment Badges */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-300">
            <span className="px-2 py-1 bg-black/40 border border-white/10 rounded">
              💵 Cash on Delivery
            </span>
            <span className="px-2 py-1 bg-black/40 border border-white/10 rounded font-semibold text-white">
              VISA
            </span>
            <span className="px-2 py-1 bg-black/40 border border-white/10 rounded font-semibold text-white">
              Mastercard
            </span>
            <span className="px-2 py-1 bg-black/40 border border-white/10 rounded text-red-300">
              JazzCash
            </span>
            <span className="px-2 py-1 bg-black/40 border border-white/10 rounded text-emerald-300">
              EasyPaisa
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
