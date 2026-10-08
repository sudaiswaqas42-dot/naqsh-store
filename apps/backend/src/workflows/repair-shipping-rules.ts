import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import type { UpdateShippingOptionRuleDTO } from "@medusajs/framework/types"

const normalizeShippingRulesStep = createStep("normalize-shipping-rules", async (_, { container }) => {
  const fulfillment = container.resolve(Modules.FULFILLMENT)
  let updated = 0
  let skip = 0
  while (true) {
    const rules = await fulfillment.listShippingOptionRules({}, { skip, take: 100 })
    const changes = rules
      .filter(rule => ["enabled_in_store", "is_return"].includes(rule.attribute) && typeof rule.value === "boolean")
      .map(rule => ({ id: rule.id, attribute: rule.attribute, operator: rule.operator as UpdateShippingOptionRuleDTO["operator"], value: String(rule.value) }))
    if (changes.length) {
      await fulfillment.updateShippingOptionRules(changes)
      updated += changes.length
    }
    if (rules.length < 100) break
    skip += rules.length
  }
  return new StepResponse({ updated })
})

export const repairShippingRulesWorkflow = createWorkflow("repair-shipping-rules", () => {
  return new WorkflowResponse(normalizeShippingRulesStep())
})
