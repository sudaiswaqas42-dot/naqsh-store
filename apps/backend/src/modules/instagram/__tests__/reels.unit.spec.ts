import { InstagramService, normalizeReels } from "../instagram-service"

const video = { id: "new", media_type: "VIDEO", caption: "New reel", media_url: "https://example.com/video.mp4", permalink: "https://instagram.com/reel/new", timestamp: "2026-09-29T00:00:00Z" }

describe("Instagram reels", () => {
  const originalFetch = global.fetch
  const originalToken = process.env.INSTAGRAM_ACCESS_TOKEN
  let service: any
  beforeEach(() => {
    process.env.INSTAGRAM_ACCESS_TOKEN = "test-token"
    service = Object.create(InstagramService.prototype)
    Object.assign(service, { cached: [], fetchedAt: 0, retryAt: 0, hasSnapshot: false,
      listInstagramStates: jest.fn().mockResolvedValue([{ id: "instagram_active" }]),
      updateInstagramStates: jest.fn().mockResolvedValue({}),
    })
    jest.spyOn(console, "warn").mockImplementation(() => {})
  })
  afterEach(() => {
    global.fetch = originalFetch
    if (originalToken === undefined) delete process.env.INSTAGRAM_ACCESS_TOKEN
    else process.env.INSTAGRAM_ACCESS_TOKEN = originalToken
    jest.restoreAllMocks()
  })

  it("excludes images/carousels and sorts videos newest first", () => {
    expect(normalizeReels([
      { ...video, id: "old", timestamp: "2026-09-01T00:00:00Z" },
      { ...video, id: "image", media_type: "IMAGE" },
      { ...video, id: "carousel", media_type: "CAROUSEL_ALBUM" }, video,
    ]).map((item) => item.id)).toEqual(["new", "old"])
  })

  it("fetches on a cold request and reuses the cache", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({ ok: true, json: async () => ({ id: process.env.INSTAGRAM_USER_ID || "123", username: "naqsh" }) }).mockResolvedValueOnce({ ok: true, json: async () => ({ data: [video] }) })
    expect(await service.getLatestReels()).toHaveLength(1)
    await service.getLatestReels()
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })

  it("keeps stale data on upstream failure and backs off retries", async () => {
    service.listInstagramStates.mockResolvedValue([{ id: "instagram_active", reels: { items: [video] }, fetched_at: new Date(1) }])
    global.fetch = jest.fn().mockRejectedValue(new Error("Offline"))
    expect(await service.getLatestReels()).toHaveLength(1)
    await service.getLatestReels()
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it("signals failure if there is no successful cached snapshot", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("Offline"))
    await expect(service.getLatestReels()).rejects.toThrow("Instagram reels unavailable")
  })
})
