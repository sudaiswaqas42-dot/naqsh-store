const { Client } = require('pg');
const RAILWAY_URL = 'postgresql://postgres:UYdliHHIlLqHXqgptVsUSlXqKUdMeqxD@reseau.proxy.rlwy.net:41305/railway';

async function listOrders() {
  const client = new Client({ connectionString: RAILWAY_URL });
  await client.connect();
  try {
    const res = await client.query(`
      SELECT id, display_id, email, created_at, status
      FROM "order"
      ORDER BY created_at DESC
    `);
    console.log("Total orders in Railway:", res.rows.length);
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error("Error querying orders:", err);
  } finally {
    await client.end();
  }
}

listOrders();
