const { Modules } = require("@medusajs/framework/utils")

module.exports.default = async function activateCategories({ container }) {
  const productService = container.resolve(Modules.PRODUCT)
  const categories = await productService.listProductCategories({
    handle: ["women-stitched", "women-unstitched", "men-stitched", "men-unstitched", "children"],
  })
  for (const category of categories) {
    await productService.updateProductCategories(category.id, { is_active: true })
  }
}
