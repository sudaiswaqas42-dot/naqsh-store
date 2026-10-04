import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { InstagramService } from "../../../modules/instagram/instagram-service"
import { connectInstagramWorkflow } from "../../../workflows/connect-instagram"
import { syncInstagramWorkflow } from "../../../workflows/sync-instagram"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  res.setHeader("Cache-Control", "no-store")
  try { res.json(await req.scope.resolve<InstagramService>("instagram").getFeed()) }
  catch { res.status(503).json({ account: null, reels: [], error: "Connect an account or check its token and permissions." }) }
}

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  res.setHeader("Cache-Control", "no-store")
  const body = req.body as { token: string; user_id?: string; provider?: "instagram" | "facebook"; refresh?: boolean }
  try {
    if (body.refresh) {
      const { result } = await syncInstagramWorkflow(req.scope).run({ input: { refreshToken: false } })
      if (!result.success) return res.status(503).json({ error: "Instagram refresh failed. The previous feed is preserved." })
      return res.json(await req.scope.resolve<InstagramService>("instagram").getFeed())
    }
    const { result } = await connectInstagramWorkflow(req.scope).run({ input: { token: body.token, user_id: body.user_id, provider: body.provider } })
    res.json(result)
  } catch {
    res.status(400).json({ error: "Connection failed. Check the access token, matching account ID, permissions and server encryption configuration." })
  }
}
