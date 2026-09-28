const { Client } = require("pg")

async function inspect() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  })
  await client.connect()

  // 1. Original variants
  const origVar = await client.query(
    `SELECT pv.id as variant_id, pv.title, pv.sku, p.title as prod_title
     FROM product_variant pv
     JOIN product p ON p.id = pv.product_id
     WHERE pv.id NOT LIKE 'variant_01M3muky%'
     LIMIT 3`
  )
  console.log("Original variants:", origVar.rows)

  if (origVar.rows.length > 0) {
    const origLinks = await client.query(
      `SELECT * FROM product_variant_price_set WHERE variant_id = $1`,
      [origVar.rows[0].variant_id]
    )
    console.log("Original variant price set links:", origLinks.rows)

    if (origLinks.rows.length > 0) {
      const prices = await client.query(
        `SELECT id, currency_code, amount, price_set_id FROM price WHERE price_set_id = $1`,
        [origLinks.rows[0].price_set_id]
      )
      console.log("Prices for original price_set:", prices.rows)
    }
  }

  // 2. Check my seeded variant from screenshot 5
  const myLinks = await client.query(
    `SELECT * FROM product_variant_price_set WHERE variant_id = 'variant_01M3mukyqte5b8d6f22715'`
  )
  console.log("My variant price set links:", myLinks.rows)

  if (myLinks.rows.length > 0) {
    const myPrices = await client.query(
      `SELECT id, currency_code, amount, price_set_id FROM price WHERE price_set_id = $1`,
      [myLinks.rows[0].price_set_id]
    )
    console.log("Prices for my variant:", myPrices.rows)
  }

  // 3. Regions in Medusa
  const regions = await client.query("SELECT id, name, currency_code FROM region")
  console.log("Regions in DB:", regions.rows)

  // 4. Region countries
  const countries = await client.query("SELECT id, iso_2, region_id FROM region_country")
  console.log("Countries in DB:", countries.rows)

  await client.end()
}

inspect().catch(console.error)
