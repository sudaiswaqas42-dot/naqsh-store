import { MedusaContainer } from "@medusajs/framework/types"
import { InstagramService } from "../modules/instagram/instagram-service"

export default async function run(container: MedusaContainer) {
  await container.resolve<InstagramService>("instagram").refreshToken()
}

export const config = { name: "instagram-token-refresh", schedule: "0 3 * * *" }
