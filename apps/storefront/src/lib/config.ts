import { getLocaleHeader } from "@lib/util/get-locale-header"
import Medusa, { FetchArgs, FetchInput } from "@medusajs/js-sdk"

// Defaults to standard port for Medusa server
let MEDUSA_BACKEND_URL = "http://localhost:9000"

if (process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL) {
  MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
}

export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  debug: process.env.NODE_ENV === "development",
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
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
  const isServerRead = typeof window === "undefined" &&
    (!init.method || init.method.toUpperCase() === "GET")
  if (!isServerRead) return originalFetch(input, init)

  for (let attempt = 0; ; attempt++) {
    try {
      return await originalFetch<T>(input, {
        ...init,
        signal: init.signal ?? AbortSignal.timeout(10000),
      })
    } catch (error) {
      const status = (error as { status?: number }).status
      const transient = !status || status === 408 || status === 429 || status >= 500
      if (attempt >= 1 || !transient || init.signal?.aborted) throw error
      await new Promise((resolve) => setTimeout(resolve, 250))
    }
  }
}
