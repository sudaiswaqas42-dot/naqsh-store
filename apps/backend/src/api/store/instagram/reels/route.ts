import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { InstagramService } from "../../../../modules/instagram/instagram-service"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const reels = await req.scope.resolve<InstagramService>("instagram").getLatestReels(8)
  res.setHeader("Cache-Control", "public, max-age=60")
  res.json({ success: true, reels, count: reels.length })
}
