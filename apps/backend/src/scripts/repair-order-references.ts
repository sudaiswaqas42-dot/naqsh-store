import { ExecArgs } from "@medusajs/framework/types"
import { repairOrderReferencesWorkflow } from "../workflows/repair-order-references"

export default async function repairOrderReferences({ container }: ExecArgs) {
  const host = new URL(process.env.DATABASE_URL || "postgres://localhost").hostname
  if (!["localhost", "127.0.0.1", "::1", "[::1]"].includes(host)) throw new Error("This repair script is restricted to the local database.")
  const { result } = await repairOrderReferencesWorkflow(container).run({ input: {} })
  container.resolve("logger").info(`Assigned unique references to ${result.repaired} duplicate orders. No orders were deleted.`)
}
