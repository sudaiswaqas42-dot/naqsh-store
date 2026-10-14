import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { HOMEPAGE_MODULE } from "../../../modules/homepage"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve(HOMEPAGE_MODULE)
  const [section] = await service.listHomepageSections({ key: "cod_settings" })
  res.json({ cod_settings: {
    account_name: section?.settings?.account_name || "",
    account_number: section?.settings?.account_number || "",
    shipping_advance: 250,
  } })
}
