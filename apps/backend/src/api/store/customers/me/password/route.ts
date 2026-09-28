import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { changeCustomerPasswordWorkflow } from "../../../../../workflows/change-customer-password"

export const POST = async (req: AuthenticatedMedusaRequest, res: MedusaResponse) => {
  const parsed = z.object({ old_password: z.string().min(1).max(256), new_password: z.string().min(8).max(256) }).safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ message: "Enter your current password and a new password of at least 8 characters." })
  const { result } = await changeCustomerPasswordWorkflow(req.scope).run({ input: { customer_id: req.auth_context.actor_id, ...parsed.data } })
  return res.json(result)
}
