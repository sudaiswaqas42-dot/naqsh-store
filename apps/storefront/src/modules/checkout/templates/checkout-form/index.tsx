import { listCartPaymentMethods } from "@lib/data/payment"
import { HttpTypes } from "@medusajs/types"
import Addresses from "@modules/checkout/components/addresses"
import Payment from "@modules/checkout/components/payment"
import Review from "@modules/checkout/components/review"
import Shipping from "@modules/checkout/components/shipping"

export default async function CheckoutForm({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) {
  if (!cart) {
    return null
  }

  const paymentMethods = await (
    cart.region_id || cart.region?.id
      ? listCartPaymentMethods((cart.region_id || cart.region?.id)!)
      : Promise.resolve(null)
  )

  return (
    <div className="w-full grid grid-cols-1 gap-y-8">
      <Addresses cart={cart} customer={customer} />

      <Shipping cart={cart} />

      {paymentMethods?.length ? (
        <Payment cart={cart} availablePaymentMethods={paymentMethods} />
      ) : (
        <p role="alert">Payment methods are temporarily unavailable. Please refresh the page or contact support.</p>
      )}

      <Review cart={cart} />
    </div>
  )
}
