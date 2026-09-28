import { MedusaService } from "@medusajs/framework/utils"
import { InstagramState } from "./models/instagram-state"

export interface InstagramReelDoc {
  id: string
  media_url: string
  thumbnail_url: string
  permalink: string
  timestamp: string
  fetchedAt: Date
}

const DAY = 86_400_000
const FIELDS = "id,media_type,media_product_type,media_url,thumbnail_url,permalink,timestamp"

export function normalizeReels(items: any[], now = new Date()): InstagramReelDoc[] {
  return items.filter((item) => item.media_product_type === "REELS" && item.media_url && item.permalink)
    .map((item) => ({
      id: String(item.id), media_url: item.media_url,
      thumbnail_url: item.thumbnail_url || "", permalink: item.permalink,
      timestamp: item.timestamp, fetchedAt: now,
    }))
    .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
}

export class InstagramService extends MedusaService({ InstagramState }) {
  private cached: InstagramReelDoc[] = []
  private syncing?: Promise<{ success: boolean; count: number }>

  private async state() {
    const states = await this.listInstagramStates({ id: "instagram_active" })
    if (states[0]) return states[0]
    try {
      return await this.createInstagramStates({ id: "instagram_active", reels: { items: [] } })
    } catch {
      const [existing] = await this.listInstagramStates({ id: "instagram_active" })
      if (!existing) throw new Error("Instagram state initialization failed")
      return existing
    }
  }

  private async tokenDocument() {
    let state = await this.state()
    if (state.token) return state
    const token = process.env.INSTAGRAM_ACCESS_TOKEN?.trim()
    if (!token) throw new Error("INSTAGRAM_ACCESS_TOKEN is not configured")
    state = await this.updateInstagramStates({ id: state.id, token, next_refresh_at: new Date(Date.now() + DAY) })
    return state
  }

  public async fetchAndStoreReels() {
    this.syncing ??= this.sync().finally(() => { this.syncing = undefined })
    return this.syncing
  }

  private async sync() {
    try {
      const doc = await this.tokenDocument()
      const items: any[] = []
      let cursor: string | undefined
      for (let page = 0; page < 10; page++) {
        const url = new URL("https://graph.instagram.com/me/media")
        url.search = new URLSearchParams({ fields: FIELDS, limit: "100", access_token: doc.token!,
          ...(cursor ? { after: cursor } : {}) }).toString()
        const response = await fetch(url, { signal: AbortSignal.timeout(15000) })
        if (!response.ok) throw new Error("Instagram media request failed")
        const body = await response.json()
        if (!Array.isArray(body.data)) throw new Error("Invalid Instagram media response")
        items.push(...body.data)
        cursor = body.paging?.cursors?.after
        if (normalizeReels(items).length >= 8 || !body.paging?.next || !cursor) break
      }
      const reels = normalizeReels(items).slice(0, 8)
      await this.updateInstagramStates({ id: doc.id, reels: { items: reels }, fetched_at: new Date() })
      this.cached = reels
      return { success: true, count: reels.length }
    } catch {
      console.warn("[Instagram] Sync failed. Check token and PostgreSQL connectivity; retaining cached reels.")
      return { success: false, count: this.cached.length }
    }
  }

  public async refreshToken() {
    try {
      const doc = await this.tokenDocument()
      if (Date.now() < new Date(doc.next_refresh_at || 0).getTime()) return { success: true, skipped: true }
      const url = new URL("https://graph.instagram.com/refresh_access_token")
      url.search = new URLSearchParams({ grant_type: "ig_refresh_token", access_token: doc.token! }).toString()
      const response = await fetch(url, { signal: AbortSignal.timeout(15000) })
      if (!response.ok) throw new Error("Instagram refresh rejected")
      const body = await response.json()
      if (typeof body.access_token !== "string" || !(Number(body.expires_in) > 0)) throw new Error("Invalid refresh response")
      await this.updateInstagramStates({ id: doc.id, token: body.access_token, refreshed_at: new Date(),
        expires_at: new Date(Date.now() + Number(body.expires_in) * 1000),
        next_refresh_at: new Date(Date.now() + Math.min(50 * DAY, Number(body.expires_in) * 800)),
      })
      return { success: true, skipped: false }
    } catch {
      console.warn("[Instagram] TOKEN REFRESH FAILED. Reauthorize Instagram Login before expiry; cached reels remain available.")
      return { success: false, skipped: false }
    }
  }

  public async getLatestReels(limit = 8) {
    try {
      const snapshot = await this.state()
      if (snapshot.reels) this.cached = (snapshot.reels.items || []) as InstagramReelDoc[]
    } catch {
      // Keep the last successful read during temporary database outages.
    }
    return [...this.cached].sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp)).slice(0, limit)
  }
}

