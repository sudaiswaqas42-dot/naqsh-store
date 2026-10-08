import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

type Input = {
  order_id: string
  kind: string
  custom_status?: string
  tracking_number?: string
  carrier?: string
}

const sendOrderEmailStep = createStep("send-order-email", async (input: Input, { container }) => {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: orders } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "display_id",
      "custom_display_id",
      "email",
      "currency_code",
      "total",
      "metadata",
      "shipping_address.first_name",
      "shipping_address.*",
      "items.title",
      "items.variant_title",
      "items.quantity",
      "items.unit_price",
    ],
    filters: { id: input.order_id },
  })
  const order = orders[0]
  if (!order?.email) return new StepResponse({ sent: false })

  const notification = container.resolve(Modules.NOTIFICATION)
  const kind = input.kind || "status_update"
  await notification.createNotifications({
    to: order.email,
    channel: "email",
    template: `order-${kind}`,
    resource_id: order.id,
    resource_type: "order",
    idempotency_key: `order-${order.id}-${kind}-${Date.now()}`,
    data: {
      display_id: order.custom_display_id || order.display_id,
      total: order.total,
      currency_code: order.currency_code,
      name: order.shipping_address?.first_name,
      items: order.items,
      shipping_address: order.shipping_address,
      custom_status: input.custom_status || order.metadata?.custom_status,
      tracking_number: input.tracking_number || order.metadata?.tracking_number,
      carrier: input.carrier || order.metadata?.carrier || "",
      kind,
    },
  })
  return new StepResponse({ sent: true })
})

export const sendOrderEmailWorkflow = createWorkflow("send-order-email-workflow", (input: Input) => {
  return new WorkflowResponse(sendOrderEmailStep(input))
})
