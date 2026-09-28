import { authenticate, defineMiddlewares } from "@medusajs/framework/http"
import { authenticateCron } from "./cron/auth"

export default defineMiddlewares({
  routes: [{ matcher: "/cron/*", method: "GET", middlewares: [authenticateCron] }, {
    matcher: "/store/customers/me/password",
    method: "POST",
    middlewares: [authenticate("customer", ["session", "bearer"])],
  }],
})
