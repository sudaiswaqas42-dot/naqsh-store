import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ChatBubbleLeftRight, PencilSquare, Check, XMark, Eye, EyeSlash, Trash, Plus, Star } from "@medusajs/icons"
import { Container, Heading, Text, Badge, Button, Input } from "@medusajs/ui"
import { useEffect, useState } from "react"
import ConfirmDialog from "../../components/confirm-dialog"

interface Review {
  id: string
  name: string
  city: string
  initials: string
  quote: string
  rating: number
  category: "all" | "lawn" | "pret" | "formals"
  verified: boolean
  is_approved: boolean
  date: string
}

const ReviewsAdminPage = () => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [sectionTitle, setSectionTitle] = useState("Loved by Thousands")
  const [sectionSubtitle, setSectionSubtitle] = useState("Real feedback from verified shoppers across Pakistan who trust NAQSH for celebratory moments.")
  const [isActive, setIsActive] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null)

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Review>>({})

  // Add State
  const [showAddModal, setShowAddModal] = useState(false)
  const [newForm, setNewForm] = useState({
    name: "",
    city: "Lahore",
    rating: 5,
    category: "lawn" as "all" | "lawn" | "pret" | "formals",
    quote: "",
  })
  const [saving, setSaving] = useState(false)

  const fetchReviews = () => {
    setLoading(true)
    fetch("/admin/reviews")
      .then((res) => res.json())
      .then((data) => {
        setReviews(data.reviews || [])
        if (data.title) setSectionTitle(data.title)
        if (data.subtitle) setSectionSubtitle(data.subtitle)
        if (data.is_active !== undefined) setIsActive(data.is_active)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const handleSaveSectionMeta = async () => {
    setSaving(true)
    try {
      const res = await fetch("/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_section",
          title: sectionTitle,
          subtitle: sectionSubtitle,
          is_active: isActive,
        }),
      })
      if (res.ok) {
        setMessage("Section settings saved successfully!")
        setTimeout(() => setMessage(null), 3000)
      }
    } catch (err: any) {
      alert("Error: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await fetch("/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle", id }),
      })
      if (res.ok) {
        const data = await res.json()
        setReviews(data.reviews)
        setMessage("Visibility updated!")
        setTimeout(() => setMessage(null), 2500)
      }
    } catch (err: any) {
      alert("Error toggling review: " + err.message)
    }
  }

  const confirmDeleteReview = async () => {
    if (!reviewToDelete) return
    const id = reviewToDelete
    setReviewToDelete(null)
    try {
      const res = await fetch("/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id }),
      })
      if (res.ok) {
        const data = await res.json()
        setReviews(data.reviews)
        setMessage("Review permanently deleted!")
        setTimeout(() => setMessage(null), 2500)
      }
    } catch (err: any) {
      alert("Error deleting review: " + err.message)
    }
  }

  const handleStartEdit = (r: Review) => {
    setEditingId(r.id)
    setEditForm({
      name: r.name,
      city: r.city,
      rating: r.rating,
      category: r.category,
      quote: r.quote,
    })
  }

  const handleSaveEdit = async (id: string) => {
    setSaving(true)
    try {
      const res = await fetch("/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "edit", id, ...editForm }),
      })
      if (res.ok) {
        const data = await res.json()
        setReviews(data.reviews)
        setEditingId(null)
        setMessage("Review updated successfully!")
        setTimeout(() => setMessage(null), 2500)
      }
    } catch (err: any) {
      alert("Error editing review: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleAddNew = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newForm.name.trim() || !newForm.quote.trim()) {
      alert("Please enter customer name and review quote.")
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", ...newForm }),
      })
      if (res.ok) {
        const data = await res.json()
        setReviews(data.reviews)
        setShowAddModal(false)
        setNewForm({ name: "", city: "Lahore", rating: 5, category: "lawn", quote: "" })
        setMessage("New verified review added successfully!")
        setTimeout(() => setMessage(null), 3000)
      }
    } catch (err: any) {
      alert("Error adding review: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  const activeCount = reviews.filter((r) => r.is_approved !== false).length

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <Heading level="h1" style={{ fontSize: "28px", fontWeight: "600" }}>
            Customer Reviews Management
          </Heading>
          <Text style={{ color: "#6b7280", marginTop: "4px" }}>
            Full control over live customer testimonials, star ratings, categories, and storefront visibility
          </Text>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {message && <Badge color="green">{message}</Badge>}
          <Button variant="primary" size="small" onClick={() => setShowAddModal(true)}>
            <Plus /> Add Verified Review
          </Button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
        <Container style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "4px" }}>
          <Text size="xsmall" style={{ color: "#6b7280", fontWeight: "600", textTransform: "uppercase" }}>
            Total Reviews
          </Text>
          <Heading level="h2" style={{ fontSize: "24px", fontWeight: "700" }}>
            {reviews.length}
          </Heading>
        </Container>

        <Container style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "4px" }}>
          <Text size="xsmall" style={{ color: "#6b7280", fontWeight: "600", textTransform: "uppercase" }}>
            Active on Storefront
          </Text>
          <Heading level="h2" style={{ fontSize: "24px", fontWeight: "700", color: "#16a34a" }}>
            {activeCount}
          </Heading>
        </Container>

        <Container style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "4px" }}>
          <Text size="xsmall" style={{ color: "#6b7280", fontWeight: "600", textTransform: "uppercase" }}>
            Store Satisfaction Rating
          </Text>
          <Heading level="h2" style={{ fontSize: "24px", fontWeight: "700", color: "#d97706" }}>
            5.0 / 5.0 ★
          </Heading>
        </Container>
      </div>

      {/* Section Global Settings Card */}
      <Container style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Heading level="h2" style={{ fontSize: "16px", fontWeight: "600" }}>
            Section Heading & Visibility
          </Heading>
          <Button
            variant={isActive ? "primary" : "secondary"}
            size="small"
            onClick={() => setIsActive(!isActive)}
          >
            {isActive ? <Eye /> : <EyeSlash />}
            {isActive ? "Section Active on Home" : "Section Hidden on Home"}
          </Button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "16px" }}>
          <div>
            <Text size="xsmall" style={{ fontWeight: "600", marginBottom: "4px", color: "#374151" }}>
              Main Title
            </Text>
            <Input
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              placeholder="e.g. Loved by Thousands"
            />
          </div>
          <div>
            <Text size="xsmall" style={{ fontWeight: "600", marginBottom: "4px", color: "#374151" }}>
              Subtitle / Caption
            </Text>
            <Input
              value={sectionSubtitle}
              onChange={(e) => setSectionSubtitle(e.target.value)}
              placeholder="e.g. Real feedback from verified shoppers across Pakistan..."
            />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button variant="secondary" size="small" onClick={handleSaveSectionMeta} disabled={saving}>
            <Check /> Save Section Settings
          </Button>
        </div>
      </Container>

      {/* Add New Review Modal / Form */}
      {showAddModal && (
        <Container style={{ padding: "24px", border: "2px solid #3b82f6", display: "flex", flexDirection: "column", gap: "16px", background: "#f8fafc" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Heading level="h2" style={{ fontSize: "18px", fontWeight: "600", color: "#1e3a8a" }}>
              Add Verified Customer Testimonial
            </Heading>
            <Button variant="secondary" size="small" onClick={() => setShowAddModal(false)}>
              <XMark /> Cancel
            </Button>
          </div>

          <form onSubmit={handleAddNew} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "14px" }}>
              <div>
                <Text size="xsmall" style={{ fontWeight: "600", marginBottom: "4px" }}>Customer Name</Text>
                <Input
                  required
                  value={newForm.name}
                  onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                  placeholder="e.g. Mahira Khan"
                />
              </div>

              <div>
                <Text size="xsmall" style={{ fontWeight: "600", marginBottom: "4px" }}>City / Location</Text>
                <Input
                  value={newForm.city}
                  onChange={(e) => setNewForm({ ...newForm, city: e.target.value })}
                  placeholder="e.g. Lahore / Karachi"
                />
              </div>

              <div>
                <Text size="xsmall" style={{ fontWeight: "600", marginBottom: "4px" }}>Category</Text>
                <select
                  value={newForm.category}
                  onChange={(e) => setNewForm({ ...newForm, category: e.target.value as any })}
                  style={{ width: "100%", height: "32px", padding: "0 8px", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "12px", background: "#fff" }}
                >
                  <option value="lawn">Festive Lawn</option>
                  <option value="pret">Stitched Pret</option>
                  <option value="formals">Luxury Formals</option>
                  <option value="all">All Categories</option>
                </select>
              </div>

              <div>
                <Text size="xsmall" style={{ fontWeight: "600", marginBottom: "4px" }}>Star Rating</Text>
                <select
                  value={newForm.rating}
                  onChange={(e) => setNewForm({ ...newForm, rating: Number(e.target.value) })}
                  style={{ width: "100%", height: "32px", padding: "0 8px", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "12px", background: "#fff" }}
                >
                  <option value={5}>★★★★★ (5 Stars)</option>
                  <option value={4}>★★★★☆ (4 Stars)</option>
                  <option value={3}>★★★☆☆ (3 Stars)</option>
                </select>
              </div>
            </div>

            <div>
              <Text size="xsmall" style={{ fontWeight: "600", marginBottom: "4px" }}>Review Text / Customer Quote</Text>
              <textarea
                required
                rows={3}
                value={newForm.quote}
                onChange={(e) => setNewForm({ ...newForm, quote: e.target.value })}
                placeholder="Paste customer review here..."
                style={{ width: "100%", padding: "8px", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "13px", fontFamily: "inherit" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <Button variant="secondary" size="small" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="small" type="submit" disabled={saving}>
                <Check /> Publish Review
              </Button>
            </div>
          </form>
        </Container>
      )}

      {/* Reviews List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <Heading level="h2" style={{ fontSize: "18px", fontWeight: "600" }}>
          All Customer Reviews ({reviews.length})
        </Heading>

        {loading ? (
          <Container style={{ padding: "32px", textAlign: "center" }}>
            <Text style={{ color: "#6b7280" }}>Loading customer reviews...</Text>
          </Container>
        ) : reviews.length === 0 ? (
          <Container style={{ padding: "32px", textAlign: "center" }}>
            <Text style={{ color: "#6b7280" }}>No reviews found. Click "Add Verified Review" to create one.</Text>
          </Container>
        ) : (
          reviews.map((r) => {
            const isEditing = editingId === r.id
            const isLive = r.is_approved !== false

            return (
              <Container
                key={r.id}
                style={{
                  padding: "16px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  borderLeft: isLive ? "4px solid #16a34a" : "4px solid #9ca3af",
                  background: isLive ? "#fff" : "#f9fafb",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
                  {/* Left info */}
                  <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <div
                      style={{
                        width: "38px",
                        height: "38px",
                        borderRadius: "50%",
                        background: "#1f2937",
                        color: "#fbbf24",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "700",
                        fontSize: "12px",
                        letterSpacing: "1px",
                        flexShrink: 0,
                      }}
                    >
                      {r.initials || "CU"}
                    </div>

                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Text style={{ fontWeight: "700", fontSize: "14px", color: "#111827" }}>
                          {r.name}
                        </Text>
                        <span style={{ fontSize: "12px", color: "#d97706" }}>
                          {"★".repeat(r.rating || 5)}
                        </span>
                        <Badge color={isLive ? "green" : "orange"}>
                          {isLive ? "Live on Store" : "Pending Admin Confirmation"}
                        </Badge>
                      </div>

                      <Text size="xsmall" style={{ color: "#6b7280", marginTop: "2px" }}>
                        {r.city} • {r.date}
                      </Text>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <Button
                      variant={isLive ? "secondary" : "primary"}
                      size="small"
                      onClick={() => handleToggleStatus(r.id)}
                      title={isLive ? "Hide from storefront" : "Confirm and Publish to Storefront"}
                    >
                      {isLive ? <EyeSlash /> : <Check />}
                      {isLive ? "Hide Review" : "Approve & Publish"}
                    </Button>

                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => handleStartEdit(r)}
                    >
                      <PencilSquare />
                      Edit
                    </Button>

                    <Button
                      variant="danger"
                      size="small"
                      onClick={() => setReviewToDelete(r.id)}
                    >
                      <Trash />
                    </Button>
                  </div>
                </div>

                {/* Review Text */}
                {!isEditing ? (
                  <div style={{ background: "#f8fafc", padding: "10px 14px", borderRadius: "4px", border: "1px solid #f1f5f9" }}>
                    <Text style={{ fontSize: "13px", color: "#334155", fontStyle: "italic", lineHeight: "1.5" }}>
                      "{r.quote}"
                    </Text>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "8px", borderTop: "1px solid #e5e7eb", paddingTop: "12px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                      <div>
                        <Text size="xsmall" style={{ fontWeight: "600", marginBottom: "4px" }}>Customer Name</Text>
                        <Input
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Text size="xsmall" style={{ fontWeight: "600", marginBottom: "4px" }}>City</Text>
                        <Input
                          value={editForm.city}
                          onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                        />
                      </div>
                      <div>
                        <Text size="xsmall" style={{ fontWeight: "600", marginBottom: "4px" }}>Category</Text>
                        <select
                          value={editForm.category}
                          onChange={(e) => setEditForm({ ...editForm, category: e.target.value as any })}
                          style={{ width: "100%", height: "32px", padding: "0 8px", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "12px", background: "#fff" }}
                        >
                          <option value="lawn">Festive Lawn</option>
                          <option value="pret">Stitched Pret</option>
                          <option value="formals">Luxury Formals</option>
                          <option value="all">All</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <Text size="xsmall" style={{ fontWeight: "600", marginBottom: "4px" }}>Review Text</Text>
                      <textarea
                        rows={2}
                        value={editForm.quote}
                        onChange={(e) => setEditForm({ ...editForm, quote: e.target.value })}
                        style={{ width: "100%", padding: "8px", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "13px", fontFamily: "inherit" }}
                      />
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                      <Button variant="secondary" size="small" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                      <Button variant="primary" size="small" onClick={() => handleSaveEdit(r.id)} disabled={saving}>
                        <Check /> Save Review
                      </Button>
                    </div>
                  </div>
                )}
              </Container>
            )
          })
        )}
      </div>

      <ConfirmDialog
        isOpen={!!reviewToDelete}
        title="Delete Customer Review?"
        description="Are you sure you want to permanently delete this customer review? It will be removed from both the admin dashboard and the live storefront."
        confirmLabel="Delete Review"
        onConfirm={confirmDeleteReview}
        onCancel={() => setReviewToDelete(null)}
      />
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Customer Reviews",
  icon: ChatBubbleLeftRight,
})

export default ReviewsAdminPage
