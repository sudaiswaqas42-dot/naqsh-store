const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });
async function main() {
  await client.connect();
  const res = await client.query('SELECT id, display_id, email, status, metadata FROM "order" ORDER BY created_at DESC');
  console.log('ALL ORDERS IN DB:', res.rows);
  await client.end();
}
main().catch(console.error);
