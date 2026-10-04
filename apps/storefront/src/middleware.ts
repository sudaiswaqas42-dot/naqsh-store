import { NextRequest, NextResponse } from "next/server"

// This storefront serves Pakistan only. Do not query regions on every navigation.
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.includes(".")) return NextResponse.next()
  const country = "pk"
  const firstSegment = request.nextUrl.pathname.split("/")[1]?.toLowerCase()
  if (firstSegment !== country) {
    const path = request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname
    return NextResponse.redirect(new URL(`/${country}${path}${request.nextUrl.search}`, request.url), 307)
  }
  const response = NextResponse.next()
  if (!request.cookies.get("_medusa_cache_id")) {
    response.cookies.set("_medusa_cache_id", crypto.randomUUID(), { maxAge: 86400, sameSite: "lax" })
  }
  return response
}
export const config = { matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images|assets|videos|png|svg|jpg|jpeg|gif|webp).*)"] }
