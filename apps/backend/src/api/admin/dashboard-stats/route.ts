import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

    // 1. Fetch Orders
    const { data: orders } = await query.graph({
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
      ],
      pagination: {
        take: 500,
        order: { created_at: "DESC" },
      },
    })

    // 2. Fetch Customers
    const { data: customers } = await query.graph({
      entity: "customer",
      fields: ["id", "email", "created_at"],
      pagination: { take: 500 },
    })

    // 3. Fetch Inventory items & levels + map to products
    const pgConnection = req.scope.resolve(ContainerRegistrationKeys.PG_CONNECTION)
    const inventoryProductMap: Record<string, { product_id: string; title: string }> = {}
    const productTitleMap: Record<string, string> = {}

    try {
      if (pgConnection) {
        const invRes = await pgConnection.raw(`
          SELECT pvii.inventory_item_id, pv.product_id, p.title as product_title
          FROM product_variant_inventory_item pvii
          JOIN product_variant pv ON pv.id = pvii.variant_id
          JOIN product p ON p.id = pv.product_id
        `)
        for (const row of invRes.rows || []) {
          inventoryProductMap[row.inventory_item_id] = {
            product_id: row.product_id,
            title: row.product_title,
          }
        }

        const prodRes = await pgConnection.raw("SELECT id, title FROM product")
        for (const row of prodRes.rows || []) {
          productTitleMap[row.title] = row.id
        }
      }
    } catch {
      // safe fallback
    }

    let lowStockProducts: any[] = []
    try {
      const { data: inventoryLevels } = await query.graph({
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
      if (customStatus === "returned" || customStatus === "Refunded") {
        returnedCount++
      } else if (ord.status === "canceled" || customStatus === "Cancelled") {
        cancelledCount++
      } else if (customStatus === "Delivered" || ord.status === "completed") {
        completedCount++
      } else {
        pendingCount++
      }

      // Aggregate product sales
      if (Array.isArray(ord.items)) {
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

      let st = (ord.metadata?.custom_status as string) || ""
      if (!st) {
        if (
          fuls.some((f: any) => f.delivered_at && !f.canceled_at) ||
          its.some((it: any) => (it.detail?.delivered_quantity || 0) > 0) ||
          ord.fulfillment_status === "delivered" ||
          ord.fulfillment_status === "partially_delivered" ||
          ord.status === "completed"
        ) {
          st = "Delivered"
        } else if (
          fuls.some((f: any) => f.shipped_at && !f.canceled_at) ||
          its.some((it: any) => (it.detail?.shipped_quantity || 0) > 0) ||
          ord.fulfillment_status === "shipped" ||
          ord.fulfillment_status === "partially_shipped"
        ) {
          st = "Shipped"
        } else if (
          fuls.some((f: any) => (f.packed_at || f.id) && !f.canceled_at) ||
          its.some((it: any) => (it.detail?.fulfilled_quantity || 0) > 0) ||
          ord.fulfillment_status === "fulfilled"
        ) {
          st = "Packed"
        } else if (ord.status === "canceled") {
          st = "Cancelled"
        } else if (ord.payment_status === "captured" || ord.status === "pending") {
          st = "Confirmed"
        } else {
          st = "Pending"
        }
      }

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
        payment_status: ord.payment_status || "captured",
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
