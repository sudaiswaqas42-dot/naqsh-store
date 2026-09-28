async function verify() {
  const res = await fetch("http://localhost:8000/pk/categories/women-stitched")
  const html = await res.text()
  
  const hasSvgImages = html.includes("/images/products/women_stitched_")
  console.log("Verified: Has women_stitched SVG thumbnails in page HTML?", hasSvgImages)

  const productTitles = [
    "Noor-e-Jahan",
    "Gul-e-Daudi",
    "Zeenat",
    "Shehnai",
    "Mah-e-Nau"
  ]
  const foundTitles = productTitles.filter(t => html.includes(t))
  console.log("Verified seeded products appearing on page:", foundTitles)
}

verify().catch(console.error)
