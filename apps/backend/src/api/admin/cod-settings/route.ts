import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { HOMEPAGE_MODULE } from "../../../modules/homepage"

import { saveCodSettingsWorkflow } from "../../../workflows/save-cod-settings"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const service = req.scope.resolve(HOMEPAGE_MODULE)
  const [section] = await service.listHomepageSections({ key: "cod_settings" })
  res.json({ cod_settings: {
    account_name: section?.settings?.account_name || "",
    account_number: section?.settings?.account_number || "",
    whatsapp_number: section?.settings?.whatsapp_number || "",
    shipping_advance: 250,
  } })
}

export const POST = async (req: MedusaRequest<{ account_name: string; account_number: string; whatsapp_number?: string }>, res: MedusaResponse) => {
  const { result } = await saveCodSettingsWorkflow(req.scope).run({ input: req.body })
  res.json({ cod_settings: result })
}

