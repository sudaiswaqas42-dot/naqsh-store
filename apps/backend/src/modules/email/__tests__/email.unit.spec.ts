import EmailProvider, { renderOrderEmail } from "../service"
import { sendEmail } from "../../../utils/send-email"
import nodemailer from "nodemailer"

jest.mock("nodemailer", () => ({ __esModule: true, default: { createTransport: jest.fn() } }))

const originalEnv = { ...process.env }
afterEach(() => {
  process.env = { ...originalEnv }
  jest.restoreAllMocks()
  jest.clearAllMocks()
})

it("renders escaped customer details, item prices and delivery address", () => {
  const result = renderOrderEmail("order-confirmed", {
    display_id: 42, name: "<script>", currency_code: "PKR", total: 200,
    items: [{ title: "Silk & Cotton", quantity: 2, unit_price: 100 }],
    shipping_address: { address_1: "Main Street", city: "Lahore" },
  })
  expect(result.subject).toBe("Order Confirmed - #42")
  expect(result.html).toContain("&lt;script&gt;")
  expect(result.html).toContain("Silk &amp; Cotton")
  expect(result.html).toMatch(/100(?:\.00)?/)
  expect(result.html).toContain("Main Street")
  expect(result.html).toContain("Lahore")
  expect(renderOrderEmail("order-delivered", { display_id: 42 }).subject).toBe("Order Delivered - #42")
})

it("skips a missing recipient and catches SMTP failures", async () => {
  delete process.env.EMAIL_RELAY_URL
  const warn = jest.spyOn(console, "error").mockImplementation(() => {})
  const close = jest.fn()
  jest.mocked(nodemailer.createTransport).mockReturnValue({ sendMail: jest.fn().mockRejectedValue(new Error("Offline")), close } as any)
  expect(await sendEmail({ to: "", subject: "Test", html: "" })).toBeNull()
  expect(nodemailer.createTransport).not.toHaveBeenCalled()
  expect(await sendEmail({ to: "test@example.com", subject: "Test", html: "" })).toBeNull()
  expect(close).toHaveBeenCalled()
  warn.mockRestore()
})

it("sends an HTML-only email through the configured relay once", async () => {
  process.env.EMAIL_RELAY_URL = "https://relay.example.test/email"
  process.env.EMAIL_RELAY_SECRET = "test-secret"
  const relay = jest.spyOn(global, "fetch").mockResolvedValue({ ok: true, json: async () => ({ id: "message-123" }) } as Response)
  const result = await sendEmail({ to: "test@example.com", subject: "OTP", html: "<p>Code</p>" })
  expect(result?.messageId).toBe("message-123")
  expect(relay).toHaveBeenCalledTimes(1)
  expect(nodemailer.createTransport).not.toHaveBeenCalled()
})

it("reports rejected notifications as failures without duplicate relay or SMTP attempts", async () => {
  process.env.EMAIL_RELAY_URL = "https://relay.example.test/email"
  jest.spyOn(console, "error").mockImplementation(() => {})
  const relay = jest.spyOn(global, "fetch").mockResolvedValue({ ok: false, status: 503 } as Response)
  const provider = new EmailProvider()
  await expect(provider.send({ to: "test@example.com", channel: "email", template: "order-confirmed", data: { display_id: 1 } })).rejects.toThrow("Email delivery failed")
  expect(relay).toHaveBeenCalledTimes(1)
  expect(nodemailer.createTransport).not.toHaveBeenCalled()
})
