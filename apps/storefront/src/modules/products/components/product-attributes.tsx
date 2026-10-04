import { productAttributes } from "@lib/util/product-details"

export default function ProductAttributes({ product }: { product: Parameters<typeof productAttributes>[0] }) {
  const attributes = productAttributes(product)
  if (!attributes.length) return null
  return <dl className="my-2 space-y-1 text-xs text-stone-600">
    {attributes.map(({ label, value }) => <div key={label} className="flex flex-wrap gap-x-1">
      <dt className="font-medium">{label}:</dt><dd>{value}</dd>
    </div>)}
  </dl>
}
