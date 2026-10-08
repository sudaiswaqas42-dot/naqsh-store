import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

export default async function inspectCatalog({ container }: ExecArgs) {
  const service = container.resolve(Modules.PRODUCT)
  const products = await service.listProducts({}, { take: 1000, relations: ["categories"], select: ["id", "title", "material", "metadata"] })
  const categories = await service.listProductCategories({}, { take: 200, select: ["id", "name", "handle", "parent_category_id"] })
  console.log(JSON.stringify({ count: products.length, categories, sample: products.slice(0, 14).map(product => ({ id: product.id, title: product.title, material: product.material, brand: product.metadata?.brand, gender: product.metadata?.gender, fabric_type: product.metadata?.fabric_type, categories: product.categories?.map(category => category.handle) })) }))
  console.log("Order number module registered:", container.hasRegistration("orderNumber"))
}
