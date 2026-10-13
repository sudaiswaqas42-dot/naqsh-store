const { Client } = require('pg');

async function inspect() {
  const railway = new Client({ connectionString: 'postgresql://postgres:UYdliHHIlLqHXqgptVsUSlXqKUdMeqxD@reseau.proxy.rlwy.net:41305/railway' });
  await railway.connect();

  const prod = await railway.query("SELECT id, title FROM product WHERE title ILIKE '%Spices%' OR id = 'prod_01M4T4D830JBPZGGM9H4H9HP3H'");
  console.log('Products matching Spices:', prod.rows);

  if (prod.rows.length > 0) {
    const v = await railway.query('SELECT id, title, sku, product_id, manage_inventory FROM product_variant WHERE product_id = $1', [prod.rows[0].id]);
    console.log('Variants:', v.rows);

    const vIds = v.rows.map(r => r.id);
    if (vIds.length > 0) {
      const links = await railway.query('SELECT * FROM product_variant_inventory_item WHERE variant_id = ANY($1)', [vIds]);
      console.log('Links:', links.rows);
    }
  }

  // Also check how many total variants exist without inventory item links
  const unlinked = await railway.query(`
    SELECT pv.id, pv.title, pv.sku, p.title as prod_title 
    FROM product_variant pv
    JOIN product p ON p.id = pv.product_id
    LEFT JOIN product_variant_inventory_item pvii ON pvii.variant_id = pv.id
    WHERE pvii.id IS NULL
  `);
  console.log('Total unlinked variants on Railway:', unlinked.rows.length, unlinked.rows.slice(0, 5));

  await railway.end();
}

inspect().catch(console.error);
