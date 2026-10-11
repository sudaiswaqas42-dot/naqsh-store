import ts from "typescript"

// Medusa distributes the dashboard as compiled chunks. Transform only the
// order-edit trigger, leaving returns/exchanges and product management intact.
export function customizeDashboard(source: string, id: string): { code: string; map: null } | undefined {
  const file = id.replace(/\\/g, "/")
  if (!file.includes("@medusajs/dashboard/")) return undefined
  let code = source
  code = code.replace(/(\w+\.accessor)\("display_id",\s*\{/g, '$1((order) => Number(order.display_id) >= 1310 ? order.display_id : order.custom_display_id || order.display_id, { id: "display_id",')
  if (/order-create-edit-[^/]+\.mjs$/.test(file)) {
    const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS)
    const edits: { start: number; end: number }[] = []
    const visit = (node: ts.Node) => {
      if (ts.isCallExpression(node) && node.arguments[0]?.getText(tree) === "StackedFocusModal.Trigger" && node.getText(tree).includes('"actions.addItems"')) {
        edits.push({ start: node.getStart(tree), end: node.getEnd() })
        return
      }
      ts.forEachChild(node, visit)
    }
    visit(tree)
    for (const edit of edits.sort((a, b) => b.start - a.start)) code = code.slice(0, edit.start) + "null" + code.slice(edit.end)
    return { code, map: null }
  }
  return code === source ? undefined : { code, map: null }
}
