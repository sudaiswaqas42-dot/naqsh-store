const { Client } = require('pg');

async function autoLinkVariants(connectionString, name) {
  const client = new Client({ connectionString });
  await client.connect();
  console.log(`Checking unlinked variants on ${name}...`);

  const STOCK_LOCATION_ID = 'sloc_01M3EW98XJ4RACZA75YDSA0ZJE';

  const unlinked = await client.query(`
    SELECT pv.id as variant_id, pv.title as variant_title, pv.sku, p.title as prod_title, pv.product_id
    FROM product_variant pv
    JOIN product p ON p.id = pv.product_id
    LEFT JOIN product_variant_inventory_item pvii ON pvii.variant_id = pv.id
    WHERE pvii.id IS NULL
  `);

  console.log(`Found ${unlinked.rows.length} unlinked variants on ${name}`);

  for (const row of unlinked.rows) {
    const invItemId = `iitem_${row.variant_id}`;
    const pviiId = `pvii_${row.variant_id}`;
    const ilevId = `ilev_${row.variant_id}`;
    const invTitle = `${row.prod_title} - ${row.variant_title}`;
    const invSku = row.sku || `SKU-${row.variant_id.slice(-8)}`;

    // 1. Insert or update inventory_item
    await client.query(`
      INSERT INTO inventory_item (id, sku, title, description, material, created_at, updated_at)
      VALUES ($1, $2, $3, $4, 'Unstitched Fabric', NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        sku = EXCLUDED.sku,
        updated_at = NOW()
    `, [invItemId, invSku, invTitle, `100% Unstitched Fabric - ${row.prod_title}`]);

    // 2. Link variant to inventory item
    await client.query(`
      INSERT INTO product_variant_inventory_item (id, variant_id, inventory_item_id, required_quantity)
      VALUES ($1, $2, $3, 1)
      ON CONFLICT (variant_id, inventory_item_id) DO NOTHING
    `, [pviiId, row.variant_id, invItemId]);

    // 3. Create inventory level with default 50 stock
    await client.query(`
      INSERT INTO inventory_level (
        id, inventory_item_id, location_id, stocked_quantity, reserved_quantity, incoming_quantity,
        raw_stocked_quantity, raw_reserved_quantity, raw_incoming_quantity, created_at, updated_at
      ) VALUES ($1, $2, $3, 50, 0, 0, '{"value": "50"}', '{"value": "0"}', '{"value": "0"}', NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
        stocked_quantity = EXCLUDED.stocked_quantity,
        raw_stocked_quantity = EXCLUDED.raw_stocked_quantity,
        updated_at = NOW()
    `, [ilevId, invItemId, STOCK_LOCATION_ID]);

    // 4. Update variant manage_inventory
    await client.query(`
      UPDATE product_variant
      SET manage_inventory = true, allow_backorder = false
      WHERE id = $1
    `, [row.variant_id]);

    console.log(`Auto-linked variant ${row.variant_id} (${invTitle}, SKU: ${invSku})`);
  }

  await client.end();
}

async function run() {
  await autoLinkVariants('postgresql://postgres:UYdliHHIlLqHXqgptVsUSlXqKUdMeqxD@reseau.proxy.rlwy.net:41305/railway', 'Railway');
  await autoLinkVariants('postgresql://neondb_owner:npg_N5jy4HXSbDed@ep-delicate-bird-azhwwm8f-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require', 'Neon');
}

run().catch(console.error);
