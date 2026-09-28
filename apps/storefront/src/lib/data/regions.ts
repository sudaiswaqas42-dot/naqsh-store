"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"

let regionsCache: { data: HttpTypes.StoreRegion[]; timestamp: number } | null = null

export const listRegions = async () => {
  const now = Date.now()
  if (regionsCache && now - regionsCache.timestamp < 60000) {
    return regionsCache.data
  }

  return await sdk.client
    .fetch<{ regions: HttpTypes.StoreRegion[] }>(`/store/regions`, {
      method: "GET",
      next: { revalidate: 60, tags: ["regions"] },
      cache: "force-cache",
    })
    .then(({ regions }) => {
      regionsCache = { data: regions, timestamp: Date.now() }
      return regions
    })
}

export const retrieveRegion = async (id: string) => {
  return await sdk.client
    .fetch<{ region: HttpTypes.StoreRegion }>(`/store/regions/${id}`, {
      method: "GET",
      next: { revalidate: 60, tags: ["regions"] },
      cache: "force-cache",
    })
    .then(({ region }) => region)
}

export const getRegion = async (countryCode: string) => {
  const regions = await listRegions()

  if (!regions || regions.length === 0) {
    return null
  }

  const region = regions.find((r) =>
    r.countries?.some((c) => c?.iso_2?.toLowerCase() === countryCode.toLowerCase())
  )

  return region || regions.find((r) => r.currency_code?.toLowerCase() === "pkr") || regions[0]
}
