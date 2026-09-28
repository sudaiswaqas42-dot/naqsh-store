import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { RETURN_MODULE } from "../modules/returns"
import ReturnService from "../modules/returns/service"

export type ReturnInput = { order_number: string; customer_email: string; customer_name?: string; items: { description: string }[]; reason: string; action_requested: "return" | "exchange"; notes?: string }
const createReturnStep = createStep("create-verified-return-request", async (input: ReturnInput, { container }) => {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const reference = input.order_number.replace(/^#/, "").trim()
  const { data: orders } = await query.graph({ entity: "order", fields: ["id", "display_id", "email", "status"], filters: { email: input.customer_email, ...(/^\d+$/.test(reference) ? { display_id: reference } : { id: reference }) }, pagination: { take: 1 } })
  const order = orders[0]
  if (!order || order.status === "canceled") throw new MedusaError(MedusaError.Types.INVALID_DATA, "No eligible order matches that order number and email.")
  const service: ReturnService = container.resolve(RETURN_MODULE)
  const request = await service.createReturnRequests({ order_id: order.id, order_display_id: String(order.display_id), customer_email: input.customer_email, customer_name: input.customer_name || "", items: { entries: input.items }, reason: input.reason, action_requested: input.action_requested, notes: input.notes || "", status: "pending" })
  return new StepResponse(request, request.id)
}, async (id, { container }) => {
  if (id) await (container.resolve(RETURN_MODULE) as ReturnService).deleteReturnRequests(id)
})
export const createReturnRequestWorkflow = createWorkflow("create-verified-return-request-workflow", (input: ReturnInput) => new WorkflowResponse(createReturnStep(input)))
