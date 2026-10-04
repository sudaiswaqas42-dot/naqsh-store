"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"

let regionsCache: { data: HttpTypes.StoreRegion[]; timestamp: number } | null = null

export const listRegions = async () => {
  const now = Date.now()
  if (regionsCache && now - regionsCache.timestamp < 600000) {
    return regionsCache.data
  }

  try {
    const { regions } = await sdk.client.fetch<{ regions: HttpTypes.StoreRegion[] }>(`/store/regions`, {
      method: "GET",
      next: { revalidate: 60, tags: ["regions"] },
      cache: "force-cache",
    })
    if (Array.isArray(regions) && regions.length > 0) {
      regionsCache = { data: regions, timestamp: Date.now() }
      return regions
    }
    return regionsCache?.data || []
  } catch (err) {
    console.error("listRegions error:", err)
    return regionsCache?.data || []
  }
}

export const retrieveRegion = async (id: string) => {
  try {
    const { region } = await sdk.client.fetch<{ region: HttpTypes.StoreRegion }>(`/store/regions/${id}`, {
      method: "GET",
      next: { revalidate: 60, tags: ["regions"] },
      cache: "force-cache",
    })
    return region
  } catch (err) {
    console.error("retrieveRegion error:", err)
    return null
  }
}

export const getRegion = async (countryCode: string) => {
  const regions = await listRegions().catch(() => [])

  if (!regions || regions.length === 0) {
    return {
      id: "reg_01M3EW98QY2SGP87H13WFBDRM5",
      name: "Pakistan",
      currency_code: "pkr",
      countries: [{ iso_2: "pk" }],
    } as any
  }

  const region = regions.find((r) =>
    r.countries?.some((c) => c?.iso_2?.toLowerCase() === (countryCode || "pk").toLowerCase())
  )

  return (
    region ||
    regions.find((r) => r.currency_code?.toLowerCase() === "pkr") ||
    regions[0]
  )
}
