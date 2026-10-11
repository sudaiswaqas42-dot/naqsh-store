export function orderReference(order: { display_id?: number | string | null; custom_display_id?: string | null; id?: string }) {
  return Number(order.display_id) >= 1310 ? String(order.display_id) : order.custom_display_id || String(order.display_id || order.id || "")
}
