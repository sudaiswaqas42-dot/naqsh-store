import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ArrowPath, Check, XMark, Clock } from "@medusajs/icons"
import { Container, Heading, Text, Badge, Button, Table, Input } from "@medusajs/ui"
import { useEffect, useState } from "react"

const ReturnsAdminPage = () => {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeNotes, setActiveNotes] = useState<Record<string, string>>({})
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchReturns = () => {
    setLoading(true)
    fetch("/admin/return-requests")
      .then((res) => res.json())
      .then((data) => {
        setRequests(data.return_requests || [])
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchReturns()
  }, [])

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id)
    try {
      await fetch(`/admin/return-requests/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          admin_notes: activeNotes[id] || undefined,
        }),
      })
      fetchReturns()
    } catch (err: any) {
      alert("Error updating return: " + err.message)
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <Heading level="h1" style={{ fontSize: "28px", fontWeight: "600" }}>
            Return & Exchange Management
          </Heading>
          <Text style={{ color: "var(--fg-subtle)", marginTop: "4px" }}>
            Review customer return/exchange submissions, update approval status, and leave internal resolution notes
          </Text>
        </div>
        <Button variant="secondary" onClick={fetchReturns} disabled={loading}>
          <ArrowPath className={loading ? "animate-spin" : ""} />
          Refresh Requests
        </Button>
      </div>

      <Container style={{ padding: "20px" }}>
        {loading ? (
          <Text style={{ color: "var(--fg-subtle)" }}>Loading return requests...</Text>
        ) : requests.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0" }}>
            <Text style={{ color: "var(--fg-subtle)" }}>No return or exchange requests currently submitted.</Text>
          </div>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Order #</Table.HeaderCell>
                <Table.HeaderCell>Customer</Table.HeaderCell>
                <Table.HeaderCell>Reason</Table.HeaderCell>
                <Table.HeaderCell>Requested Action</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Actions / Resolution</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {requests.map((req) => (
                <Table.Row key={req.id}>
                  <Table.Cell style={{ fontWeight: "600" }}>
                    #{req.order_display_id || req.order_id}
                  </Table.Cell>
                  <Table.Cell>
                    <div>
                      <Text size="small" style={{ fontWeight: "500" }}>{req.customer_name || "Customer"}</Text>
                      <Text size="xsmall" style={{ color: "var(--fg-subtle)" }}>{req.customer_email}</Text>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color="orange">{req.reason}</Badge>
                    {req.notes && (
                      <Text size="xsmall" style={{ color: "var(--fg-subtle)", marginTop: "4px", maxWidth: "200px" }}>
                        "{req.notes}"
                      </Text>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Text size="small" style={{ fontWeight: "600", color: "var(--fg-base)" }}>
                      {req.action_requested}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge
                      color={
                        req.status === "approved" || req.status === "processed" ? "green" :
                        req.status === "rejected" ? "red" :
                        req.status === "received" ? "purple" : "orange"
                      }
                    >
                      {req.status?.toUpperCase()}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <Button
                          size="small"
                          variant="secondary"
                          disabled={updatingId === req.id || req.status === "approved"}
                          onClick={() => updateStatus(req.id, "approved")}
                        >
                          <Check /> Approve
                        </Button>
                        <Button
                          size="small"
                          variant="secondary"
                          disabled={updatingId === req.id || req.status === "received"}
                          onClick={() => updateStatus(req.id, "received")}
                        >
                          Received
                        </Button>
                        <Button
                          size="small"
                          variant="secondary"
                          disabled={updatingId === req.id || req.status === "processed"}
                          onClick={() => updateStatus(req.id, "processed")}
                        >
                          Completed
                        </Button>
                        <Button
                          size="small"
                          variant="danger"
                          disabled={updatingId === req.id || req.status === "rejected"}
                          onClick={() => updateStatus(req.id, "rejected")}
                        >
                          <XMark /> Reject
                        </Button>
                      </div>
                      <Input
                        placeholder="Resolution note..."
                        size="small"
                        defaultValue={req.admin_notes || ""}
                        onChange={(e) =>
                          setActiveNotes({ ...activeNotes, [req.id]: e.target.value })
                        }
                      />
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}
      </Container>
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Returns & Exchanges",
  icon: Clock,
})

export default ReturnsAdminPage
