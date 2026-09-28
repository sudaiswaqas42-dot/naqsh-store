import { MedusaService } from "@medusajs/framework/utils"
import { SupportMessage } from "./models/support-message"
import { NewsletterSubscription } from "./models/newsletter-subscription"

export default class CustomerCareService extends MedusaService({ SupportMessage, NewsletterSubscription }) {}
