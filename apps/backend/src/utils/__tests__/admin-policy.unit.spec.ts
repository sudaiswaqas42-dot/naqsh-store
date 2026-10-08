import fs from "node:fs"
import path from "node:path"
import ts from "typescript"
import { customizeDashboard } from "../../admin-policy"

describe("admin order edit policy", () => {
  const directory = path.join(path.dirname(require.resolve("@medusajs/dashboard/package.json")), "dist")
  it("removes Add items from the installed compiled order edit screen", () => {
    const file = path.join(directory, fs.readdirSync(directory).find(name => /^order-create-edit-.*\.mjs$/.test(name))!)
    const source = fs.readFileSync(file, "utf8")
    expect(source).toContain('t("actions.addItems")')
    const result = customizeDashboard(source, file)
    expect(result?.code).not.toContain('t("actions.addItems")')
    expect(result?.code).toContain("OrderEditItem")
    const parsed = ts.transpileModule(result!.code, { reportDiagnostics: true, compilerOptions: { target: ts.ScriptTarget.ES2021 } })
    expect(parsed.diagnostics?.filter(diagnostic => diagnostic.category === ts.DiagnosticCategory.Error)).toEqual([])
  })

  it("does not remove item selection from returns or exchanges", () => {
    const source = 'jsx(StackedFocusModal.Trigger, { children: t("actions.addItems") })'
    expect(customizeDashboard(source, directory + "/order-create-exchange-test.mjs")).toBeUndefined()
  })
})
