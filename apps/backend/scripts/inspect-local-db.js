const { Client } = require('pg');

async function main() {
  const c = new Client('postgres://postgres:1234@localhost/medusa-naqsh-store');
  await c.connect();
  console.log('Connected to local DB');

  const tables = [
    'product', 'product_category', 'product_category_product', 'product_variant', 
    'price_set', 'price', 'product_variant_price_set', 'product_option', 
    'product_option_value', 'product_image', 'image', 'inventory_item', 
    'inventory_level', 'product_variant_inventory_item', 'homepage_section',
    'sales_channel', 'product_sales_channel', 'collection', 'region'
  ];

  for (const t of tables) {
    try {
      const res = await c.query(`SELECT count(*) FROM "${t}"`);
      console.log(`${t}: ${res.rows[0].count}`);
    } catch (e) {
      console.log(`${t}: NOT FOUND (${e.message})`);
    }
  }

  // Also check children category specifically
  const cats = await c.query(`SELECT id, name, handle FROM product_category WHERE handle LIKE '%child%' OR handle LIKE '%kid%'`);
  console.log('Children categories in local DB:', cats.rows);

  await c.end();
}

main().catch(console.error);
