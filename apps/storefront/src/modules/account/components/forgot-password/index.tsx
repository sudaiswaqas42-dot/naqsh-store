"use client"

import { useState, useEffect } from "react"
import Input from "@modules/common/components/input"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import { sendPasswordResetOtp, resetPasswordWithOtp } from "@lib/data/customer"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

type Step = "REQUEST_OTP" | "ENTER_OTP_AND_PASSWORD" | "SUCCESS"

const ForgotPassword = ({ setCurrentView }: Props) => {
  const [step, setStep] = useState<Step>("REQUEST_OTP")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [cooldown, setCooldown] = useState<number>(0)

  // Cooldown countdown timer for Resend Code
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  // Step 1: Send OTP to email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)

    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail) {
      setError("Please enter your email address.")
      return
    }

    setIsLoading(true)
    try {
      const res = await sendPasswordResetOtp(trimmedEmail)
      if (res.success) {
        setSuccessMsg(res.message || "A 6-digit verification code has been sent to your email.")
        setStep("ENTER_OTP_AND_PASSWORD")
        setCooldown(60) // 60s cooldown
      } else {
        setError(res.message || "Failed to send code. Please try again.")
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (cooldown > 0 || isLoading) return
    setError(null)
    setSuccessMsg(null)
    setIsLoading(true)

    try {
      const res = await sendPasswordResetOtp(email.trim().toLowerCase())
      if (res.success) {
        setSuccessMsg("A new verification code has been sent to your email.")
        setCooldown(60)
      } else {
        setError(res.message || "Failed to resend code.")
      }
    } catch (err: any) {
      setError(err?.message || "Failed to resend code.")
    } finally {
      setIsLoading(false)
    }
  }

  // Step 2: Submit OTP and new password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)

    const cleanOtp = otp.trim()
    if (!cleanOtp || cleanOtp.length !== 6) {
      setError("Please enter the complete 6-digit verification code.")
      return
    }

    if (!newPassword || newPassword.length < 8) {
      setError("Your new password must be at least 8 characters long.")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("The entered passwords do not match. Please verify.")
      return
    }

    setIsLoading(true)
    try {
      const res = await resetPasswordWithOtp(email.trim().toLowerCase(), cleanOtp, newPassword)
      if (res.success) {
        setStep("SUCCESS")
      } else {
        setError(res.message || "Could not reset password. Please check your verification code.")
      }
    } catch (err: any) {
      setError(err?.message || "Password reset failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="max-w-md w-full flex flex-col items-center bg-white border border-stone-200/80 rounded-2xl p-8 sm:p-10 shadow-[0_10px_35px_rgba(0,0,0,0.03)]"
      data-testid="forgot-password-page"
    >
      <span className="text-[10px] uppercase font-sans font-semibold tracking-[0.25em] text-accent mb-2">
        Account Recovery
      </span>

      {step === "REQUEST_OTP" && (
        <>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold tracking-wide uppercase text-stone-900 mb-2 text-center">
            Reset Password
          </h1>
          <p className="text-center text-xs sm:text-sm text-stone-500 mb-8 leading-relaxed max-w-xs">
            Enter the email address registered with your NAQSH account. We will send you a 6-digit verification code.
          </p>

          {error && (
            <div className="w-full mb-5 text-center text-xs text-rose-700 bg-rose-50 border border-rose-200/80 rounded-lg p-3.5 leading-relaxed">
              {error}
            </div>
          )}

          <form className="w-full flex flex-col" onSubmit={handleSendOtp}>
            <div className="flex flex-col w-full gap-y-4">
              <Input
                label="Email Address"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="forgot-password-email-input"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 bg-stone-900 hover:bg-black disabled:bg-stone-400 text-white text-xs tracking-[0.2em] uppercase py-3.5 rounded-lg transition-all duration-200 shadow-sm flex items-center justify-center font-medium"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending Code...
                </span>
              ) : (
                "Send Verification Code"
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-stone-100 w-full text-center">
            <button
              type="button"
              onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
              className="text-xs text-stone-600 hover:text-stone-900 font-medium inline-flex items-center gap-1.5 transition-colors"
            >
              ← Back to Sign In
            </button>
          </div>
        </>
      )}

      {step === "ENTER_OTP_AND_PASSWORD" && (
        <>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold tracking-wide uppercase text-stone-900 mb-2 text-center">
            New Password
          </h1>
          <p className="text-center text-xs sm:text-sm text-stone-500 mb-6 leading-relaxed max-w-xs">
            We sent a 6-digit verification code to <strong className="text-stone-800">{email}</strong>. Please enter the code and set your new password.
          </p>

          {successMsg && (
            <div className="w-full mb-4 text-center text-xs text-emerald-800 bg-emerald-50 border border-emerald-200/80 rounded-lg p-3">
              {successMsg}
            </div>
          )}

          {error && (
            <div className="w-full mb-4 text-center text-xs text-rose-700 bg-rose-50 border border-rose-200/80 rounded-lg p-3 leading-relaxed">
              {error}
            </div>
          )}

          <form className="w-full flex flex-col gap-y-4" onSubmit={handleResetPassword}>
            <div>
              <Input
                label="6-Digit Verification Code"
                name="otp"
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                data-testid="otp-input"
              />
              <div className="flex justify-between items-center mt-2 px-1">
                <span className="text-[11px] text-stone-400">Valid for 10 minutes</span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={cooldown > 0 || isLoading}
                  className="text-[11px] text-stone-700 hover:text-stone-900 font-medium disabled:text-stone-400 transition-colors"
                >
                  {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
                </button>
              </div>
            </div>

            <Input
              label="New Password (min 8 characters)"
              name="new_password"
              type="password"
              required
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              data-testid="new-password-input"
            />

            <Input
              label="Confirm New Password"
              name="confirm_password"
              type="password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              data-testid="confirm-password-input"
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-3 bg-stone-900 hover:bg-black disabled:bg-stone-400 text-white text-xs tracking-[0.2em] uppercase py-3.5 rounded-lg transition-all duration-200 shadow-sm flex items-center justify-center font-medium"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating Password...
                </span>
              ) : (
                "Update Password"
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-stone-100 w-full flex justify-between items-center text-xs">
            <button
              type="button"
              onClick={() => {
                setStep("REQUEST_OTP")
                setError(null)
                setSuccessMsg(null)
              }}
              className="text-stone-500 hover:text-stone-800"
            >
              Change email
            </button>
            <button
              type="button"
              onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
              className="text-stone-900 font-semibold hover:text-accent"
            >
              Back to Sign In
            </button>
          </div>
        </>
      )}

      {step === "SUCCESS" && (
        <div className="w-full flex flex-col items-center text-center py-4">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-5">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="font-serif text-2xl font-semibold text-stone-900 mb-2">
            Password Updated!
          </h2>

          <p className="text-xs sm:text-sm text-stone-500 mb-8 max-w-xs leading-relaxed">
            Your password has been successfully reset. You can now sign in using your new credentials.
          </p>

          <button
            type="button"
            onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
            className="w-full bg-stone-900 hover:bg-black text-white text-xs tracking-[0.2em] uppercase py-3.5 rounded-lg transition-all duration-200 shadow-sm font-medium"
          >
            Sign In Now
          </button>
        </div>
      )}
    </div>
  )
}

export default ForgotPassword
