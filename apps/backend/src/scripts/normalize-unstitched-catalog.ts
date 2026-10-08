import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, MedusaError, Modules } from "@medusajs/framework/utils"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import { normalizeUnstitchedCatalogWorkflow } from "../workflows/normalize-unstitched-catalog"

export default async function normalizeCatalog({ container }: ExecArgs) {
  const host = new URL(process.env.DATABASE_URL || "postgres://localhost").hostname
  if (!["localhost", "127.0.0.1", "::1", "[::1]"].includes(host)) throw new MedusaError(MedusaError.Types.NOT_ALLOWED, "This script is restricted to the local database.")
  const service = container.resolve(Modules.PRODUCT)
  const snapshot: unknown[] = []
  let skip = 0
  while (true) {
    const products = await service.listProducts({}, { take: 200, skip, order: { id: "ASC" }, relations: ["categories"] })
    snapshot.push(...products.map(product => ({ id: product.id, title: product.title, description: product.description, status: product.status, type_id: product.type_id, metadata: product.metadata, category_ids: product.categories?.map(category => category.id) })))
    if (products.length < 200) break
    skip += products.length
  }
  const backupDirectory = path.resolve(process.cwd(), "../../tmp/catalog-backups")
  await mkdir(backupDirectory, { recursive: true })
  await writeFile(path.join(backupDirectory, `before-unstitched-${Date.now()}.json`), JSON.stringify({ products: snapshot, categories: await service.listProductCategories({}, { take: 300 }) }, null, 2))
  const { result } = await normalizeUnstitchedCatalogWorkflow(container).run({ input: {} })
  container.resolve(ContainerRegistrationKeys.LOGGER).info(`Unstitched catalog: ${result.updated} products updated, ${result.drafted} non-fabric accessories moved to draft.`)
}
