import { MedusaService, Modules } from "@medusajs/framework/utils"
import { container } from "@medusajs/framework"
import { OrderNumber } from "./models/order-number"

export default class OrderNumberModuleService extends MedusaService({ OrderNumber }) {
  async allocateReference() {
    const orders = container.resolve(Modules.ORDER)
    const latest = await orders.listOrders({}, { take: 1, order: { display_id: "DESC" }, select: ["display_id"] })
    const minimum = Math.max(1309, Number(latest[0]?.display_id || 0))
    // Reservations use the database sequence, so concurrent checkouts cannot
    // receive the same public reference, even after imported order history.
    let reference = 0
    do {
      const allocation = await this.createOrderNumbers({})
      reference = 1309 + Number(allocation.sequence)
    } while (reference <= minimum)
    return String(reference)
  }
}
