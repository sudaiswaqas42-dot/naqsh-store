import { model } from "@medusajs/framework/utils"

export const ReturnRequest = model.define("return_request", {
  id: model.id().primaryKey(),
  order_id: model.text(),
  order_display_id: model.text().nullable(),
  customer_email: model.text(),
  customer_name: model.text().nullable(),
  items: model.json(),
  reason: model.text(),
  action_requested: model.text(),
  status: model.text().default("pending"),
  notes: model.text().nullable(),
  admin_notes: model.text().nullable(),
})

export default ReturnRequest
