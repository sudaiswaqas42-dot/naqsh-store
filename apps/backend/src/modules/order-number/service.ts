import { MedusaService } from "@medusajs/framework/utils"
import { OrderNumber } from "./models/order-number"

export default class OrderNumberModuleService extends MedusaService({ OrderNumber }) {
  async allocateReference() {
    const allocation = await this.createOrderNumbers({})
    return String(1309 + Number(allocation.sequence))
  }
}
