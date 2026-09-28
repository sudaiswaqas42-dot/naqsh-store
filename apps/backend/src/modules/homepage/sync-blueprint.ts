import { INITIAL_HOMEPAGE_BLUEPRINT } from "./default-sections";

export async function syncAndHydrateHomepageSections(
  homepageService: any,
  forceReset: boolean = false,
) {
  try {
    const existing = await homepageService.listHomepageSections(
      {},
      { order: { rank: "ASC" } },
    );

    // Map existing by key or type
    const existingByKey = new Map<string, any>();
    for (const sec of existing) {
      if (sec.key) existingByKey.set(sec.key, sec);
      if (sec.type) existingByKey.set(sec.type, sec);
    }

    // Iterate through blueprint items
    for (const blueprint of INITIAL_HOMEPAGE_BLUEPRINT) {
      const found =
        existingByKey.get(blueprint.key) || existingByKey.get(blueprint.type);

      if (!found) {
        // Section is completely missing in database (e.g. fabric_strip, instagram_feed, sale_banner)
        await homepageService.createHomepageSections({
          key: blueprint.key,
          type: blueprint.type,
          title: blueprint.title,
          subtitle: blueprint.subtitle,
          cta_text: blueprint.cta_text,
          cta_link: blueprint.cta_link,
          rank: blueprint.rank,
          is_active: blueprint.is_active,
          settings: blueprint.settings,
        });
      } else if (forceReset) {
        // Force reset cards and rank
        await homepageService.updateHomepageSections({
          id: found.id,
          title: blueprint.title,
          subtitle: blueprint.subtitle,
          cta_text: blueprint.cta_text,
          cta_link: blueprint.cta_link,
          rank: blueprint.rank,
          settings: blueprint.settings,
        });
      } else {
        // Section exists, check if cards/settings need hydration (e.g. settings is null or has 0 cards)
        const needsCardsHydration =
          blueprint.settings?.cards &&
          blueprint.settings.cards.length > 0 &&
          (!found.settings?.cards || found.settings.cards.length === 0);

        const needsProfileHydration =
          blueprint.settings?.profile_url && !found.settings?.profile_url;

        // Ensure clean ranks:
        const needsRankAlignment = found.rank !== blueprint.rank;

        if (
          needsCardsHydration ||
          needsProfileHydration ||
          needsRankAlignment
        ) {
          const mergedSettings = {
            ...(found.settings || {}),
            ...(needsCardsHydration ? { cards: blueprint.settings?.cards } : {}),
            ...(needsProfileHydration
              ? {
                  profile_url: blueprint.settings?.profile_url,
                  username: blueprint.settings?.username,
                  cards: blueprint.settings?.cards,
                }
              : {}),
          };

          const updatePayload: any = {
            id: found.id,
            settings: mergedSettings,
          };

          if (needsRankAlignment) {
            updatePayload.rank = blueprint.rank;
          }
          if (
            blueprint.key === "featured_categories" &&
            found.title !== blueprint.title
          ) {
            updatePayload.title = blueprint.title;
          }

          await homepageService.updateHomepageSections(updatePayload);
        }
      }
    }

    // Re-fetch all sections
    const allSections = await homepageService.listHomepageSections(
      {},
      { order: { rank: "ASC" } },
    );

    // Filter out internal non-display keys like sale_discounts from the layout sections list
    return allSections.filter((s: any) => s.key !== "sale_discounts");
  } catch (err) {
    console.error("Error syncing homepage sections:", err);
    return [];
  }
}
