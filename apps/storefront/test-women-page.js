async function test() {
  const menRes = await fetch("http://localhost:8000/pk/categories/men")
  const menHtml = await menRes.text()
  
  const menMatches = menHtml.match(/href="\/pk\/products\/[^"]+"/g) || []
  console.log("Total product card links on /pk/categories/men:", menMatches.length)
  console.log("Has Men CategoryShowcaseGrid (Stitched Eastern):", menHtml.includes("Shop Stitched Eastern"))
  console.log("Has Men CategoryShowcaseGrid (Unstitched Fabric):", menHtml.includes("Shop Unstitched Fabric"))

  const saleRes = await fetch("http://localhost:8000/pk/categories/sale")
  const saleHtml = await saleRes.text()
  const saleMatches = saleHtml.match(/href="\/pk\/products\/[^"]+"/g) || []
  console.log("Total product card links on /pk/categories/sale:", saleMatches.length)
  console.log("Sale page title:", saleHtml.includes("End of Season Sale"))
}

test().catch(console.error)
