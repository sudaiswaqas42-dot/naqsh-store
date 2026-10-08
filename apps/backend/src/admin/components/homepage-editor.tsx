import { homepagePresets } from "./homepage-presets"
import { INITIAL_HOMEPAGE_BLUEPRINT } from "../../modules/homepage/default-sections"
import { useEffect, useState } from "react"
import { Button, Input } from "@medusajs/ui"
import ConfirmDialog from "./confirm-dialog"

type Section = {
  id: string
  key: string
  type: string
  title: string
  subtitle?: string
  cta_text?: string
  cta_link?: string
  collection_id?: string
  rank: number
  is_active: boolean
  settings: Record<string, any> | null
}
const types: Record<string, string> = {
  hero_slider: "Hero slideshow",
  features_strip: "Service promises",
  featured_categories: "Category cards",
  product_carousel: "Products",
  sale_banner: "Sale countdown",
  promo_banner: "Image banners",
  lookbook: "Lookbook",
  customer_reviews: "Customer reviews",
  fabric_strip: "Fabric cards",
  instagram_feed: "Instagram reels",
  cards_grid: "Custom cards",
  newsletter: "Newsletter",
}
const listKeys: Record<string, string> = {
  hero_slider: "slides",
  features_strip: "items",
  featured_categories: "cards",
  cards_grid: "cards",
  custom_cards: "cards",
  fabric_strip: "cards",
  promo_banner: "cards",
  lookbook: "cards",
}
const fields: Record<string, string[]> = {
  hero_slider: [
    "title",
    "sub",
    "eyebrow",
    "tag",
    "image",
    "cta_text",
    "cta_link",
  ],
  features_strip: ["title", "desc", "icon"],
  featured_categories: ["title", "subtitle", "image_url", "link", "badge"],
  fabric_strip: ["title", "subtitle", "image_url", "link", "badge"],
  lookbook: ["title", "subtitle", "image_url", "price", "link"],
  promo_banner: ["title", "subtitle", "image_url", "badge", "cta_text", "link"],
  default: [
    "title",
    "subtitle",
    "image_url",
    "link",
    "badge",
    "price",
    "original_price",
  ],
}
const labels: Record<string, string> = {
  sub: "Description",
  desc: "Description",
  image_url: "Image",
  image: "Image",
  cta_text: "Button text",
  cta_link: "Button destination",
  link: "Destination",
  price: "Display price (PKR)",
  original_price: "Compare-at price (PKR)",
  icon: "Icon label",
  eyebrow: "Small heading",
  tag: "Tag",
  badge: "Badge",
  subtitle: "Subheading",
  title: "Heading",
}

async function request(path: string, body?: unknown, method = "POST") {
  const response = await fetch(
    path,
    body === undefined && method !== "DELETE"
      ? undefined
      : {
          method,
          headers: { "Content-Type": "application/json" },
          body: body === undefined ? undefined : JSON.stringify(body),
        },
  )
  const data = await response.json()
  if (!response.ok)
    throw new Error(
      data.message || data.error || "Request failed. Please retry.",
    )
  return data
}

function Field({
  name,
  value,
  onChange,
  numeric = false,
}: {
  name: string
  value: any
  onChange: (value: any) => void
  numeric?: boolean
}) {
  return (
    <label className="flex flex-col gap-2 text-sm">
      <span className="font-medium">{labels[name] || name}</span>
      <Input
        type={numeric ? "number" : "text"}
        min={numeric ? 0 : undefined}
        value={value ?? ""}
        onChange={(event) =>
          onChange(
            numeric && event.target.value !== ""
              ? Number(event.target.value)
              : event.target.value,
          )
        }
      />
    </label>
  )
}

