import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

export default async function inspectPromotions({ container }: ExecArgs) {
  const service = container.resolve(Modules.PROMOTION)
  const promotions = await service.listPromotions({ code: ["LUXE20", "FLAT1000", "FREESHIP"] }, { relations: ["application_method", "rules", "rules.values"] })
  console.log(JSON.stringify(promotions.map(p => ({ code: p.code, status: p.status, method: p.application_method, rules: p.rules }))))
}
