import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { sendOrderEmailWorkflow } from "../workflows/send-order-email"

export default async function statusNotifier({ event: { data }, container }: SubscriberArgs<{ id: string; kind: "confirmed" | "delivered" }>) {
  await sendOrderEmailWorkflow(container).run({ input: { order_id: data.id, kind: data.kind } })
}

export const config: SubscriberConfig = { event: "naqsh.order-status-notification", context: { subscriberId: "naqsh-order-status" } }
