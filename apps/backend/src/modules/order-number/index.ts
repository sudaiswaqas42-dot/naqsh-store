import { Module } from "@medusajs/framework/utils"
import OrderNumberModuleService from "./service"

export const ORDER_NUMBER_MODULE = "orderNumber"
export default Module(ORDER_NUMBER_MODULE, { service: OrderNumberModuleService })
