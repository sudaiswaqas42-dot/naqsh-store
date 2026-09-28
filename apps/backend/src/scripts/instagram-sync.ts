import { ExecArgs } from "@medusajs/framework/types"
import { InstagramService } from "../modules/instagram/instagram-service"

export default async function syncInstagram({ container }: ExecArgs) {
  const service = container.resolve<InstagramService>("instagram")
  const result = process.env.INSTAGRAM_REFRESH_TOKEN === "true" ? await service.refreshToken() : await service.fetchAndStoreReels()
  console.log("Instagram task:", result)
  if (!result.success) throw new Error("Instagram task failed. Check configuration and connectivity.")
}
