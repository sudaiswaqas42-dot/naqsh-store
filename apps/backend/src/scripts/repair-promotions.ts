import { ExecArgs, CreatePromotionDTO } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules, RuleType } from "@medusajs/framework/utils"
import { createPromotionsWorkflow, updatePromotionsWorkflow, updatePromotionRulesWorkflow, createPromotionRulesWorkflow } from "@medusajs/medusa/core-flows"

export default async function repairPromotions({ container }: ExecArgs) {
  const service = container.resolve(Modules.PROMOTION)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const definitions: CreatePromotionDTO[] = [
    { code: "LUXE20", type: "standard", status: "active", is_automatic: false, application_method: { type: "percentage", value: 20, currency_code: "pkr", target_type: "items", allocation: "across" } },
    { code: "FLAT1000", type: "standard", status: "active", is_automatic: false, application_method: { type: "fixed", value: 1000, currency_code: "pkr", target_type: "items", allocation: "across" } },
    { code: "FREESHIP", type: "standard", status: "active", is_automatic: false, application_method: { type: "percentage", value: 100, currency_code: "pkr", target_type: "shipping_methods", allocation: "across" } },
  ]
  for (const definition of definitions) {
    const [existing] = await service.listPromotions({ code: definition.code }, { relations: ["application_method", "rules", "rules.values"] })
    if (existing) {
      await updatePromotionsWorkflow(container).run({ input: { promotionsData: [{ id: existing.id, ...definition }] } })
    } else {
      await createPromotionsWorkflow(container).run({ input: { promotionsData: [definition] } })
    }
    if (definition.code === "FLAT1000") {
      const [promotion] = await service.listPromotions({ code: "FLAT1000" }, { relations: ["rules"] })
      const minimum = promotion.rules?.find(rule => ["item_total", "original_item_subtotal"].includes(rule.attribute || ""))
      const rule = { attribute: "original_item_subtotal", operator: "gte" as const, values: ["5000"] }
      if (minimum) {
        await updatePromotionRulesWorkflow(container).run({ input: { data: [{ id: minimum.id, ...rule }] } })
      } else {
        await createPromotionRulesWorkflow(container).run({ input: { rule_type: RuleType.RULES, data: { id: promotion.id, rules: [rule] } } })
      }
    }
    logger.info("Configured promotion " + definition.code)
  }
}
