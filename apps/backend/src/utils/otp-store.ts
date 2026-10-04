import { randomInt } from "node:crypto"

// In-memory OTP store with automatic cleanup and rate-limiting
interface OtpEntry {
  otp: string
  expiresAt: number
  attempts: number
  lastSentAt: number
}

const otpMap = new Map<string, OtpEntry>()

// Expire after 10 minutes
const OTP_TTL_MS = 10 * 60 * 1000
// Minimum 60 seconds before resending OTP
const RESEND_COOLDOWN_MS = 60 * 1000
// Max invalid attempts before invalidating OTP
const MAX_ATTEMPTS = 5

export function generateOtp(email: string): { otp: string; cooldownRemaining?: number } {
  const normalizedEmail = email.trim().toLowerCase()
  const existing = otpMap.get(normalizedEmail)
  const now = Date.now()

  if (existing && now - existing.lastSentAt < RESEND_COOLDOWN_MS) {
    const remaining = Math.ceil((RESEND_COOLDOWN_MS - (now - existing.lastSentAt)) / 1000)
    return { otp: "", cooldownRemaining: remaining }
  }

  // Generate 6 digit numeric code
  const otp = randomInt(100000, 1000000).toString()

  otpMap.set(normalizedEmail, {
    otp,
    expiresAt: now + OTP_TTL_MS,
    attempts: 0,
    lastSentAt: now,
  })

  return { otp }
}

export function verifyOtp(email: string, inputOtp: string): { valid: boolean; error?: string } {
  const normalizedEmail = email.trim().toLowerCase()
  const entry = otpMap.get(normalizedEmail)

  if (!entry) {
    return { valid: false, error: "No verification code was requested for this email, or it has expired." }
  }

  if (Date.now() > entry.expiresAt) {
    otpMap.delete(normalizedEmail)
    return { valid: false, error: "Verification code has expired. Please request a new code." }
  }

  if (entry.attempts >= MAX_ATTEMPTS) {
    otpMap.delete(normalizedEmail)
    return { valid: false, error: "Too many incorrect attempts. Please request a new verification code." }
  }

  if (entry.otp !== inputOtp.trim()) {
    entry.attempts += 1
    return { valid: false, error: "Incorrect verification code. Please check your email and try again." }
  }

  return { valid: true }
}

export function consumeOtp(email: string, inputOtp: string): { valid: boolean; error?: string } {
  const result = verifyOtp(email, inputOtp)
  if (result.valid) {
    otpMap.delete(email.trim().toLowerCase())
  }
  return result
}
