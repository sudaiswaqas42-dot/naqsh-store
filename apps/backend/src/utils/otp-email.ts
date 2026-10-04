import { sendEmail } from "./send-email"

export async function sendOtpEmail(toEmail: string, otp: string): Promise<boolean> {
  const subject = `NAQSH - Password Reset Verification Code: ${otp}`
  const html = `<!doctype html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Reset Your Password</title>
</head>
<body style="margin:0;padding:0;background-color:#f6f5f1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0F2D22;">
  <div style="max-width:540px;margin:30px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.05);border:1px solid #eae7dc;">
    
    <!-- Header -->
    <div style="padding:32px 24px;background-color:#0F2D22;text-align:center;">
      <h1 style="margin:0;font-family:Georgia,serif;font-size:26px;letter-spacing:6px;color:#B6975A;text-transform:uppercase;">NAQSH</h1>
      <p style="margin:6px 0 0 0;font-size:11px;letter-spacing:2px;color:#ffffff;text-transform:uppercase;opacity:0.8;">Where Identity Begins</p>
    </div>

    <!-- Body -->
    <div style="padding:36px 32px;">
      <h2 style="margin:0 0 16px 0;font-family:Georgia,serif;font-size:20px;color:#0F2D22;font-weight:600;">Password Reset Verification</h2>
      
      <p style="margin:0 0 20px 0;font-size:14px;line-height:1.6;color:#4a5568;">
        We received a request to reset your password for your <strong>NAQSH</strong> account. Use the verification code below to complete the process.
      </p>

      <!-- OTP Box -->
      <div style="background-color:#FAF9F5;border:1px dashed #B6975A;border-radius:8px;padding:24px;text-align:center;margin:28px 0;">
        <span style="display:block;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#8c7851;margin-bottom:8px;font-weight:600;">One-Time Verification Code</span>
        <span style="font-family:monospace,'Courier New',Courier;font-size:36px;font-weight:bold;letter-spacing:10px;color:#0F2D22;">${otp}</span>
      </div>

      <p style="margin:0 0 12px 0;font-size:13px;line-height:1.6;color:#718096;">
        This code is valid for <strong>10 minutes</strong>. Do not share this code with anyone.
      </p>

      <p style="margin:0 0 24px 0;font-size:12px;line-height:1.6;color:#a0aec0;">
        If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
      </p>

      <hr style="border:none;border-top:1px solid #eee;margin:28px 0;" />

      <p style="margin:0;font-size:12px;color:#718096;line-height:1.5;">
        Warm regards,<br>
        <strong style="color:#0F2D22;">NAQSH Concierge Team</strong>
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color:#fbfaf8;padding:16px 24px;border-top:1px solid #eae7dc;text-align:center;font-size:11px;color:#a0aec0;">
      © ${new Date().getFullYear()} NAQSH Luxury Brand. All rights reserved.
    </div>

  </div>
</body>
</html>`

  const result = await sendEmail({
    to: toEmail,
    subject,
    html,
  })

  return !!result
}
