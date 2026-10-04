import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, MedusaError, Modules } from "@medusajs/framework/utils"

type Input = {
  id: string
  custom_status?: string
  tracking_number?: string
  carrier?: string
  internal_notes?: string
}

const statuses = [
  "Pending",
  "Confirmed",
  "Processing",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
  "Returned",
  "Refunded",
]

const updateStatusStep = createStep("update-order-custom-status", async (input: Input, { container }) => {
  if (input.custom_status && !statuses.includes(input.custom_status)) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Invalid order status")
  }
  const service = container.resolve(Modules.ORDER)
  const order = await service.retrieveOrder(input.id)
  const metadata = { ...order.metadata, status_updated_at: new Date().toISOString() }
  for (const field of ["custom_status", "tracking_number", "carrier", "internal_notes"] as const) {
    if (input[field] !== undefined) {
      if (typeof input[field] !== "string" || input[field]!.length > 2000) {
        throw new MedusaError(MedusaError.Types.INVALID_DATA, "Invalid status details")
      }
      metadata[field] = input[field]
    }
  }
  const updated = await service.updateOrders(input.id, { metadata })

  const statusLower = (input.custom_status || "").toLowerCase().trim()
  if (input.custom_status && String(order.metadata?.custom_status || "").toLowerCase() !== statusLower) {
    let kind: string = "status_update"
    if (statusLower === "confirmed") kind = "confirmed"
    else if (statusLower === "shipped") kind = "shipped"
    else if (statusLower === "out for delivery") kind = "out_for_delivery"
    else if (statusLower === "delivered") kind = "delivered"
    else if (statusLower === "cancelled" || statusLower === "canceled") kind = "cancelled"
    else if (statusLower === "refunded") kind = "refunded"
    else if (statusLower === "packed") kind = "packed"
    else if (statusLower === "processing") kind = "processing"
    else kind = "status_update"

    await container.resolve(Modules.EVENT_BUS).emit({
      name: "naqsh.order-status-notification",
      data: {
        id: input.id,
        kind,
        custom_status: input.custom_status,
        carrier: input.carrier || order.metadata?.carrier,
        tracking_number: input.tracking_number || order.metadata?.tracking_number,
      },
    }).catch(() => {
      container.resolve(ContainerRegistrationKeys.LOGGER).error("Order saved, but notification event could not be queued")
    })
  }

  return new StepResponse(updated)
})

export const updateOrderStatusWorkflow = createWorkflow("update-order-custom-status-workflow", (input: Input) => {
  return new WorkflowResponse(updateStatusStep(input))
})
