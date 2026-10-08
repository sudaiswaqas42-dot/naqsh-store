import { HttpTypes } from "@medusajs/types"
import { Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type OrderDetailsProps = {
  order: HttpTypes.StoreOrder
  showStatus?: boolean
}

const OrderDetails = ({ order, showStatus }: OrderDetailsProps) => {
  const formatStatus = (str: string) => {
    const formatted = str.split("_").join(" ")
    return formatted.slice(0, 1).toUpperCase() + formatted.slice(1)
  }

  return (
    <div className="space-y-4">
      {/* Prominent Pakistani Luxury Order Reference Banner */}
      <div className="p-5 bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent block mb-1">
            Official Booking Reference
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-serif font-semibold text-brand tracking-wider">
              #{(order.custom_display_id || order.display_id)}
            </span>
            <span className="text-[11px] px-2 py-0.5 bg-emerald-100 text-emerald-800 font-medium">
              Confirmed
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Save your order number to track your parcel from Karachi fulfillment hub to your doorstep.
          </p>
        </div>

        <LocalizedClientLink
          href={`/order/track?order_number=${(order.custom_display_id || order.display_id)}&email=${encodeURIComponent(order.email || "")}`}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand text-white text-xs font-semibold uppercase tracking-widest hover:bg-black transition-colors whitespace-nowrap shadow-xs"
        >
          <span>Track This Order</span>
          <span>&rarr;</span>
        </LocalizedClientLink>
      </div>

      <Text>
        We have sent the complete booking summary to{" "}
        <span
          className="text-ui-fg-medium-plus font-semibold"
          data-testid="order-email"
        >
          {order.email}
        </span>
        .
      </Text>
      <Text className="mt-2 text-xs text-stone-500">
        Order placed on:{" "}
        <span data-testid="order-date" className="font-medium text-stone-800">
          {new Date(order.created_at).toDateString()}
        </span>
      </Text>

      <div className="flex flex-wrap items-center text-compact-small gap-x-4 gap-y-2 mt-4">
        {showStatus && (
          <>
            <Text>
              Order status:{" "}
              <span className="text-ui-fg-subtle" data-testid="order-status">
                {formatStatus(order.fulfillment_status)}
              </span>
            </Text>
            <Text>
              Payment status:{" "}
              <span
                className="text-ui-fg-subtle"
                data-testid="order-payment-status"
              >
                {formatStatus(order.payment_status)}
              </span>
            </Text>
          </>
        )}
      </div>

      {/* Order Cancellation Notice & Direct WhatsApp Action */}
      <div className="mt-3 pt-3 border-t border-dashed border-stone-200">
        <p className="text-xs text-stone-600 leading-relaxed flex flex-wrap items-center gap-x-1.5">
          <span>If you want to cancel your order,</span>
          <a
            href={`https://wa.me/923197365388?text=${encodeURIComponent(
              `Assalam-o-Alaikum NAQSH Team,\n\nI would like to request CANCELLATION for my Order #${(order.custom_display_id || order.display_id)}.\n\nOrder Details:\n• Order Reference: #${(order.custom_display_id || order.display_id)}\n• Customer Email: ${order.email || ""}\n• Total Amount: Rs. ${Number(order.total || 0).toLocaleString()}\n• Date Placed: ${new Date(order.created_at).toDateString()}\n\nPlease confirm cancellation and assist with my order.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-rose-700 hover:text-rose-900 underline underline-offset-2 transition-colors cursor-pointer"
          >
            <span>click here</span>
            <svg
              className="w-3.5 h-3.5 text-[#25D366] inline-block"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
            </svg>
          </a>
          <span>to immediately request cancellation with our WhatsApp concierge.</span>
        </p>
      </div>
    </div>
  )
}

export default OrderDetails

