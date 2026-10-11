import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, MedusaError, Modules } from "@medusajs/framework/utils"
import { createOrderFulfillmentWorkflow, createOrderShipmentWorkflow, markOrderFulfillmentAsDeliveredWorkflow, createAndCompleteReturnOrderWorkflow } from "@medusajs/medusa/core-flows"

type Input = { order_id: string; action: "fulfill" | "ship" | "deliver" | "return"; fulfillment_id?: string; carrier?: string; tracking_number?: string; note?: string; custom_status?: string }

const manageParcelStep = createStep("manage-parcel", async (input: Input, { container }) => {
  const result = await container.resolve(Modules.LOCKING).execute(`naqsh-parcel:${input.order_id}`, async () => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const { data } = await query.graph({ entity: "order", fields: ["id", "status", "metadata", "items.*", "items.detail.*", "shipping_methods.*", "fulfillments.*", "fulfillments.items.*"], filters: { id: input.order_id } })
    const order = data[0] as any
    if (!order || order.status === "canceled") throw new MedusaError(MedusaError.Types.INVALID_DATA, "This order cannot be fulfilled.")
    const service = container.resolve(Modules.ORDER)
    const metadata = { ...order.metadata }
    const fulfillments = (order.fulfillments || []).filter((item: any) => !item.canceled_at)
    const fulfillment = fulfillments.find((item: any) => item.id === input.fulfillment_id)
    if (input.action === "fulfill") {
      const items = (order.items || []).map((item: any) => ({ id: item.id, quantity: Number(item.quantity) - Number(item.detail?.fulfilled_quantity || 0) })).filter((item: any) => item.quantity > 0)
      if (!items.length) throw new MedusaError(MedusaError.Types.INVALID_DATA, "All items are already fulfilled.")
      await createOrderFulfillmentWorkflow(container).run({ input: { order_id: order.id, items, shipping_option_id: order.shipping_methods?.[0]?.shipping_option_id, no_notification: true } })
      metadata.custom_status = input.custom_status?.trim() || "Confirmed"
    } else {
      if (!fulfillment) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Select an active fulfillment for this order.")
      if (metadata.courier_returns?.[fulfillment.id]) throw new MedusaError(MedusaError.Types.INVALID_DATA, "This parcel has already been returned.")
      const items = (fulfillment.items || []).map((item: any) => ({ id: item.line_item_id, quantity: Number(item.quantity) }))
      if (!items.length || items.some((item: any) => !item.id || item.quantity <= 0)) throw new MedusaError(MedusaError.Types.INVALID_DATA, "No valid parcel items were found.")
      if (input.action === "ship") {
        const carrier = input.carrier?.trim()
        const tracking = input.tracking_number?.trim()
        if (!carrier || !tracking || carrier.length > 100 || tracking.length > 200) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Select a courier and enter a valid tracking ID.")
        if (fulfillment.shipped_at) throw new MedusaError(MedusaError.Types.INVALID_DATA, "This parcel has already been shipped.")
        await createOrderShipmentWorkflow(container).run({ input: { order_id: order.id, fulfillment_id: fulfillment.id, items, labels: [{ tracking_number: tracking, tracking_url: "", label_url: "" }], metadata: { carrier }, no_notification: true } })
        metadata.carrier = carrier
        metadata.tracking_number = tracking
        metadata.custom_status = input.custom_status?.trim() || "Shipped"
        if (input.note) metadata.internal_notes = input.note.trim()
      } else if (input.action === "deliver") {
        if (!fulfillment.shipped_at || fulfillment.delivered_at) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Only a shipped parcel can be marked delivered.")
        await markOrderFulfillmentAsDeliveredWorkflow(container).run({ input: { orderId: order.id, fulfillmentId: fulfillment.id, no_notification: true } })
        metadata.custom_status = fulfillments.every((item: any) => item.id === fulfillment.id || item.delivered_at) ? "Delivered" : "Shipped"
      } else if (input.action === "return") {
        if (!fulfillment.shipped_at) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Only dispatched parcels can be returned by the courier.")
        if (!input.note?.trim()) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Enter a courier return reason.")
        const { result: returned } = await createAndCompleteReturnOrderWorkflow(container).run({ input: { order_id: order.id, items, location_id: fulfillment.location_id, note: input.note.trim().slice(0, 2000), receive_now: true, refund_amount: 0 } })
        metadata.courier_returns = { ...metadata.courier_returns, [fulfillment.id]: returned.id }
        metadata.custom_status = fulfillments.every((item: any) => metadata.courier_returns[item.id]) ? "Returned" : "Shipped"
      } else throw new MedusaError(MedusaError.Types.INVALID_DATA, "Unknown parcel action.")
    }
    await service.updateOrders(order.id, { metadata })
    if (input.action !== "fulfill") await container.resolve(Modules.EVENT_BUS).emit({ name: "naqsh.order-status-notification", data: { id: order.id, kind: input.action === "ship" ? "shipped" : input.action === "deliver" ? "delivered" : "status_update", custom_status: metadata.custom_status, carrier: metadata.carrier, tracking_number: metadata.tracking_number } }).catch(() => container.resolve(ContainerRegistrationKeys.LOGGER).error("Parcel updated, but its customer notification could not be queued."))
    return { status: metadata.custom_status }
  })
  return new StepResponse(result)
})

export const manageParcelWorkflow = createWorkflow("manage-parcel", (input: Input) => new WorkflowResponse(manageParcelStep(input)))
