import { MedusaService } from "@medusajs/framework/utils"
import { HomepageSection } from "./models/homepage-section"

class HomepageModuleService extends MedusaService({
  HomepageSection,
}) {}

export default HomepageModuleService
