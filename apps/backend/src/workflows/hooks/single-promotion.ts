import { completeCartWorkflow, updateCartPromotionsWorkflow } from "@medusajs/medusa/core-flows"
import { ContainerRegistrationKeys, MedusaError, PromotionActions } from "@medusajs/framework/utils"

updateCartPromotionsWorkflow.hooks.validate(async ({ input, cart }, { container }) => {
  const action = input.action || PromotionActions.ADD
  if (action === PromotionActions.REMOVE) return
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({ entity: "cart", fields: ["id", "promotions.code", "promotions.is_automatic"], filters: { id: cart.id } })
  const requested = input.promo_codes || []
  const existing = action === PromotionActions.REPLACE ? [] : (data[0]?.promotions || []).filter(promotion => promotion && !promotion.is_automatic).map(promotion => promotion!.code)
  const codes = Array.from(new Set([...existing, ...requested].filter(Boolean)))
  if (!codes.length) return
  const { data: promotions } = await query.graph({ entity: "promotion", fields: ["code", "is_automatic"], filters: { code: codes } })
  const automatic = new Set(promotions.filter(promotion => promotion.is_automatic).map(promotion => promotion.code))
  if (codes.filter(code => !automatic.has(code)).length > 1) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Only one promotion code can be used per order. Remove the current code first.")
  }
})

completeCartWorkflow.hooks.validate(async ({ cart }, { container }) => {
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const { data } = await query.graph({ entity: "cart", fields: ["id", "promotions.is_automatic"], filters: { id: cart.id } })
  if ((data[0]?.promotions || []).filter(promotion => promotion && !promotion.is_automatic).length > 1) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Only one promotion code can be used per order. Please remove extra codes.")
  }
})
