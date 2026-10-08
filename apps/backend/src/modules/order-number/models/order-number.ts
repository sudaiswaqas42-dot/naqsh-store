import { model } from "@medusajs/framework/utils"

export const OrderNumber = model.define("naqsh_order_number", {
  id: model.id().primaryKey(),
  sequence: model.autoincrement(),
})
