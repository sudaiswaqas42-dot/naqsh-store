import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HomepageSection } from "@lib/data/homepage"

const defaultDepartments = [
  { name: "Women", slug: "women", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80" },
  { name: "Men", slug: "men", image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80" },
  { name: "Kids", slug: "children", image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80" },
]

export default function ShopDepartments({ section }: { section?: HomepageSection }) {
  const cards = (section?.settings?.cards && section.settings.cards.length > 0)
    ? section.settings.cards.map((c: any) => ({
        name: c.title || "Collection",
        slug: c.link?.replace("/categories/", "") || "women",
        link: c.link || "/categories/women",
        image: c.image_url || defaultDepartments[0].image,
      }))
    : defaultDepartments.map(d => ({
        name: `Shop ${d.name}`,
        slug: d.slug,
        link: `/categories/${d.slug}`,
        image: d.image,
      }))

  return (
    <section className="content-container py-10 sm:py-14" aria-label="Shop by department">
      {section?.title && (
        <div className="mb-6 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-accent">Curated Collections</p>
          <h2 className="mt-1 font-serif text-2xl text-brand sm:text-3xl">{section.title}</h2>
          {section.subtitle && <p className="mt-1 text-xs text-stone-500">{section.subtitle}</p>}
        </div>
      )}
      <div className="grid grid-cols-3 gap-3 sm:gap-6">
        {cards.map((department: any, idx: number) => (
          <LocalizedClientLink key={department.link + idx} href={department.link} className="group relative overflow-hidden bg-stone-100">
            <img
              src={department.image}
              alt={department.name + " collection"}
              width={500}
              height={600}
              loading="lazy"
              className="aspect-[3/4] w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-105 sm:aspect-[4/3]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
            <h3 className="absolute bottom-4 inset-x-2 text-center text-sm font-medium text-white sm:bottom-6 sm:text-2xl">
              {department.name}
            </h3>
          </LocalizedClientLink>
        ))}
      </div>
    </section>
  )
}
