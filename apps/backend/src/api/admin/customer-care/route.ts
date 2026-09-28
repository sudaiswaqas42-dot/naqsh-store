import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import CustomerCareService from "../../../modules/customer-care/service"
import { CUSTOMER_CARE_MODULE } from "../../../modules/customer-care"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const service: CustomerCareService = req.scope.resolve(CUSTOMER_CARE_MODULE)
  const offset = Math.max(0, Number(req.query.offset) || 0)
  const [messages, count] = await service.listAndCountSupportMessages({}, { take: 20, skip: offset, order: { created_at: "DESC" } })
  const [, subscribers] = await service.listAndCountNewsletterSubscriptions({}, { take: 1 })
  return res.json({ messages, count, subscribers, offset, limit: 20 })
}
