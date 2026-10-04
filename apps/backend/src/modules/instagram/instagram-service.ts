import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto"
import { MedusaError, MedusaService } from "@medusajs/framework/utils"
import { InstagramState } from "./models/instagram-state"

export interface InstagramReelDoc {
  id: string
  caption: string
  media_url: string
  thumbnail_url: string
  permalink: string
  timestamp: string
  fetchedAt: Date
}
type Account = { id: string; username: string; profile_url: string; provider: "instagram" | "facebook" }
type Connection = { token: string; user_id?: string; provider?: "instagram" | "facebook" }
const TTL = 20 * 60 * 1000
const DAY = 86400000
const FIELDS = "id,caption,media_type,media_product_type,media_url,thumbnail_url,permalink,timestamp"
const invalid = (message: string) => new MedusaError(MedusaError.Types.INVALID_DATA, message)

function encryptionKey() {
  const secret = process.env.INSTAGRAM_ENCRYPTION_KEY || process.env.JWT_SECRET
  if (!secret) throw invalid("Configure INSTAGRAM_ENCRYPTION_KEY before saving an account")
  return createHash("sha256").update(`naqsh-instagram:${secret}`).digest()
}
function encrypt(token: string) {
  const iv = randomBytes(12)
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv)
  const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()])
  return ["enc", iv.toString("base64"), cipher.getAuthTag().toString("base64"), encrypted.toString("base64")].join(":")
}
function decrypt(token: string) {
  const [, iv, tag, encrypted] = token.split(":")
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(iv, "base64"))
  decipher.setAuthTag(Buffer.from(tag, "base64"))
  return Buffer.concat([decipher.update(Buffer.from(encrypted, "base64")), decipher.final()]).toString("utf8")
}
export function normalizeReels(items: any[], now = new Date()): InstagramReelDoc[] {
  return items.filter((item) => (item.media_type === "VIDEO" || item.media_product_type === "REELS") && item.media_url && item.permalink)
    .map((item) => ({ id: String(item.id), caption: String(item.caption || ""), media_url: item.media_url,
      thumbnail_url: item.thumbnail_url || "", permalink: item.permalink, timestamp: item.timestamp, fetchedAt: now }))
    .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
}

export class InstagramService extends MedusaService({ InstagramState }) {
  private cached: InstagramReelDoc[] = []
  private fetchedAt = 0
  private retryAt = 0
  private hasSnapshot = false
  private account?: Account
  private connectionKey = ""
  private syncing?: Promise<{ success: boolean; count: number }>

  private async state() {
    const [existing] = await this.listInstagramStates({ id: "instagram_active" })
    if (existing) return existing
    try { return await this.createInstagramStates({ id: "instagram_active", reels: { items: [] } }) }
    catch {
      const [created] = await this.listInstagramStates({ id: "instagram_active" })
      if (!created) throw invalid("Instagram storage unavailable")
      return created
    }
  }

  private credentials(snapshot?: any): Connection {
    const stored = snapshot?.token?.startsWith("enc:")
    const token = stored ? decrypt(snapshot.token) : process.env.INSTAGRAM_ACCESS_TOKEN?.trim()
    if (!token) throw invalid("Configure an Instagram access token")
    return { token, user_id: stored ? snapshot.reels?.account?.id : process.env.INSTAGRAM_USER_ID,
      provider: stored ? snapshot.reels?.account?.provider : process.env.INSTAGRAM_API_HOST === "facebook" ? "facebook" : "instagram" }
  }

  private async graph(connection: Connection, path: string, fields: string, after?: string) {
    const base = connection.provider === "facebook"
      ? `https://graph.facebook.com/${process.env.INSTAGRAM_GRAPH_VERSION || "v21.0"}` : "https://graph.instagram.com"
    const url = new URL(`${base}/${path}`)
    url.search = new URLSearchParams({ fields, access_token: connection.token, limit: "25", ...(after ? { after } : {}) }).toString()
    const response = await fetch(url, { signal: AbortSignal.timeout(12000) })
    if (!response.ok) throw invalid("Instagram rejected the connection. Check the token, account ID and media permissions.")
    return response.json()
  }

  private async fetchAccount(connection: Connection): Promise<Account> {
    if (connection.provider === "facebook" && !/^\d+$/.test(connection.user_id || "")) throw invalid("Facebook Login requires the Instagram business account ID")
    const body = await this.graph(connection, connection.provider === "facebook" ? connection.user_id! : "me", "id,username")
    if (!body.id || !body.username) throw invalid("Instagram account details unavailable")
    if (connection.user_id && connection.provider !== "facebook" && String(body.id) !== connection.user_id) throw invalid("The account ID does not match this token")
    return { id: String(body.id), username: body.username, profile_url: `https://www.instagram.com/${encodeURIComponent(body.username)}/`, provider: connection.provider || "instagram" }
  }

  private async media(connection: Connection) {
    const items: any[] = []
    let cursor: string | undefined
    for (let page = 0; page < 2; page++) {
      const body = await this.graph(connection, `${connection.provider === "facebook" ? connection.user_id : "me"}/media`, FIELDS, cursor)
      if (!Array.isArray(body.data)) throw invalid("Invalid Instagram media response")
      items.push(...body.data)
      cursor = body.paging?.cursors?.after
      if (normalizeReels(items).length >= 8 || !body.paging?.next || !cursor) break
    }
    return normalizeReels(items).slice(0, 8)
  }

