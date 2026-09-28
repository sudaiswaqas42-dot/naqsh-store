import { model } from "@medusajs/framework/utils"

export const HomepageSection = model.define("homepage_section", {
  id: model.id().primaryKey(),
  key: model.text(),
  type: model.text(),
  title: model.text(),
  subtitle: model.text().nullable(),
  cta_text: model.text().nullable(),
  cta_link: model.text().nullable(),
  collection_id: model.text().nullable(),
  rank: model.number().default(0),
  is_active: model.boolean().default(true),
  settings: model.json().nullable(),
})

export default HomepageSection
