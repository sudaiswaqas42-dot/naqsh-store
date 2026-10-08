import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ChatBubble } from "@medusajs/icons"
import { Button, Container, Heading, Text, Textarea } from "@medusajs/ui"
import { useEffect, useState } from "react"

type Message = { id: string; name: string; email: string; phone?: string; subject: string; message: string; status: string; admin_notes?: string }
const CustomerCarePage = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [count, setCount] = useState(0)
  const [subscribers, setSubscribers] = useState(0)
  const [offset, setOffset] = useState(0)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState<string | null>(null)
  const load = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/admin/customer-care?offset=" + offset)
      if (!response.ok) throw new Error("Unable to load customer messages")
      const data = await response.json()
      setMessages(data.messages)
      setCount(data.count)
      setSubscribers(data.subscribers)
    } catch (error) { setError((error as Error).message) } finally { setLoading(false) }
  }
  useEffect(() => { void load() }, [offset])
  const save = async (message: Message) => {
    setSaving(message.id)
    setError("")
    try {
      const response = await fetch("/admin/customer-care/" + message.id, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: message.status, admin_notes: message.admin_notes || "" }) })
      if (!response.ok) throw new Error("Unable to save customer message")
      await load()
    } catch (error) { setError((error as Error).message) } finally { setSaving(null) }
  }
  return <Container className="space-y-6">
    <div className="flex justify-between"><div><Heading level="h1">Customer Care</Heading><Text>{count} messages / {subscribers} newsletter subscribers</Text></div><Button onClick={load} disabled={loading}>Refresh</Button></div>
    {error && <Text role="alert" className="text-red-600">{error}</Text>}
    {loading ? <Text>Loading messages...</Text> : messages.length === 0 ? <Text>No customer messages yet.</Text> : messages.map(message => <div key={message.id} className="border rounded-lg p-5 space-y-3">
      <Heading level="h2">{message.subject}</Heading>
      <Text>{message.name} / {message.email} / {message.phone}</Text>
      <Text className="whitespace-pre-wrap">{message.message}</Text>
      <label className="block">Status <select aria-label="Message status" className="border border-[var(--border-base)] bg-[var(--bg-base)] text-[var(--fg-base)] p-2 rounded" value={message.status} onChange={e => setMessages(list => list.map(item => item.id === message.id ? { ...item, status: e.target.value } : item))}><option value="open">Open</option><option value="in_progress">In progress</option><option value="resolved">Resolved</option></select></label>
      <Textarea aria-label="Internal notes" placeholder="Internal notes" value={message.admin_notes || ""} onChange={e => setMessages(list => list.map(item => item.id === message.id ? { ...item, admin_notes: e.target.value } : item))} />
      <Button disabled={saving === message.id} onClick={() => save(message)}>{saving === message.id ? "Saving..." : "Save"}</Button>
    </div>)}
    <div className="flex gap-3"><Button disabled={offset === 0 || loading} onClick={() => setOffset(Math.max(0, offset - 20))}>Previous</Button><Button disabled={offset + 20 >= count || loading} onClick={() => setOffset(offset + 20)}>Next</Button></div>
  </Container>
}
export const config = defineRouteConfig({ label: "Customer Care", icon: ChatBubble })

export default CustomerCarePage
