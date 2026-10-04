import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function PromoBanners({ section }: { section?: any }) {
  const settings = section?.settings || {}
  const cards = settings.cards ?? [settings.banner_left, settings.banner_right].filter(Boolean).map((card: any) => ({ ...card, image_url: card.image, badge: card.label, cta_text: card.cta }))
  return <section className="py-16 bg-stone-50"><div className="content-container mx-auto px-4">
    <div className="text-center mb-10">{settings.eyebrow && <p className="text-xs uppercase tracking-widest text-accent">{settings.eyebrow}</p>}<h2 className="font-serif text-3xl text-brand">{section?.title}</h2><p className="mt-2 text-sm text-stone-500">{section?.subtitle}</p></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{cards.map((card: any, index: number) => <LocalizedClientLink key={card.id || index} href={card.link || "/store"} className="group relative min-h-[420px] p-8 flex flex-col justify-end bg-brand text-white overflow-hidden">
      {card.image_url && <img src={card.image_url} alt={card.title || ""} className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105" />}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" /><div className="relative space-y-3">{card.badge && <p className="text-xs uppercase tracking-widest">{card.badge}</p>}<h3 className="font-serif text-3xl">{card.title}</h3><p>{card.subtitle}</p>{card.cta_text && <span className="inline-block bg-white px-6 py-3 text-brand text-sm">{card.cta_text}</span>}</div>
    </LocalizedClientLink>)}</div>{section?.cta_text && <div className="mt-8 text-center"><LocalizedClientLink className="underline" href={section.cta_link || "/store"}>{section.cta_text}</LocalizedClientLink></div>}
  </div></section>
}
