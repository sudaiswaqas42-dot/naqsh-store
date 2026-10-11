export function orderReference(order: { display_id?: number | string | null; custom_display_id?: string | null; id?: string }) {
  if (!order) return ""
  return String(order.custom_display_id || order.display_id || order.id || "")
}
