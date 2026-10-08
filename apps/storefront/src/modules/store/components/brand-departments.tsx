import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function BrandDepartments({
  brand,
  selected,
}: {
  brand: string
  selected: string
}) {
  const departments = [
    {
      gender: "",
      title: "All Brand Collection",
      subtitle: "Browse All Cuts",
      badge: "COMPLETE",
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=85",
    },
    {
      gender: "women",
      title: "Ladies Unstitched",
      subtitle: "3pc, 2pc, Lawn & Silks",
      badge: "LADIES",
      image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=85",
    },
    {
      gender: "men",
      title: "Gents Unstitched",
      subtitle: "Pure Boski, Wash & Wear & Khaddar",
      badge: "GENTS",
      image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=85",
    },
  ]

  return (
    <section className="border-b border-stone-200 bg-[#FAF9F6] py-10 sm:py-14" aria-label="Choose a department">
      <div className="content-container">
        <div className="text-center mb-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#B6975A]">
            Department Directory
          </p>
          <h2 className="mt-1 font-serif text-2xl text-stone-900 sm:text-3xl">
            Select Your Department
          </h2>
          <p className="mt-1 text-xs text-stone-500 sm:text-sm">
            Filter brand cuts by gender or view the full designer catalog
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
          {departments.map((dept) => {
            const isCurrent = (!selected && dept.gender === "") || selected === dept.gender
            const href = dept.gender ? `/brands/${brand}?gender=${dept.gender}` : `/brands/${brand}`

            return (
              <LocalizedClientLink
                key={dept.gender || "all"}
                href={href}
                aria-current={isCurrent ? "page" : undefined}
                className="group relative flex w-28 flex-col items-center text-center sm:w-44 md:w-52"
              >
                <div
                  className={`relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-full border-2 transition-all duration-300 ${
                    isCurrent
                      ? "border-[#B6975A] shadow-xl ring-4 ring-[#B6975A]/25 scale-105"
                      : "border-stone-200 group-hover:border-[#B6975A] group-hover:scale-102"
                  }`}
                >
                  <img
                    src={dept.image}
                    alt={dept.title}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {isCurrent && (
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[#B6975A] text-white shadow-md">
                      <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                <span
                  className={`mt-3 font-serif text-xs font-semibold sm:text-base transition-colors ${
                    isCurrent ? "text-stone-900 font-bold" : "text-stone-700 group-hover:text-[#B6975A]"
                  }`}
                >
                  {dept.title}
                </span>
                <span className="text-[10px] sm:text-xs text-stone-500 font-light mt-0.5 line-clamp-1">
                  {dept.subtitle}
                </span>
              </LocalizedClientLink>
            )
          })}
        </div>
      </div>
    </section>
  )
}
