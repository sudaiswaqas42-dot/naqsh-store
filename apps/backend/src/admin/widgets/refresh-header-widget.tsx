import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { ArrowPath } from "@medusajs/icons"
import { Button } from "@medusajs/ui"
import { useState } from "react"
import "../styles/brand.css"

const RefreshHeaderWidget = () => {
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => {
      window.location.reload()
    }, 250)
  }

  return (
    <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1D4C3A]">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#B6975A] animate-pulse" />
        <span className="text-xs font-medium tracking-wider text-[#FAF9F6] uppercase">
          NAQSH Luxury Live Store
        </span>
      </div>
      <Button
        variant="secondary"
        size="small"
        onClick={handleRefresh}
        disabled={refreshing}
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-[#14382B] text-[#FAF9F6] border border-[#B6975A] hover:bg-[#1D4C3A] hover:border-[#D4BE8D] transition-all shadow-sm"
      >
        <ArrowPath className={`h-3.5 w-3.5 text-[#B6975A] ${refreshing ? "animate-spin" : ""}`} />
        <span>{refreshing ? "Refreshing Page..." : "Refresh Page"}</span>
      </Button>
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: [
    "order.list.before",
    "product.list.before",
    "customer.list.before",
  ],
})

export default RefreshHeaderWidget
