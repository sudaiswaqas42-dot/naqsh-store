import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { runInventoryAutoLinker } from "../utils/inventory-auto-linker"

export default async function autoLinkVariantInventorySubscriber({
  event,
  container,
}: SubscriberArgs<any>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER) as any
  try {
    const result = await runInventoryAutoLinker()
    if (result.linked > 0) {
      logger.info(`[Subscriber:${event.name}] Auto-linked ${result.linked} variant(s): ${result.details.join(", ")}`)
    }
  } catch (err: any) {
    logger.warn(`[Subscriber:${event.name}] Auto-link encountered error: ${err?.message || err}`)
  }
}

export const config: SubscriberConfig = {
  event: ["product-variant.created", "product.created", "product-variant.updated", "product.updated"],
  context: { subscriberId: "naqsh-auto-link-inventory-subscriber" },
}
