const { Client } = require('pg');
const RAILWAY_URL = 'postgresql://postgres:UYdliHHIlLqHXqgptVsUSlXqKUdMeqxD@reseau.proxy.rlwy.net:41305/railway';

async function checkCols() {
  const client = new Client({ connectionString: RAILWAY_URL });
  await client.connect();
  try {
    for (const t of ['order_shipping', 'order_shipping_method', 'order_item', 'order_line_item']) {
      const res = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema='public' AND table_name='${t}'
      `);
      console.log(`Columns for ${t}:`, res.rows.map(r => r.column_name));
    }
  } finally {
    await client.end();
  }
}

checkCols();
