import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { z } from "zod"
import { generateOtp } from "../../../../../utils/otp-store"
import { sendOtpEmail } from "../../../../../utils/otp-email"

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Please provide a valid email address."),
})

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0]?.message || "Invalid email address." })
  }

  const { email } = parsed.data

  try {
    const customerService = req.scope.resolve(Modules.CUSTOMER)
    const customers = await customerService.listCustomers({ email })

    // Check if customer exists and has an account
    const hasAccount = customers && customers.some((c: any) => c.has_account === true)

    if (!hasAccount && (!customers || customers.length === 0)) {
      return res.status(404).json({
        message: "No account found with this email address. Please sign up first.",
      })
    }

    const { otp, cooldownRemaining } = generateOtp(email)
    if (cooldownRemaining) {
      return res.status(429).json({
        message: `Please wait ${cooldownRemaining} seconds before requesting a new code.`,
        cooldownRemaining,
      })
    }

    const sent = await sendOtpEmail(email, otp)
    if (!sent) {
      return res.status(500).json({
        message: "Failed to send verification email. Please try again in a few moments.",
      })
    }

    return res.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${email}.`,
    })
  } catch (error: any) {
    console.error("[Forgot Password] send-otp error:", error)
    return res.status(500).json({ message: "An error occurred while processing your request. Please try again." })
  }
}
