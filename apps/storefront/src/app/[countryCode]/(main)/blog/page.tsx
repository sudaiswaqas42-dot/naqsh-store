import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata: Metadata = {
  title: "The Editorial Journal — NAQSH",
  description: "Stories on Pakistani fashion heritage, lawn season curation, and handloom craftsmanship.",
}

const articles = [
  {
    slug: "art-of-pakistani-lawn",
    title: "The Anatomy of Luxury Lawn: From Cotton Boll to Heirloom Weave",
    category: "Textile Craft",
    date: "April 18, 2025",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
    excerpt: "Why extra-long staple combed cotton remains the crown jewel of Pakistani summer couture, balancing breathability with whisper-weight opulence.",
    collectionLink: "/collections/summer-lawn-25",
    collectionLabel: "Shop Summer Lawn '25",
  },
  {
    slug: "reviving-zardozi-and-tilla",
    title: "Reviving Zardozi & Tilla: Inside Our Lahore Master Atelier",
    category: "Heritage",
    date: "March 29, 2025",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
    excerpt: "A behind-the-scenes look at the needleworkers of the Walled City as they painstakingly craft metallic thread embroideries for the Festive 2025 formal edit.",
    collectionLink: "/collections/festive-formals",
    collectionLabel: "Explore Festive Formals",
  },
  {
    slug: "modern-monochrome-pret",
    title: "Quiet Luxury: The Rise of Monochromatic Co-ords in Contemporary Pret",
    category: "Style Guide",
    date: "February 12, 2025",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80",
    excerpt: "How effortless matching sets and tonal draping are replacing heavy multi-colored lawn prints for modern South Asian urban dressing.",
    collectionLink: "/categories/co-ords",
    collectionLabel: "View Silk Co-ords",
  },
]

export default function BlogPage() {
  return (
    <div className="content-container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-5xl font-sans">
      <div className="text-center max-w-xl mx-auto mb-16">
        <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">
          The NAQSH Gazette
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl text-brand font-medium mt-1">
          The Editorial Journal
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-2 font-light">
          Reflections on timeless design, textile anthropology, and the evolving spirit of Pakistani fashion.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {articles.map((post) => (
          <article
            key={post.slug}
            className="group flex flex-col bg-white border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow"
          >
            <div className="relative aspect-[16/10] bg-stone-100 overflow-hidden">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <span className="absolute top-3 left-3 bg-stone-900/90 text-white text-[9px] uppercase tracking-widest font-semibold px-2.5 py-1 backdrop-blur-xs">
                {post.category}
              </span>
            </div>

            <div className="p-6 flex flex-col flex-1 justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] text-stone-400">
                  <span>{post.date}</span>
                  <span>•</span>
                  <span>{post.readTime}</span>
                </div>

                <h2 className="font-serif text-xl font-medium text-brand group-hover:text-accent transition-colors leading-snug">
                  {post.title}
                </h2>

                <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                <LocalizedClientLink
                  href={post.collectionLink}
                  className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
                >
                  <span>{post.collectionLabel}</span>
                  <span>&rarr;</span>
                </LocalizedClientLink>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
