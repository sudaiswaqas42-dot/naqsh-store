import { MedusaService } from "@medusajs/framework/utils"
import { ReturnRequest } from "./models/return-request"

class ReturnModuleService extends MedusaService({
  ReturnRequest,
}) {}

export default ReturnModuleService
