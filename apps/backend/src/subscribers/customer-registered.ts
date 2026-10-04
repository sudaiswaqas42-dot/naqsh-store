import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function customerRegistered({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  try {
    const query = container.resolve(ContainerRegistrationKeys.QUERY)
    const { data: customers } = await query.graph({
      entity: "customer",
      fields: ["id", "email", "first_name", "last_name"],
      filters: { id: data.id },
    })

    const customer = customers[0]
    if (!customer?.email) return

    const notification = container.resolve(Modules.NOTIFICATION)
    await notification.createNotifications({
      to: customer.email,
      channel: "email",
      template: "customer-welcome",
      resource_id: customer.id,
      resource_type: "customer",
      idempotency_key: `customer-welcome-${customer.id}`,
      data: {
        email: customer.email,
        name: [customer.first_name, customer.last_name].filter(Boolean).join(" ") || "Valued Shopper",
      },
    })
    logger.info(`[Email] Welcome email dispatched for customer ${customer.email}`)
  } catch (err: any) {
    logger.error(`[Email] Failed to send customer welcome email: ${err?.message || err}`)
  }
}

export const config: SubscriberConfig = {
  event: "customer.created",
  context: { subscriberId: "naqsh-customer-welcome" },
}
