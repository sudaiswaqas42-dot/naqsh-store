import { Metadata } from "next"
import CustomerReviews from "@modules/home/components/customer-reviews"

export const metadata: Metadata = {
  title: "Customer Reviews | NAQSH",
  description: "Explore NAQSH reviews and share your experience.",
}

export default function ReviewsPage() {
  return <CustomerReviews fullPage />
}
