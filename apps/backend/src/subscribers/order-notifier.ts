import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { sendOrderEmailWorkflow } from "../workflows/send-order-email"

export default async function orderNotifier({ event: { data }, container }: SubscriberArgs<{ id: string }>) {
  await sendOrderEmailWorkflow(container).run({ input: { order_id: data.id, kind: "confirmed" } })
}

export const config: SubscriberConfig = { event: "order.placed", context: { subscriberId: "naqsh-order-confirmed" } }
