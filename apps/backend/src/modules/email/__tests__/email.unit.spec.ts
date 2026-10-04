import { renderOrderEmail } from "../service"
import { sendEmail } from "../../../utils/send-email"
import nodemailer from "nodemailer"

jest.mock("nodemailer", () => ({ __esModule: true, default: { createTransport: jest.fn() } }))

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
  const warn = jest.spyOn(console, "error").mockImplementation(() => {})
  const close = jest.fn()
  jest.mocked(nodemailer.createTransport).mockReturnValue({ sendMail: jest.fn().mockRejectedValue(new Error("Offline")), close } as any)
  expect(await sendEmail({ to: "", subject: "Test", html: "" })).toBeNull()
  expect(nodemailer.createTransport).not.toHaveBeenCalled()
  expect(await sendEmail({ to: "test@example.com", subject: "Test", html: "" })).toBeNull()
  expect(close).toHaveBeenCalled()
  warn.mockRestore()
})
