import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ChartBar, ArrowPath, ExclamationCircle, Sparkles } from "@medusajs/icons"
import { Container, Heading, Text, Badge, Button, Table } from "@medusajs/ui"
import { useEffect, useState } from "react"

const DashboardPage = () => {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const loadStats = () => {
    setLoading(true)
    fetch("/admin/dashboard-stats")
      .then((res) => res.json())
      .then((json) => {
        setData(json)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Dashboard stats error:", err)
        setLoading(false)
      })
  }

  useEffect(() => {
    loadStats()
  }, [])

  const [selectedMetric, setSelectedMetric] = useState<"none" | "revenue" | "today" | "monthly" | "orders" | "customers">("revenue")
  const [searchTerm, setSearchTerm] = useState("")

  const metrics = data?.metrics || {
    total_sales: 0,
    today_sales: 0,
    monthly_sales: 0,
    total_orders: 0,
    pending_orders: 0,
    completed_orders: 0,
    cancelled_orders: 0,
    returned_orders: 0,
    total_customers: 0,
  }

  const lowStock = data?.low_stock_products || []
  const bestSelling = data?.best_selling_products || []
  const recentOrders = data?.recent_orders || []
  const allOrders: any[] = data?.all_orders || []
  const customerList: any[] = data?.customer_list || []
  const salesChart = data?.sales_chart || []

  const maxRevenue = Math.max(...salesChart.map((d: any) => d.revenue), 1000)

  // Compute filtered telemetry list based on selected box
  let activeTableTitle = "Store Telemetry Breakdown"
  let activeTableSubtitle = "Select any metric above to drill down into live transaction details."
  let activeOrders: any[] = []

  if (selectedMetric === "revenue") {
    activeTableTitle = "Total Revenue Breakdown (All Paid Transactions)"
    activeTableSubtitle = `Showing ${allOrders.filter((o) => o.status !== "Cancelled").length} revenue-generating orders across Pakistan.`
    activeOrders = allOrders.filter((o) => o.status !== "Cancelled")
  } else if (selectedMetric === "today") {
    activeTableTitle = "Today's Orders & Live Sales (Last 24 Hours)"
    activeTableSubtitle = `Showing ${allOrders.filter((o) => o.is_today).length} orders placed today.`
    activeOrders = allOrders.filter((o) => o.is_today)
  } else if (selectedMetric === "monthly") {
    activeTableTitle = "Current Month Sales Telemetry"
    activeTableSubtitle = `Showing ${allOrders.filter((o) => o.is_this_month).length} orders recorded in the current calendar month.`
    activeOrders = allOrders.filter((o) => o.is_this_month)
  } else if (selectedMetric === "orders") {
    activeTableTitle = "Complete Orders Register"
    activeTableSubtitle = `Full register of all ${allOrders.length} orders across all statuses.`
    activeOrders = allOrders
  } else if (selectedMetric === "customers") {
    activeTableTitle = "Customer Client Profiles & Lifetime Value"
    activeTableSubtitle = `Registered customer database with lifetime order count and cumulative spend.`
  }

  const filteredOrders = activeOrders.filter((o) => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      (o.display_id && String(o.display_id).includes(term)) ||
      (o.id && o.id.toLowerCase().includes(term)) ||
      (o.email && o.email.toLowerCase().includes(term)) ||
      (o.status && o.status.toLowerCase().includes(term))
    )
  })

  const filteredCustomers = customerList.filter((c) => {
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    return (
      (c.email && c.email.toLowerCase().includes(term)) ||
      (c.id && c.id.toLowerCase().includes(term))
    )
  })

  return (
    <div style={{ padding: "24px 32px", width: "100%", maxWidth: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px", boxSizing: "border-box" }}>
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <Heading level="h1" style={{ fontSize: "26px", fontWeight: "700", color: "#111827", letterSpacing: "-0.02em" }}>
            NAQSH Store Overview & Analytics
          </Heading>
          <Text style={{ color: "#6b7280", marginTop: "2px", fontSize: "13px" }}>
            Live landscape telemetry: click any metric card below to interactively inspect full transaction data
          </Text>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Button variant="secondary" size="small" onClick={loadStats} disabled={loading}>
            <ArrowPath className={loading ? "animate-spin" : ""} />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Horizontal 5-Card Metric Strip across full width - Clickable */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: "14px" }}>
        {/* Total Revenue Box */}
        <div
          onClick={() => setSelectedMetric("revenue")}
          style={{
            cursor: "pointer",
            padding: "16px 20px",
            borderLeft: "4px solid #0F2D22",
            borderRadius: "8px",
            background: selectedMetric === "revenue" ? "#F0FDF4" : "#fff",
            border: selectedMetric === "revenue" ? "2px solid #0F2D22" : "1px solid #e5e7eb",
            boxShadow: selectedMetric === "revenue" ? "0 4px 12px rgba(15, 45, 34, 0.15)" : "0 1px 3px rgba(0,0,0,0.05)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            transition: "all 0.2s ease",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Text size="xsmall" style={{ color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: "600" }}>Total Revenue</Text>
            {selectedMetric === "revenue" && <Badge color="green">Active</Badge>}
          </div>
          <Heading level="h2" style={{ fontSize: "22px", marginTop: "6px", fontWeight: "700", color: "#0F2D22" }}>
            Rs. {Number(metrics.total_sales).toLocaleString()}
          </Heading>
          <Text size="xsmall" style={{ color: "#10b981", marginTop: "4px", fontSize: "11px" }}>Click to view all paid orders</Text>
        </div>

        {/* Today's Sales Box */}
        <div
          onClick={() => setSelectedMetric("today")}
          style={{
            cursor: "pointer",
            padding: "16px 20px",
            borderLeft: "4px solid #B6975A",
            borderRadius: "8px",
            background: selectedMetric === "today" ? "#FFFBEB" : "#fff",
            border: selectedMetric === "today" ? "2px solid #B6975A" : "1px solid #e5e7eb",
            boxShadow: selectedMetric === "today" ? "0 4px 12px rgba(182, 151, 90, 0.2)" : "0 1px 3px rgba(0,0,0,0.05)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            transition: "all 0.2s ease",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Text size="xsmall" style={{ color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: "600" }}>Today's Sales</Text>
            {selectedMetric === "today" && <Badge color="orange">Active</Badge>}
          </div>
          <Heading level="h2" style={{ fontSize: "22px", marginTop: "6px", fontWeight: "700", color: "#B6975A" }}>
            Rs. {Number(metrics.today_sales).toLocaleString()}
          </Heading>
          <Text size="xsmall" style={{ color: "#6b7280", marginTop: "4px", fontSize: "11px" }}>Click to view 24h orders</Text>
        </div>

        {/* Monthly Sales Box */}
        <div
          onClick={() => setSelectedMetric("monthly")}
          style={{
            cursor: "pointer",
            padding: "16px 20px",
            borderLeft: "4px solid #3b82f6",
            borderRadius: "8px",
            background: selectedMetric === "monthly" ? "#EFF6FF" : "#fff",
            border: selectedMetric === "monthly" ? "2px solid #3b82f6" : "1px solid #e5e7eb",
            boxShadow: selectedMetric === "monthly" ? "0 4px 12px rgba(59, 130, 246, 0.2)" : "0 1px 3px rgba(0,0,0,0.05)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            transition: "all 0.2s ease",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Text size="xsmall" style={{ color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: "600" }}>Monthly Sales</Text>
            {selectedMetric === "monthly" && <Badge color="blue">Active</Badge>}
          </div>
          <Heading level="h2" style={{ fontSize: "22px", marginTop: "6px", fontWeight: "700", color: "#1e40af" }}>
            Rs. {Number(metrics.monthly_sales).toLocaleString()}
          </Heading>
          <Text size="xsmall" style={{ color: "#6b7280", marginTop: "4px", fontSize: "11px" }}>Click to view monthly orders</Text>
        </div>

        {/* Total Orders Box */}
        <div
          onClick={() => setSelectedMetric("orders")}
          style={{
            cursor: "pointer",
            padding: "16px 20px",
            borderLeft: "4px solid #10b981",
            borderRadius: "8px",
            background: selectedMetric === "orders" ? "#F0FDF4" : "#fff",
            border: selectedMetric === "orders" ? "2px solid #10b981" : "1px solid #e5e7eb",
            boxShadow: selectedMetric === "orders" ? "0 4px 12px rgba(16, 185, 129, 0.2)" : "0 1px 3px rgba(0,0,0,0.05)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            transition: "all 0.2s ease",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Text size="xsmall" style={{ color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: "600" }}>Total Orders</Text>
            {selectedMetric === "orders" && <Badge color="green">Active</Badge>}
          </div>
          <Heading level="h2" style={{ fontSize: "22px", marginTop: "6px", fontWeight: "700", color: "#065f46" }}>
            {metrics.total_orders}
          </Heading>
          <Text size="xsmall" style={{ color: "#6b7280", marginTop: "4px", fontSize: "11px" }}>
            {metrics.pending_orders} pending · {metrics.completed_orders} done
          </Text>
        </div>

        {/* Total Customers Box */}
        <div
          onClick={() => setSelectedMetric("customers")}
          style={{
            cursor: "pointer",
            padding: "16px 20px",
            borderLeft: "4px solid #ec4899",
            borderRadius: "8px",
            background: selectedMetric === "customers" ? "#FDF2F8" : "#fff",
            border: selectedMetric === "customers" ? "2px solid #ec4899" : "1px solid #e5e7eb",
            boxShadow: selectedMetric === "customers" ? "0 4px 12px rgba(236, 72, 153, 0.2)" : "0 1px 3px rgba(0,0,0,0.05)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            transition: "all 0.2s ease",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Text size="xsmall" style={{ color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: "600" }}>Total Customers</Text>
            {selectedMetric === "customers" && <Badge color="purple">Active</Badge>}
          </div>
          <Heading level="h2" style={{ fontSize: "22px", marginTop: "6px", fontWeight: "700", color: "#be185d" }}>
            {metrics.total_customers}
          </Heading>
          <Text size="xsmall" style={{ color: "#6b7280", marginTop: "4px", fontSize: "11px" }}>Click to inspect client profiles</Text>
        </div>
      </div>

      {/* Interactive Deep-Dive Table for Selected Metric */}
      <Container style={{ padding: "20px 24px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Heading level="h2" style={{ fontSize: "17px", fontWeight: "700", color: "#111827" }}>
                {activeTableTitle}
              </Heading>
              <Badge color="blue">{selectedMetric === "customers" ? `${filteredCustomers.length} Records` : `${filteredOrders.length} Orders`}</Badge>
            </div>
            <Text size="xsmall" style={{ color: "#6b7280", marginTop: "2px" }}>
              {activeTableSubtitle}
            </Text>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <input
              type="text"
              placeholder={selectedMetric === "customers" ? "Search email or ID..." : "Filter order #, email, status..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: "6px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "12px",
                outline: "none",
                minWidth: "220px",
              }}
            />
            {searchTerm && (
              <Button size="small" variant="secondary" onClick={() => setSearchTerm("")}>
                Clear
              </Button>
            )}
          </div>
        </div>

        {selectedMetric === "customers" ? (
          filteredCustomers.length > 0 ? (
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Customer ID</Table.HeaderCell>
                  <Table.HeaderCell>Email Address</Table.HeaderCell>
                  <Table.HeaderCell>Joined Date</Table.HeaderCell>
                  <Table.HeaderCell>Total Orders</Table.HeaderCell>
                  <Table.HeaderCell>Lifetime Spend</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filteredCustomers.map((cust: any) => (
                  <Table.Row key={cust.id}>
                    <Table.Cell style={{ fontFamily: "monospace", fontSize: "11px", color: "#6b7280" }}>
                      {cust.id}
                    </Table.Cell>
                    <Table.Cell style={{ fontWeight: "600", fontSize: "13px", color: "#111827" }}>
                      {cust.email}
                    </Table.Cell>
                    <Table.Cell style={{ color: "#6b7280", fontSize: "12px" }}>
                      {new Date(cust.created_at).toLocaleDateString()}
                    </Table.Cell>
                    <Table.Cell>
                      <Badge color="blue">{cust.orders_count || 0} orders</Badge>
                    </Table.Cell>
                    <Table.Cell style={{ fontWeight: "700", color: "#0F2D22", fontSize: "13px" }}>
                      Rs. {Number(cust.total_spent || 0).toLocaleString()}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          ) : (
            <div style={{ padding: "30px", textAlign: "center" }}>
              <Text style={{ color: "#9ca3af" }}>No customers found matching "{searchTerm}".</Text>
            </div>
          )
        ) : filteredOrders.length > 0 ? (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Order #</Table.HeaderCell>
                <Table.HeaderCell>Customer</Table.HeaderCell>
                <Table.HeaderCell>Date & Time</Table.HeaderCell>
                <Table.HeaderCell>Fulfillment Status</Table.HeaderCell>
                <Table.HeaderCell>Payment</Table.HeaderCell>
                <Table.HeaderCell>Order Total</Table.HeaderCell>
                <Table.HeaderCell>Action</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {filteredOrders.map((ord: any) => (
                <Table.Row key={ord.id}>
                  <Table.Cell style={{ fontWeight: "700", fontSize: "12px", color: "#0F2D22" }}>
                    #{ord.display_id || ord.id.slice(0, 8)}
                  </Table.Cell>
                  <Table.Cell style={{ fontSize: "12px", color: "#374151" }}>
                    {ord.email || "Guest Checkout"}
                  </Table.Cell>
                  <Table.Cell style={{ color: "#6b7280", fontSize: "11px" }}>
                    {new Date(ord.created_at).toLocaleString()}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={
                      ord.status === "Delivered" || ord.status === "completed" ? "green" :
                      ord.status === "Cancelled" || ord.status === "canceled" ? "red" :
                      ord.status === "Returned" ? "purple" :
                      ord.status === "Shipped" || ord.status === "Out for Delivery" ? "blue" :
                      ord.status === "Packed" ? "orange" : "grey"
                    }>
                      {ord.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={ord.payment_status === "captured" ? "green" : "grey"}>
                      {ord.payment_status || "paid"}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell style={{ fontWeight: "700", fontSize: "13px", color: "#111827" }}>
                    Rs. {Number(ord.total).toLocaleString()}
                  </Table.Cell>
                  <Table.Cell>
                    <a
                      href={`/app/orders/${ord.id}`}
                      style={{
                        color: "#0F2D22",
                        textDecoration: "underline",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      View Order
                    </a>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        ) : (
          <div style={{ padding: "30px", textAlign: "center" }}>
            <Text style={{ color: "#9ca3af" }}>No orders found for this view.</Text>
          </div>
        )}
      </Container>

      {/* Middle Row: Landscape 2-Column Grid (1.3fr : 1fr) */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "16px", alignItems: "stretch" }}>
        {/* Left: 14-Day Sales Trend & Status Pipeline */}
        <Container style={{ padding: "20px 24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div>
              <Heading level="h2" style={{ fontSize: "16px", fontWeight: "600", color: "#111827" }}>
                Revenue Trend (Last 14 Days)
              </Heading>
              <Text size="xsmall" style={{ color: "#6b7280" }}>Daily store revenue volume across Pakistan</Text>
            </div>
            {/* Status Pills */}
            <div style={{ display: "flex", gap: "8px" }}>
              <Badge color="orange">Pending: {metrics.pending_orders}</Badge>
              <Badge color="green">Completed: {metrics.completed_orders}</Badge>
              <Badge color="red">Cancelled: {metrics.cancelled_orders}</Badge>
            </div>
          </div>

          {salesChart.length > 0 ? (
            <div style={{ display: "flex", alignItems: "flex-end", height: "160px", gap: "8px", borderBottom: "1px solid #e5e7eb", paddingBottom: "6px" }}>
              {salesChart.map((bar: any, idx: number) => {
                const heightPct = Math.max(8, (bar.revenue / maxRevenue) * 100)
                return (
                  <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", height: "100%", justifyContent: "flex-end" }}>
                    <div
                      title={`${bar.date}: Rs. ${bar.revenue.toLocaleString()}`}
                      style={{
                        width: "100%",
                        maxWidth: "28px",
                        height: `${heightPct}%`,
                        backgroundColor: bar.revenue > 0 ? "#0F2D22" : "#e5e7eb",
                        borderRadius: "3px 3px 0 0",
                        transition: "all 0.3s ease",
                      }}
                    />
                    <Text size="xsmall" style={{ color: "#9ca3af", fontSize: "9px" }}>{bar.label}</Text>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ height: "140px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Text style={{ color: "#9ca3af" }}>No recent sales recorded yet.</Text>
            </div>
          )}
        </Container>

        {/* Right: Low Stock Inventory Alerts */}
        <Container style={{ padding: "20px 24px", display: "flex", flexDirection: "column", maxHeight: "270px", overflowY: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <ExclamationCircle style={{ color: "#ef4444" }} />
            <Heading level="h2" style={{ fontSize: "16px", fontWeight: "600" }}>
              Low Stock Alerts (≤ 5 units)
            </Heading>
          </div>
          {lowStock.length > 0 ? (
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Product</Table.HeaderCell>
                  <Table.HeaderCell>SKU</Table.HeaderCell>
                  <Table.HeaderCell>Available</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {lowStock.slice(0, 5).map((item: any) => (
                  <Table.Row key={item.id}>
                    <Table.Cell style={{ fontWeight: "500", fontSize: "12px" }}>
                      {item.product_id ? (
                        <a
                          href={`/app/products/${item.product_id}`}
                          style={{
                            color: "#0F2D22",
                            textDecoration: "underline",
                            fontWeight: "600",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                          title="Open product in Admin"
                        >
                          <span>{item.title}</span>
                          <span style={{ fontSize: "10px", opacity: 0.7 }}>↗</span>
                        </a>
                      ) : (
                        <span>{item.title}</span>
                      )}
                    </Table.Cell>
                    <Table.Cell style={{ color: "#6b7280", fontSize: "11px" }}>{item.sku}</Table.Cell>
                    <Table.Cell>
                      <Badge color={item.available <= 0 ? "red" : "orange"}>
                        {item.available <= 0 ? "0 left (Sold Out)" : `${item.available} units left`}
                      </Badge>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          ) : (
            <div style={{ padding: "24px 0", textAlign: "center" }}>
              <Text style={{ color: "#10b981", fontSize: "13px" }}>✓ All inventory levels are healthy.</Text>
            </div>
          )}
        </Container>
      </div>

      {/* Bottom Row: Landscape 2-Column Grid (1fr : 1.2fr) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "16px" }}>
        {/* Top Selling Products */}
        <Container style={{ padding: "20px 24px", maxHeight: "320px", overflowY: "auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
            <Sparkles style={{ color: "#B6975A" }} />
            <Heading level="h2" style={{ fontSize: "16px", fontWeight: "600" }}>
              Top Selling Products
            </Heading>
          </div>
          {bestSelling.length > 0 ? (
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Product</Table.HeaderCell>
                  <Table.HeaderCell>Sold</Table.HeaderCell>
                  <Table.HeaderCell>Revenue</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {bestSelling.slice(0, 6).map((prod: any, idx: number) => (
                  <Table.Row key={idx}>
                    <Table.Cell style={{ fontWeight: "500", fontSize: "12px" }}>
                      {prod.product_id ? (
                        <a
                          href={`/app/products/${prod.product_id}`}
                          style={{
                            color: "#0F2D22",
                            textDecoration: "underline",
                            fontWeight: "600",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                          title="Open product in Admin"
                        >
                          <span>{prod.title}</span>
                          <span style={{ fontSize: "10px", opacity: 0.7 }}>↗</span>
                        </a>
                      ) : (
                        <span>{prod.title}</span>
                      )}
                    </Table.Cell>
                    <Table.Cell style={{ fontSize: "12px" }}>{prod.count} units</Table.Cell>
                    <Table.Cell style={{ fontWeight: "600", color: "#0F2D22", fontSize: "12px" }}>
                      Rs. {Number(prod.revenue).toLocaleString()}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          ) : (
            <Text style={{ color: "#9ca3af", fontSize: "13px" }}>No product sales recorded yet.</Text>
          )}
        </Container>

        {/* Recent Orders */}
        <Container style={{ padding: "20px 24px", maxHeight: "320px", overflowY: "auto" }}>
          <Heading level="h2" style={{ fontSize: "16px", fontWeight: "600", marginBottom: "14px" }}>
            Recent Orders
          </Heading>
          {recentOrders.length > 0 ? (
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Order #</Table.HeaderCell>
                  <Table.HeaderCell>Customer</Table.HeaderCell>
                  <Table.HeaderCell>Date</Table.HeaderCell>
                  <Table.HeaderCell>Status</Table.HeaderCell>
                  <Table.HeaderCell>Total</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {recentOrders.slice(0, 6).map((ord: any) => (
                  <Table.Row key={ord.id}>
                    <Table.Cell style={{ fontWeight: "600", fontSize: "12px" }}>#{ord.display_id || ord.id.slice(0, 8)}</Table.Cell>
                    <Table.Cell style={{ fontSize: "12px" }}>{ord.email || "Guest"}</Table.Cell>
                    <Table.Cell style={{ color: "#6b7280", fontSize: "11px" }}>
                      {new Date(ord.created_at).toLocaleDateString()}
                    </Table.Cell>
                    <Table.Cell>
                      <Badge color={
                        ord.status === "Delivered" || ord.status === "completed" ? "green" :
                        ord.status === "Cancelled" || ord.status === "canceled" ? "red" :
                        ord.status === "Returned" ? "purple" :
                        ord.status === "Shipped" || ord.status === "Out for Delivery" ? "blue" :
                        ord.status === "Packed" ? "orange" : "grey"
                      }>
                        {ord.status}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell style={{ fontWeight: "600", fontSize: "12px", color: "#111827" }}>
                      Rs. {Number(ord.total).toLocaleString()}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          ) : (
            <Text style={{ color: "#9ca3af", fontSize: "13px" }}>No orders placed yet.</Text>
          )}
        </Container>
      </div>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "NAQSH Analytics",
  icon: ChartBar,
})

export default DashboardPage
