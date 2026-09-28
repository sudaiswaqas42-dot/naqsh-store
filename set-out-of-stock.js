const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });

async function main() {
  await client.connect();
  const v = await client.query("SELECT pv.id, p.title FROM product_variant pv JOIN product p ON p.id = pv.product_id WHERE p.title ILIKE '%Shahkar Festive Cape%' LIMIT 1");
  if (v.rows[0]) {
    const vId = v.rows[0].id;
    console.log('SETTING VARIANT OUT OF STOCK:', vId, v.rows[0].title);
    await client.query("UPDATE inventory_level SET stocked_quantity = 0, raw_stocked_quantity = '{\"value\": \"0\", \"precision\": 20}'::jsonb WHERE inventory_item_id IN (SELECT inventory_item_id FROM product_variant_inventory_item WHERE variant_id = $1)", [vId]);
    console.log('SUCCESSFULLY SET TO 0 STOCK');
  }
  await client.end();
}
main().catch(console.error);
