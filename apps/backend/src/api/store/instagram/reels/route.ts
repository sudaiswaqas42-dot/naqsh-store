import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { InstagramService } from "../../../../modules/instagram/instagram-service"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const feed = await req.scope.resolve<InstagramService>("instagram").getFeed()
    res.setHeader("Cache-Control", "no-store")
    res.json({ success: true, ...feed })
  } catch {
    res.status(503).json({ success: false, reels: [], error: "Reels temporarily unavailable" })
  }
}
