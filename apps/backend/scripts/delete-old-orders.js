const { Client } = require('pg');
const RAILWAY_URL = 'postgresql://postgres:UYdliHHIlLqHXqgptVsUSlXqKUdMeqxD@reseau.proxy.rlwy.net:41305/railway';
const LOCAL_URL = 'postgres://postgres:1234@localhost/medusa-naqsh-store';

async function cleanupOrdersForDb(dbUrl, dbName) {
  console.log(`\n========================================`);
  console.log(`Cleaning orders with display_id < 1310 on ${dbName}...`);
  console.log(`========================================`);

  const client = new Client({ connectionString: dbUrl });
  try {
    await client.connect();
    await client.query('BEGIN');

    // 1. Get target orders
    const targetsRes = await client.query('SELECT id, display_id, email, created_at FROM "order" WHERE display_id < 1310');
    console.log(`Found ${targetsRes.rows.length} orders to delete:`);
    targetsRes.rows.forEach(r => console.log(`  - #${r.display_id} (ID: ${r.id}, Email: ${r.email}, Date: ${r.created_at})`));

    if (targetsRes.rows.length === 0) {
      console.log("No orders with display_id < 1310 found.");
      await client.query('ROLLBACK');
      return;
    }

    const orderIds = targetsRes.rows.map(r => r.id);

    // 2. Fetch associated item_ids and shipping_method_ids
    const itemsRes = await client.query('SELECT item_id FROM order_item WHERE order_id = ANY($1)', [orderIds]);
    const itemIds = itemsRes.rows.map(r => r.item_id).filter(Boolean);

    const shippingRes = await client.query('SELECT shipping_method_id FROM order_shipping WHERE order_id = ANY($1)', [orderIds]);
    const shippingMethodIds = shippingRes.rows.map(r => r.shipping_method_id).filter(Boolean);

    const changeRes = await client.query('SELECT id FROM order_change WHERE order_id = ANY($1)', [orderIds]);
    const changeIds = changeRes.rows.map(r => r.id).filter(Boolean);

    // 3. Delete links
    await client.query('DELETE FROM order_cart WHERE order_id = ANY($1)', [orderIds]);
    await client.query('DELETE FROM order_fulfillment WHERE order_id = ANY($1)', [orderIds]);
    await client.query('DELETE FROM order_payment_collection WHERE order_id = ANY($1)', [orderIds]);
    await client.query('DELETE FROM order_promotion WHERE order_id = ANY($1)', [orderIds]);

    // 4. Delete change actions & changes
    if (changeIds.length > 0) {
      await client.query('DELETE FROM order_change_action WHERE order_change_id = ANY($1)', [changeIds]);
    }
    await client.query('DELETE FROM order_change WHERE order_id = ANY($1)', [orderIds]);

    // 5. Delete credit lines, transactions, summary
    await client.query('DELETE FROM order_credit_line WHERE order_id = ANY($1)', [orderIds]);
    await client.query('DELETE FROM order_transaction WHERE order_id = ANY($1)', [orderIds]);
    await client.query('DELETE FROM order_summary WHERE order_id = ANY($1)', [orderIds]);

    // 6. Delete shipping adjustments, tax lines, shipping_method, order_shipping
    if (shippingMethodIds.length > 0) {
      await client.query('DELETE FROM order_shipping_method_adjustment WHERE shipping_method_id = ANY($1)', [shippingMethodIds]);
      await client.query('DELETE FROM order_shipping_method_tax_line WHERE shipping_method_id = ANY($1)', [shippingMethodIds]);
    }
    await client.query('DELETE FROM order_shipping WHERE order_id = ANY($1)', [orderIds]);
    if (shippingMethodIds.length > 0) {
      await client.query('DELETE FROM order_shipping_method WHERE id = ANY($1)', [shippingMethodIds]);
    }

    // 7. Delete line item adjustments, tax lines, order_item, order_line_item
    if (itemIds.length > 0) {
      await client.query('DELETE FROM order_line_item_adjustment WHERE item_id = ANY($1)', [itemIds]);
      await client.query('DELETE FROM order_line_item_tax_line WHERE item_id = ANY($1)', [itemIds]);
    }
    await client.query('DELETE FROM order_item WHERE order_id = ANY($1)', [orderIds]);
    if (itemIds.length > 0) {
      await client.query('DELETE FROM order_line_item WHERE id = ANY($1)', [itemIds]);
    }

    // 8. Delete orders
    const delRes = await client.query('DELETE FROM "order" WHERE id = ANY($1)', [orderIds]);
    console.log(`Successfully deleted ${delRes.rowCount} orders from "order" table.`);

    await client.query('COMMIT');
    console.log(`Transaction committed on ${dbName}!`);

    // Verify
    const verifyRes = await client.query('SELECT display_id, email, created_at FROM "order" ORDER BY display_id DESC');
    console.log(`\nRemaining orders in ${dbName} (${verifyRes.rows.length} total):`);
    verifyRes.rows.forEach(r => console.log(`  - #${r.display_id} (${r.email}, ${r.created_at})`));

  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`Error deleting orders on ${dbName}:`, err);
  } finally {
    await client.end();
  }
}

async function main() {
  await cleanupOrdersForDb(RAILWAY_URL, 'Railway Live Production');
  try {
    await cleanupOrdersForDb(LOCAL_URL, 'Local Database');
  } catch (err) {
    console.log('Local DB skipped:', err.message);
  }
}

main();
