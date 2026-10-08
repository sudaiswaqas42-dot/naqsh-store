import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HomepageSection } from "@lib/data/homepage"

const defaultArticles = [
  { title: "The art of luxury lawn", text: "A closer look at the fabrics behind your favourite summer pieces.", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80", link: "/blog#art-of-pakistani-lawn" },
  { title: "Celebrating embroidery", text: "Discover the detail and heritage of zardozi and tilla.", image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80", link: "/blog#reviving-zardozi-and-tilla" },
  { title: "Everyday, beautifully styled", text: "Find inspiration in timeless colours and effortless matching sets.", image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80", link: "/blog#modern-monochrome-unstitched" },
]

export default function JournalPreview({ section }: { section?: HomepageSection }) {
  const articles = (section?.settings?.cards && section.settings.cards.length > 0)
    ? section.settings.cards.map((c: any) => ({
        title: c.title || "The Journal Story",
        text: c.subtitle || "Exploring the heritage and craft behind our pieces.",
        image: c.image_url || defaultArticles[0].image,
        link: c.link || "/blog",
      }))
    : defaultArticles

  return (
    <section className="content-container py-14 sm:py-20">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-accent">{section?.subtitle || "The NAQSH Journal"}</p>
          <h2 className="mt-2 font-serif text-3xl text-brand">{section?.title || "Stories & Style"}</h2>
        </div>
        <LocalizedClientLink href="/blog" className="text-xs underline underline-offset-4">
          Read the blog
        </LocalizedClientLink>
      </div>
      <div className="grid gap-6 sm:grid-cols-3">
        {articles.map((article: any, idx: number) => (
          <LocalizedClientLink key={article.link + idx} href={article.link} className="group">
            <img
              src={article.image}
              alt={article.title}
              width={600}
              height={400}
              loading="lazy"
              className="aspect-[3/2] w-full object-cover"
            />
            <h3 className="mt-4 font-serif text-xl text-brand group-hover:underline">
              {article.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-500">
              {article.text}
            </p>
          </LocalizedClientLink>
        ))}
      </div>
    </section>
  )
}
