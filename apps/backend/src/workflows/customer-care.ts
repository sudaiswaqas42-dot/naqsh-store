import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import CustomerCareService from "../modules/customer-care/service"
import { CUSTOMER_CARE_MODULE } from "../modules/customer-care"

export type SupportInput = { name: string; email: string; phone?: string; subject: string; message: string }
const createSupportStep = createStep("create-support-message", async (input: SupportInput, { container }) => {
  const service: CustomerCareService = container.resolve(CUSTOMER_CARE_MODULE)
  const message = await service.createSupportMessages(input)
  return new StepResponse(message, message.id)
}, async (id, { container }) => {
  if (id) await (container.resolve(CUSTOMER_CARE_MODULE) as CustomerCareService).deleteSupportMessages(id)
})
export const createSupportWorkflow = createWorkflow("create-support-message-workflow", (input: SupportInput) => new WorkflowResponse(createSupportStep(input)))

const subscribeStep = createStep("subscribe-newsletter", async ({ email }: { email: string }, { container }) => {
  const service: CustomerCareService = container.resolve(CUSTOMER_CARE_MODULE)
  const existing = await service.listNewsletterSubscriptions({ email })
  if (existing.length) return new StepResponse({ subscribed: true })
  try {
    await service.createNewsletterSubscriptions({ email, consented_at: new Date() })
  } catch (error) {
    if (!(await service.listNewsletterSubscriptions({ email })).length) throw error
  }
  return new StepResponse({ subscribed: true })
})
export const subscribeWorkflow = createWorkflow("subscribe-newsletter-workflow", (input: { email: string }) => new WorkflowResponse(subscribeStep(input)))

export type UpdateSupportInput = { id: string; status: "open" | "in_progress" | "resolved"; admin_notes?: string }
const updateSupportStep = createStep("update-support-message", async (input: UpdateSupportInput, { container }) => {
  const service: CustomerCareService = container.resolve(CUSTOMER_CARE_MODULE)
  return new StepResponse(await service.updateSupportMessages(input))
})
export const updateSupportWorkflow = createWorkflow("update-support-message-workflow", (input: UpdateSupportInput) => new WorkflowResponse(updateSupportStep(input)))
