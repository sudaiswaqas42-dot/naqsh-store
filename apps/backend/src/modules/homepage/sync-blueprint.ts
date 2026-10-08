import { INITIAL_HOMEPAGE_BLUEPRINT } from "./default-sections"

const COUNTDOWN_TYPES = new Set(["sale_banner", "flash_sale"])

export function isCountdownSection(sec: any): boolean {
  return !!sec && COUNTDOWN_TYPES.has(sec.type)
}

/**
 * Total countdown duration (ms) configured by the admin in section settings.
 * Supports days + hours + minutes + seconds. Returns 0 when nothing is set.
 */
export function getCountdownDurationMs(settings: any): number {
  const s = settings || {}
  const days = Math.max(0, Number(s.days) || 0)
  const hours = Math.max(0, Number(s.hours) || 0)
  const minutes = Math.max(0, Number(s.minutes) || 0)
  const seconds = Math.max(0, Number(s.seconds) || 0)
  return (days * 86400 + hours * 3600 + minutes * 60 + seconds) * 1000
}

/**
 * Builds settings with a fresh absolute `ends_at` timestamp, starting now.
 */
export function withFreshCountdown(settings: any): any {
  const durationMs = getCountdownDurationMs(settings)
  return {
    ...(settings || {}),
    ends_at: durationMs > 0 ? new Date(Date.now() + durationMs).toISOString() : null,
    expired_at: null,
  }
}

/**
 * Ensures every countdown banner has an absolute end time and automatically
 * disables banners whose countdown has finished. Admin can re-enable them,
 * which starts a fresh countdown (handled in the admin update route).
 */
async function enforceCountdownExpiry(homepageService: any, sections: any[]) {
  const now = Date.now()
  let changed = false

  for (const sec of sections) {
    if (!isCountdownSection(sec)) continue
    const settings = sec.settings || {}
    const endsAtMs = settings.ends_at ? new Date(settings.ends_at).getTime() : NaN

    if (sec.is_active && Number.isNaN(endsAtMs)) {
      // Active banner without an end time yet: start the timer now
      if (getCountdownDurationMs(settings) > 0) {
        await homepageService.updateHomepageSections({
          id: sec.id,
          settings: withFreshCountdown(settings),
        })
        changed = true
      }
      continue
    }

    if (sec.is_active && !Number.isNaN(endsAtMs) && endsAtMs <= now) {
      await homepageService.updateHomepageSections({
        id: sec.id,
        is_active: false,
        settings: { ...settings, expired_at: new Date().toISOString() },
      })
      changed = true
    }
  }

  return changed
}

export async function syncAndHydrateHomepageSections(
  homepageService: any,
  forceReset: boolean = false,
) {
  try {
    const existing = await homepageService.listHomepageSections(
      {},
      { order: { rank: "ASC" }, take: null },
    )

    const existingByKey = new Map<string, any>()
    for (const sec of existing) {
      if (sec.key) existingByKey.set(sec.key, sec)
      if (sec.type) existingByKey.set(sec.type, sec)
    }

    for (const blueprint of INITIAL_HOMEPAGE_BLUEPRINT) {
      const found =
        existingByKey.get(blueprint.key) || existingByKey.get(blueprint.type)

      const settings = isCountdownSection(blueprint)
        ? withFreshCountdown(blueprint.settings)
        : blueprint.settings

      if (!found) {
        await homepageService.createHomepageSections({
          key: blueprint.key,
          type: blueprint.type,
          title: blueprint.title,
          subtitle: blueprint.subtitle,
          cta_text: blueprint.cta_text,
          cta_link: blueprint.cta_link,
          rank: blueprint.rank,
          is_active: blueprint.is_active,
          settings,
        })
      } else if (forceReset) {
          if (blueprint.type === "instagram_feed") {
            // Keep the connected Instagram account, only realign rank
            await homepageService.updateHomepageSections({
              id: found.id,
              rank: blueprint.rank,
            })
            continue
          }
          await homepageService.updateHomepageSections({
            id: found.id,
            title: blueprint.title,
            subtitle: blueprint.subtitle,
            cta_text: blueprint.cta_text,
            cta_link: blueprint.cta_link,
            rank: blueprint.rank,
            is_active: blueprint.is_active,
            settings,
          })
        }
      }

    let allSections = await homepageService.listHomepageSections(
      {},
      { order: { rank: "ASC" }, take: null },
    )

    const changed = await enforceCountdownExpiry(homepageService, allSections)
    if (changed) {
      allSections = await homepageService.listHomepageSections(
        {},
        { order: { rank: "ASC" }, take: null },
      )
    }

    // Filter out internal non-display keys like sale_discounts from the layout sections list
    return allSections.filter((s: any) => !["sale_discounts", "social_links"].includes(s.key))
  } catch (err) {
    console.error("Error syncing homepage sections:", err)
    throw err
  }
}
