import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"
import { HOMEPAGE_MODULE } from "../modules/homepage"

type CodSettings = { account_name: string; account_number: string; whatsapp_number?: string }
const saveCodSettingsStep = createStep("save-cod-settings", async (input: CodSettings, { container }) => {
  if (typeof input.account_name !== "string" || typeof input.account_number !== "string") {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Account name and number are required")
  }
  const accountName = input.account_name.trim()
  const accountNumber = input.account_number.replace(/[\s-]/g, "")
  if (!accountName || accountName.length > 100 || !/^(03\d{9}|\+?923\d{9})$/.test(accountNumber)) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Enter an account name and a valid Pakistani JazzCash mobile number")
  }

  const rawWhatsapp = typeof input.whatsapp_number === "string" ? input.whatsapp_number.trim() : ""
  let whatsappNumber = ""
  if (rawWhatsapp) {
    const cleanDigits = rawWhatsapp.replace(/[^\d+]/g, "").replace(/\+/g, "")
    if (!/^(?:92|0092|0)?3\d{9}$/.test(cleanDigits)) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Enter a valid Pakistani WhatsApp mobile number (e.g. 03XXXXXXXXX or +92 3XX XXXXXXX)")
    }
    whatsappNumber = rawWhatsapp
  }

  const service = container.resolve(HOMEPAGE_MODULE)
  const [existing] = await service.listHomepageSections({ key: "cod_settings" })
  const settings = {
    account_name: accountName,
    account_number: accountNumber,
    whatsapp_number: whatsappNumber,
    shipping_advance: 250,
  }
  if (existing) await service.updateHomepageSections({ id: existing.id, settings })
  else await service.createHomepageSections({ key: "cod_settings", type: "cod_settings", title: "COD advance shipping", rank: 100, is_active: false, settings })
  return new StepResponse(settings)
})

export const saveCodSettingsWorkflow = createWorkflow("save-cod-settings", (input: CodSettings) => {
  const settings = saveCodSettingsStep(input)
  return new WorkflowResponse(settings)
})

