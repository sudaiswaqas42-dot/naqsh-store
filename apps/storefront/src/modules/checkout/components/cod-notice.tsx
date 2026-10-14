"use client"

import { useEffect, useState } from "react"
import { sdk } from "@lib/config"

type Settings = { account_name: string; account_number: string }
export default function CodNotice() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let cancelled = false
    sdk.client.fetch<{ cod_settings: Settings }>("/store/cod-settings", { cache: "no-store" })
      .then(data => { if (!cancelled) setSettings(data.cod_settings) })
      .catch(() => { if (!cancelled) setSettings(null) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])
  return <div className="mt-3 rounded-xl border border-red-200 bg-red-50/60 p-4 text-sm" aria-live="polite">
    <p className="font-semibold leading-relaxed text-red-700">Standard shipping charges of Rs. 250 must be paid in advance before your order is dispatched.</p>
    <p className="mt-1 text-xs leading-relaxed text-stone-600">Pay the remaining order amount on delivery. The Rs. 250 advance covers shipping; it is not an additional fee.</p>
    <div className="mt-3 rounded-lg border border-stone-200 bg-white p-3">
      <p className="font-semibold text-brand">JazzCash / Rs. 250</p>
      {loading ? <p className="mt-2 text-xs">Loading account details...</p> : settings?.account_name && settings.account_number ? <dl className="mt-2 space-y-2 text-xs">
        <div><dt className="text-stone-500">Account name</dt><dd className="mt-0.5 break-words font-medium">{settings.account_name}</dd></div>
        <div><dt className="text-stone-500">Account number</dt><dd className="mt-0.5 font-medium tabular-nums">{settings.account_number}</dd></div>
      </dl> : <p className="mt-2 text-xs text-stone-600">Please contact us for JazzCash payment details before sending your advance.</p>}
    </div>
  </div>
}
