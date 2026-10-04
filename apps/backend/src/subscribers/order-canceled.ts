import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { sendOrderEmailWorkflow } from "../workflows/send-order-email"

export default async function orderCanceledSubscriber({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  await sendOrderEmailWorkflow(container).run({
    input: { order_id: data.id, kind: "cancelled" },
  })
}

export const config: SubscriberConfig = {
  event: "order.canceled",
  context: { subscriberId: "naqsh-order-canceled" },
}
