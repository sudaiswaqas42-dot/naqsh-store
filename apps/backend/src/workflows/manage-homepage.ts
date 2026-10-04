import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"
import { HOMEPAGE_MODULE } from "../modules/homepage"
import {
  getCountdownDurationMs,
  isCountdownSection,
  syncAndHydrateHomepageSections,
  withFreshCountdown,
} from "../modules/homepage/sync-blueprint"
import {
  validateReorder,
  validateSection,
} from "../modules/homepage/validation"

type Input = {
  action: "create" | "update" | "delete" | "reorder" | "reset"
  id?: string
  data?: any
}
const manageHomepageStep = createStep(
  "manage-homepage",
  async (
    input: Input,
    { container }
  ): Promise<StepResponse<Record<string, any>>> => {
    const service = container.resolve(HOMEPAGE_MODULE) as any
    const invalid = (error: any): never => {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, error.message)
    }
    if (input.action === "reset")
      return new StepResponse({
        sections: await syncAndHydrateHomepageSections(service, true),
      })
    if (input.action === "reorder") {
      let items: any[] = []
      try {
        items = validateReorder(input.data)
      } catch (error) {
        invalid(error)
      }
      const existing = await service.listHomepageSections({}, { take: null })
      if (
        items.some(
          (item) =>
            !existing.some(
              (section: any) =>
                section.id === item.id &&
                !["sale_discounts", "social_links"].includes(section.key)
            )
        )
      )
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "Unknown homepage section"
        )
      await service.updateHomepageSections(items)
      return new StepResponse({ success: true })
    }
    if (input.action === "create") {
      let data: any
      try {
        data = validateSection(input.data, true)
      } catch (error) {
        invalid(error)
      }
      if ((await service.listHomepageSections({ key: data.key })).length)
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "Section key already exists"
        )
      delete data.restart_countdown
      if (isCountdownSection(data))
        data.settings = withFreshCountdown(data.settings)
      return new StepResponse({
        section: await service.createHomepageSections(data),
      })
    }
    const current = await service.retrieveHomepageSection(input.id)
    if (["sale_discounts", "social_links"].includes(current.key))
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Use the dedicated settings editor"
      )
    if (input.action === "delete") {
      await service.deleteHomepageSections([input.id])
      return new StepResponse({ id: input.id, deleted: true })
    }
    let data: any
    try {
      data = validateSection(input.data)
    } catch (error) {
      invalid(error)
    }
    const restart = data.restart_countdown
    delete data.restart_countdown
    if (data.settings) data.settings = { ...current.settings, ...data.settings }
    if (isCountdownSection(current)) {
      const settings = data.settings || current.settings || {}
      const changed =
        getCountdownDurationMs(settings) !==
        getCountdownDurationMs(current.settings)
      if (
        restart ||
        (data.is_active === true && !current.is_active) ||
        changed
      ) {
        data.settings = withFreshCountdown(settings)
        if (restart) data.is_active = true
      } else if (data.settings)
        data.settings = {
          ...settings,
          ends_at: current.settings?.ends_at ?? null,
          expired_at: current.settings?.expired_at ?? null,
        }
      if (
        (data.is_active ?? current.is_active) &&
        getCountdownDurationMs(data.settings || settings) <= 0
      )
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "Set a countdown duration before publishing the banner"
        )
    }
    return new StepResponse({
      section: await service.updateHomepageSections({ ...data, id: input.id }),
    })
  }
)

export const manageHomepageWorkflow = createWorkflow(
  "manage-homepage",
  (input: Input) => new WorkflowResponse(manageHomepageStep(input))
)
