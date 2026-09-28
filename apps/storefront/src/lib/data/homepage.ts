import { sdk } from "@lib/config"

export interface HomepageSection {
  id: string
  key: string
  type: string
  title: string
  subtitle: string | null
  cta_text: string | null
  cta_link: string | null
  collection_id: string | null
  rank: number
  is_active: boolean
  settings: any
}

let memoryHomepageCache: { data: HomepageSection[]; timestamp: number } | null = null

export async function getHomepageSections(): Promise<HomepageSection[]> {
  const now = Date.now()
  if (memoryHomepageCache && now - memoryHomepageCache.timestamp < 30000) {
    return memoryHomepageCache.data
  }

  try {
    const res = await sdk.client.fetch<{ sections: HomepageSection[] }>(
      "/store/homepage-sections",
      {
        method: "GET",
        next: { revalidate: 30, tags: ["homepage-sections"] },
      }
    )
    const sections = res.sections || []
    memoryHomepageCache = { data: sections, timestamp: Date.now() }
    return sections
  } catch (err) {
    console.error("Failed to fetch homepage sections:", err)
    return []
  }
}

export interface SocialLinks {
  facebook: string
  instagram: string
  tiktok: string
  pinterest: string
}

export async function getSocialLinks(): Promise<SocialLinks> {
  const fallback: SocialLinks = {
    facebook: "https://www.facebook.com/share/1EgwjwJypC/",
    instagram: "https://www.instagram.com/naqsh._.store?stkn=NDFrMTE5b3YwODI2",
    tiktok: "https://tiktok.com/@naqsh._.store",
    pinterest: "https://pinterest.com/naqshbrand",
  }
  try {
    const res = await sdk.client.fetch<{ social_links: SocialLinks }>(
      "/store/social-links",
      {
        method: "GET",
        next: { revalidate: 60, tags: ["social-links"] },
      }
    )
    return res.social_links || fallback
  } catch (err) {
    return fallback
  }
}