function ImageField({
  name,
  value,
  onChange,
}: {
  name: string
  value: string
  onChange: (value: string) => void
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  return (
    <div className="space-y-2">
      <Field name={name} value={value} onChange={onChange} />
      <div className="flex items-center gap-3">
        {value && (
          <img
            src={value}
            alt="Selected image"
            className="h-16 w-16 rounded border object-cover"
          />
        )}
        <label className="text-sm">
          {busy ? "Uploading..." : "Upload image"}
          <input
            className="block mt-1 max-w-full text-xs"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            disabled={busy}
            onChange={async (event) => {
              const file = event.target.files?.[0]
              if (!file) return
              if (file.size > 10 * 1024 * 1024) {
                setError("Choose an image smaller than 10 MB.")
                return
              }
              setBusy(true)
              setError("")
              try {
                const body = new FormData()
                body.append("files", file)
                const response = await fetch("/admin/uploads", {
                  method: "POST",
                  body,
                })
                const data = await response.json()
                if (!response.ok || !data.files?.[0]?.url)
                  throw new Error(data.message || "Image upload failed")
                onChange(data.files[0].url)
              } catch (error: any) {
                setError(error.message)
              } finally {
                setBusy(false)
              }
            }}
          />
        </label>
      </div>
      {error && (
        <p role="alert" className="text-red-600 text-sm">
          {error}
        </p>
      )}
    </div>
  )
}

function ProductPicker({
  ids,
  onChange,
}: {
  ids: string[]
  onChange: (ids: string[]) => void
}) {
  const [query, setQuery] = useState("")
  const [products, setProducts] = useState<any[]>([])
  const [error, setError] = useState("")
  useEffect(() => {
    let active = true
    const timer = setTimeout(() => {
      request(
        `/admin/products?limit=30&q=${encodeURIComponent(query)}&fields=id,title,thumbnail,status`,
      )
        .then((data) => {
          if (active) {
            setProducts(data.products || [])
            setError("")
          }
        })
        .catch((error) => {
          if (active) setError(error.message)
        })
    }, 250)
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [query])
  return (
    <div className="space-y-3">
      <p className="text-sm text-ui-fg-subtle">
        Choose published products. Prices, variants and inventory come from the
        product catalog.
      </p>
      <Input
        aria-label="Search products"
        placeholder="Search your entire product catalog..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      {error && <p role="alert">{error}</p>}
      <div className="max-h-64 overflow-auto divide-y rounded border">
        {products.map((product) => (
          <label
            key={product.id}
            className="flex gap-3 items-center p-3 text-sm"
          >
            <input
              type="checkbox"
              checked={ids.includes(product.id)}
              onChange={(event) =>
                onChange(
                  event.target.checked
                    ? [...ids, product.id]
                    : ids.filter((id) => id !== product.id),
                )
              }
            />
            <span>
              {product.title}{" "}
              <span className="text-ui-fg-muted">({product.status})</span>
            </span>
          </label>
        ))}
      </div>
      <div className="space-y-2">
        {ids.map((id, index) => (
          <div key={id} className="flex flex-wrap items-center gap-2 text-xs">
            <a href={`/app/products/${id}`} className="underline">
              {index + 1}. {products.find((p) => p.id === id)?.title || id}
            </a>
            <Button
              size="small"
              variant="secondary"
              disabled={!index}
              onClick={() => {
                const next = [...ids]
                ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
                onChange(next)
              }}
            >
              Move up
            </Button>
            <Button
              size="small"
              variant="secondary"
              onClick={() => onChange(ids.filter((value) => value !== id))}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}

function SectionForm({
  section,
  onSaved,
}: {
  section: Section
  onSaved: () => Promise<void>
}) {
  const [draft, setDraft] = useState<Section>(() => ({
    ...structuredClone(section),
    rank: 0,
  }))
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const dirty =
    JSON.stringify(draft) !== JSON.stringify({ ...section, rank: 0 })
  const savedContent = JSON.stringify({ ...section, rank: 0 })
  useEffect(() => {
    setDraft(JSON.parse(savedContent))
  }, [savedContent])
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (dirty) {
        event.preventDefault()
        event.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [dirty])
  const settings = draft.settings || {}
  const setting = (key: string, value: any) =>
    setDraft((current) => ({
      ...current,
      settings: { ...current.settings, [key]: value },
    }))
  const listKey = listKeys[draft.type]
  const items: any[] =
    settings[listKey] ??
    (draft.type === "promo_banner" &&
    (settings.banner_left || settings.banner_right)
      ? [settings.banner_left, settings.banner_right]
          .filter(Boolean)
          .map((item) => ({
            ...item,
            image_url: item.image,
            cta_text: item.cta,
            badge: item.label,
          }))
      : [])
  const itemFields = fields[draft.type] || fields.default
  const changeItem = (index: number, key: string, value: any) =>
    setting(
      listKey,
      items.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    )
  const save = async (restart = false) => {
    setBusy(true)
    setMessage("")
    try {
      const { id, key, type, rank, ...data } = draft
      await request(`/admin/homepage-sections/${id}`, {
        ...data,
        restart_countdown: restart,
      })
      await onSaved()
      setMessage("Saved. Storefront updates within one minute.")
    } catch (error: any) {
      setMessage(error.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="space-y-6 border-t p-5">
      <fieldset disabled={busy} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {(draft.type === "customer_reviews"
            ? ["title", "subtitle"]
            : ["title", "subtitle", "cta_text", "cta_link"]
          ).map((name) => (
            <Field
              key={name}
              name={name}
              value={(draft as any)[name]}
              onChange={(value) =>
                setDraft((current) => {
                  const slideField = name === "subtitle" ? "sub" : name
                  const slides = current.settings?.slides
                  return {
                    ...current,
                    [name]: value,
                    ...(current.type === "hero_slider" && slides?.length
                      ? {
                          settings: {
                            ...current.settings,
                            slides: slides.map((slide: any, index: number) =>
                              index ? slide : { ...slide, [slideField]: value },
                            ),
                          },
                        }
                      : {}),
                  }
                })
              }
            />
          ))}
        </div>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={draft.is_active}
            onChange={(event) =>
              setDraft({ ...draft, is_active: event.target.checked })
            }
          />
          Visible on homepage
        </label>
        {!["hero_slider", "sale_banner", "flash_sale"].includes(draft.type) && (
          <Field
            name="eyebrow"
            value={settings.eyebrow}
            onChange={(value) => setting("eyebrow", value)}
          />
        )}
        {listKey && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">
                {draft.type === "hero_slider" ? "Slides" : "Content items"} (
                {items.length})
              </h3>
              <Button
                variant="secondary"
                size="small"
                onClick={() =>
                  setting(listKey, [
                    ...items,
                    {
                      id: crypto.randomUUID(),
                      title: "New item",
                      link: "/store",
                      cta_link: "/store",
                    },
                  ])
                }
              >
                Add item
              </Button>
            </div>
            {!Object.prototype.hasOwnProperty.call(settings, listKey) && (
              <p className="text-sm text-ui-fg-subtle">
                This section currently uses its original template. Add items to
                replace it, or clear all to display no items.
              </p>
            )}
            {items.map((item, index) => (
              <details
                key={item.id || index}
                className="rounded-lg border bg-ui-bg-subtle"
                open={undefined}
              >
                <summary className="cursor-pointer p-4 text-sm font-medium">
                  {index + 1}. {item.title || "Untitled item"}
                </summary>
                <div className="p-4 pt-0 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    {itemFields.map((name) =>
                      name === "image" || name === "image_url" ? (
                        <ImageField
                          key={name}
                          name={name}
                          value={item[name] || ""}
                          onChange={(value) => changeItem(index, name, value)}
                        />
                      ) : (
                        <Field
                          key={name}
                          name={name}
                          value={item[name]}
                          numeric={["price", "original_price"].includes(name)}
                          onChange={(value) => changeItem(index, name, value)}
                        />
                      ),
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="small"
                      variant="secondary"
                      disabled={!index}
                      onClick={() => {
                        const next = [...items]
                        ;[next[index - 1], next[index]] = [
                          next[index],
                          next[index - 1],
                        ]
                        setting(listKey, next)
                      }}
                    >
                      Move up
                    </Button>
                    <Button
                      size="small"
                      variant="secondary"
                      disabled={index === items.length - 1}
                      onClick={() => {
                        const next = [...items]
                        ;[next[index + 1], next[index]] = [
                          next[index],
                          next[index + 1],
                        ]
                        setting(listKey, next)
                      }}
                    >
                      Move down
                    </Button>
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() =>
                        setting(listKey, [
                          ...items.slice(0, index + 1),
                          { ...item, id: crypto.randomUUID() },
                          ...items.slice(index + 1),
                        ])
                      }
                    >
                      Duplicate
                    </Button>
                    <Button
                      size="small"
                      variant="danger"
                      onClick={() =>
                        setting(
                          listKey,
                          items.filter((_, i) => i !== index),
                        )
                      }
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </details>
            ))}
            <Button
              size="small"
              variant="secondary"
              onClick={() => setShowClearConfirm(true)}
            >
              Clear all items
            </Button>
            {["cards_grid", "custom_cards"].includes(draft.type) && (
              <p className="text-xs text-ui-fg-subtle">
                These are promotional display cards. For purchasable products
                with checkout prices, add a Products section.
              </p>
            )}
          </div>
        )}
        {draft.type === "product_carousel" && (
          <ProductPicker
            ids={settings.product_ids || []}
            onChange={(ids) => setting("product_ids", ids)}
          />
        )}
        {["sale_banner", "flash_sale"].includes(draft.type) && (
          <div className="space-y-4">
            <p className="text-sm text-ui-fg-subtle">
              The banner advertises your promotion. Create the matching discount
              under Promotions so it also applies at checkout.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                "badge",
                "promo_code",
                "days",
                "hours",
                "minutes",
                "seconds",
              ].map((name) => (
                <Field
                  key={name}
                  name={name}
                  numeric={["days", "hours", "minutes", "seconds"].includes(
                    name,
                  )}
                  value={settings[name]}
                  onChange={(value) => setting(name, value)}
                />
              ))}
            </div>
            <ImageField
              name="image_url"
              value={settings.image_url || ""}
              onChange={(value) => setting("image_url", value)}
            />
            <p className="text-xs">
              Ends:{" "}
              {settings.ends_at
                ? new Date(settings.ends_at).toLocaleString()
                : "Set a countdown duration"}
            </p>
            <Button variant="secondary" onClick={() => save(true)}>
              Save and restart countdown
            </Button>
          </div>
        )}
        {draft.type === "customer_reviews" && (
          <p className="text-sm">
            Approve, edit and remove customer reviews in{" "}
            <a className="underline" href="/app/reviews">
              Reviews
            </a>
            . This section uses approved reviews only.
          </p>
        )}
        {draft.type === "instagram_feed" && (
          <p className="text-sm">
            Manage the connected account and videos in the Instagram tab above.
          </p>
        )}
      </fieldset>
      <div className="flex flex-wrap items-center gap-3 border-t pt-4">
        <Button disabled={busy || !dirty} onClick={() => save()}>
          {busy ? "Saving..." : "Save section"}
        </Button>
        <Button
          disabled={busy || !dirty}
          variant="secondary"
          onClick={() => setDraft({ ...structuredClone(section), rank: 0 })}
        >
          Discard changes
        </Button>
        <span role="status" className="text-sm">
          {message || (dirty ? "Unsaved changes" : "All changes saved")}
        </span>
      </div>
      <ConfirmDialog
        isOpen={showClearConfirm}
        title="Clear All Items?"
        description="Are you sure you want to remove every item from this section? You will need to save to publish this change."
        confirmLabel="Clear All Items"
        onConfirm={() => {
          setting(listKey, [])
          setShowClearConfirm(false)
        }}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  )
}

export default function HomepageEditor() {
  const [sections, setSections] = useState<Section[]>([])
  const [type, setType] = useState("cards_grid")
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [sectionToDelete, setSectionToDelete] = useState<Section | null>(null)
  const load = async () => {
    const data = await request("/admin/homepage-sections")
    setSections(
      (data.sections || []).map((section: Section) => {
        const blueprint = INITIAL_HOMEPAGE_BLUEPRINT.find(
          (item) => item.type === section.type,
        )
        const defaults =
          homepagePresets[section.type] || blueprint?.settings || {}
        return { ...section, settings: { ...defaults, ...section.settings } }
      }),
    )
  }
  useEffect(() => {
    load()
      .catch((error) => setError(error.message))
      .finally(() => setLoading(false))
  }, [])
  const mutate = async (action: () => Promise<unknown>) => {
    setBusy(true)
    setError("")
    try {
      await action()
      await load()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setBusy(false)
    }
  }
  const move = (index: number, direction: number) =>
    mutate(async () => {
      const next = [...sections]
      const other = next[index + direction]
      next[index + direction] = next[index]
      next[index] = other
      await request("/admin/homepage-sections", {
        reorder: true,
        sections: next.map((section, rank) => ({ id: section.id, rank })),
      })
    })
  return (
    <div className="space-y-5">
      <div className="rounded-lg border bg-ui-bg-base p-5 space-y-4">
        <h2 className="text-lg font-semibold">Homepage sections</h2>
        <p className="text-sm text-ui-fg-subtle">
          Open a section to edit its content. Changes go live when you save.
          Arrange sections with Move up / down.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <select
            aria-label="New section type"
            className="rounded border bg-ui-bg-base p-2 text-sm"
            value={type}
            onChange={(event) => setType(event.target.value)}
          >
            {Object.entries(types).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <Button
            disabled={busy}
            onClick={() =>
              mutate(() =>
                request("/admin/homepage-sections", {
                  key: `custom_${crypto.randomUUID()}`,
                  type,
                  title: types[type],
                  rank: sections.length
                    ? Math.max(...sections.map((section) => section.rank)) + 1
                    : 0,
                  is_active: false,
                  settings:
                    type === "product_carousel"
                      ? { product_ids: [] }
                      : listKeys[type]
                        ? { [listKeys[type]]: [] }
                        : {},
                }),
              )
            }
          >
            Add section
          </Button>
          <span className="text-xs text-ui-fg-subtle">
            New sections start hidden.
          </span>
        </div>
      </div>
      {error && (
        <div
          role="alert"
          className="rounded border border-red-300 p-4 text-red-600"
        >
          {error}
          <Button variant="secondary" size="small" onClick={() => mutate(load)}>
            Retry
          </Button>
        </div>
      )}
      {loading ? (
        <p>Loading sections...</p>
      ) : sections.length === 0 ? (
        <p className="p-6 text-sm">
          No homepage sections. Add a section to get started.
        </p>
      ) : (
        sections.map((section, index) => (
          <details key={section.id} className="rounded-lg border bg-ui-bg-base">
            <summary className="cursor-pointer p-5">
              <span className="mr-3 text-ui-fg-muted">{index + 1}.</span>
              <span className="font-semibold">
                {section.title || types[section.type] || section.type}
              </span>
              <span className="ml-3 text-xs text-ui-fg-subtle">
                {types[section.type] || section.type} /{" "}
                {section.is_active ? "Visible" : "Hidden"}
              </span>
            </summary>
            <div className="flex flex-wrap gap-2 px-5 pb-4">
              <Button
                size="small"
                variant="secondary"
                disabled={busy || index === 0}
                onClick={() => move(index, -1)}
              >
                Move up
              </Button>
              <Button
                size="small"
                variant="secondary"
                disabled={busy || index === sections.length - 1}
                onClick={() => move(index, 1)}
              >
                Move down
              </Button>
              <Button
                size="small"
                variant="secondary"
                disabled={busy}
                onClick={() =>
                  mutate(() => {
                    const { id, key, ...data } = section
                    return request("/admin/homepage-sections", {
                      ...data,
                      key: `custom_${crypto.randomUUID()}`,
                      title: `${section.title} (copy)`,
                      is_active: false,
                      rank:
                        Math.max(...sections.map((value) => value.rank)) + 1,
                    })
                  })
                }
              >
                Duplicate section
              </Button>
              <Button
                size="small"
                variant="danger"
                disabled={busy}
                onClick={() => setSectionToDelete(section)}
              >
                Delete section
              </Button>
            </div>
            <SectionForm section={section} onSaved={load} />
          </details>
        ))
      )}
      <ConfirmDialog
        isOpen={!!sectionToDelete}
        title={`Delete "${sectionToDelete?.title || "Section"}"?`}
        description="Are you sure you want to permanently delete this section and all of its content? This action cannot be undone."
        confirmLabel="Delete Section"
        onConfirm={() => {
          if (sectionToDelete) {
            const id = sectionToDelete.id
            setSectionToDelete(null)
            void mutate(() =>
              request(`/admin/homepage-sections/${id}`, undefined, "DELETE"),
            )
          }
        }}
        onCancel={() => setSectionToDelete(null)}
      />
    </div>
  )
}
