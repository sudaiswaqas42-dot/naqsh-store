import { defineRouteConfig } from "@medusajs/admin-sdk"
import { SquaresPlus } from "@medusajs/icons"
import { Container, Heading, Text, Button, Input } from "@medusajs/ui"
import { useEffect, useState } from "react"
import HomepageEditor from "../../components/homepage-editor"
import InstagramManager from "../../components/instagram-manager"

function SocialLinks() {
  const [links, setLinks] = useState<Record<string, string>>({
    facebook: "",
    instagram: "",
    tiktok: "",
    pinterest: "",
  })
  const [busy, setBusy] = useState(true)
  const [message, setMessage] = useState("")
  useEffect(() => {
    fetch("/admin/social-links")
      .then(async (response) => {
        if (!response.ok)
          throw new Error("Could not load social links. Reload before editing.")
        const data = await response.json()
        setLinks(data.social_links || {})
        setBusy(false)
      })
      .catch((error) => setMessage(error.message))
  }, [])
  return (
    <Container className="space-y-5 p-6">
      <Heading level="h2">Footer social links</Heading>
      <form
        className="space-y-4"
        onSubmit={async (event) => {
          event.preventDefault()
          setBusy(true)
          try {
            const response = await fetch("/admin/social-links", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(links),
            })
            if (!response.ok) throw new Error("Could not save social links")
            setMessage("Saved. Storefront updates within one minute.")
          } catch (error: any) {
            setMessage(error.message)
          } finally {
            setBusy(false)
          }
        }}
      >
        <fieldset disabled={busy} className="grid gap-4 md:grid-cols-2">
          {["facebook", "instagram", "tiktok", "pinterest"].map((name) => (
            <label key={name} className="space-y-2 text-sm capitalize">
              {name}
              <Input
                type="url"
                value={links[name] || ""}
                placeholder="https://"
                onChange={(event) =>
                  setLinks({ ...links, [name]: event.target.value })
                }
              />
            </label>
          ))}
        </fieldset>
        <Button type="submit" disabled={busy}>
          Save links
        </Button>
        <p role="status" className="text-sm">
          {message}
        </p>
      </form>
    </Container>
  )
}

const HomepageAdminPage = () => {
  const [tab, setTab] = useState("sections")
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 md:p-8">
      <Container className="p-6">
        <Heading level="h1">Homepage</Heading>
        <Text className="mt-2 text-ui-fg-subtle">
          Edit your storefront, section by section.
        </Text>
      </Container>
      <nav
        aria-label="Homepage settings"
        className="flex flex-wrap gap-2 border-b pb-3"
      >
        {[
          ["sections", "Sections"],
          ["products", "Prices & promotions"],
          ["instagram", "Instagram"],
          ["social", "Social links"],
        ].map(([id, label]) => (
          <Button
            key={id}
            variant={tab === id ? "primary" : "secondary"}
            onClick={() => setTab(id)}
          >
            {label}
          </Button>
        ))}
      </nav>
      <div hidden={tab !== "sections"}>
        <HomepageEditor />
      </div>
      {tab === "products" && (
        <Container className="space-y-4 p-6">
          <Heading level="h2">Product prices and checkout discounts</Heading>
          <Text>
            Set each variant's price in Products. Use Promotions for coupon
            codes and automatic discounts, including discounts limited to
            selected products or categories.
          </Text>
          <div className="flex flex-wrap gap-4">
            <a className="underline" href="/app/products">
              Products & variant prices
            </a>
            <a className="underline" href="/app/promotions">
              Coupons & automatic promotions
            </a>
            <a className="underline" href="/app/price-lists">
              Sale price lists
            </a>
          </div>
          <Text className="text-ui-fg-subtle">
            Homepage product sections use catalog prices. Banner text and custom
            card prices are promotional content; they do not change the amount
            charged at checkout.
          </Text>
        </Container>
      )}
      {tab === "instagram" && <InstagramManager onConnected={() => {}} />}
      {tab === "social" && <SocialLinks />}
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Homepage Editor",
  icon: SquaresPlus,
})
export default HomepageAdminPage