  public async connect(input: Connection) {
    const connection = { ...input, token: input.token?.trim(), user_id: input.user_id?.trim() || undefined }
    if (!connection.token || connection.token.length > 4096) throw invalid("Enter a valid access token")
    const account = await this.fetchAccount(connection)
    const reels = await this.media({ ...connection, user_id: account.id })
    const snapshot = await this.state()
    const token = encrypt(connection.token)
    await this.updateInstagramStates({ id: snapshot.id, token, reels: { items: reels, account }, fetched_at: new Date(), next_refresh_at: new Date(Date.now() + 50 * DAY) })
    this.cached = reels
    this.account = account
    this.fetchedAt = Date.now()
    this.hasSnapshot = true
    this.connectionKey = token
    this.retryAt = 0
    return { account, reels, count: reels.length }
  }

  public async fetchAndStoreReels() {
    this.syncing ??= this.sync().finally(() => { this.syncing = undefined })
    return this.syncing
  }
  private async sync() {
    try {
      const snapshot = await this.state().catch(() => undefined)
      const connection = this.credentials(snapshot)
      const account = await this.fetchAccount(connection)
      const reels = await this.media({ ...connection, user_id: account.id })
      // A concurrent account switch must never be overwritten by an older fetch.
      if (snapshot) {
        const latest = await this.state()
        if (latest.token !== snapshot.token) return { success: false, count: this.cached.length }
        await this.updateInstagramStates({ id: snapshot.id, reels: { items: reels, account }, fetched_at: new Date() })
      }
      this.cached = reels
      this.account = account
      this.fetchedAt = Date.now()
      this.hasSnapshot = true
      return { success: true, count: reels.length }
    } catch {
      this.retryAt = Date.now() + 60000
      console.warn("[Instagram] Sync failed; retaining this account's last successful reels.")
      return { success: false, count: this.cached.length }
    }
  }

  public async refreshToken() {
    try {
      const snapshot = await this.state()
      const connection = this.credentials(snapshot)
      if (connection.provider === "facebook" || Date.now() < new Date(snapshot.next_refresh_at || 0).getTime()) return { success: true, skipped: true }
      // Instagram Login: refresh after 24 hours and before the 60-day expiry.
      // Admin connections are encrypted in PostgreSQL. Never write a deployment .env.
      const url = new URL("https://graph.instagram.com/refresh_access_token")
      url.search = new URLSearchParams({ grant_type: "ig_refresh_token", access_token: connection.token }).toString()
      const response = await fetch(url, { signal: AbortSignal.timeout(15000) })
      const body = await response.json()
      if (!response.ok || !body.access_token || !(Number(body.expires_in) > 0)) throw invalid("Token refresh failed")
      const latest = await this.state()
      if (latest.token !== snapshot.token) return { success: true, skipped: true }
      await this.updateInstagramStates({ id: snapshot.id,
        ...(snapshot.token?.startsWith("enc:") ? { token: encrypt(body.access_token) } : {}),
        refreshed_at: new Date(), expires_at: new Date(Date.now() + Number(body.expires_in) * 1000),
        next_refresh_at: new Date(Date.now() + Math.min(50 * DAY, Number(body.expires_in) * 800)),
      })
      console.info("[Instagram] Token refreshed. For environment configuration, update INSTAGRAM_ACCESS_TOKEN manually when reauthorizing; no token is logged.")
      return { success: true, skipped: false }
    } catch {
      console.warn("[Instagram] Refresh failed. Reconnect the account before expiry.")
      return { success: false, skipped: false }
    }
  }

  public async getLatestReels(limit = 8) {
    try {
      const snapshot = await this.state()
      const key = snapshot.token?.startsWith("enc:") ? snapshot.token : createHash("sha256").update(process.env.INSTAGRAM_ACCESS_TOKEN || "").digest("hex")
      if (this.connectionKey && this.connectionKey !== key) {
        this.cached = []; this.account = undefined; this.hasSnapshot = false; this.fetchedAt = 0; this.retryAt = 0
      }
      this.connectionKey = key
      if (snapshot.fetched_at && (!this.hasSnapshot || new Date(snapshot.fetched_at).getTime() > this.fetchedAt)) {
        this.cached = (snapshot.reels?.items || []) as InstagramReelDoc[]
        this.account = snapshot.reels?.account as Account | undefined
        this.fetchedAt = new Date(snapshot.fetched_at).getTime()
        this.hasSnapshot = true
      }
    } catch { /* Memory cache remains usable during database outages. */ }
    if ((!this.account || Date.now() - this.fetchedAt >= TTL) && Date.now() >= this.retryAt) await this.fetchAndStoreReels()
    if (!this.hasSnapshot) throw invalid("Instagram reels unavailable")
    return [...this.cached].sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp)).slice(0, limit)
  }
  public async getFeed() {
    const reels = await this.getLatestReels()
    return { account: this.account || null, reels, count: reels.length }
  }
}
