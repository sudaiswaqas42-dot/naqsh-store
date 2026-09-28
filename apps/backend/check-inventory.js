const { Client } = require("pg")

async function checkInv() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  })
  await client.connect()

  // Check prices for original variants
  const origPrices = await client.query(`
    SELECT p.currency_code, p.amount, pvps.variant_id
    FROM price p
    JOIN product_variant_price_set pvps ON pvps.price_set_id = p.price_set_id
    WHERE pvps.variant_id NOT LIKE 'variant_01M3muky%'
    LIMIT 10
  `)
  console.log("Original variant prices (currencies):")
  console.table(origPrices.rows)

  // Check inventory linking
  const invLinks = await client.query(`
    SELECT * FROM product_variant_inventory_item LIMIT 5
  `)
  console.log("Variant inventory links:", invLinks.rows)

  // Check inventory levels
  const invLevels = await client.query(`
    SELECT * FROM inventory_level LIMIT 5
  `)
  console.log("Inventory levels:", invLevels.rows)

  // Stock locations
  const locations = await client.query(`
    SELECT * FROM stock_location LIMIT 5
  `)
  console.log("Stock locations:", locations.rows)

  await client.end()
}

checkInv().catch(console.error)
