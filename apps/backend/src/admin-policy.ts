import ts from "typescript"

// Medusa distributes the dashboard as compiled chunks. Transform only the
// order-edit trigger, leaving returns/exchanges and product management intact.
export function customizeDashboard(source: string, id: string): { code: string; map: null } | undefined {
  const file = id.replace(/\\/g, "/")
  if (!file.includes("dashboard") && !file.includes("@medusajs")) return undefined
  let code = source
  code = code.replace(/(\w+\.accessor)\("display_id",\s*\{/g, '$1((order) => order.custom_display_id || order.display_id, { id: "display_id",')
  
  // Increase file upload limit from 1MB to 50MB
  code = code.replace(/__MAX_UPLOAD_FILE_SIZE__/g, "52428800")
  code = code.replace(/1048576/g, "52428800")
  code = code.replace(/1024\s*\*\s*1024/g, "52428800")

  // Ensure SINGLE PKR pricing field (eliminate duplicate Price <Region> column)
  code = code.replace(/\.\.\.regions\?\.map\(/g, "...[]?.map(")
  code = code.replace(/\.\.\.regions\.map\(/g, "...[]?.map(")

  // Enable dynamic option values creation (allow typing any custom color/option)
  if (file.includes("product-create-details-variant-section") || file.includes("product-options-manage")) {
    code = code.replace(
      /\/\/\s*onCreateOption=\{async\s*\(values\)\s*=>\s*\{[\s\S]*?\/\/\s*\}\}/g,
      `onCreateOption={async (values) => { const newValueName = values[values.length - 1]?.trim(); if (newValueName && opt.id) { const currentValueIds = opt.value_ids || []; handleValueChange(opt.id, [...currentValueIds, newValueName]); } }}`
    )
  }

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
