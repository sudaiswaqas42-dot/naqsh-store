import { defineWidgetConfig } from "@medusajs/admin-sdk"
import BrandLogo from "../components/brand-logo"

const BrandLogoWidget = () => <BrandLogo />

export const config = defineWidgetConfig({ zone: ["login.before", "order.list.before", "product.list.before"] })
export default BrandLogoWidget
