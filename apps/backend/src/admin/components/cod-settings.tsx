import { useEffect, useState } from "react"
import { Button, Container, Heading, Input, Text } from "@medusajs/ui"

export default function CodSettings() {
  const [settings, setSettings] = useState({ account_name: "", account_number: "", whatsapp_number: "" })
  const [loaded, setLoaded] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  useEffect(() => {
    fetch("/admin/cod-settings").then(async response => {
      if (!response.ok) throw new Error("Could not load payment and WhatsApp details. Reload to try again.")
      const data = await response.json()
      setSettings({
        account_name: data.cod_settings?.account_name || "",
        account_number: data.cod_settings?.account_number || "",
        whatsapp_number: data.cod_settings?.whatsapp_number || "",
      })
      setLoaded(true)
    }).catch(error => setMessage(error.message))
  }, [])
  return <Container className="space-y-6 p-6">
    <div>
      <Heading level="h2">COD Advance Shipping &amp; WhatsApp Concierge</Heading>
      <Text className="text-ui-fg-subtle text-sm mt-1">
        Configure your payment account details and WhatsApp support concierge. The JazzCash details appear when customers select Cash on Delivery. The WhatsApp number is used across the entire storefront (floating chat widget, product inquiries, order confirmation, cancellation, and footer).
      </Text>
    </div>
    <form className="space-y-6" onSubmit={async event => {
      event.preventDefault()
      setBusy(true)
      setMessage("")
      try {
        const response = await fetch("/admin/cod-settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) })
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || "Unable to save settings")
        setSettings({
          account_name: data.cod_settings?.account_name || "",
          account_number: data.cod_settings?.account_number || "",
          whatsapp_number: data.cod_settings?.whatsapp_number || "",
        })
        setMessage("Settings saved successfully! Storefront will now use these updated details.")
      } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to save") }
      finally { setBusy(false) }
    }}>
      <div className="space-y-3">
        <Heading level="h3" className="text-base font-semibold">1. Cash On Delivery (Advance Shipping Details)</Heading>
        <fieldset disabled={!loaded || busy} className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm font-medium">JazzCash account name<Input required maxLength={100} placeholder="e.g. NAQSH Official" value={settings.account_name} onChange={event => setSettings({ ...settings, account_name: event.target.value })} /></label>
          <label className="space-y-2 text-sm font-medium">JazzCash account number<Input required type="tel" placeholder="03XXXXXXXXX" value={settings.account_number} onChange={event => setSettings({ ...settings, account_number: event.target.value })} /></label>
        </fieldset>
      </div>

      <div className="space-y-3 pt-4 border-t border-ui-border-base">
        <Heading level="h3" className="text-base font-semibold">2. WhatsApp Concierge &amp; Customer Support</Heading>
        <fieldset disabled={!loaded || busy} className="grid gap-4">
          <label className="space-y-2 text-sm font-medium">
            WhatsApp Contact / Helpline Number
            <Input
              type="tel"
              placeholder="e.g. 03XXXXXXXXX or +92 3XX XXXXXXX"
              value={settings.whatsapp_number}
              onChange={event => setSettings({ ...settings, whatsapp_number: event.target.value })}
            />
            <span className="text-xs text-ui-fg-subtle block">
              Enter your official WhatsApp business number. Changing this here will automatically update the number across the whole store (chat button, direct product inquiries, order tracking, and footer).
            </span>
          </label>
        </fieldset>
      </div>

      <div className="pt-2">
        <Button type="submit" disabled={!loaded || busy}>{busy ? "Saving..." : "Save Payment & WhatsApp Settings"}</Button>
      </div>
      {message && <p role="status" className={`text-sm ${message.includes("success") ? "text-emerald-600 font-medium" : "text-rose-600 font-medium"}`}>{message}</p>}
    </form>
  </Container>
}
