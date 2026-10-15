import { sdk } from "@lib/config"

export type CodSettings = {
  account_name: string
  account_number: string
  whatsapp_number?: string
  shipping_advance: number
}

export function normalizeWhatsApp(num?: string | null) {
  if (!num) return { digits: "", display: "", isValid: false }

  let digits = num.replace(/[^\d]/g, "")
  if (digits.startsWith("0092")) {
    digits = "92" + digits.slice(4)
  } else if (digits.startsWith("0") && digits.length === 11) {
    digits = "92" + digits.slice(1)
  } else if (digits.length === 10 && digits.startsWith("3")) {
    digits = "92" + digits
  }

  let display = num.trim()
  if (digits.startsWith("92") && digits.length === 12) {
    display = `+92 ${digits.slice(2, 5)} ${digits.slice(5)}`
  }

  return {
    digits,
    display,
    isValid: digits.length >= 10,
  }
}

export function getWhatsAppUrl(num?: string | null, message?: string) {
  const { digits, isValid } = normalizeWhatsApp(num)
  if (!isValid || !digits) return ""
  const encodedMsg = message ? encodeURIComponent(message) : ""
  return `https://wa.me/${digits}${encodedMsg ? `?text=${encodedMsg}` : ""}`
}

let cachedSettingsPromise: Promise<CodSettings | null> | null = null

export function fetchCodSettingsClient(): Promise<CodSettings | null> {
  if (typeof window === "undefined") return Promise.resolve(null)
  if (!cachedSettingsPromise) {
    cachedSettingsPromise = sdk.client
      .fetch<{ cod_settings: CodSettings }>("/store/cod-settings", { cache: "no-store" })
      .then(data => data.cod_settings || null)
      .catch(() => null)
  }
  return cachedSettingsPromise
}
