const { Client } = require('pg');

async function fixSharedOptions(connectionString, name) {
  const client = new Client({ connectionString });
  await client.connect();
  console.log(`Fixing shared options on ${name}...`);

  // 1. Find all non-exclusive options
  const shared = await client.query('SELECT id, title FROM product_option WHERE is_exclusive = false');
  console.log(`Found ${shared.rows.length} non-exclusive options on ${name}:`, shared.rows);

  // 2. Set is_exclusive = true for all options so Medusa Admin NEVER treats them as pre-filled templates!
  await client.query('UPDATE product_option SET is_exclusive = true WHERE is_exclusive = false');
  console.log(`Set is_exclusive = true on all options on ${name}.`);

  // 3. Delete any orphaned/unused option values that were added as dummy presets
  const unused = await client.query(`
    SELECT pov.id, pov.value, pov.option_id
    FROM product_option_value pov
    LEFT JOIN product_variant_option pvo ON pvo.option_value_id = pov.id
    LEFT JOIN product_product_option_value ppov ON ppov.product_option_value_id = pov.id
    WHERE pvo.variant_id IS NULL AND ppov.id IS NULL
  `);

  console.log(`Found ${unused.rows.length} unused option values on ${name}. Deleting them...`);

  if (unused.rows.length > 0) {
    const unusedIds = unused.rows.map(r => r.id);
    await client.query('DELETE FROM product_option_value WHERE id = ANY($1)', [unusedIds]);
    console.log(`Deleted ${unused.rows.length} unused option values on ${name}.`);
  }

  await client.end();
}

async function run() {
  await fixSharedOptions('postgresql://postgres:UYdliHHIlLqHXqgptVsUSlXqKUdMeqxD@reseau.proxy.rlwy.net:41305/railway', 'Railway');
  await fixSharedOptions('postgresql://neondb_owner:npg_N5jy4HXSbDed@ep-delicate-bird-azhwwm8f-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require', 'Neon');
}

run().catch(console.error);
