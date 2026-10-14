import { useEffect, useState } from "react"
import { Button, Container, Heading, Input, Text } from "@medusajs/ui"

export default function CodSettings() {
  const [settings, setSettings] = useState({ account_name: "", account_number: "" })
  const [loaded, setLoaded] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  useEffect(() => {
    fetch("/admin/cod-settings").then(async response => {
      if (!response.ok) throw new Error("Could not load payment details. Reload to try again.")
      const data = await response.json()
      setSettings(data.cod_settings)
      setLoaded(true)
    }).catch(error => setMessage(error.message))
  }, [])
  return <Container className="space-y-4 p-6">
    <Heading level="h2">COD advance shipping / JazzCash</Heading>
    <Text>Customers must pay Rs. 250 standard shipping in advance before dispatch. These account details appear when they select Cash on Delivery in the cart or checkout.</Text>
    <form className="space-y-4" onSubmit={async event => {
      event.preventDefault()
      setBusy(true)
      setMessage("")
      try {
        const response = await fetch("/admin/cod-settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) })
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || "Unable to save payment details")
        setSettings(data.cod_settings)
        setMessage("Saved. Customers will see these details on their next page load.")
      } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to save") }
      finally { setBusy(false) }
    }}>
      <fieldset disabled={!loaded || busy} className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm">JazzCash account name<Input required maxLength={100} value={settings.account_name} onChange={event => setSettings({ ...settings, account_name: event.target.value })} /></label>
        <label className="space-y-2 text-sm">JazzCash account number<Input required type="tel" placeholder="03XXXXXXXXX" value={settings.account_number} onChange={event => setSettings({ ...settings, account_number: event.target.value })} /></label>
      </fieldset>
      <Button type="submit" disabled={!loaded || busy}>{busy ? "Saving..." : "Save JazzCash details"}</Button>
      <p role="status" className="text-sm">{message}</p>
    </form>
  </Container>
}
