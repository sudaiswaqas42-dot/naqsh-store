import { createProductsWorkflow, updateProductsWorkflow } from "@medusajs/medusa/core-flows"
import { normalizeUnstitchedCatalogWorkflow } from "../normalize-unstitched-catalog"

createProductsWorkflow.hooks.productsCreated(async ({ products }, { container }) => {
  await normalizeUnstitchedCatalogWorkflow(container).run({ input: { ids: products.map(product => product.id) } })
})

updateProductsWorkflow.hooks.productsUpdated(async ({ products }, { container }) => {
  await normalizeUnstitchedCatalogWorkflow(container).run({ input: { ids: products.map(product => product.id) } })
})
