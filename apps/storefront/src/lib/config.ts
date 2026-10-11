import { getLocaleHeader } from "@lib/util/get-locale-header"
import Medusa, { FetchArgs, FetchInput } from "@medusajs/js-sdk"

export const FALLBACK_MEDUSA_BACKEND_URL = "https://naqsh-backend-production.up.railway.app"

// Defaults to standard port for Medusa server, or Railway production URL
let MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || FALLBACK_MEDUSA_BACKEND_URL

export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  debug: process.env.NODE_ENV === "development",
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
})

export const fallbackSdk = new Medusa({
  baseUrl: FALLBACK_MEDUSA_BACKEND_URL,
  debug: false,
  publishableKey:
    process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
    "pk_f5e00e96956d20bf784d23ee9052f3bf80ebab9ad4b48167b399385c4fea50a0",
})

const originalFetch = sdk.client.fetch.bind(sdk.client)

sdk.client.fetch = async <T>(
  input: FetchInput,
  init?: FetchArgs
): Promise<T> => {
  const headers = init?.headers ?? {}
  let localeHeader: Record<string, string | null> | undefined
  try {
    localeHeader = await getLocaleHeader()
    headers["x-medusa-locale"] ??= localeHeader["x-medusa-locale"]
  } catch {}

  const newHeaders = {
    ...localeHeader,
    ...headers,
  }
  init = {
    ...init,
    headers: newHeaders,
  }

  const isServerRead =
    typeof window === "undefined" &&
    (!init.method || init.method.toUpperCase() === "GET")

  const tryFetch = async (targetInput: FetchInput, timeoutMs = 8000): Promise<T> => {
    return await originalFetch<T>(targetInput, {
      ...init,
      signal: init?.signal ?? AbortSignal.timeout(timeoutMs),
    })
  }

  try {
    return await tryFetch(input, isServerRead ? 4000 : 10000)
  } catch (error: any) {
    // If local backend is down or unreachable, seamlessly fallback to live Railway production backend
    try {
      return await fallbackSdk.client.fetch<T>(input, {
        ...init,
        signal: init?.signal ?? AbortSignal.timeout(10000),
      })
    } catch (fallbackError) {
      console.warn("Fallback backend fetch error:", fallbackError)
    }

    throw error
  }
}
