import { nonFabricProduct, productDepartment, unstitchedProductTitle } from "../unstitched-catalog"

it("does not confuse women's products with men's products", () => {
  expect(productDepartment({ title: "Women silk", categories: [] })).toBe("women")
  expect(productDepartment({ title: "Pure Boski", categories: [] })).toBe("men")
  expect(productDepartment({ title: "Girls Chiffon", categories: [] })).toBe("girls")
})

it("normalizes fabric titles without duplicating Unstitched", () => {
  expect(unstitchedProductTitle("Stitched Lawn")).toBe("Unstitched Lawn")
  expect(unstitchedProductTitle("Silk Unstitched")).toBe("Silk Unstitched")
  expect(unstitchedProductTitle("Silk")).toBe("Silk — Unstitched Fabric")
})

it("identifies non-fabric accessories rather than relabeling jewellery as fabric", () => {
  expect(nonFabricProduct("Traditional Kundan Jhumka")).toBe(true)
  expect(nonFabricProduct("Embroidered Lawn")).toBe(false)
})
