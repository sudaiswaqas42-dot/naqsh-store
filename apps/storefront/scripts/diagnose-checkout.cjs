const fs = require("node:fs")
const path = require("node:path")

async function main() {
  const base = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
  const headers = {
    "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
    "content-type": "application/json",
  }
  async function api(path, body) {
    const response = await fetch(base + path, {
      method: body ? "POST" : "GET", headers,
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(30000),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(`${path}: ${response.status} ${data.message || data.error || "Request failed"}`)
    return data
  }
  console.log("Backend:", new URL(base).origin)
  console.log("SMTP password configured:", !!(process.env.SMTP_PASSWORD || process.env.EMAIL_PASS))
  if (process.argv.includes("--otp")) {
    const result = await api("/store/auth/forgot-password/send-otp", { email: "sudaiswaqas18@gmail.com" })
    console.log("Live password reset:", { success: result.success, message: result.message })
    return
  }
  const { regions } = await api("/store/regions")
  console.log("Regions:", regions.map(r => ({ id: r.id, countries: r.countries.map(c => c.iso_2) })))
  const region = regions.find(r => r.countries.some(c => c.iso_2 === "pk"))
  if (!region) throw new Error("Pakistan region missing")
  const { payment_providers } = await api(`/store/payment-providers?region_id=${region.id}`)
  console.log("Payment providers:", payment_providers.map(p => p.id))
  if (process.argv.includes("--existing")) {
    const saved = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../../../tmp/checkout-diagnostic.json")))
    if (saved.backend !== base) throw new Error("Diagnostic cart backend mismatch")
    const { shipping_options } = await api(`/store/shipping-options?cart_id=${saved.cart_id}`)
    console.log("Shipping:", shipping_options.map(s => ({ id: s.id, name: s.name, amount: s.amount })))
    const standard = shipping_options.find(s => s.name === "Standard Delivery (TCS / Leopards)" && s.amount === 250)
    if (!standard) throw new Error("Standard delivery unavailable")
    const { cart } = await api(`/store/carts/${saved.cart_id}/shipping-methods`, { option_id: standard.id })
    console.log("Selected delivery total:", cart.shipping_total)
    const { payment_collection } = await api("/store/payment-collections", { cart_id: saved.cart_id })
    const payment = await api(`/store/payment-collections/${payment_collection.id}/payment-sessions`, { provider_id: "pp_system_default" })
    console.log("COD session:", payment.payment_collection.payment_sessions.map(s => ({ provider: s.provider_id, status: s.status })))
    return
  }
  if (process.argv.includes("--cart")) {
    const { products } = await api(`/store/products?limit=12&region_id=${region.id}&fields=id,title,*variants.calculated_price,+variants.inventory_quantity`)
    const variant = products.flatMap(p => p.variants).find(v => v.calculated_price?.calculated_amount != null && (!v.manage_inventory || v.allow_backorder || v.inventory_quantity > 0))
    if (!variant) throw new Error("No purchasable diagnostic variant found")
    const { cart } = await api("/store/carts", {
      region_id: region.id,
      items: [{ variant_id: variant.id, quantity: 1 }],
      shipping_address: { first_name: "Checkout", last_name: "Diagnostic", address_1: "Diagnostic address", city: "Karachi", country_code: "pk", postal_code: "74000" },
      metadata: { purpose: "checkout-diagnostic-no-order" },
    })
    const { shipping_options } = await api(`/store/shipping-options?cart_id=${cart.id}`)
    console.log("Shipping:", shipping_options.map(s => ({ id: s.id, name: s.name, amount: s.amount })))
    fs.writeFileSync(path.resolve(__dirname, "../../../tmp/checkout-diagnostic.json"), JSON.stringify({ cart_id: cart.id, backend: base, region_id: region.id, shipping_options: shipping_options.map(s => ({ id: s.id, name: s.name, amount: s.amount })) }))
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1 })
