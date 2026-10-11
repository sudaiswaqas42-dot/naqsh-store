import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text, Switch, toast } from "@medusajs/ui"
import { useState, useEffect } from "react"

export default function ProductSizing({ data: product }: { data: any }) {
  const [enabled, setEnabled] = useState(product.metadata?.enable_sizing === true)
  const [busy, setBusy] = useState(false)
  useEffect(() => setEnabled(product.metadata?.enable_sizing === true), [product.id, product.metadata?.enable_sizing])
  const save = async (value: boolean) => {
    setBusy(true)
    try {
      const response = await fetch(`/admin/products/${product.id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ metadata: { ...product.metadata, enable_sizing: value } }) })
      if (!response.ok) throw new Error("Could not save sizing preference")
      setEnabled(value)
      toast.success("Sizing preference saved")
    } catch (error) { toast.error((error as Error).message) }
    finally { setBusy(false) }
  }
  return <Container className="flex items-center justify-between gap-6"><div><Heading level="h2">Customer size selection</Heading><Text className="text-ui-fg-subtle">Off for unstitched fabrics. Add a Size option and its variants, then enable this switch to offer sizes.</Text></div><Switch aria-label="Show sizes on storefront" checked={enabled} disabled={busy} onCheckedChange={save} /></Container>
}
export const config = defineWidgetConfig({ zone: "product.details.before" })
