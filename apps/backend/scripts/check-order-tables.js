const { Client } = require('pg');
const RAILWAY_URL = 'postgresql://postgres:UYdliHHIlLqHXqgptVsUSlXqKUdMeqxD@reseau.proxy.rlwy.net:41305/railway';

async function checkOrderTables() {
  const client = new Client({ connectionString: RAILWAY_URL });
  await client.connect();
  try {
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema='public' AND (table_name LIKE '%order%' OR table_name LIKE '%link%')
    `);
    console.log("Tables with order or link:", res.rows.map(r => r.table_name));
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.end();
  }
}

checkOrderTables();
