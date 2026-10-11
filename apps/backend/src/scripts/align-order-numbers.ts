import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, MedusaError, Modules } from "@medusajs/framework/utils"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"

export default async function alignOrderNumbers({ container, args }: ExecArgs) {
  const host = new URL(process.env.DATABASE_URL || "postgres://localhost").hostname
  if (!["localhost", "127.0.0.1", "::1", "[::1]"].includes(host)) throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "Local database only")
  const service = container.resolve(Modules.ORDER)
  const orders: any[] = []
  for (let skip = 0; ; skip += 200) {
    const batch = await service.listOrders({}, { take: 200, skip, order: { id: "ASC" } })
    orders.push(...batch)
    if (batch.length < 200) break
  }
  const legacy = orders.filter(order => Number(order.display_id) < 1310)
  const current = orders.filter(order => Number(order.display_id) >= 1310)
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  logger.info(JSON.stringify({ legacy: legacy.length, current: current.length, highest: Math.max(1309, ...current.map(order => Number(order.display_id))), mismatched: current.filter(order => order.custom_display_id && String(order.display_id) !== order.custom_display_id).length }))
  if (!args.includes("--apply")) return
  const backup = path.resolve(process.cwd(), "../../tmp/order-number-backups")
  await mkdir(backup, { recursive: true })
  await writeFile(path.join(backup, `references-${Date.now()}.json`), JSON.stringify(orders.map(order => ({ id: order.id, display_id: order.display_id, custom_display_id: order.custom_display_id })), null, 2))
  if (current.length) await service.updateOrders(current.map(order => ({ id: order.id, custom_display_id: String(order.display_id) })))
  if (legacy.length) await service.softDeleteOrders(legacy.map(order => order.id))
  logger.info(`Aligned ${current.length} order references and removed ${legacy.length} pre-1310 orders using recoverable soft deletion.`)
}
