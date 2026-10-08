import { ExecArgs } from "@medusajs/framework/types"
import { repairShippingRulesWorkflow } from "../workflows/repair-shipping-rules"

export default async function repairShippingRules({ container }: ExecArgs) {
  const { result } = await repairShippingRulesWorkflow(container).run()
  console.log(`Normalized ${result.updated} shipping rule values`)
}
