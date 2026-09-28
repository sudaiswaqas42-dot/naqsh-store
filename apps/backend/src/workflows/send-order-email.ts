import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

type Input = { order_id: string; kind: "confirmed" | "delivered" }

const sendOrderEmailStep = createStep("send-order-email", async (input: Input, { container }) => {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: orders } = await query.graph({ entity: "order", fields: [
    "id", "display_id", "email", "currency_code", "total", "shipping_address.first_name",
    "items.title", "items.variant_title", "items.quantity",
  ], filters: { id: input.order_id } })
  const order = orders[0]
  if (!order?.email) return new StepResponse({ sent: false })
  const notification = container.resolve(Modules.NOTIFICATION)
  await notification.createNotifications({
    to: order.email, channel: "email", template: `order-${input.kind}`,
    resource_id: order.id, resource_type: "order",
    idempotency_key: `order-${order.id}-${input.kind}`,
    data: { display_id: order.display_id, total: order.total, currency_code: order.currency_code,
      name: order.shipping_address?.first_name, items: order.items },
  })
  return new StepResponse({ sent: true })
})

export const sendOrderEmailWorkflow = createWorkflow("send-order-email-workflow", (input: Input) => {
  return new WorkflowResponse(sendOrderEmailStep(input))
})
