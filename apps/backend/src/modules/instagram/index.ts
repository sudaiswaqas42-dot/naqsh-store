import { Module } from "@medusajs/framework/utils"
import { InstagramService } from "./instagram-service"

export const INSTAGRAM_MODULE = "instagram"
export default Module(INSTAGRAM_MODULE, { service: InstagramService })
