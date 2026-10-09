export const trackingStages = ["Confirmed", "Processing", "Packed", "Shipped", "Out for Delivery", "Delivered"]

export function orderTracking(order: any) {
  const fulfillments = (order.fulfillments || []).filter((fulfillment: any) => !fulfillment.canceled_at)
  let status = String(order.metadata?.custom_status || "")
  if (order.status === "canceled") status = "Cancelled"
  if (!status) {
    if (fulfillments.some((fulfillment: any) => fulfillment.delivered_at)) status = "Delivered"
    else if (fulfillments.some((fulfillment: any) => fulfillment.shipped_at)) status = "Shipped"
    else if (fulfillments.length) status = "Packed"
    else status = "Confirmed"
  }
  const currentIndex = trackingStages.indexOf(status)
  const fulfillment = fulfillments.find((item: any) => item.labels?.some((label: any) => label.tracking_number))
  const rawTracking = String(order.metadata?.tracking_number || fulfillment?.labels?.[0]?.tracking_number || "").trim()
  const rawCarrier = String(order.metadata?.carrier || "").trim()
  const isDispatched = ["Shipped", "Out for Delivery", "Delivered"].includes(status) || Boolean(rawTracking)

  const trackingNumber = isDispatched && rawTracking ? rawTracking : null
  const carrier = isDispatched && trackingNumber ? (rawCarrier || "Courier Express") : null
  const steps = trackingStages.map((name, index) => ({
    name,
    status: index < currentIndex || status === "Delivered" ? "completed" : index === currentIndex ? "current" : "pending",
    completed: index < currentIndex || status === "Delivered",
    current: index === currentIndex,
  }))
  return { status, carrier, trackingNumber, steps }
}
