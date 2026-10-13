const { Client } = require('pg');

const NEON_URL = 'postgresql://neondb_owner:npg_N5jy4HXSbDed@ep-delicate-bird-azhwwm8f-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

async function main() {
  const c = new Client({ connectionString: NEON_URL });
  await c.connect();

  const total = await c.query('SELECT count(*) FROM product');
  console.log('Total products:', total.rows[0].count);

  const sample = await c.query('SELECT id, title, handle, subtitle, material, collection_id FROM product LIMIT 20');
  console.log('Sample products:');
  sample.rows.forEach(r => console.log(`- [${r.id}] ${r.title} | Handle: ${r.handle} | Material: ${r.material}`));

  const colls = await c.query('SELECT id, title, handle FROM product_collection');
  console.log('\nCollections:');
  colls.rows.forEach(c => console.log(`- [${c.id}] ${c.title} (${c.handle})`));

  await c.end();
}

main().catch(console.error);
