const { Client } = require('pg');
const client = new Client({ connectionString: 'postgres://postgres:1234@localhost/medusa-naqsh-store' });

async function run() {
  await client.connect();
  const res = await client.query(`
    SELECT table_name, column_name 
    FROM information_schema.columns 
    WHERE table_name LIKE 'product%' 
    ORDER BY table_name, ordinal_position
  `);
  const map = {};
  for (const row of res.rows) {
    if (!map[row.table_name]) map[row.table_name] = [];
    map[row.table_name].push(row.column_name);
  }
  for (const [tbl, cols] of Object.entries(map)) {
    console.log(tbl, ':', cols.join(', '));
  }
  await client.end();
}

run().catch(console.error);
