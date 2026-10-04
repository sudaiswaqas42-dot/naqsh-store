import { useEffect, useState } from "react"
import { Button, Container, Heading, Input, Text } from "@medusajs/ui"

type Feed = { account: { username: string; id: string; profile_url: string } | null; reels: { id: string; caption: string; thumbnail_url: string; media_url: string; permalink: string; timestamp: string }[] }
const InstagramManager = ({ onConnected }: { onConnected: () => void }) => {
  const [feed, setFeed] = useState<Feed>({ account: null, reels: [] })
  const [token, setToken] = useState("")
  const [userId, setUserId] = useState("")
  const [provider, setProvider] = useState("instagram")
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  useEffect(() => {
    const controller = new AbortController()
    fetch("/admin/instagram", { signal: controller.signal }).then(async (response) => {
      const body = await response.json()
      if (response.ok) setFeed(body)
      else setMessage(body.error)
    }).catch(() => { if (!controller.signal.aborted) setMessage("Unable to load the Instagram connection.") })
    return () => controller.abort()
  }, [])
  const save = async (refresh = false) => {
    setBusy(true)
    setMessage("")
    try {
      const response = await fetch("/admin/instagram", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(refresh ? { refresh: true } : { token, user_id: userId, provider }) })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error || "Unable to connect Instagram")
      setFeed(body)
      setToken("")
      setMessage(refresh ? "Live reels refreshed." : "Account connected. The storefront now uses this account's latest reels.")
      onConnected()
    } catch (error) { setMessage(error instanceof Error ? error.message : "Connection failed") }
    finally { setBusy(false) }
  }
  return <Container className="flex flex-col gap-6 p-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><Heading level="h2">{feed.account ? `Reels by @${feed.account.username}` : "Connect Instagram"}</Heading>
        <Text className="text-ui-fg-subtle">Live reels update automatically, newest first. This preview uses the same feed as your storefront.</Text></div>
      <Button variant="secondary" disabled={busy} onClick={() => save(true)}>Refresh reels</Button>
    </div>
    <form onSubmit={(event) => { event.preventDefault(); void save() }} className="grid gap-4 rounded-lg border p-4">
      <Text weight="plus">Connect or replace account</Text>
      <label className="grid gap-1 text-sm">Login type
        <select value={provider} onChange={(event) => setProvider(event.target.value)} className="rounded-md border p-2">
          <option value="instagram">Instagram Login</option><option value="facebook">Facebook Login</option>
        </select>
      </label>
      <label className="grid gap-1 text-sm">Instagram account ID (optional for Instagram Login)
        <Input value={userId} onChange={(event) => setUserId(event.target.value)} placeholder="Leave blank to detect from token" inputMode="numeric" pattern="[0-9]*" required={provider === "facebook"} />
      </label>
      <label className="grid gap-1 text-sm">New access token
        <Input type="password" value={token} onChange={(event) => setToken(event.target.value)} required autoComplete="new-password" placeholder="Paste the token for the new account" maxLength={4096} />
      </label>
      <Text size="small" className="text-ui-fg-subtle">The username and profile link are verified with Instagram. Tokens are encrypted on the server and never returned to the storefront.</Text>
      <Button type="submit" disabled={busy}>{busy ? "Connecting..." : "Connect account"}</Button>
    </form>
    {message && <p role="status" className="text-sm">{message}</p>}
    {feed.account && <a href={feed.account.profile_url} target="_blank" rel="noopener noreferrer" className="text-sm underline">View @{feed.account.username} on Instagram</a>}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 240px))", gap: 16 }}>
      {feed.reels.map((reel, index) => <article key={reel.id} className="overflow-hidden rounded-lg border">
        <video src={reel.media_url} poster={reel.thumbnail_url || undefined} controls muted playsInline preload="none" style={{ aspectRatio: "9/16", width: "100%", objectFit: "cover", background: "#0F2D22" }} />
        <div className="space-y-2 p-3"><Text weight="plus">{index === 0 ? "Latest reel" : `Reel ${index + 1}`}</Text>
          <p className="line-clamp-2 text-sm">{reel.caption?.split("\n")[0] || "Instagram reel"}</p>
          <time className="block text-xs">{new Date(reel.timestamp).toLocaleDateString()}</time>
          <a className="text-xs underline" href={reel.permalink} target="_blank" rel="noopener noreferrer">View on Instagram</a></div>
      </article>)}
    </div>
    {!feed.reels.length && <Text>No live reels available. Connect an account with published videos.</Text>}
  </Container>
}
export default InstagramManager
