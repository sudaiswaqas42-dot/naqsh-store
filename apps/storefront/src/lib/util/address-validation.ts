export function cleanAddressValue(value: unknown) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : ""
}

export function addressFieldError(name: string, input: unknown, required = true): string {
  const value = cleanAddressValue(input)
  const field = name.split(".").pop()
  if (!value) return required ? "This field is required." : ""
  if (/[\u0000-\u001f<>]/.test(value)) return "Please enter plain text without special markup."
  if (field === "email") return value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "" : "Enter a valid email address."
  if (field === "first_name" || field === "last_name") return value.length <= 60 && /^[\p{L}\p{M}][\p{L}\p{M}\s.'’-]*$/u.test(value) ? "" : "Use letters for your name (maximum 60 characters)."
  if (field === "address_1") return value.length >= 5 && value.length <= 200 && /[\p{L}\p{N}]/u.test(value) ? "" : "Enter a complete street/house address (5–200 characters)."
  if (field === "city") return value.length >= 2 && value.length <= 80 && /^[\p{L}\p{M}\s.'’-]+$/u.test(value) ? "" : "Enter a valid city name (2–80 characters)."
  if (field === "phone") return /^(?:0|\+92|0092)3\d{9}$/.test(value.replace(/[\s()-]/g, "")) ? "" : "Enter a Pakistani mobile number, e.g. 03001234567 or +923001234567."
  if (field === "postal_code") return /^\d{5}$/.test(value) ? "" : "Enter a 5-digit postal code, or leave this optional field blank."
  if (field === "country_code") return value.toLowerCase() === "pk" ? "" : "Delivery is currently available in Pakistan only."
  return value.length <= 100 ? "" : "Use at most 100 characters."
}

export function readCheckoutAddress(form: FormData, prefix: "shipping_address" | "billing_address") {
  const values = Object.fromEntries(["first_name", "last_name", "address_1", "postal_code", "city", "country_code", "province", "phone"].map((key) => {
    const value = cleanAddressValue(form.get(`${prefix}.${key}`))
    const required = ["first_name", "last_name", "address_1", "city", "country_code"].includes(key) || (key === "phone" && prefix === "shipping_address")
    const error = addressFieldError(key, value, required)
    if (error) throw new Error(`${prefix === "shipping_address" ? "Shipping" : "Billing"} ${key.replaceAll("_", " ")}: ${error}`)
    return [key, key === "phone" ? value.replace(/[\s()-]/g, "") : value]
  }))
  return { ...values, country_code: "pk" } as { first_name: string; last_name: string; address_1: string; postal_code: string; city: string; country_code: string; province: string; phone: string }
}
