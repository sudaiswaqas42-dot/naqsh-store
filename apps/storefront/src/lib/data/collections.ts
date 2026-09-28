"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

export const retrieveCollection = async (id: string) => {
  const next = {
    ...(await getCacheOptions("collections")),
  }

  return await sdk.client
    .fetch<{ collection: HttpTypes.StoreCollection }>(
      `/store/collections/${id}`,
      {
        next,
        cache: "force-cache",
      }
    )
    .then(({ collection }) => collection)
}

let collectionsCache: { data: { collections: HttpTypes.StoreCollection[]; count: number }; timestamp: number } | null = null

export const listCollections = async (
  queryParams: Record<string, string> = {}
): Promise<{ collections: HttpTypes.StoreCollection[]; count: number }> => {
  const isDefault = Object.keys(queryParams).length === 0
  const now = Date.now()
  if (isDefault && collectionsCache && now - collectionsCache.timestamp < 600000) {
    return collectionsCache.data
  }

  const next = {
    ...(await getCacheOptions("collections")),
  }

  queryParams.limit = queryParams.limit || "100"
  queryParams.offset = queryParams.offset || "0"

  return await sdk.client
    .fetch<{ collections: HttpTypes.StoreCollection[]; count: number }>(
      "/store/collections",
      {
        query: queryParams,
        next,
        cache: "force-cache",
      }
    )
    .then(({ collections }) => {
      const res = { collections, count: collections.length }
      if (isDefault) {
        collectionsCache = { data: res, timestamp: Date.now() }
      }
      return res
    })
}

const collectionHandleCache = new Map<string, { data: HttpTypes.StoreCollection; timestamp: number }>()

export const getCollectionByHandle = async (
  handle: string
): Promise<HttpTypes.StoreCollection | null> => {
  const now = Date.now()
  const cached = collectionHandleCache.get(handle)
  if (cached && now - cached.timestamp < 600000) {
    return cached.data
  }

  if (collectionsCache && now - collectionsCache.timestamp < 600000) {
    const found = collectionsCache.data.collections.find((c) => c.handle === handle)
    if (found) {
      collectionHandleCache.set(handle, { data: found, timestamp: now })
      return found
    }
  }

  const next = {
    ...(await getCacheOptions("collections")),
  }

  return await sdk.client
    .fetch<HttpTypes.StoreCollectionListResponse>(`/store/collections`, {
      query: { handle, fields: "id,title,handle" },
      next,
      cache: "force-cache",
    })
    .then(({ collections }) => {
      const col = collections[0] || null
      if (col) {
        collectionHandleCache.set(handle, { data: col, timestamp: Date.now() })
      }
      return col
    })
}
