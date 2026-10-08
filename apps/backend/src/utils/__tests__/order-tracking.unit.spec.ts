import { orderTracking } from "../order-tracking"

describe("customer order tracking", () => {
  it("does not invent a courier or tracking ID for a new order", () => {
    const result = orderTracking({ status: "pending", metadata: {}, fulfillments: [] })
    expect(result.status).toBe("Confirmed")
    expect(result.carrier).toBeNull()
    expect(result.trackingNumber).toBeNull()
  })

  it("keeps prepared tracking details private until dispatch", () => {
    const result = orderTracking({ metadata: { custom_status: "Packed", carrier: "TCS", tracking_number: "12345" } })
    expect(result.carrier).toBeNull()
    expect(result.trackingNumber).toBeNull()
  })

  it("shows admin-supplied details after dispatch", () => {
    const result = orderTracking({ metadata: { custom_status: "Shipped", carrier: "Leopards", tracking_number: "LEO-123" } })
    expect(result.carrier).toBe("Leopards")
    expect(result.trackingNumber).toBe("LEO-123")
    expect(result.steps.find(step => step.name === "Shipped")?.status).toBe("current")
    expect(result.steps.find(step => step.name === "Delivered")?.status).toBe("pending")
  })

  it("uses actual fulfillment labels without guessing a courier", () => {
    const result = orderTracking({ fulfillments: [{ shipped_at: "2026-10-08", labels: [{ tracking_number: "REAL-ID" }] }] })
    expect(result.trackingNumber).toBe("REAL-ID")
    expect(result.carrier).toBeNull()
  })

  it("does not infer delivery from a completed payment/order", () => {
    expect(orderTracking({ status: "completed" }).status).toBe("Confirmed")
  })

  it("cancellation wins over stale shipping metadata", () => {
    const result = orderTracking({ status: "canceled", metadata: { custom_status: "Shipped", tracking_number: "123" } })
    expect(result.status).toBe("Cancelled")
    expect(result.trackingNumber).toBeNull()
    expect(result.steps.every(step => step.status === "pending")).toBe(true)
  })
})
