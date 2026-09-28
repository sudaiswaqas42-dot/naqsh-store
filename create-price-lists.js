const { Client } = require('pg');
const crypto = require('crypto');

const client = new Client({ connectionString: process.env.DATABASE_URL });

function randId(prefix) {
  return `${prefix}_${Date.now().toString(36)}${crypto.randomBytes(6).toString('hex')}`;
}

async function main() {
  await client.connect();
  console.log('Connected to DB...');

  // 1. Clean existing dummy price lists if any
  await client.query("DELETE FROM price WHERE price_list_id IS NOT NULL");
  await client.query("DELETE FROM price_list");

  // 2. Insert 3 Realistic Price Lists
  const priceLists = [
    {
      id: 'plist_01M3NAQSHFESTIVE26',
      title: "NAQSH Festive Gala '26 - Special Sale Price List",
      description: "Festive discounts and promotional luxury pricing for Lawn, Pret, and Luxury Formals across Pakistan.",
      type: 'sale',
      status: 'active',
      rules_count: 0
    },
    {
      id: 'plist_01M3NAQSHVIPTIER',
      title: "VIP Atelier Client Tier - Bespoke Pricing",
      description: "Exclusive privilege pricing for registered VIP Pakistani clients.",
      type: 'override',
      status: 'active',
      rules_count: 0
    },
    {
      id: 'plist_01M3NAQSHCLEARANCE',
      title: "Seasonal Clearance Edit - Unstitched Voile",
      description: "Special clearance pricing on 3-piece unstitched festive voile suits.",
      type: 'sale',
      status: 'active',
      rules_count: 0
    }
  ];

  for (const pl of priceLists) {
    await client.query(`
      INSERT INTO price_list (id, title, description, type, status, rules_count, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
    `, [pl.id, pl.title, pl.description, pl.type, pl.status, pl.rules_count]);
    console.log(`Created Price List: ${pl.title}`);
  }

  // 3. Attach prices to these price lists for variant price sets
  const priceSetsRes = await client.query(`
    SELECT DISTINCT pvps.price_set_id
    FROM product_variant_price_set pvps
    LIMIT 150
  `);

  console.log(`Linking ${priceSetsRes.rows.length} price sets to price lists...`);

  let count = 0;
  for (const row of priceSetsRes.rows) {
    count++;
    const targetPl = priceLists[count % priceLists.length];
    const discountPrice = 4450 + (count % 8) * 600; // e.g. 4450, 5050, 5650, 6250...
    const pId = randId('price');
    await client.query(`
      INSERT INTO price (id, price_set_id, price_list_id, currency_code, amount, rules_count, raw_amount, created_at, updated_at)
      VALUES ($1, $2, $3, 'pkr', $4, 0, $5::jsonb, NOW(), NOW())
    `, [pId, row.price_set_id, targetPl.id, discountPrice, JSON.stringify({ value: String(discountPrice), precision: 20 })]);
  }

  console.log(`Successfully attached ${count} prices to active Price Lists!`);
  await client.end();
}

main().catch(console.error);
