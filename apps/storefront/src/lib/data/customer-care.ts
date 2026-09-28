"use server"

import { sdk } from "@lib/config"

export async function submitSupportMessage(input: { name: string; email: string; phone: string; subject: string; message: string }) {
  try {
    const result = await sdk.client.fetch<{ id: string }>("/store/contact", { method: "POST", body: input })
    return { id: result.id }
  } catch {
    return { error: "We could not save your message. Please check your details and try again." }
  }
}

export async function subscribeNewsletter(email: string) {
  try {
    await sdk.client.fetch("/store/newsletter", { method: "POST", body: { email, consent: true } })
    return { success: true }
  } catch {
    return { error: "We could not save your subscription. Please try again." }
  }
}
