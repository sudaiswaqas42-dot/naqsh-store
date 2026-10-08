const { Client } = require('pg');

async function main() {
  const c = new Client('postgres://postgres:1234@localhost:5432/medusa-naqsh-store');
  await c.connect();

  const u = await c.query('SELECT id, email FROM "user"');
  console.log('Local DB Users:', u.rows);

  const k = await c.query("SELECT id, token, type FROM api_key");
  console.log('Local DB API Keys:', k.rows);

  await c.end();
}

main().catch(console.error);
