import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

let cached: { expires: number; rankings: Record<string, { sold: number; recent: number }> } | null = null
export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  if (cached && cached.expires > Date.now()) return res.json({ rankings: cached.rankings })
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const rankings: Record<string, { sold: number; recent: number }> = {}
  let skip = 0
  const cutoff = Date.now() - 30 * 86400000
  while (true) {
    const { data: orders } = await query.graph({ entity: "order", fields: ["id", "created_at", "status", "items.product_id", "items.quantity"], pagination: { take: 100, skip, order: { created_at: "DESC" } } })
    for (const order of orders) {
      if (order.status === "canceled" || order.status === "draft") continue
      for (const item of order.items || []) {
        if (!item?.product_id) continue
        const rank = rankings[item.product_id] ||= { sold: 0, recent: 0 }
        rank.sold += Number(item.quantity)
        if (new Date(order.created_at).getTime() >= cutoff) rank.recent += Number(item.quantity)
      }
    }
    if (orders.length < 100) break
    skip += orders.length
  }
  cached = { expires: Date.now() + 60000, rankings }
  return res.json({ rankings })
}
