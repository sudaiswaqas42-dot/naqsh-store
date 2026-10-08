import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { orderTracking } from "../utils/order-tracking"

type Input = { order_number: string; email: string }

const trackOrderStep = createStep("track-naqsh-order", async (input: Input, { container }) => {
  const reference = String(input.order_number || "").trim().replace(/^#/, "")
  const email = String(input.email || "").trim().toLowerCase()
  if (!reference || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Enter your order number and checkout email.")
  }
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "display_id", "custom_display_id", "status", "total", "subtotal", "discount_total", "shipping_total", "currency_code", "created_at", "email", "metadata", "fulfillments.*", "fulfillments.labels.*", "shipping_address.*", "items.*"],
    filters: { email, ...(/^\d+$/.test(reference) ? { $or: [{ custom_display_id: reference }, { display_id: reference }] } : reference.startsWith("order_") ? { id: reference } : { custom_display_id: reference }) },
    pagination: { take: 2 },
  })
  if (!orders.length) throw new MedusaError(MedusaError.Types.NOT_FOUND, "No order found. Check your order number and checkout email.")
  if (orders.length > 1) throw new MedusaError(MedusaError.Types.INVALID_DATA, "This order number has more than one match. Please use the full order reference from your confirmation or contact support.")
  const order = orders[0]
  const tracking = orderTracking(order)
  return new StepResponse({
    id: order.id,
    display_id: order.custom_display_id || order.display_id,
    status: order.status,
    custom_status: tracking.status,
    custom_status_label: tracking.status,
    tracking_number: tracking.trackingNumber,
    carrier: tracking.carrier,
    tracking: { carrier: tracking.carrier, tracking_number: tracking.trackingNumber, steps: tracking.steps },
    created_at: order.created_at,
    currency_code: order.currency_code,
    total: order.total,
    subtotal: order.subtotal,
    shipping_total: order.shipping_total,
    discount_total: order.discount_total,
    shipping_address: order.shipping_address,
    items: order.items,
    steps: tracking.steps,
  })
})

export const trackOrderWorkflow = createWorkflow("track-naqsh-order-workflow", (input: Input) => new WorkflowResponse(trackOrderStep(input)))
