import { authenticate, defineMiddlewares } from "@medusajs/framework/http"
import { authenticateCron } from "./cron/auth"

export default defineMiddlewares({
  routes: [{ matcher: "/cron/*", method: "GET", middlewares: [authenticateCron] }, {
    matcher: "/admin/orders/:id/edits/items",
    method: "POST",
    middlewares: [(_req, res) => {
      res.status(403).json({ message: "Adding products to placed orders is disabled. Create a separate order for additional products." })
    }],
  }, {
    matcher: "/store/customers/me/password",
    method: "POST",
    middlewares: [authenticate("customer", ["session", "bearer"])],
  }],
})
