import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"

const repairReferencesStep = createStep("repair-duplicate-order-references", async (_input: Record<string, never>, { container }) => {
  const orders = container.resolve(Modules.ORDER)
  const seen = new Set<string>()
  const repairs: { id: string; custom_display_id: string }[] = []
  let skip = 0
  while (true) {
    const batch = await orders.listOrders({}, { select: ["id", "display_id", "custom_display_id"], order: { created_at: "ASC", id: "ASC" }, skip, take: 200 })
    for (const order of batch) {
      const reference = String(order.custom_display_id || order.display_id)
      if (seen.has(reference)) {
        repairs.push({ id: order.id, custom_display_id: `NQ-${order.id.replace(/^order_/, "").toUpperCase()}` })
      } else seen.add(reference)
    }
    if (batch.length < 200) break
    skip += batch.length
  }
  if (repairs.length) await orders.updateOrders(repairs)
  return new StepResponse({ repaired: repairs.length })
})

export const repairOrderReferencesWorkflow = createWorkflow("repair-duplicate-order-references-workflow", (input: Record<string, never>) => new WorkflowResponse(repairReferencesStep(input)))
