const { Client } = require('pg');

const NEON_URL = 'postgresql://neondb_owner:npg_N5jy4HXSbDed@ep-delicate-bird-azhwwm8f-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
const RAILWAY_URL = 'postgresql://postgres:UYdliHHIlLqHXqgptVsUSlXqKUdMeqxD@reseau.proxy.rlwy.net:41305/railway';

async function fix(url, name) {
  console.log('Fixing mpath for:', name);
  const client = new Client({ connectionString: url });
  await client.connect();

  // Fix mpath for root categories
  await client.query("UPDATE product_category SET mpath = id WHERE parent_category_id IS NULL");

  // Fix mpath for level 1 children
  await client.query("UPDATE product_category SET mpath = parent_category_id || '.' || id WHERE parent_category_id IS NOT NULL");

  const roots = await client.query("SELECT id, name, mpath FROM product_category WHERE parent_category_id IS NULL");
  console.log(`[${name}] Root categories:`, roots.rows);

  const children = await client.query("SELECT id, name, parent_category_id, mpath FROM product_category WHERE parent_category_id IS NOT NULL");
  console.log(`[${name}] Children categories count:`, children.rows.length);

  await client.end();
}

async function run() {
  await fix(NEON_URL, 'Neon');
  await fix(RAILWAY_URL, 'Railway');
  console.log('Done!');
}

run().catch(console.error);
