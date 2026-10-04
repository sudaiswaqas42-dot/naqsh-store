import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { sendOrderEmailWorkflow } from "../workflows/send-order-email"

export default async function orderShipped({ event: { data }, container }: SubscriberArgs<{ id: string; no_notification?: boolean }>) {
  if (data.no_notification) return
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  try {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const { data: fulfillments } = await query.graph({
      entity: "fulfillment",
      fields: ["id", "order.id"],
      filters: { id: data.id },
    })
    const orderId = fulfillments[0]?.order?.id
    if (!orderId) {
      logger.warn(`Fulfillment ${data.id}: no linked order found, skipping shipment email`)
      return
    }
    await sendOrderEmailWorkflow(container).run({ input: { order_id: orderId, kind: "shipped" } })
    logger.info(`Shipment email sent for order ${orderId} (fulfillment ${data.id})`)
  } catch (err) {
    logger.error(`Failed to send shipment email for fulfillment ${data.id}: ${err}`)
  }
}

export const config: SubscriberConfig = {
  event: ["fulfillment.created", "shipment.created"],
  context: { subscriberId: "naqsh-order-shipped" },
}

