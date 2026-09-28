import { defineRouteConfig } from "@medusajs/admin-sdk"
import {
  SquaresPlus,
  ArrowUpMini,
  ArrowDownMini,
  PencilSquare,
  Check,
  XMark,
  Eye,
  EyeSlash,
  Trash,
  Plus,
  Sparkles,
  Tag,
  ArrowPath,
  MagnifyingGlass,
} from "@medusajs/icons"
import { Container, Heading, Text, Badge, Button, Input, Switch } from "@medusajs/ui"
import { useEffect, useState } from "react"

const HomepageAdminPage = () => {
  const [activeTab, setActiveTab] = useState<"sections" | "products" | "instagram" | "categories" | "social">("sections")
  const [sections, setSections] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<any>({})
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  // Card Studio Modal State
  const [activeCardSection, setActiveCardSection] = useState<any | null>(null)
  const [editingCardIndex, setEditingCardIndex] = useState<number | null>(null)
  const [cardFormData, setCardFormData] = useState<any>({
    title: "",
    subtitle: "Luxury Pret",
    image_url: "",
    price: 4950,
    original_price: 6950,
    discount_percent: 25,
    badge: "SALE",
    link: "/store",
  })
  const [savingCards, setSavingCards] = useState(false)

  // New Section Creation State
  const [showAddSection, setShowAddSection] = useState(false)
  const [newSecData, setNewSecData] = useState<any>({
    type: "cards_grid",
    title: "New Festive Curation",
    subtitle: "Handcrafted designs for the season",
    cta_text: "Shop Collection →",
    cta_link: "/store",
    badge: "LIMITED TIME FESTIVE GALA",
    promo_code: "LUXE20",
    hours: 5,
    minutes: 41,
    seconds: 12,
  })

  // Task 3: Direct Product Pricing & Sale Engine State
  const [catalogProducts, setCatalogProducts] = useState<any[]>([])
  const [productSearch, setProductSearch] = useState("")
  const [productSaleStates, setProductSaleStates] = useState<{
    [productId: string]: {
      on_sale: boolean
      sale_price?: number
      original_price?: number
      discount_percent?: number
    }
  }>({})
  const [savingProductSales, setSavingProductSales] = useState(false)

  // Sales Controller State
  const [salesConfig, setSalesConfig] = useState<any>({
    active: true,
    default_discount: 20,
    category_discounts: {
      "Ready-to-Wear": 20,
      "Luxury Pret": 25,
      "Summer Lawn '25": 30,
      "Festive Formals": 30,
      "Pret Edit": 20,
      "Bestsellers": 25,
      "Unstitched": 30,
      "Men": 20,
      "Women": 20,
    },
    products: {},
  })
  const [newCatName, setNewCatName] = useState("")
  const [newCatPercent, setNewCatPercent] = useState("20")
  const [savingSales, setSavingSales] = useState(false)

  // Instagram Settings & Reels
  const [instagramSettings, setInstagramSettings] = useState({
    profile_url: "https://www.instagram.com/itx_shk_selfish/",
    username: "@itx_shk_selfish",
    title: "Live on Instagram",
    subtitle: "Behind the seams, bespoke bridal fittings, and seasonal luxury pret stories.",
  })
  const [instagramCards, setInstagramCards] = useState<any[]>([])
  const [savingInstagram, setSavingInstagram] = useState(false)

  // Footer Social Links
  const [socialLinks, setSocialLinks] = useState({
    facebook: "https://facebook.com/naqshbrand",
    instagram: "https://instagram.com/itx_shk_selfish",
    tiktok: "https://tiktok.com/@naqshbrand",
    pinterest: "https://pinterest.com/naqshbrand",
  })
  const [savingSocial, setSavingSocial] = useState(false)

  const fetchSections = () => {
    setLoading(true)
    fetch("/admin/homepage-sections")
      .then((res) => res.json())
      .then((data) => {
        setSections(data.sections || [])
        // Sync Instagram settings & reels from instagram_feed section if present
        const instaSec = (data.sections || []).find((s: any) => s.type === "instagram_feed" || s.key === "instagram_feed")
        if (instaSec) {
          setInstagramSettings({
            profile_url: instaSec.settings?.profile_url || "https://www.instagram.com/itx_shk_selfish/",
            username: instaSec.settings?.username || "@itx_shk_selfish",
            title: instaSec.title || "Live on Instagram",
            subtitle: instaSec.subtitle || "Behind the seams, bespoke bridal fittings, and seasonal luxury pret stories.",
          })
          setInstagramCards(instaSec.settings?.cards || [])
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })

    fetch("/admin/sales")
      .then((res) => res.json())
      .then((data) => {
        if (data.sales) {
          setSalesConfig(data.sales)
          if (data.sales.products) {
            setProductSaleStates(data.sales.products)
          }
        }
        if (data.products && Array.isArray(data.products)) {
          setCatalogProducts(data.products)
        }
      })
      .catch((err) => console.error(err))

    fetch("/admin/social-links")
      .then((res) => res.json())
      .then((data) => {
        if (data.social_links) setSocialLinks(data.social_links)
      })
      .catch((err) => console.error(err))
  }

  useEffect(() => {
    fetchSections()
  }, [])

  // Sync / Reset Blueprint (Image 1, 2, 3, 4 cards pre-population)
  const handleResetBlueprint = async () => {
    if (!confirm("This will synchronize all 10 homepage sections and populate all reference cards from Image 1 (Circles), Image 2 (Bento), Image 3 (Products), and Image 4 (Spotlights). Continue?")) return
    setSyncing(true)
    try {
      const res = await fetch("/admin/homepage-sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_blueprint" }),
      })
      if (res.ok) {
        setMessage("All 10 sections and cards hydrated successfully!")
        setTimeout(() => setMessage(null), 3500)
        fetchSections()
      }
    } catch (err: any) {
      alert("Error resetting blueprint: " + err.message)
    } finally {
      setSyncing(false)
    }
  }

  // Section content editing
  const startEdit = (sec: any) => {
    setEditingId(sec.id)
    setFormData({
      title: sec.title || "",
      subtitle: sec.subtitle || "",
      cta_text: sec.cta_text || "",
      cta_link: sec.cta_link || "",
      collection_id: sec.collection_id || "",
      is_active: sec.is_active,
      badge: sec.settings?.badge || "LIMITED TIME FESTIVE GALA",
      promo_code: sec.settings?.promo_code || "LUXE20",
      hours: sec.settings?.hours ?? 5,
      minutes: sec.settings?.minutes ?? 41,
      seconds: sec.settings?.seconds ?? 12,
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setFormData({})
  }

  const saveEdit = async (sec: any) => {
    setSaving(true)
    try {
      const isBanner = sec.type === "sale_banner" || sec.type === "flash_sale"
      const updatedSettings = {
        ...(sec.settings || {}),
        ...(isBanner
          ? {
              badge: formData.badge,
              promo_code: formData.promo_code,
              hours: Number(formData.hours),
              minutes: Number(formData.minutes),
              seconds: Number(formData.seconds),
            }
          : {}),
      }

      const res = await fetch(`/admin/homepage-sections/${sec.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          subtitle: formData.subtitle,
          cta_text: formData.cta_text,
          cta_link: formData.cta_link,
          collection_id: formData.collection_id,
          settings: updatedSettings,
        }),
      })
      if (res.ok) {
        setMessage("Section updated successfully!")
        setTimeout(() => setMessage(null), 3000)
        setEditingId(null)
        fetchSections()
      }
    } catch (err: any) {
      alert("Error saving: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (sec: any) => {
    try {
      await fetch(`/admin/homepage-sections/${sec.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !sec.is_active }),
      })
      fetchSections()
    } catch (err: any) {
      alert("Error updating visibility: " + err.message)
    }
  }

  const moveRank = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= sections.length) return

    const newSections = [...sections]
    const temp = newSections[index]
    newSections[index] = newSections[targetIndex]
    newSections[targetIndex] = temp

    const updatedWithRanks = newSections.map((sec, idx) => ({
      id: sec.id,
      rank: idx,
    }))

    try {
      await fetch("/admin/homepage-sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reorder: true, sections: updatedWithRanks }),
      })
      fetchSections()
    } catch (err: any) {
      alert("Error reordering: " + err.message)
    }
  }

  const deleteSection = async (id: string) => {
    if (!confirm("Are you sure you want to remove this section from the homepage?")) return
    try {
      await fetch(`/admin/homepage-sections/${id}`, { method: "DELETE" })
      fetchSections()
    } catch (err: any) {
      alert("Error deleting section: " + err.message)
    }
  }

  // Create New Section
  const handleCreateSection = async () => {
    try {
      const isBanner = newSecData.type === "sale_banner"
      const settings = isBanner
        ? {
            badge: newSecData.badge,
            promo_code: newSecData.promo_code,
            hours: Number(newSecData.hours),
            minutes: Number(newSecData.minutes),
            seconds: Number(newSecData.seconds),
          }
        : {
            cards: [],
          }

      const res = await fetch("/admin/homepage-sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: `custom_${Date.now()}`,
          type: newSecData.type,
          title: newSecData.title,
          subtitle: newSecData.subtitle,
          cta_text: newSecData.cta_text,
          cta_link: newSecData.cta_link,
          rank: sections.length,
          is_active: true,
          settings,
        }),
      })

      if (res.ok) {
        setShowAddSection(false)
        setMessage("New section added to homepage!")
        setTimeout(() => setMessage(null), 3000)
        fetchSections()
      }
    } catch (err: any) {
      alert("Error creating section: " + err.message)
    }
  }

  // Card Studio Management
  const openCardsStudio = (sec: any) => {
    setActiveCardSection({
      ...sec,
      cards: sec.settings?.cards || [],
    })
    setEditingCardIndex(null)
    setCardFormData({
      title: "",
      subtitle: sec.type === "fabric_strip" ? "Embroidered Voile" : "Luxury Pret",
      image_url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800",
      price: 4950,
      original_price: 6950,
      discount_percent: 25,
      badge: sec.type === "fabric_strip" ? "TRENDING" : "SALE",
      link: "/store",
    })
  }

  const handleSaveCard = () => {
    if (!activeCardSection) return
    const currentCards = [...(activeCardSection.cards || [])]

    if (editingCardIndex !== null && editingCardIndex >= 0) {
      currentCards[editingCardIndex] = {
        ...currentCards[editingCardIndex],
        ...cardFormData,
      }
    } else {
      currentCards.push({
        id: `card_${Date.now()}`,
        ...cardFormData,
      })
    }

    setActiveCardSection({
      ...activeCardSection,
      cards: currentCards,
    })

    setEditingCardIndex(null)
    setCardFormData({
      title: "",
      subtitle: activeCardSection.type === "fabric_strip" ? "Embroidered Voile" : "Luxury Pret",
      image_url: "",
      price: 4950,
      original_price: 6950,
      discount_percent: 25,
      badge: activeCardSection.type === "fabric_strip" ? "TRENDING" : "SALE",
      link: "/store",
    })
  }

  const handleDeleteCard = (idx: number) => {
    if (!activeCardSection) return
    const currentCards = activeCardSection.cards.filter((_: any, i: number) => i !== idx)
    setActiveCardSection({
      ...activeCardSection,
      cards: currentCards,
    })
  }

  const handlePersistCards = async () => {
    if (!activeCardSection) return
    setSavingCards(true)
    try {
      const updatedSettings = {
        ...(activeCardSection.settings || {}),
        cards: activeCardSection.cards,
      }
      const res = await fetch(`/admin/homepage-sections/${activeCardSection.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: updatedSettings }),
      })
      if (res.ok) {
        setMessage("Section cards saved and published to storefront!")
        setTimeout(() => setMessage(null), 3000)
        setActiveCardSection(null)
        fetchSections()
      }
    } catch (err: any) {
      alert("Error saving cards: " + err.message)
    } finally {
      setSavingCards(false)
    }
  }

  // Task 3: Product Sale State Handlers
  const handleToggleProductSale = (prodId: string) => {
    const current = productSaleStates[prodId] || { on_sale: false, discount_percent: 20 }
    setProductSaleStates({
      ...productSaleStates,
      [prodId]: {
        ...current,
        on_sale: !current.on_sale,
      },
    })
  }

  const handleUpdateProductPrice = (prodId: string, field: "sale_price" | "original_price" | "discount_percent", value: any) => {
    const current = productSaleStates[prodId] || { on_sale: true, discount_percent: 20 }
    setProductSaleStates({
      ...productSaleStates,
      [prodId]: {
        ...current,
        [field]: Number(value),
      },
    })
  }

  const handleApplyAllProductSales = async () => {
    setSavingProductSales(true)
    try {
      const res = await fetch("/admin/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          active: true,
          products: productSaleStates,
        }),
      })
      if (res.ok) {
        setMessage("Product-level pricing & sale discounts published live to all cards!")
        setTimeout(() => setMessage(null), 3500)
      }
    } catch (err: any) {
      alert("Error saving product sales: " + err.message)
    } finally {
      setSavingProductSales(false)
    }
  }

  // Instagram Settings Save
  const handleSaveInstagram = async () => {
    setSavingInstagram(true)
    try {
      const instaSec = sections.find((s) => s.type === "instagram_feed" || s.key === "instagram_feed")
      if (instaSec) {
        await fetch(`/admin/homepage-sections/${instaSec.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: instagramSettings.title,
            subtitle: instagramSettings.subtitle,
            settings: {
              ...(instaSec.settings || {}),
              profile_url: instagramSettings.profile_url,
              username: instagramSettings.username,
              cards: instagramCards,
            },
          }),
        })
      }
      // Also sync to footer social links
      await fetch("/admin/social-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...socialLinks, instagram: instagramSettings.profile_url }),
      })
      setMessage("Instagram profile & live feed configuration updated live!")
      setTimeout(() => setMessage(null), 3000)
      fetchSections()
    } catch (err: any) {
      alert("Error saving Instagram: " + err.message)
    } finally {
      setSavingInstagram(false)
    }
  }

  // Category Discounts Save
  const handleSaveSalesConfig = async () => {
    setSavingSales(true)
    try {
      const res = await fetch("/admin/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(salesConfig),
      })
      if (res.ok) {
        setMessage("Category sale discounts applied to storefront!")
        setTimeout(() => setMessage(null), 3000)
      }
    } catch (err: any) {
      alert("Error saving sales: " + err.message)
    } finally {
      setSavingSales(false)
    }
  }

  const handleAddCategoryDiscount = () => {
    if (!newCatName.trim()) return
    setSalesConfig({
      ...salesConfig,
      category_discounts: {
        ...salesConfig.category_discounts,
        [newCatName.trim()]: Number(newCatPercent) || 20,
      },
    })
    setNewCatName("")
  }

  const handleRemoveCategoryDiscount = (cat: string) => {
    const updated = { ...salesConfig.category_discounts }
    delete updated[cat]
    setSalesConfig({ ...salesConfig, category_discounts: updated })
  }

  const saveSocialLinks = async () => {
    setSavingSocial(true)
    try {
      const res = await fetch("/admin/social-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(socialLinks),
      })
      if (res.ok) {
        setMessage("Footer circular social links updated successfully!")
        setTimeout(() => setMessage(null), 3000)
      }
    } catch (err: any) {
      alert("Error saving social links: " + err.message)
    } finally {
      setSavingSocial(false)
    }
  }

  const filteredCatalog = catalogProducts.filter((p) =>
    p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.id.toLowerCase().includes(productSearch.toLowerCase())
  )

  return (
    <div style={{ padding: "32px 40px", width: "100%", maxWidth: "1280px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "28px", boxSizing: "border-box", fontFamily: "sans-serif" }}>
      {/* Top Header Card */}
      <Container style={{ padding: "26px 30px", background: "linear-gradient(135deg, #0F2D22 0%, #173d30 100%)", color: "#fff", borderRadius: "10px", boxShadow: "0 10px 25px -5px rgba(15, 45, 34, 0.25)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#B6975A" }} />
              <span style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.2em", textTransform: "uppercase", color: "#B6975A" }}>
                NAQSH Haute Couture Admin
              </span>
            </div>
            <Heading level="h1" style={{ fontSize: "30px", fontWeight: "700", color: "#FAF9F6", letterSpacing: "-0.02em", marginTop: "6px" }}>
              Homepage Layout & Sale Studio
            </Heading>
            <Text style={{ color: "#d1d5db", marginTop: "4px", fontSize: "14px", maxWidth: "680px" }}>
              Full control over all 10 homepage sections, circular categories, zero-latency Instagram embed (@itx_shk_selfish), and direct product-level sale pricing.
            </Text>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            <Button
              variant="secondary"
              size="small"
              onClick={handleResetBlueprint}
              disabled={syncing}
              style={{ background: "#B6975A", color: "#0F2D22", fontWeight: "700", border: "none" }}
              title="Pre-populates cards for Images 1, 2, 3, 4"
            >
              <ArrowPath /> {syncing ? "Syncing..." : "Sync All Reference Cards"}
            </Button>
            <Button variant="secondary" size="small" onClick={() => setShowAddSection(true)} style={{ background: "#fff", color: "#0F2D22", fontWeight: "600" }}>
              <Plus /> Add Section
            </Button>
            <a
              href="http://localhost:8000/pk"
              target="_blank"
              rel="noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "4px",
                background: "rgba(255,255,255,0.15)",
                color: "#fff",
                fontSize: "13px",
                fontWeight: "600",
                textDecoration: "none",
                border: "1px solid rgba(255,255,255,0.25)",
              }}
            >
              View Storefront ↗
            </a>
          </div>
        </div>

        {message && (
          <div style={{ marginTop: "16px", padding: "10px 16px", background: "rgba(182, 151, 90, 0.2)", border: "1px solid #B6975A", borderRadius: "6px", color: "#FAF9F6", fontSize: "13px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
            <Check /> {message}
          </div>
        )}
      </Container>

      {/* Vertical Navigation Tabs */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "2px solid #e5e7eb", paddingBottom: "4px", overflowX: "auto" }}>
        {[
          { id: "sections", label: `1. Homepage Sections (${sections.length})`, icon: "🏛️" },
          { id: "products", label: `2. Product Pricing & Sale Engine (${catalogProducts.length})`, icon: "🏷️" },
          { id: "instagram", label: "3. Instagram Live Feed (@itx_shk_selfish)", icon: "📸" },
          { id: "categories", label: "4. Category Discounts (% Off)", icon: "🛍️" },
          { id: "social", label: "5. Footer Social Media Links", icon: "🌐" },
        ].map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 20px",
                fontSize: "14px",
                fontWeight: isActive ? "700" : "500",
                color: isActive ? "#0F2D22" : "#4b5563",
                borderBottom: isActive ? "3px solid #0F2D22" : "3px solid transparent",
                background: isActive ? "#f8fafc" : "transparent",
                borderRadius: "6px 6px 0 0",
                cursor: "pointer",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
                borderTop: "none",
                borderLeft: "none",
                borderRight: "none",
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* TAB 1: HOMEPAGE SECTIONS & CARD GRIDS */}
      {activeTab === "sections" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <Heading level="h2" style={{ fontSize: "20px", fontWeight: "700", color: "#0F2D22" }}>
                Active Homepage Structure (Vertical Layout)
              </Heading>
              <Text style={{ color: "#6b7280", fontSize: "13px", marginTop: "2px" }}>
                Reorder using arrows. Each section card has direct access to edit details and manage cards.
              </Text>
            </div>
            <Badge color="green">{sections.length} Sections Configured</Badge>
          </div>

          {loading ? (
            <Container style={{ padding: "40px", textAlign: "center" }}>
              <Text style={{ color: "#6b7280" }}>Loading sections...</Text>
            </Container>
          ) : sections.length === 0 ? (
            <Container style={{ padding: "40px", textAlign: "center" }}>
              <Text style={{ color: "#6b7280" }}>
                No sections found. Click "Sync All Reference Cards" to populate the default layout.
              </Text>
            </Container>
          ) : (
            sections.map((sec, idx) => {
              const isEditing = editingId === sec.id
              const isBanner = sec.type === "sale_banner" || sec.type === "flash_sale"
              const isBento = sec.key === "featured_categories" || sec.type === "featured_categories"
              const isCircular = sec.key === "fabric_strip" || sec.type === "fabric_strip"
              const isInsta = sec.key === "instagram_feed" || sec.type === "instagram_feed"
              const cardsCount = sec.settings?.cards?.length || 0

              return (
                <Container
                  key={sec.id}
                  style={{
                    padding: "20px 24px",
                    borderLeft: `6px solid ${
                      isBento
                        ? "#B6975A"
                        : isCircular
                        ? "#0F2D22"
                        : isBanner
                        ? "#ef4444"
                        : isInsta
                        ? "#ec4899"
                        : sec.is_active
                        ? "#10b981"
                        : "#d1d5db"
                    }`,
                    background: sec.is_active ? "#fff" : "#f9fafb",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    borderRadius: "8px",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      {/* Rank Up / Down */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                        <Button
                          variant="transparent"
                          size="small"
                          disabled={idx === 0}
                          onClick={() => moveRank(idx, "up")}
                          title="Move Up on Homepage"
                        >
                          <ArrowUpMini />
                        </Button>
                        <span style={{ fontSize: "11px", fontWeight: "700", textAlign: "center", color: "#6b7280" }}>
                          #{idx + 1}
                        </span>
                        <Button
                          variant="transparent"
                          size="small"
                          disabled={idx === sections.length - 1}
                          onClick={() => moveRank(idx, "down")}
                          title="Move Down on Homepage"
                        >
                          <ArrowDownMini />
                        </Button>
                      </div>

                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                          <Heading level="h3" style={{ fontSize: "17px", fontWeight: "700", color: "#111827" }}>
                            {sec.title}
                          </Heading>
                          <Badge color="grey">{sec.type}</Badge>
                          <Badge color={sec.is_active ? "green" : "grey"}>
                            {sec.is_active ? "Active" : "Hidden"}
                          </Badge>
                          {isBento && (
                            <Badge color="orange">
                              ⭐ Image 2 Bento Grid ({cardsCount} Cards)
                            </Badge>
                          )}
                          {isCircular && (
                            <Badge color="green">
                              ⭕ Image 1 Circular Categories ({cardsCount} Cards)
                            </Badge>
                          )}
                          {isInsta && (
                            <Badge color="purple">
                              📸 Instagram Feed ({cardsCount} Posts)
                            </Badge>
                          )}
                          {!isBento && !isCircular && !isInsta && cardsCount > 0 && (
                            <Badge color="blue">{cardsCount} Cards Attached</Badge>
                          )}
                        </div>
                        {sec.subtitle && (
                          <Text size="small" style={{ color: "#6b7280", marginTop: "4px" }}>
                            {sec.subtitle}
                          </Text>
                        )}
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      {/* Manage Cards Button for card-capable sections */}
                      {!isBanner && sec.type !== "hero_slider" && sec.type !== "features_strip" && sec.type !== "newsletter" && sec.type !== "customer_reviews" && (
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={() => openCardsStudio(sec)}
                          style={{
                            color: "#0F2D22",
                            fontWeight: "700",
                            background: isBento ? "#fef3c7" : isCircular ? "#ecfdf5" : "#f1f5f9",
                            border: `1px solid ${isBento ? "#f59e0b" : isCircular ? "#10b981" : "#cbd5e1"}`,
                          }}
                        >
                          <Sparkles /> Manage Cards ({cardsCount})
                        </Button>
                      )}

                      <Button
                        variant="secondary"
                        size="small"
                        onClick={() => toggleActive(sec)}
                      >
                        {sec.is_active ? <EyeSlash /> : <Eye />}
                        {sec.is_active ? "Hide" : "Show"}
                      </Button>

                      {!isEditing && (
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={() => startEdit(sec)}
                        >
                          <PencilSquare /> Edit Details
                        </Button>
                      )}

                      <Button
                        variant="transparent"
                        size="small"
                        onClick={() => deleteSection(sec.id)}
                        title="Delete Section"
                        style={{ color: "#ef4444" }}
                      >
                        <Trash />
                      </Button>
                    </div>
                  </div>

                  {/* Section Edit Form */}
                  {isEditing && (
                    <div style={{ marginTop: "18px", borderTop: "1px solid #e5e7eb", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div>
                          <Text size="xsmall" style={{ fontWeight: "600", marginBottom: "4px", color: "#374151" }}>Section Title / Headline</Text>
                          <Input
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          />
                        </div>
                        <div>
                          <Text size="xsmall" style={{ fontWeight: "600", marginBottom: "4px", color: "#374151" }}>Subtitle / Caption</Text>
                          <Input
                            value={formData.subtitle}
                            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                          />
                        </div>
                      </div>

                      {isBanner ? (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "14px", background: "#f8fafc", padding: "12px", borderRadius: "6px" }}>
                          <div>
                            <Text size="xsmall" style={{ fontWeight: "600", marginBottom: "4px" }}>Pill Badge</Text>
                            <Input
                              value={formData.badge}
                              onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                              placeholder="LIMITED TIME FESTIVE GALA"
                            />
                          </div>
                          <div>
                            <Text size="xsmall" style={{ fontWeight: "600", marginBottom: "4px" }}>Promo Code</Text>
                            <Input
                              value={formData.promo_code}
                              onChange={(e) => setFormData({ ...formData, promo_code: e.target.value })}
                              placeholder="LUXE20"
                            />
                          </div>
                          <div>
                            <Text size="xsmall" style={{ fontWeight: "600", marginBottom: "4px" }}>Countdown Hours</Text>
                            <Input
                              type="number"
                              value={formData.hours}
                              onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                            />
                          </div>
                          <div>
                            <Text size="xsmall" style={{ fontWeight: "600", marginBottom: "4px" }}>Countdown Mins</Text>
                            <Input
                              type="number"
                              value={formData.minutes}
                              onChange={(e) => setFormData({ ...formData, minutes: e.target.value })}
                            />
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                          <div>
                            <Text size="xsmall" style={{ fontWeight: "600", marginBottom: "4px", color: "#374151" }}>CTA Button Text</Text>
                            <Input
                              value={formData.cta_text}
                              onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                            />
                          </div>
                          <div>
                            <Text size="xsmall" style={{ fontWeight: "600", marginBottom: "4px", color: "#374151" }}>CTA Button Link</Text>
                            <Input
                              value={formData.cta_link}
                              onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                            />
                          </div>
                          <div>
                            <Text size="xsmall" style={{ fontWeight: "600", marginBottom: "4px", color: "#374151" }}>Linked Collection / Category ID</Text>
                            <Input
                              value={formData.collection_id}
                              onChange={(e) => setFormData({ ...formData, collection_id: e.target.value })}
                              placeholder="e.g. pcol_01..."
                            />
                          </div>
                        </div>
                      )}

                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" }}>
                        <Button variant="secondary" size="small" onClick={cancelEdit}>
                          <XMark /> Cancel
                        </Button>
                        <Button variant="primary" size="small" onClick={() => saveEdit(sec)} disabled={saving}>
                          <Check /> Save Changes
                        </Button>
                      </div>
                    </div>
                  )}
                </Container>
              )
            })
          )}
        </div>
      )}

      {/* TAB 2: PRODUCT PRICING & SALE ENGINE (Task 3) */}
      {activeTab === "products" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <Container style={{ padding: "24px", borderLeft: "6px solid #dc2626" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Tag style={{ color: "#dc2626" }} />
                  <Heading level="h2" style={{ fontSize: "20px", fontWeight: "700", color: "#111827" }}>
                    Product-Level Pricing & Sale Controller
                  </Heading>
                  <Badge color="red">Task 3 Master</Badge>
                </div>
                <Text style={{ color: "#6b7280", fontSize: "13px", marginTop: "4px" }}>
                  Toggle sale on/off per product ("kuch per lagao kuch per na lagao"). Enter custom sale price, strikethrough original price, and discount percentage. Changes are applied instantly to all storefront cards!
                </Text>
              </div>

              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <Button
                  variant="primary"
                  size="small"
                  onClick={handleApplyAllProductSales}
                  disabled={savingProductSales}
                  style={{ background: "#dc2626", color: "#fff", fontWeight: "700" }}
                >
                  <Check /> {savingProductSales ? "Applying..." : "Apply Live to Storefront"}
                </Button>
              </div>
            </div>

            {/* Product Search & Quick Actions */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", flexWrap: "wrap", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "320px" }}>
                <Input
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products by title or ID..."
                />
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => {
                    const updated = { ...productSaleStates }
                    filteredCatalog.forEach((p) => {
                      updated[p.id] = {
                        ...(updated[p.id] || {}),
                        on_sale: true,
                        discount_percent: 20,
                        sale_price: 2800,
                        original_price: 3500,
                      }
                    })
                    setProductSaleStates(updated)
                  }}
                >
                  Set All Visible to 20% Sale
                </Button>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => {
                    const updated = { ...productSaleStates }
                    filteredCatalog.forEach((p) => {
                      if (updated[p.id]) updated[p.id].on_sale = false
                    })
                    setProductSaleStates(updated)
                  }}
                >
                  Turn Off Sale for Visible
                </Button>
              </div>
            </div>
          </Container>

          {/* Product Cards Table / List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filteredCatalog.map((prod) => {
              const state = productSaleStates[prod.id] || { on_sale: false, discount_percent: 20 }
              const isOnSale = !!state.on_sale

              return (
                <Container
                  key={prod.id}
                  style={{
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "16px",
                    borderLeft: `5px solid ${isOnSale ? "#dc2626" : "#e5e7eb"}`,
                    background: isOnSale ? "#fff" : "#fafafa",
                  }}
                >
                  {/* Product Info */}
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", minWidth: "280px" }}>
                    <div style={{ width: "50px", height: "50px", borderRadius: "6px", overflow: "hidden", background: "#f3f4f6", flexShrink: 0 }}>
                      {prod.thumbnail ? (
                        <img src={prod.thumbnail} alt={prod.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#9ca3af" }}>
                          NAQSH
                        </div>
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: "600", fontSize: "14px", color: "#111827" }}>
                        {prod.title}
                      </div>
                      <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px" }}>
                        ID: {prod.id}
                      </div>
                    </div>
                  </div>

                  {/* Toggle On Sale ("kuch per lagao kuch per na lagao") */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <button
                      type="button"
                      onClick={() => handleToggleProductSale(prod.id)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "700",
                        cursor: "pointer",
                        border: "none",
                        transition: "all 0.2s",
                        background: isOnSale ? "#dc2626" : "#e5e7eb",
                        color: isOnSale ? "#fff" : "#374151",
                      }}
                    >
                      {isOnSale ? "🔥 On Sale" : "Regular Price"}
                    </button>
                  </div>

                  {/* Pricing Inputs */}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", opacity: isOnSale ? 1 : 0.45 }}>
                    <div>
                      <Text size="xsmall" style={{ fontWeight: "600", color: "#374151" }}>Sale Price (Rs)</Text>
                      <input
                        type="number"
                        disabled={!isOnSale}
                        value={state.sale_price ?? 2800}
                        onChange={(e) => handleUpdateProductPrice(prod.id, "sale_price", e.target.value)}
                        style={{ width: "90px", padding: "6px 8px", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "13px", fontWeight: "600" }}
                      />
                    </div>

                    <div>
                      <Text size="xsmall" style={{ fontWeight: "600", color: "#374151" }}>Original Price (Rs)</Text>
                      <input
                        type="number"
                        disabled={!isOnSale}
                        value={state.original_price ?? 3500}
                        onChange={(e) => handleUpdateProductPrice(prod.id, "original_price", e.target.value)}
                        style={{ width: "90px", padding: "6px 8px", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "13px" }}
                      />
                    </div>

                    <div>
                      <Text size="xsmall" style={{ fontWeight: "600", color: "#374151" }}>Discount %</Text>
                      <input
                        type="number"
                        disabled={!isOnSale}
                        value={state.discount_percent ?? 20}
                        onChange={(e) => handleUpdateProductPrice(prod.id, "discount_percent", e.target.value)}
                        style={{ width: "65px", padding: "6px 8px", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "13px", fontWeight: "700", textAlign: "center", color: "#dc2626" }}
                      />
                    </div>
                  </div>

                  {/* Preview Badge */}
                  <div style={{ minWidth: "120px", textAlign: "right" }}>
                    {isOnSale ? (
                      <div>
                        <span style={{ fontSize: "13px", fontWeight: "700", color: "#0F2D22" }}>
                          Rs {(state.sale_price ?? 2800).toLocaleString()}
                        </span>
                        <div style={{ fontSize: "11px", color: "#9ca3af", textDecoration: "line-through" }}>
                          Rs {(state.original_price ?? 3500).toLocaleString()}
                        </div>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: "#dc2626" }}>
                          -{state.discount_percent ?? 20}% SALE
                        </span>
                      </div>
                    ) : (
                      <span style={{ fontSize: "12px", color: "#6b7280" }}>Standard Catalog</span>
                    )}
                  </div>
                </Container>
              )
            })}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
            <Button
              variant="primary"
              size="base"
              onClick={handleApplyAllProductSales}
              disabled={savingProductSales}
              style={{ background: "#dc2626", color: "#fff", fontWeight: "700", padding: "10px 24px" }}
            >
              <Check /> {savingProductSales ? "Applying..." : "Save & Apply Live Sale Discounts"}
            </Button>
          </div>
        </div>
      )}

      {/* TAB 3: INSTAGRAM LIVE FEED (@itx_shk_selfish) */}
      {activeTab === "instagram" && (
        <Container style={{ padding: "28px", display: "flex", flexDirection: "column", gap: "20px", borderLeft: "6px solid #ec4899" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Heading level="h2" style={{ fontSize: "20px", fontWeight: "700", color: "#111827" }}>
                Instagram Live Feed & Embed Controller
              </Heading>
              <Badge color="purple">Zero-Cost Performance Embed</Badge>
            </div>
            <Text style={{ color: "#6b7280", fontSize: "13px", marginTop: "4px" }}>
              Admin has direct access to change the Instagram link. Live posts and reels embed smoothly right above the footer without affecting site speed (using optimized lazy loading).
            </Text>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
            <div>
              <Text size="xsmall" style={{ fontWeight: "700", marginBottom: "6px", color: "#374151" }}>Instagram Profile URL</Text>
              <Input
                value={instagramSettings.profile_url}
                onChange={(e) => setInstagramSettings({ ...instagramSettings, profile_url: e.target.value })}
                placeholder="https://www.instagram.com/itx_shk_selfish/"
              />
            </div>
            <div>
              <Text size="xsmall" style={{ fontWeight: "700", marginBottom: "6px", color: "#374151" }}>Instagram Handle / Username</Text>
              <Input
                value={instagramSettings.username}
                onChange={(e) => setInstagramSettings({ ...instagramSettings, username: e.target.value })}
                placeholder="@itx_shk_selfish"
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
            <div>
              <Text size="xsmall" style={{ fontWeight: "700", marginBottom: "6px", color: "#374151" }}>Section Headline</Text>
              <Input
                value={instagramSettings.title}
                onChange={(e) => setInstagramSettings({ ...instagramSettings, title: e.target.value })}
                placeholder="Live on Instagram"
              />
            </div>
            <div>
              <Text size="xsmall" style={{ fontWeight: "700", marginBottom: "6px", color: "#374151" }}>Section Subtitle</Text>
              <Input
                value={instagramSettings.subtitle}
                onChange={(e) => setInstagramSettings({ ...instagramSettings, subtitle: e.target.value })}
                placeholder="Behind the seams, bespoke bridal fittings..."
              />
            </div>
          </div>

          {/* Instagram Reels Live Cards Controller */}
          <div style={{ marginTop: "12px", borderTop: "1px solid #e5e7eb", paddingTop: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <Heading level="h3" style={{ fontSize: "16px", fontWeight: "700", color: "#111827" }}>
                  Active Instagram Reels ({instagramCards.length})
                </Heading>
                <Text style={{ fontSize: "12px", color: "#6b7280" }}>
                  Reels appear in vertical 9:16 format with silent hover video previews. When you add a new reel, it automatically goes to the 1st slot!
                </Text>
              </div>
              <Button
                variant="secondary"
                size="small"
                onClick={() => {
                  const newReel = {
                    id: `reel_${Date.now()}`,
                    title: "New NAQSH Couture Story #NAQSH #itx_shk_selfish",
                    image_url: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=85",
                    video_url: "https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-a-red-dress-wearing-jewelry-41315-large.mp4",
                    link: instagramSettings.profile_url,
                    views: "50.0K",
                    likes: "3.8k",
                  }
                  setInstagramCards([newReel, ...instagramCards])
                }}
                style={{ background: "#fdf2f8", color: "#db2777", borderColor: "#fbcfe8", fontWeight: "700" }}
              >
                <Sparkles /> + Add Latest Reel (Goes to 1st Slot)
              </Button>
            </div>

            {/* Reel Cards Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
              {instagramCards.map((card, idx) => (
                <div
                  key={card.id || idx}
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "12px",
                    background: "#f9fafb",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    position: "relative",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "11px", fontWeight: "700", background: idx === 0 ? "#fbcfe8" : "#e5e7eb", color: idx === 0 ? "#9d174d" : "#374151", padding: "2px 8px", borderRadius: "4px" }}>
                      {idx === 0 ? "★ Reel 1 (Latest)" : `Reel ${idx + 1}`}
                    </span>
                    <Button
                      variant="transparent"
                      size="small"
                      onClick={() => setInstagramCards(instagramCards.filter((_, i) => i !== idx))}
                      style={{ color: "#dc2626", padding: "2px 6px", height: "auto" }}
                      title="Remove this reel"
                    >
                      <Trash /> Delete
                    </Button>
                  </div>

                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    {card.image_url ? (
                      <img
                        src={card.image_url}
                        alt="Poster"
                        style={{ width: "50px", height: "70px", objectFit: "cover", borderRadius: "4px", border: "1px solid #d1d5db" }}
                      />
                    ) : (
                      <div style={{ width: "50px", height: "70px", background: "#e5e7eb", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px" }}>
                        No Image
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text size="xsmall" style={{ fontWeight: "700", color: "#374151" }}>Caption / Title</Text>
                      <Input
                        value={card.title || ""}
                        onChange={(e) => {
                          const updated = [...instagramCards]
                          updated[idx] = { ...updated[idx], title: e.target.value }
                          setInstagramCards(updated)
                        }}
                        placeholder="Reel caption..."
                        style={{ fontSize: "11px", marginTop: "2px" }}
                      />
                    </div>
                  </div>

                  <div>
                    <Text size="xsmall" style={{ fontWeight: "600", color: "#6b7280" }}>Poster Image URL</Text>
                    <Input
                      value={card.image_url || ""}
                      onChange={(e) => {
                        const updated = [...instagramCards]
                        updated[idx] = { ...updated[idx], image_url: e.target.value }
                        setInstagramCards(updated)
                      }}
                      placeholder="https://..."
                      style={{ fontSize: "11px" }}
                    />
                  </div>

                  <div>
                    <Text size="xsmall" style={{ fontWeight: "600", color: "#6b7280" }}>Video Preview URL (.mp4 / stream)</Text>
                    <Input
                      value={card.video_url || ""}
                      onChange={(e) => {
                        const updated = [...instagramCards]
                        updated[idx] = { ...updated[idx], video_url: e.target.value }
                        setInstagramCards(updated)
                      }}
                      placeholder="https://..."
                      style={{ fontSize: "11px" }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <div>
                      <Text size="xsmall" style={{ fontWeight: "600", color: "#6b7280" }}>Views (e.g. 54.8K)</Text>
                      <Input
                        value={card.views || "45.0K"}
                        onChange={(e) => {
                          const updated = [...instagramCards]
                          updated[idx] = { ...updated[idx], views: e.target.value }
                          setInstagramCards(updated)
                        }}
                        style={{ fontSize: "11px" }}
                      />
                    </div>
                    <div>
                      <Text size="xsmall" style={{ fontWeight: "600", color: "#6b7280" }}>Likes (e.g. 4.2k)</Text>
                      <Input
                        value={card.likes || "3.5k"}
                        onChange={(e) => {
                          const updated = [...instagramCards]
                          updated[idx] = { ...updated[idx], likes: e.target.value }
                          setInstagramCards(updated)
                        }}
                        style={{ fontSize: "11px" }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", borderTop: "1px solid #e5e7eb", paddingTop: "16px" }}>
            <Button variant="primary" size="small" onClick={handleSaveInstagram} disabled={savingInstagram} style={{ background: "#ec4899", border: "none", fontWeight: "700" }}>
              <Check /> {savingInstagram ? "Publishing..." : "Save & Publish Reels to Storefront"}
            </Button>
          </div>
        </Container>
      )}

      {/* TAB 4: CATEGORY DISCOUNTS */}
      {activeTab === "categories" && (
        <Container style={{ padding: "26px", display: "flex", flexDirection: "column", gap: "18px", borderLeft: "6px solid #f59e0b" }}>
          <div>
            <Heading level="h2" style={{ fontSize: "19px", fontWeight: "700", color: "#111827" }}>
              Category-Wide Discounts (% Off)
            </Heading>
            <Text style={{ color: "#6b7280", fontSize: "13px", marginTop: "4px" }}>
              Set flat discounts across entire collections and categories. Automatically displays red SALE badges on corresponding product cards.
            </Text>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "10px" }}>
            {Object.entries(salesConfig.category_discounts || {}).map(([cat, pct]: [string, any]) => (
              <div key={cat} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "6px" }}>
                <span style={{ fontWeight: "600", fontSize: "13px", color: "#111827" }}>{cat}</span>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <input
                    type="number"
                    value={pct}
                    onChange={(e) =>
                      setSalesConfig({
                        ...salesConfig,
                        category_discounts: {
                          ...salesConfig.category_discounts,
                          [cat]: Number(e.target.value),
                        },
                      })
                    }
                    style={{ width: "52px", padding: "4px 6px", border: "1px solid #d1d5db", borderRadius: "3px", textAlign: "center", fontWeight: "bold", fontSize: "13px" }}
                  />
                  <span style={{ fontSize: "12px", fontWeight: "bold", color: "#dc2626" }}>%</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCategoryDiscount(cat)}
                    style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", padding: "2px" }}
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Category Discount Row */}
          <div style={{ display: "flex", gap: "10px", marginTop: "12px", alignItems: "center" }}>
            <Input
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Add category (e.g. Lawn, Silk, Kurta)"
              style={{ maxWidth: "260px" }}
            />
            <Input
              type="number"
              value={newCatPercent}
              onChange={(e) => setNewCatPercent(e.target.value)}
              placeholder="%"
              style={{ width: "80px" }}
            />
            <Button variant="secondary" size="small" onClick={handleAddCategoryDiscount}>
              <Plus /> Add Category Sale
            </Button>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px", borderTop: "1px solid #f3f4f6", paddingTop: "14px" }}>
            <Button variant="primary" size="small" onClick={handleSaveSalesConfig} disabled={savingSales}>
              <Check /> Apply Category Discounts
            </Button>
          </div>
        </Container>
      )}

      {/* TAB 5: FOOTER SOCIAL LINKS */}
      {activeTab === "social" && (
        <Container style={{ padding: "26px", display: "flex", flexDirection: "column", gap: "16px", border: "1px solid #e5e7eb" }}>
          <div>
            <Heading level="h2" style={{ fontSize: "18px", fontWeight: "700" }}>
              Footer Social Media Links (Circular Icons)
            </Heading>
            <Text style={{ color: "#6b7280", fontSize: "13px", marginTop: "2px" }}>
              Destination URLs for circular social buttons in the footer: Facebook, Instagram, TikTok, and Pinterest.
            </Text>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <Text size="xsmall" style={{ fontWeight: "600", marginBottom: "4px", color: "#374151" }}>Facebook URL</Text>
              <Input
                value={socialLinks.facebook}
                onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                placeholder="https://facebook.com/..."
              />
            </div>
            <div>
              <Text size="xsmall" style={{ fontWeight: "600", marginBottom: "4px", color: "#374151" }}>Instagram URL</Text>
              <Input
                value={socialLinks.instagram}
                onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                placeholder="https://instagram.com/..."
              />
            </div>
            <div>
              <Text size="xsmall" style={{ fontWeight: "600", marginBottom: "4px", color: "#374151" }}>TikTok URL</Text>
              <Input
                value={socialLinks.tiktok}
                onChange={(e) => setSocialLinks({ ...socialLinks, tiktok: e.target.value })}
                placeholder="https://tiktok.com/@..."
              />
            </div>
            <div>
              <Text size="xsmall" style={{ fontWeight: "600", marginBottom: "4px", color: "#374151" }}>Pinterest URL</Text>
              <Input
                value={socialLinks.pinterest}
                onChange={(e) => setSocialLinks({ ...socialLinks, pinterest: e.target.value })}
                placeholder="https://pinterest.com/..."
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
            <Button variant="primary" size="small" onClick={saveSocialLinks} disabled={savingSocial}>
              <Check /> Save Social Links
            </Button>
          </div>
        </Container>
      )}

      {/* MODAL: CARD STUDIO (Add, Edit, Delete Cards with Auto-Flow) */}
      {activeCardSection && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 110, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <Container style={{ width: "100%", maxWidth: "940px", maxHeight: "92vh", overflowY: "auto", padding: "24px", borderRadius: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e5e7eb", paddingBottom: "14px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Heading level="h2" style={{ fontSize: "20px", fontWeight: "700", color: "#0F2D22" }}>
                    Card Studio: {activeCardSection.title}
                  </Heading>
                  <Badge color="blue">{activeCardSection.type}</Badge>
                </div>
                <Text size="small" style={{ color: "#6b7280", marginTop: "2px" }}>
                  {activeCardSection.type === "fabric_strip"
                    ? "Circular categories runway: Add, edit, or delete categories. All items smoothly auto-scroll on the homepage."
                    : activeCardSection.type === "featured_categories"
                    ? "Bento grid (Image 2): First 7 cards auto-align to the tall box + 3 double columns. Additional cards flow into a clean grid."
                    : "Product cards grid (Image 3 & 4): Customize images, pricing, discounts, and destinations."}
                </Text>
              </div>
              <Button variant="transparent" size="small" onClick={() => setActiveCardSection(null)}>
                <XMark />
              </Button>
            </div>

            {/* Current Cards Grid Preview */}
            <div style={{ marginTop: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <Text style={{ fontWeight: "700", fontSize: "14px" }}>
                  Attached Cards ({activeCardSection.cards?.length || 0})
                </Text>
              </div>

              {activeCardSection.cards?.length === 0 ? (
                <div style={{ padding: "24px", textAlign: "center", border: "1px dashed #d1d5db", borderRadius: "6px", color: "#6b7280" }}>
                  No cards attached yet. Use "+ Add Card to List" below to create cards.
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: "12px", marginBottom: "20px" }}>
                  {activeCardSection.cards.map((card: any, cIdx: number) => {
                    const isCircleType = activeCardSection.type === "fabric_strip"

                    return (
                      <div
                        key={cIdx}
                        style={{
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          overflow: "hidden",
                          background: "#fff",
                          display: "flex",
                          flexDirection: "column",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                        }}
                      >
                        <div style={{ position: "relative", height: "130px", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {card.image_url ? (
                            isCircleType ? (
                              <img
                                src={card.image_url}
                                alt={card.title}
                                style={{ width: "95px", height: "95px", borderRadius: "50%", objectFit: "cover", border: "2px solid #B6975A" }}
                              />
                            ) : (
                              <img src={card.image_url} alt={card.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            )
                          ) : (
                            <div style={{ color: "#9ca3af", fontSize: "12px" }}>No Image</div>
                          )}
                          {card.badge && (
                            <span style={{ position: "absolute", top: "6px", left: "6px", background: "#991b1b", color: "#fff", fontSize: "9px", fontWeight: "bold", padding: "2px 6px", borderRadius: "2px" }}>
                              {card.badge}
                            </span>
                          )}
                        </div>

                        <div style={{ padding: "10px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                          <div>
                            {card.subtitle && <Text size="xsmall" style={{ color: "#6b7280" }}>{card.subtitle}</Text>}
                            <Text style={{ fontWeight: "700", fontSize: "13px", marginTop: "2px", color: "#111827" }}>{card.title}</Text>
                            {card.price && (
                              <div style={{ display: "flex", gap: "6px", alignItems: "baseline", marginTop: "4px" }}>
                                <span style={{ fontWeight: "700", fontSize: "12px", color: "#0F2D22" }}>Rs. {Number(card.price).toLocaleString()}</span>
                                {card.original_price && (
                                  <span style={{ textDecoration: "line-through", fontSize: "10px", color: "#9ca3af" }}>Rs. {Number(card.original_price).toLocaleString()}</span>
                                )}
                              </div>
                            )}
                          </div>
                          <div style={{ display: "flex", gap: "6px", marginTop: "10px" }}>
                            <Button
                              variant="secondary"
                              size="small"
                              onClick={() => {
                                setEditingCardIndex(cIdx)
                                setCardFormData(card)
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="transparent"
                              size="small"
                              onClick={() => handleDeleteCard(cIdx)}
                              style={{ color: "#ef4444" }}
                            >
                              <Trash />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Add / Edit Card Form */}
            <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "16px", background: "#f8fafc", padding: "18px", borderRadius: "8px" }}>
              <Heading level="h3" style={{ fontSize: "15px", fontWeight: "700", marginBottom: "12px", color: "#0F2D22" }}>
                {editingCardIndex !== null ? `Edit Card #${editingCardIndex + 1}` : "+ Add Card to this Section"}
              </Heading>

              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "12px" }}>
                <div>
                  <Text size="xsmall" style={{ fontWeight: "600", marginBottom: "4px" }}>Card Title</Text>
                  <Input
                    value={cardFormData.title}
                    onChange={(e) => setCardFormData({ ...cardFormData, title: e.target.value })}
                    placeholder="e.g. 3-Piece Luxury Lawn or Royal Crimson"
                  />
                </div>
                <div>
                  <Text size="xsmall" style={{ fontWeight: "600", marginBottom: "4px" }}>Category / Subtitle</Text>
                  <Input
                    value={cardFormData.subtitle}
                    onChange={(e) => setCardFormData({ ...cardFormData, subtitle: e.target.value })}
                    placeholder="e.g. Embroidered Voile & Chiffon"
                  />
                </div>
              </div>

              <div style={{ marginTop: "10px" }}>
                <Text size="xsmall" style={{ fontWeight: "600", marginBottom: "4px" }}>Image URL</Text>
                <Input
                  value={cardFormData.image_url}
                  onChange={(e) => setCardFormData({ ...cardFormData, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/... or /images/..."
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "10px", marginTop: "10px" }}>
                <div>
                  <Text size="xsmall" style={{ fontWeight: "600", marginBottom: "4px" }}>Sale Price (Rs)</Text>
                  <Input
                    type="number"
                    value={cardFormData.price}
                    onChange={(e) => setCardFormData({ ...cardFormData, price: e.target.value })}
                  />
                </div>
                <div>
                  <Text size="xsmall" style={{ fontWeight: "600", marginBottom: "4px" }}>Original Price (Rs)</Text>
                  <Input
                    type="number"
                    value={cardFormData.original_price}
                    onChange={(e) => setCardFormData({ ...cardFormData, original_price: e.target.value })}
                  />
                </div>
                <div>
                  <Text size="xsmall" style={{ fontWeight: "600", marginBottom: "4px" }}>Discount %</Text>
                  <Input
                    type="number"
                    value={cardFormData.discount_percent}
                    onChange={(e) => setCardFormData({ ...cardFormData, discount_percent: e.target.value })}
                  />
                </div>
                <div>
                  <Text size="xsmall" style={{ fontWeight: "600", marginBottom: "4px" }}>Badge Text</Text>
                  <Input
                    value={cardFormData.badge}
                    onChange={(e) => setCardFormData({ ...cardFormData, badge: e.target.value })}
                    placeholder="TRENDING / SALE"
                  />
                </div>
              </div>

              <div style={{ marginTop: "10px" }}>
                <Text size="xsmall" style={{ fontWeight: "600", marginBottom: "4px" }}>Destination Link</Text>
                <Input
                  value={cardFormData.link}
                  onChange={(e) => setCardFormData({ ...cardFormData, link: e.target.value })}
                  placeholder="/store?category=..."
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "14px" }}>
                {editingCardIndex !== null && (
                  <Button variant="secondary" size="small" onClick={() => setEditingCardIndex(null)}>
                    Cancel Edit
                  </Button>
                )}
                <Button variant="primary" size="small" onClick={handleSaveCard}>
                  {editingCardIndex !== null ? "Update Card in List" : "+ Add Card to List"}
                </Button>
              </div>
            </div>

            {/* Bottom Actions */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", borderTop: "1px solid #e5e7eb", paddingTop: "14px" }}>
              <Text size="small" style={{ color: "#6b7280" }}>
                Saves directly to database and updates storefront layout immediately.
              </Text>
              <div style={{ display: "flex", gap: "8px" }}>
                <Button variant="secondary" size="small" onClick={() => setActiveCardSection(null)}>
                  Close
                </Button>
                <Button variant="primary" size="small" onClick={handlePersistCards} disabled={savingCards}>
                  <Check /> Save & Publish Cards to Live Homepage
                </Button>
              </div>
            </div>
          </Container>
        </div>
      )}

      {/* MODAL: ADD NEW SECTION */}
      {showAddSection && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <Container style={{ width: "100%", maxWidth: "600px", padding: "24px", borderRadius: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <Heading level="h2" style={{ fontSize: "19px", fontWeight: "700", color: "#0F2D22" }}>
                Add New Section to Homepage
              </Heading>
              <Button variant="transparent" size="small" onClick={() => setShowAddSection(false)}>
                <XMark />
              </Button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <Text size="xsmall" style={{ fontWeight: "600", marginBottom: "4px" }}>Section Type</Text>
                <select
                  value={newSecData.type}
                  onChange={(e) => setNewSecData({ ...newSecData, type: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "4px", fontSize: "14px" }}
                >
                  <option value="cards_grid">🛍️ Dynamic Cards Grid Section</option>
                  <option value="sale_banner">🎉 Festive Gala Flash Sale Banner (with countdown)</option>
                  <option value="promo_banner">🖼️ Seasonal Spotlight Banner</option>
                </select>
              </div>

              <div>
                <Text size="xsmall" style={{ fontWeight: "600", marginBottom: "4px" }}>Headline / Title</Text>
                <Input
                  value={newSecData.title}
                  onChange={(e) => setNewSecData({ ...newSecData, title: e.target.value })}
                  placeholder="e.g. New Seasonal Arrivals"
                />
              </div>

              <div>
                <Text size="xsmall" style={{ fontWeight: "600", marginBottom: "4px" }}>Subtitle</Text>
                <Input
                  value={newSecData.subtitle}
                  onChange={(e) => setNewSecData({ ...newSecData, subtitle: e.target.value })}
                  placeholder="e.g. Handcrafted designs..."
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}>
                <Button variant="secondary" size="small" onClick={() => setShowAddSection(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="small" onClick={handleCreateSection}>
                  <Check /> Add Section
                </Button>
              </div>
            </div>
          </Container>
        </div>
      )}
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Homepage Editor",
  icon: SquaresPlus,
})

export default HomepageAdminPage
