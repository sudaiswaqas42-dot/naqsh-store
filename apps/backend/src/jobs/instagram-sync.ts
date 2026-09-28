import { MedusaContainer } from "@medusajs/framework/types"
import { InstagramService } from "../modules/instagram/instagram-service"

export default async function run(container: MedusaContainer) {
  await container.resolve<InstagramService>("instagram").fetchAndStoreReels()
}

export const config = { name: "instagram-sync", schedule: "*/20 * * * *" }
