import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"
import { InstagramService } from "../modules/instagram/instagram-service"
import HomepageModuleService from "../modules/homepage/service"

type Input = { token: string; user_id?: string; provider?: "instagram" | "facebook" }
const connectInstagramStep = createStep("connect-instagram", async (input: Input, { container }) => {
  if (typeof input.token !== "string" || (input.user_id !== undefined && typeof input.user_id !== "string") ||
    (input.provider && !["instagram", "facebook"].includes(input.provider))) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Invalid Instagram connection")
  }
  const feed = await container.resolve<InstagramService>("instagram").connect(input)
  const homepage = container.resolve<HomepageModuleService>("homepage")
  const sections = await homepage.listHomepageSections({ type: "instagram_feed" })
  for (const section of sections) {
    await homepage.updateHomepageSections({ id: section.id, title: `Reels by @${feed.account.username}`,
      subtitle: `Latest reels from @${feed.account.username}`, cta_link: feed.account.profile_url,
      settings: { ...section.settings, cards: [], username: feed.account.username, profile_url: feed.account.profile_url, source: "instagram_api" },
    })
  }
  return new StepResponse(feed)
})
export const connectInstagramWorkflow = createWorkflow("connect-instagram", (input: Input) => new WorkflowResponse(connectInstagramStep(input)))
