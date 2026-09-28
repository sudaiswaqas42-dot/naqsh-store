import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "Customer Service | NAQSH",
  description: "Help with your NAQSH order, delivery, returns, sizing and account.",
}

const services = [
  { href: "/order/track", title: "Where is my order?", text: "Follow your order using your order number and email address.", label: "Track your order" },
  { href: "/return-policy", title: "Find your perfect fit", text: "Read our return policy and submit a return or exchange request.", label: "Returns & exchanges" },
  { href: "/size-guide", title: "A little help with sizing", text: "Explore measurements before choosing your next NAQSH piece.", label: "View size guide" },
  { href: "/shipping-policy", title: "Delivery, explained", text: "Find information about dispatch, shipping and delivery.", label: "Shipping information" },
  { href: "/account", title: "Your NAQSH account", text: "Sign in to view your orders and manage your saved addresses.", label: "Manage your account" },
  { href: "/faq", title: "Your questions, answered", text: "Explore answers about shopping, payments and product care.", label: "Read the FAQs" },
]

export default function CustomerServicePage() {
  return <main className="bg-[#faf8f5]">
    <section className="bg-stone-900 text-white px-6 py-16 sm:py-24 text-center">
      <p className="text-accent text-xs uppercase tracking-[0.3em] mb-5">The NAQSH concierge</p>
      <h1 className="font-serif text-4xl sm:text-6xl">Here for every detail.</h1>
      <p className="text-stone-300 text-sm leading-7 max-w-lg mx-auto mt-6">From choosing your first piece to caring for a favourite, find the help you need in one place.</p>
      <LocalizedClientLink href="/contact-us" className="inline-block mt-8 bg-white text-stone-900 px-8 py-3 text-xs uppercase tracking-widest">Contact our team</LocalizedClientLink>
    </section>
    <section className="content-container py-12 sm:py-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {services.map((service, index) => <LocalizedClientLink key={service.href} href={service.href} className="group bg-white border border-stone-200 p-7 sm:p-9 hover:border-accent focus-visible:outline-accent transition-colors">
        <span className="text-xs text-accent tracking-widest">0{index + 1}</span>
        <h2 className="font-serif text-2xl text-brand mt-6 mb-3">{service.title}</h2>
        <p className="text-sm text-stone-500 leading-6 min-h-[72px]">{service.text}</p>
        <span className="inline-block mt-7 text-xs uppercase tracking-wider text-brand group-hover:text-accent">{service.label} &rarr;</span>
      </LocalizedClientLink>)}
    </section>
  </main>
}
