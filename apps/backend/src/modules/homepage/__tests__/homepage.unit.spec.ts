import {
  syncAndHydrateHomepageSections,
  withFreshCountdown,
} from "../sync-blueprint"
import { validateReorder, validateSection } from "../validation"

describe("Homepage publishing", () => {
  test("reading an intentionally empty homepage never recreates deleted sections", async () => {
    const service = {
      listHomepageSections: jest.fn().mockResolvedValue([]),
      createHomepageSections: jest.fn(),
    }
    expect(await syncAndHydrateHomepageSections(service)).toEqual([])
    expect(service.createHomepageSections).not.toHaveBeenCalled()
  })
  test("preserves repeated section types and hides internal settings", async () => {
    const sections = [
      { id: "one", type: "hero_slider" },
      { id: "two", type: "hero_slider" },
      { key: "social_links" },
      { key: "sale_discounts" },
    ]
    const service = {
      listHomepageSections: jest.fn().mockResolvedValue(sections),
    }
    expect(
      (await syncAndHydrateHomepageSections(service)).map(
        (section) => section.id
      )
    ).toEqual(["one", "two"])
  })
  test("propagates read failures instead of reporting an empty successful page", async () => {
    const service = {
      listHomepageSections: jest
        .fn()
        .mockRejectedValue(new Error("unavailable")),
    }
    const log = jest.spyOn(console, "error").mockImplementation(() => {})
    await expect(syncAndHydrateHomepageSections(service)).rejects.toThrow(
      "unavailable"
    )
    log.mockRestore()
  })
  test("expires a countdown and never restarts it on a read", async () => {
    const section = {
      id: "sale",
      type: "sale_banner",
      is_active: true,
      settings: { hours: 1, ends_at: "2020-01-01T00:00:00Z" },
    }
    const service = {
      listHomepageSections: jest.fn().mockResolvedValue([section]),
      updateHomepageSections: jest.fn(),
    }
    await syncAndHydrateHomepageSections(service)
    expect(service.updateHomepageSections).toHaveBeenCalledWith(
      expect.objectContaining({ id: "sale", is_active: false })
    )
  })
  test("stores absolute countdowns", () => {
    const before = Date.now()
    const settings = withFreshCountdown({ days: 1, hours: 2 })
    expect(new Date(settings.ends_at).getTime()).toBeGreaterThanOrEqual(
      before + 26 * 3600000
    )
  })
  test("preserves blank content, empty lists and zero prices", () => {
    expect(
      validateSection({
        title: "",
        settings: { cards: [], items: [{ price: 0 }], product_ids: [] },
      })
    ).toEqual({
      title: "",
      settings: { cards: [], items: [{ price: 0 }], product_ids: [] },
    })
  })
  test.each(["javascript:alert(1)", "//evil.example", "data:text/html,test"])(
    "rejects unsafe destinations %s",
    (link) => {
      expect(() =>
        validateSection({ settings: { cards: [{ link }] } })
      ).toThrow()
    }
  )
  test("rejects malformed lists, prices and duplicate ordering", () => {
    expect(() => validateSection({ settings: { cards: [null] } })).toThrow()
    expect(() =>
      validateSection({ settings: { cards: [{ price: -1 }] } })
    ).toThrow()
    expect(() =>
      validateReorder([
        { id: "one", rank: 0 },
        { id: "one", rank: 1 },
      ])
    ).toThrow()
    expect(() =>
      validateReorder([
        { id: "one", rank: 0 },
        { id: "two", rank: 0 },
      ])
    ).toThrow()
  })
  test("protects identifiers and accepts uploaded image URLs", () => {
    expect(
      validateSection({
        id: "other",
        key: "social_links",
        type: "other",
        title: "Hello",
        settings: { image_url: "http://localhost:9000/static/image.png" },
      })
    ).toEqual({
      title: "Hello",
      settings: { image_url: "http://localhost:9000/static/image.png" },
    })
  })
})
