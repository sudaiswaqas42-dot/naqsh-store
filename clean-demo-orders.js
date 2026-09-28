const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });

async function main() {
  await client.connect();
  console.log('Connected to DB...');

  // Find all seeded demo order IDs
  const res = await client.query("SELECT id, display_id, email FROM \"order\" WHERE metadata->>'seeded' = 'true'");
  console.log(`Found ${res.rows.length} seeded demo orders:`, res.rows.map(r => `#${r.display_id} (${r.email})`));

  const seededIds = res.rows.map(r => r.id);

  if (seededIds.length > 0) {
    // Delete related rows first if any
    await client.query("DELETE FROM return_request WHERE order_id = ANY($1)", [seededIds]).catch(() => {});
    await client.query("DELETE FROM order_change WHERE order_id = ANY($1)", [seededIds]).catch(() => {});
    await client.query("DELETE FROM order_item WHERE order_id = ANY($1)", [seededIds]).catch(() => {});
    await client.query("DELETE FROM order_line_item WHERE order_id = ANY($1)", [seededIds]).catch(() => {});
    await client.query("DELETE FROM order_shipping_method WHERE order_id = ANY($1)", [seededIds]).catch(() => {});
    await client.query("DELETE FROM order_summary WHERE order_id = ANY($1)", [seededIds]).catch(() => {});
    await client.query("DELETE FROM order_address WHERE order_id = ANY($1)", [seededIds]).catch(() => {});
    
    // Now delete from order table
    await client.query("DELETE FROM \"order\" WHERE id = ANY($1)", [seededIds]);
    console.log(`Successfully removed all ${seededIds.length} seeded demo orders!`);
  }

  // Check remaining orders
  const remaining = await client.query("SELECT id, display_id, email, status, metadata FROM \"order\" ORDER BY created_at DESC");
  console.log(`Remaining authentic orders in DB: ${remaining.rows.length}`);
  remaining.rows.forEach(r => {
    console.log(` - Order #${r.display_id}: ${r.email} [${r.status}]`);
  });

  await client.end();
}

main().catch(console.error);
