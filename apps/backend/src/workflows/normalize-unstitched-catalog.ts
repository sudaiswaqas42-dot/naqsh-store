import { createStep, createWorkflow, StepResponse, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import { nonFabricProduct, productDepartment, unstitchedProductTitle } from "../utils/unstitched-catalog"

const normalizeUnstitchedStep = createStep("normalize-unstitched", async (input: { ids?: string[] }, { container }) => {
  const service = container.resolve(Modules.PRODUCT)
  const categories = await service.listProductCategories({}, { take: 300 })
  if (!input.ids) {
    for (const category of categories) {
      if (!/unstitched/i.test(category.name)) {
        await service.updateProductCategories(category.id, { name: `${category.name} Unstitched`, description: "Explore unstitched fabric cuts and collections." })
      }
    }
  }
  const category = (handle: string) => categories.find(item => item.handle === handle)
  let unstitched = category("unstitched")
  if (!unstitched) unstitched = await service.createProductCategories({ name: "Unstitched Fabric", handle: "unstitched", is_active: true, is_internal: false })
  const types = await service.listProductTypes({ value: "Unstitched Fabric" })
  const type = types[0] || await service.createProductTypes({ value: "Unstitched Fabric" })
  let skip = 0
  let updated = 0
  let drafted = 0
  while (true) {
    const products = await service.listProducts(input.ids ? { id: input.ids } : {}, { take: 100, skip, order: { id: "ASC" }, relations: ["categories"] })
    for (const product of products) {
      if (nonFabricProduct(product.title)) {
        if (product.status !== "draft") {
          await service.updateProducts(product.id, { status: "draft", metadata: { ...product.metadata, catalog_exclusion: "Non-fabric item in an unstitched-only store" } })
          drafted++
        }
        continue
      }
      const gender = productDepartment(product)
      const title = unstitchedProductTitle(product.title)
      const handles = ["unstitched", gender, gender === "men" ? "men-unstitched" : gender === "women" ? "women-unstitched" : "", gender === "boys" ? "boys-unstitched" : gender === "girls" ? "girls-unstitched" : ""]
      const ids = Array.from(new Set([unstitched.id, ...(product.categories || []).map(item => item.id), ...handles.map(handle => category(handle)?.id).filter((id): id is string => !!id)]))
      if (title === product.title && product.type_id === type.id && product.metadata?.fabric_type === "Unstitched" && ids.length === product.categories?.length && (!gender || product.metadata?.gender === gender)) continue
      await service.updateProducts(product.id, {
        title,
        type_id: type.id,
        category_ids: ids,
        metadata: { ...product.metadata, fabric_type: "Unstitched", stitching: "Unstitched", ...(gender ? { gender } : {}), original_catalog_title: product.metadata?.original_catalog_title || product.title },
        ...(!/unstitched/i.test(product.description || "") ? { description: `${product.description || title}\n\nSupplied as unstitched fabric. Product images show styling inspiration; stitching is not included.` } : {}),
      })
      updated++
    }
    if (products.length < 100) break
    skip += products.length
  }
  return new StepResponse({ updated, drafted })
})

export const normalizeUnstitchedCatalogWorkflow = createWorkflow("normalize-unstitched-catalog", (input: { ids?: string[] }) => new WorkflowResponse(normalizeUnstitchedStep(input)))
