import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

    const readAll = async (request: any) => {
      const data: any[] = []
      while (true) {
        const result = await query.graph({ ...request, pagination: { ...request.pagination, take: 200, skip: data.length } })
        data.push(...result.data)
        if (result.data.length < 200) break
      }
      return { data }
    }

    // 1. Fetch Orders
    const { data: orders } = await readAll({
      entity: "order",
      fields: [
        "id",
        "display_id",
        "status",
        "fulfillment_status",
        "payment_status",
        "total",
        "subtotal",
        "currency_code",
        "created_at",
        "customer_id",
        "email",
        "metadata",
        "fulfillments.*",
        "items.*",
        "payment_collections.*",
        "payment_collections.payments.*",
      ],
      pagination: {
        take: 500,
        order: { created_at: "DESC" },
      },
    })

    // 2. Fetch Customers
    const { data: customers } = await readAll({
      entity: "customer",
      fields: ["id", "email", "created_at"],
      pagination: { take: 500 },
    })

    // 3. Fetch Inventory items & levels + map to products
    const inventoryProductMap: Record<string, { product_id: string; title: string }> = {}
    const productTitleMap: Record<string, string> = {}
    const { data: products } = await readAll({ entity: "product", fields: ["id", "title", "variants.inventory_items.inventory_item_id"] })
    for (const product of products) {
      productTitleMap[product.title] = product.id
      for (const variant of product.variants || []) for (const item of variant.inventory_items || []) {
        inventoryProductMap[item.inventory_item_id] = { product_id: product.id, title: product.title }
      }
    }

    let lowStockProducts: any[] = []
    try {
      const { data: inventoryLevels } = await readAll({
        entity: "inventory_level",
        fields: [
          "id",
          "stocked_quantity",
          "reserved_quantity",
          "available_quantity",
          "inventory_item_id",
          "inventory_item.title",
          "inventory_item.sku",
        ],
        pagination: { take: 100 },
      })

      lowStockProducts = (inventoryLevels || [])
        .map((lvl: any) => {
          const mapping = inventoryProductMap[lvl.inventory_item_id]
          return {
            id: lvl.id,
            title: lvl.inventory_item?.title || mapping?.title || "Product Variant",
            sku: lvl.inventory_item?.sku || "N/A",
            stocked: lvl.stocked_quantity,
            reserved: lvl.reserved_quantity,
            available: Number(lvl.stocked_quantity) - Number(lvl.reserved_quantity),
            product_id: mapping?.product_id || null,
          }
        })
        .filter((item: any) => item.available <= 5)
        .sort((a: any, b: any) => a.available - b.available)
    } catch {
      // fallback if inventory not linked yet
    }

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime()

    let totalSales = 0
    let todaySales = 0
    let monthlySales = 0

    let pendingCount = 0
    let completedCount = 0
    let cancelledCount = 0
    let returnedCount = 0

    const productSalesMap: Record<string, { title: string; count: number; revenue: number; product_id: string | null }> = {}

    // Daily buckets for last 14 days
    const dailyMap: Record<string, number> = {}
    for (let i = 13; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split("T")[0]
      dailyMap[dateStr] = 0
    }

    const resolveStatus = (orderObj: any): string => {
      if (orderObj.status === "canceled") return "Cancelled"
      if (orderObj.metadata?.custom_status) return orderObj.metadata.custom_status as string

      const fuls = Array.isArray(orderObj.fulfillments) ? orderObj.fulfillments : []
      const its = Array.isArray(orderObj.items) ? orderObj.items : []

      const isDelivered =
        fuls.some((f: any) => f.delivered_at && !f.canceled_at) ||
        its.some((it: any) => (it.detail?.delivered_quantity || 0) > 0) ||
        orderObj.fulfillment_status === "delivered" ||
        orderObj.fulfillment_status === "partially_delivered" ||
        orderObj.status === "completed"

      if (isDelivered) return "Delivered"

      const isShipped =
        fuls.some((f: any) => f.shipped_at && !f.canceled_at) ||
        its.some((it: any) => (it.detail?.shipped_quantity || 0) > 0) ||
        orderObj.fulfillment_status === "shipped" ||
        orderObj.fulfillment_status === "partially_shipped"

      if (isShipped) return "Shipped"

      const isPacked =
        fuls.some((f: any) => (f.packed_at || f.id) && !f.canceled_at) ||
        its.some((it: any) => (it.detail?.fulfilled_quantity || 0) > 0) ||
        orderObj.fulfillment_status === "fulfilled"

      if (isPacked) return "Packed"

      if (orderObj.status === "canceled") return "Cancelled"
      if (orderObj.payment_status === "captured" || orderObj.status === "pending") return "Confirmed"
      return "Pending"
    }

    const resolvePaymentStatus = (ord: any): string => {
      // 1. Direct explicit status
      const raw = (ord.payment_status || "").toLowerCase().trim()
      if (raw === "captured" || raw === "authorized" || raw === "refunded" || raw === "partially_refunded") {
        return raw
      }

      // 2. Check payment_collections & payments
      const pcs = Array.isArray(ord.payment_collections) ? ord.payment_collections : []
      const payments = pcs.flatMap((pc: any) => pc.payments || [])

      if (payments.some((p: any) => p.status === "captured") || pcs.some((pc: any) => pc.status === "captured" || pc.status === "completed")) {
        return "captured"
      }

      if (payments.some((p: any) => p.status === "refunded") || pcs.some((pc: any) => pc.status === "refunded")) {
        return "refunded"
      }

      if (payments.some((p: any) => p.status === "partially_refunded") || pcs.some((pc: any) => pc.status === "partially_refunded")) {
        return "partially_refunded"
      }

      if (payments.some((p: any) => p.status === "authorized") || pcs.some((pc: any) => pc.status === "authorized")) {
        return "authorized"
      }

      if (payments.some((p: any) => p.status === "awaiting" || p.status === "pending") || pcs.some((pc: any) => pc.status === "awaiting")) {
        return "awaiting"
      }

      // 3. Metadata check
      if (ord.metadata?.payment_status) {
        return String(ord.metadata.payment_status).toLowerCase()
      }

      // 4. Fulfillment delivery implies payment captured (e.g. COD delivered)
      const fuls = Array.isArray(ord.fulfillments) ? ord.fulfillments : []
      const isDelivered = fuls.some((f: any) => f.delivered_at && !f.canceled_at) ||
        ord.fulfillment_status === "delivered" ||
        ord.metadata?.stage === "Delivered"

      if (isDelivered) {
        return "captured"
      }

      // 5. Default active confirmed order
      if (ord.status === "pending" || ord.status === "completed" || ord.status === "confirmed") {
        return "authorized"
      }

      return raw || "authorized"
    }

    orders.forEach((ord: any) => {
      const ordDate = new Date(ord.created_at)
      const ordTime = ordDate.getTime()
      const total = Number(ord.total) || 0

      // Only count non-cancelled in revenue
      if (ord.status !== "canceled") {
        totalSales += total
        if (ordTime >= todayStart) {
          todaySales += total
        }
        if (ordTime >= monthStart) {
          monthlySales += total
        }

        const dateStr = ordDate.toISOString().split("T")[0]
        if (dailyMap[dateStr] !== undefined) {
          dailyMap[dateStr] += total
        }
      }

      const customStatus = resolveStatus(ord)
      if (customStatus === "Returned" || customStatus === "Refunded") {
        returnedCount++
      } else if (ord.status === "canceled" || customStatus === "Cancelled") {
        cancelledCount++
      } else if (customStatus === "Delivered" || ord.status === "completed") {
        completedCount++
      } else {
        pendingCount++
      }

      // Aggregate product sales
      if (ord.status !== "canceled" && Array.isArray(ord.items)) {
        ord.items.forEach((item: any) => {
          const key = item.title || item.product_title || "Item"
          if (!productSalesMap[key]) {
            productSalesMap[key] = {
              title: key,
              count: 0,
              revenue: 0,
              product_id: item.product_id || productTitleMap[key] || null,
            }
          }
          productSalesMap[key].count += Number(item.quantity) || 1
          productSalesMap[key].revenue += Number(item.unit_price || 0) * (Number(item.quantity) || 1)
          if (!productSalesMap[key].product_id && (item.product_id || productTitleMap[key])) {
            productSalesMap[key].product_id = item.product_id || productTitleMap[key]
          }
        })
      }
    })

    const bestSelling = Object.values(productSalesMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    const salesChart = Object.entries(dailyMap).map(([date, revenue]) => ({
      date,
      revenue,
      label: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    }))

    const recentOrders = orders.slice(0, 8).map((ord: any) => {
      const fuls = Array.isArray(ord.fulfillments) ? ord.fulfillments : []
      const its = Array.isArray(ord.items) ? ord.items : []

      const st = resolveStatus(ord)

      return {
        id: ord.id,
        display_id: ord.display_id,
        email: ord.email,
        total: ord.total,
        currency_code: ord.currency_code,
        status: st,
        created_at: ord.created_at,
        tracking_number: ord.metadata?.tracking_number || null,
      }
    })

    const customerStats: Record<string, { orders_count: number; total_spent: number }> = {}
    orders.forEach((ord: any) => {
      const cKey = ord.customer_id || ord.email
      if (cKey) {
        if (!customerStats[cKey]) customerStats[cKey] = { orders_count: 0, total_spent: 0 }
        customerStats[cKey].orders_count += 1
        if (ord.status !== "canceled") {
          customerStats[cKey].total_spent += Number(ord.total) || 0
        }
      }
    })

    const customerList = customers.map((c: any) => ({
      id: c.id,
      email: c.email,
      created_at: c.created_at,
      orders_count: customerStats[c.id]?.orders_count || customerStats[c.email]?.orders_count || 0,
      total_spent: customerStats[c.id]?.total_spent || customerStats[c.email]?.total_spent || 0,
    }))

    const formattedAllOrders = orders.map((ord: any) => {
      const ordDate = new Date(ord.created_at)
      const ordTime = ordDate.getTime()
      return {
        id: ord.id,
        display_id: ord.display_id,
        email: ord.email || "Guest",
        total: ord.total,
        currency_code: ord.currency_code,
        status: resolveStatus(ord),
        payment_status: resolvePaymentStatus(ord),
        created_at: ord.created_at,
        is_today: ordTime >= todayStart,
        is_this_month: ordTime >= monthStart,
      }
    })

    res.json({
      metrics: {
        total_sales: totalSales,
        today_sales: todaySales,
        monthly_sales: monthlySales,
        total_orders: orders.length,
        pending_orders: pendingCount,
        completed_orders: completedCount,
        cancelled_orders: cancelledCount,
        returned_orders: returnedCount,
        total_customers: customers.length,
      },
      low_stock_products: lowStockProducts,
      best_selling_products: bestSelling,
      sales_chart: salesChart,
      recent_orders: recentOrders,
      all_orders: formattedAllOrders,
      customer_list: customerList,
    })
  } catch (error: any) {
    res.status(500).json({ error: error.message })
  }
}
