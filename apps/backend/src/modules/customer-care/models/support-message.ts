import { model } from "@medusajs/framework/utils"

export const SupportMessage = model.define("support_message", {
  id: model.id().primaryKey(),
  name: model.text(),
  email: model.text(),
  phone: model.text().nullable(),
  subject: model.text(),
  message: model.text(),
  status: model.enum(["open", "in_progress", "resolved"]).default("open"),
  admin_notes: model.text().nullable(),
})
