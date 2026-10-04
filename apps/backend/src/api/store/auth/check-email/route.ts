import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { z } from "zod"

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
})

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid email address." })
  }

  const { email } = parsed.data

  try {
    const customerService = req.scope.resolve(Modules.CUSTOMER)
    const customers = await customerService.listCustomers({ email })

    const hasAccount = customers && customers.some((c: any) => c.has_account === true)

    return res.json({
      exists: Boolean(hasAccount),
    })
  } catch (error: any) {
    return res.json({ exists: false })
  }
}
