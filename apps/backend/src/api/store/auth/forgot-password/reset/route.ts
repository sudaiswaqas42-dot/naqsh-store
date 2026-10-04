import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { z } from "zod"
import { consumeOtp } from "../../../../../utils/otp-store"
import { sendEmail } from "../../../../../utils/send-email"

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
  otp: z.string().trim().length(6, "Verification code must be 6 digits."),
  new_password: z.string().min(8, "New password must be at least 8 characters long."),
})

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0]?.message || "Invalid input." })
  }

  const { email, otp, new_password } = parsed.data

  // Verify and consume OTP
  const otpResult = consumeOtp(email, otp)
  if (!otpResult.valid) {
    return res.status(400).json({ message: otpResult.error || "Invalid or expired verification code." })
  }

  try {
    const authService = req.scope.resolve(Modules.AUTH)
    const updateResult = await authService.updateProvider("emailpass", {
      entity_id: email,
      password: new_password,
    })

    if (!updateResult.success) {
      return res.status(500).json({ message: "Unable to update password. Please try again or contact support." })
    }

    // Send confirmation email
    sendEmail({
      to: email,
      subject: "NAQSH - Your Password Has Been Reset",
      html: `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#0F2D22;background:#f6f5f1;padding:20px;">
        <div style="max-width:500px;margin:auto;background:white;padding:30px;border-radius:8px;">
          <h2 style="color:#0F2D22;letter-spacing:2px;">NAQSH</h2>
          <p>Hello,</p>
          <p>Your NAQSH account password was successfully changed.</p>
          <p style="color:#666;font-size:13px;">If you did not initiate this change, please contact us immediately.</p>
          <p>Warm regards,<br>NAQSH Concierge</p>
        </div>
      </body></html>`,
    }).catch(() => {})

    return res.json({
      success: true,
      message: "Your password has been reset successfully. You can now log in with your new password.",
    })
  } catch (error: any) {
    console.error("[Forgot Password] reset error:", error)
    return res.status(500).json({ message: "Failed to reset password. Please try again." })
  }
}
