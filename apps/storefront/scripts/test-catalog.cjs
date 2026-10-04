const assert = require("node:assert/strict")
const fs = require("node:fs")
const path = require("node:path")
const vm = require("node:vm")
const ts = require("typescript")

function load(relative, dependencies, globals = {}) {
  const filename = path.join(__dirname, "..", relative)
  const output = ts.transpileModule(fs.readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText
  const exports = {}
  vm.runInNewContext(output, { exports, require: name => {
    if (!(name in dependencies)) throw new Error(`Unexpected dependency: ${name}`)
    return dependencies[name]
  }, process: { env: {} }, URLSearchParams, AbortSignal, console, ...globals }, { filename })
  return exports
}

const util = load("src/lib/util/catalog.ts", {})
const makeProduct = (index, size = "M", color = "Black", amount = 1000) => ({
  id: `prod_${index}`, title: `Product ${index}`, handle: `product-${index}`, created_at: new Date(2026, 0, index + 1).toISOString(), material: "Lawn",
  options: [{ id: "size", title: "Size" }, { id: "color", title: "Color" }],
  variants: [{ id: `variant_${index}`, manage_inventory: true, inventory_quantity: 10, options: [{ option_id: "size", value: size }, { option_id: "color", value: color }], calculated_price: { calculated_amount: amount, original_amount: amount + 200, currency_code: "pkr" } }],
})

async function main() {
  const split = makeProduct(1)
  split.variants.push({ ...split.variants[0], id: "second", options: [{ option_id: "size", value: "L" }, { option_id: "color", value: "White" }] })
  assert.equal(util.matchesVariantFilters(split, ["M"], ["White"], true), false, "size and colour must match the same variant")
  assert.equal(util.matchesVariantFilters(split, ["L"], ["White"], true), true)
  const inventory = Array.from({ length: 105 }, (_, index) => makeProduct(index, index >= 100 ? "L" : "M", "Black", index + 1))
  let calls = 0
  const catalog = load("src/lib/data/catalog.ts", { "server-only": {}, "./categories": { listCategories: async () => [{ id: "cat_parent", handle: "women" }, { id: "cat_child", handle: "pret", parent_category_id: "cat_parent" }] }, "./regions": { getRegion: async () => ({ id: "region" }) }, "@lib/util/catalog": util }, {
    fetch: async url => {
      calls++
      const params = new URL(url).searchParams
      if (url.includes("catalog-rankings")) return { ok: true, json: async () => ({ rankings: { prod_3: { sold: 900, recent: 900 } } }) }
      const offset = Number(params.get("offset"))
      return { ok: true, json: async () => ({ products: inventory.slice(offset, offset + 100), count: inventory.length }) }
    },
  })
  const outsideScope = await catalog.getCatalog("pk", { category: "women" }, { categoryIds: ["cat_men"] })
  assert.equal(outsideScope.count, 0, "category filters must respect the current category scope")
  const filtered = await catalog.getCatalog("pk", { size: "L", color: "Black", min: "102", sortBy: "price-desc", stock: "1" })
  assert.equal(filtered.count, 4, "filters must include products beyond the first backend page")
  assert.equal(filtered.products[0].id, "prod_104")
  assert.equal(calls, 2)
  const secondPage = await catalog.getCatalog("pk", { page: "2", sortBy: "price-asc" })
  assert.equal(secondPage.count, 105)
  assert.equal(secondPage.products[0].id, "prod_12", "paginate after globally sorting prices")
  const ranked = await catalog.getCatalog("pk", { sortBy: "best-selling" })
  assert.equal(ranked.products[0].id, "prod_3")
  inventory.forEach(product => product.variants[0].calculated_price.original_amount = product.variants[0].calculated_price.calculated_amount)
  const sale = await catalog.getCatalog("pk", {}, { isSalePage: true })
  assert.equal(sale.count, 0, "never estimate the sale count or return full-price products")
  console.log("Catalog regression checks passed: same-variant filters, full-catalog filtering, price order, pagination, rankings, sale counts")
}
main().catch(error => { console.error(error); process.exitCode = 1 })
