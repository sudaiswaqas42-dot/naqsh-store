import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, MedusaError, Modules } from "@medusajs/framework/utils"
import { createOrderFulfillmentWorkflow, createOrderShipmentWorkflow, markOrderFulfillmentAsDeliveredWorkflow, createAndCompleteReturnOrderWorkflow } from "@medusajs/medusa/core-flows"

type Input = { order_id: string; action: "fulfill" | "ship" | "deliver" | "return" | "update"; fulfillment_id?: string; carrier?: string; tracking_number?: string; note?: string; custom_status?: string }

const manageParcelStep = createStep("manage-parcel", async (input: Input, { container }) => {
  const result = await container.resolve(Modules.LOCKING).execute(`naqsh-parcel:${input.order_id}`, async () => {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const { data } = await query.graph({ entity: "order", fields: ["id", "status", "metadata", "items.*", "items.detail.*", "shipping_methods.*", "fulfillments.*", "fulfillments.items.*"], filters: { id: input.order_id } })
    const order = data[0] as any
    if (!order || order.status === "canceled") throw new MedusaError(MedusaError.Types.INVALID_DATA, "This order cannot be fulfilled.")
    const service = container.resolve(Modules.ORDER)
    const metadata = { ...order.metadata }
    const fulfillments = (order.fulfillments || []).filter((item: any) => !item.canceled_at)
    const fulfillment = fulfillments.find((item: any) => item.id === input.fulfillment_id) || fulfillments[0]

    if (input.action === "update") {
      metadata.custom_status = input.custom_status?.trim() || "Processing"
      if (input.carrier) metadata.carrier = input.carrier.trim()
      if (input.tracking_number) metadata.tracking_number = input.tracking_number.trim()
      if (input.note) metadata.internal_notes = input.note.trim()
    } else if (input.action === "fulfill") {
      const items = (order.items || []).map((item: any) => ({ id: item.id, quantity: Number(item.quantity) - Number(item.detail?.fulfilled_quantity || 0) })).filter((item: any) => item.quantity > 0)
      if (items.length > 0) {
        await createOrderFulfillmentWorkflow(container).run({ input: { order_id: order.id, items, shipping_option_id: order.shipping_methods?.[0]?.shipping_option_id, no_notification: true } }).catch(() => {})
      }
      metadata.custom_status = input.custom_status?.trim() || "Processing"
      if (input.note) metadata.internal_notes = input.note.trim()
    } else {
      if (metadata.courier_returns?.[fulfillment?.id]) throw new MedusaError(MedusaError.Types.INVALID_DATA, "This parcel has already been returned.")
      const items = (fulfillment?.items || []).map((item: any) => ({ id: item.line_item_id, quantity: Number(item.quantity) }))

      if (input.action === "ship") {
        const carrier = input.carrier?.trim()
        const tracking = input.tracking_number?.trim()
        if (!carrier || !tracking || carrier.length > 100 || tracking.length > 200) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Select a courier and enter a valid tracking ID.")
        let targetFulfillment = fulfillment
        let targetItems = items
        if (!targetFulfillment) {
          const itemsToFulfill = (order.items || []).map((item: any) => ({ id: item.id, quantity: Number(item.quantity) - Number(item.detail?.fulfilled_quantity || 0) })).filter((item: any) => item.quantity > 0)
          if (itemsToFulfill.length > 0) {
            try {
              const { result: createdFulfillment } = await createOrderFulfillmentWorkflow(container).run({ input: { order_id: order.id, items: itemsToFulfill, shipping_option_id: order.shipping_methods?.[0]?.shipping_option_id, no_notification: true } })
              targetFulfillment = createdFulfillment as any
              targetItems = (createdFulfillment?.items || []).map((it: any) => ({ id: it.line_item_id || it.id, quantity: Number(it.quantity) }))
            } catch (err: any) {
              console.warn("Auto-fulfillment before ship warning:", err.message)
            }
          }
        }
        if (targetFulfillment && !targetFulfillment.shipped_at) {
          const shipItems = targetItems.length > 0 ? targetItems : (order.items || []).map((it: any) => ({ id: it.id, quantity: Number(it.quantity) }))
          await createOrderShipmentWorkflow(container).run({ input: { order_id: order.id, fulfillment_id: targetFulfillment.id, items: shipItems, labels: [{ tracking_number: tracking, tracking_url: "", label_url: "" }], metadata: { carrier }, no_notification: true } }).catch(() => {})
        }
        metadata.carrier = carrier
        metadata.tracking_number = tracking
        metadata.custom_status = input.custom_status?.trim() || "Shipped"
        if (input.note) metadata.internal_notes = input.note.trim()
      } else if (input.action === "deliver") {
        if (fulfillment && fulfillment.shipped_at && !fulfillment.delivered_at) {
          await markOrderFulfillmentAsDeliveredWorkflow(container).run({ input: { orderId: order.id, fulfillmentId: fulfillment.id, no_notification: true } }).catch(() => {})
        }
        metadata.custom_status = "Delivered"
        if (input.note) metadata.internal_notes = input.note.trim()
      } else if (input.action === "return") {
        if (!input.note?.trim()) throw new MedusaError(MedusaError.Types.INVALID_DATA, "Enter a courier return reason.")
        const returnShippingOptionId = order.shipping_methods?.[0]?.shipping_option_id || "so_01M3EW9ADCDVY4HHDJT9SVD8HR"
        let returnedId = "ret_" + Date.now()
        try {
          const { result: returned } = await createAndCompleteReturnOrderWorkflow(container).run({
            input: {
              order_id: order.id,
              items: items.length ? items : (order.items || []).map((it: any) => ({ id: it.id, quantity: Number(it.quantity) })),
              location_id: fulfillment?.location_id,
              note: input.note.trim().slice(0, 2000),
              receive_now: true,
              refund_amount: 0,
              return_shipping: {
                option_id: returnShippingOptionId,
                price: 0,
              },
            },
          })
          if (returned?.id) returnedId = returned.id
        } catch (returnErr: any) {
          console.warn("createAndCompleteReturnOrderWorkflow notice, recording return directly:", returnErr.message)
        }
        const fulfillmentKey = fulfillment?.id || "default_fulfillment"
        metadata.courier_returns = { ...metadata.courier_returns, [fulfillmentKey]: returnedId }
        metadata.return_note = input.note.trim().slice(0, 2000)
        metadata.custom_status = "Returned"
      } else throw new MedusaError(MedusaError.Types.INVALID_DATA, "Unknown parcel action.")
    }
    await service.updateOrders(order.id, { metadata })
    if (input.action !== "fulfill") await container.resolve(Modules.EVENT_BUS).emit({ name: "naqsh.order-status-notification", data: { id: order.id, kind: input.action === "ship" ? "shipped" : input.action === "deliver" ? "delivered" : "status_update", custom_status: metadata.custom_status, carrier: metadata.carrier, tracking_number: metadata.tracking_number } }).catch(() => container.resolve(ContainerRegistrationKeys.LOGGER).error("Parcel updated, but its customer notification could not be queued."))
    return { status: metadata.custom_status }
  })
  return new StepResponse(result)
})

export const manageParcelWorkflow = createWorkflow("manage-parcel", (input: Input) => new WorkflowResponse(manageParcelStep(input)))
