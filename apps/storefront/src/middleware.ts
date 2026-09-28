import { HttpTypes } from "@medusajs/types"
import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "pk"

const regionMapCache = {
  regionMap: new Map<string, HttpTypes.StoreRegion>([
    [DEFAULT_REGION, { id: "reg_pk", name: "Pakistan", currency_code: "pkr", countries: [{ iso_2: "pk" }] } as unknown as HttpTypes.StoreRegion]
  ]),
  regionMapUpdated: 0,
}

async function getRegionMap() {
  const { regionMap, regionMapUpdated } = regionMapCache

  if (!BACKEND_URL) {
    return regionMap
  }

  // Fetch regions from Medusa if not already cached
  if (regionMapUpdated < Date.now() - 3600 * 1000) {
    try {
      const response = await fetch(`${BACKEND_URL}/store/regions`, {
        method: "GET",
        headers: {
          "x-publishable-api-key": PUBLISHABLE_API_KEY!,
        },
        next: {
          revalidate: 3600,
          tags: ["regions"],
        },
        cache: "force-cache",
        signal: AbortSignal.timeout(3000),
      })

      if (response.ok) {
        const json = await response.json()
        const { regions } = json

        if (regions?.length) {
          regionMapCache.regionMap.clear()
          regions.forEach((region: HttpTypes.StoreRegion) => {
            region.countries?.forEach((c) => {
              regionMapCache.regionMap.set(c.iso_2 ?? "", region)
            })
          })
          regionMapCache.regionMapUpdated = Date.now()
        }
      }
    } catch {
      // Retry failed lookups after a short cooldown without blocking every navigation.
      regionMapCache.regionMapUpdated = Date.now() - 3600 * 1000 + 30000
    }
  }

  return regionMapCache.regionMap
}

/**
 * Fetches regions from Medusa and sets the region cookie.
 * @param request
 * @param response
 */
async function getCountryCode(
  request: NextRequest,
  regionMap: Map<string, HttpTypes.StoreRegion | number>
) {
  // NAQSH Atelier strictly operates in Pakistan currency (PKR)
  return "pk"
}

/**
 * Middleware to handle region selection and onboarding status.
 */
export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.includes(".")) {
    return NextResponse.next()
  }

  const cacheIdCookie = request.cookies.get("_medusa_cache_id")
  const cacheId = cacheIdCookie?.value || crypto.randomUUID()

  const regionMap = await getRegionMap()
  const countryCode = await getCountryCode(request, regionMap)

  // if the country code is available, use it, otherwise use the default region
  const country = countryCode || DEFAULT_REGION
  const firstPathSegment = request.nextUrl.pathname.split("/")[1]?.toLowerCase()
  const urlHasCountry = firstPathSegment === country.toLowerCase()

  if (urlHasCountry) {
    if (!cacheIdCookie) {
      const response = NextResponse.next()
      response.cookies.set("_medusa_cache_id", cacheId, {
        maxAge: 60 * 60 * 24,
      })
      return response
    }
    return NextResponse.next()
  }

  // if the url doesn't have the country, redirect to it
  const redirectPath =
    request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname
  const queryString = request.nextUrl.search || ""
  const redirectUrl = `${request.nextUrl.origin}/${country}${redirectPath}${queryString}`

  return NextResponse.redirect(redirectUrl, 307)
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
  ],
}
