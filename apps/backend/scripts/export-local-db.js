const fs = require('fs');
const zlib = require('zlib');
const { Client } = require('pg');

async function main() {
  const c = new Client('postgres://postgres:1234@localhost/medusa-naqsh-store');
  await c.connect();
  console.log('Connected to local PostgreSQL...');

  const tablesQuery = await c.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'");
  const tables = tablesQuery.rows.map(r => r.table_name);
  console.log(`Found ${tables.length} tables to export.`);

  const exportData = {};
  for (const table of tables) {
    try {
      const res = await c.query(`SELECT * FROM "${table}"`);
      exportData[table] = res.rows;
      if (res.rows.length > 0) {
        console.log(`  - ${table}: ${res.rows.length} rows`);
      }
    } catch (e) {
      console.warn(`  - Error reading ${table}:`, e.message);
    }
  }

  const jsonStr = JSON.stringify(exportData);
  const compressed = zlib.gzipSync(jsonStr);

  fs.writeFileSync('apps/backend/local_db_export.json.gz', compressed);
  console.log(`Exported and compressed successfully! Size: ${(compressed.length / 1024 / 1024).toFixed(2)} MB`);

  await c.end();
}

main().catch(console.error);
