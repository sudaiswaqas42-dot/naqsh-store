import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { sendOrderEmailWorkflow } from "../workflows/send-order-email"

export default async function orderDelivered({ event: { data }, container }: SubscriberArgs<{ id: string; no_notification?: boolean }>) {
  if (data.no_notification) return
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data: fulfillments } = await query.graph({ entity: "fulfillment", fields: ["id", "order.id"], filters: { id: data.id } })
  const orderId = fulfillments[0]?.order?.id
  if (!orderId) return
  const { data: orders } = await query.graph({ entity: "order", fields: ["id", "items.quantity", "items.detail.delivered_quantity"], filters: { id: orderId } })
  const items = orders[0]?.items || []
  if (!items.length || !items.every((item) => Number(item?.detail?.delivered_quantity || 0) >= Number(item?.quantity || 0))) return
  await sendOrderEmailWorkflow(container).run({ input: { order_id: orderId, kind: "delivered" } })
}

export const config: SubscriberConfig = { event: "delivery.created", context: { subscriberId: "naqsh-order-delivered" } }
