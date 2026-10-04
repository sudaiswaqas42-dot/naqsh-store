import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { verifyOtp } from "../../../../../utils/otp-store"

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
  otp: z.string().trim().length(6, "Verification code must be 6 digits."),
})

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0]?.message || "Invalid input." })
  }

  const { email, otp } = parsed.data
  const result = verifyOtp(email, otp)

  if (!result.valid) {
    return res.status(400).json({ message: result.error || "Invalid verification code." })
  }

  return res.json({ success: true, message: "Code verified successfully." })
}
