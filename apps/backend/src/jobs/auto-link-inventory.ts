import { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { runInventoryAutoLinker } from "../utils/inventory-auto-linker"

export default async function run(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER) as any
  try {
    const result = await runInventoryAutoLinker()
    if (result.linked > 0) {
      logger.info(`[AutoLinkInventory] Automatically linked ${result.linked} unlinked variant(s) to inventory: ${result.details.join(", ")}`)
    }
  } catch (err: any) {
    logger.warn(`[AutoLinkInventory] Job encountered error: ${err?.message || err}`)
  }
}

export const config = { name: "auto-link-inventory-job", schedule: "* * * * *" }
