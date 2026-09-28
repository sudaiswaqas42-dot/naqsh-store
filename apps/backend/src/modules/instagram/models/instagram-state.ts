import { model } from "@medusajs/framework/utils"

export const InstagramState = model.define("instagram_state", {
  id: model.id().primaryKey(),
  token: model.text().nullable(),
  expires_at: model.dateTime().nullable(),
  refreshed_at: model.dateTime().nullable(),
  next_refresh_at: model.dateTime().nullable(),
  reels: model.json().nullable(),
  fetched_at: model.dateTime().nullable(),
})
