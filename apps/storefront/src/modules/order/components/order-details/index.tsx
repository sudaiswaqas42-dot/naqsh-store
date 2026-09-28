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
              #{order.display_id}
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
          href={`/order/track?order_number=${order.display_id}&email=${encodeURIComponent(order.email || "")}`}
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

      <div className="flex items-center text-compact-small gap-x-4 mt-4">
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
    </div>
  )
}

export default OrderDetails

