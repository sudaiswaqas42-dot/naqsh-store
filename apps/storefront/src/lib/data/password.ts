"use server"

import { sdk } from "@lib/config"
import { getAuthHeaders } from "./cookies"

export async function changePassword(_state: { success: boolean; error: string }, form: FormData) {
  const oldPassword = String(form.get("old_password") || "")
  const password = String(form.get("new_password") || "")
  if (password.length < 8 || password !== form.get("confirm_password")) return { success: false, error: "Use at least 8 characters and make sure both new passwords match." }
  try {
    await sdk.client.fetch("/store/customers/me/password", { method: "POST", headers: await getAuthHeaders(), body: { old_password: oldPassword, new_password: password } })
    return { success: true, error: "" }
  } catch {
    return { success: false, error: "Password could not be changed. Check your current password and try again." }
  }
}
