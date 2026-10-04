import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { sendOrderEmailWorkflow } from "../workflows/send-order-email"

export default async function statusNotifier({
  event: { data },
  container,
}: SubscriberArgs<{
  id: string
  kind: string
  custom_status?: string
  tracking_number?: string
  carrier?: string
}>) {
  await sendOrderEmailWorkflow(container).run({
    input: {
      order_id: data.id,
      kind: data.kind,
      custom_status: data.custom_status,
      tracking_number: data.tracking_number,
      carrier: data.carrier,
    },
  })
}

export const config: SubscriberConfig = {
  event: "naqsh.order-status-notification",
  context: { subscriberId: "naqsh-order-status" },
}
