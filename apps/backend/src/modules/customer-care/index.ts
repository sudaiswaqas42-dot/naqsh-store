import { Module } from "@medusajs/framework/utils"
import CustomerCareService from "./service"

export const CUSTOMER_CARE_MODULE = "customerCare"
export default Module(CUSTOMER_CARE_MODULE, { service: CustomerCareService })
