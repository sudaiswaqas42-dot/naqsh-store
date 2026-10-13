const { Client } = require('pg');

const NEON_URL = 'postgresql://neondb_owner:npg_N5jy4HXSbDed@ep-delicate-bird-azhwwm8f-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
const RAILWAY_URL = 'postgresql://postgres:UYdliHHIlLqHXqgptVsUSlXqKUdMeqxD@reseau.proxy.rlwy.net:41305/railway';
const STOCK_LOCATION_ID = 'sloc_01M3EW98XJ4RACZA75YDSA0ZJE';

async function cleanupAndSync(url, name) {
  console.log(`\n==============================================`);
  console.log(`CLEANING UP & SYNCHRONIZING INVENTORY ON ${name}`);
  console.log(`==============================================`);
  const client = new Client({ connectionString: url });
  await client.connect();

  try {
    await client.query('BEGIN');

    // 1. DELETE ALL ORPHAN & DUMMY STITCHED INVENTORY ITEMS
    console.log('[1] Deleting reservation items...');
    await client.query(`DELETE FROM reservation_item`);

    console.log('[2] Deleting all legacy dummy inventory levels...');
    await client.query(`DELETE FROM inventory_level`);

    console.log('[3] Deleting all legacy variant-inventory links...');
    await client.query(`DELETE FROM product_variant_inventory_item`);

    console.log('[4] Deleting all legacy dummy / stitched inventory items...');
    const delRes = await client.query(`DELETE FROM inventory_item`);
    console.log(`Deleted ${delRes.rowCount} legacy inventory items!`);

    // 2. CLEAN UP OLD STITCHED GARMENTS FROM PRODUCT TABLE
    console.log('[5] Removing obsolete stitched pret garments from product table...');
    const stitchedProdIds = [
      'prod_01M3EW9BMFKHPET0BTPZSY3ZFY', // Sage Green Embroidered Pret Kurta
      'prod_01M3EW9CG58QXYPX28MMCRBE7X', // Embroidered Raw Silk Men's Waistcoat
    ];
    for (const pid of stitchedProdIds) {
      await client.query(`DELETE FROM product_category_product WHERE product_id = $1`, [pid]).catch(() => {});
      await client.query(`DELETE FROM product_variant_price_set WHERE variant_id IN (SELECT id FROM product_variant WHERE product_id = $1)`, [pid]).catch(() => {});
      await client.query(`DELETE FROM product_variant WHERE product_id = $1`, [pid]).catch(() => {});
      await client.query(`DELETE FROM image WHERE product_id = $1`, [pid]).catch(() => {});
      await client.query(`DELETE FROM product WHERE id = $1`, [pid]).catch(() => {});
    }

    // 3. CLEAN UP SIZES IN REMAINING UNSTITCHED PRODUCTS
    // Ensure variants on products like Royal Crimson are titled by color, not "Small / ..."
    console.log('[6] Standardizing variant titles to 100% Color-based Unstitched Cuts...');
    await client.query(`
      UPDATE product_variant
      SET title = 'Crimson Red - Unstitched Cut', sku = 'NAQSH-ROYAL-CRIMSON-RED'
      WHERE id = 'variant_01M3EW9ARPVHSC7Y36X8BB93HV'
    `);
    await client.query(`
      UPDATE product_variant
      SET title = 'Emerald Green - Unstitched Cut', sku = 'NAQSH-ROYAL-EMERALD-GREEN'
      WHERE id = 'variant_01M3EW9ARQ427G5CC31GPF93GB'
    `);
    await client.query(`
      UPDATE product_variant
      SET title = 'Ivory Gold - Unstitched Cut', sku = 'NAQSH-IVORY-PEARL-GOLD'
      WHERE id = 'variant_01M3EW9B57B7YMVSTCZ77K9HED'
    `);
    await client.query(`
      UPDATE product_variant
      SET title = 'Midnight Blue - Unstitched Cut', sku = 'NAQSH-SILK-MIDNIGHT-BLUE'
      WHERE id = 'variant_01M3EW9BBNHYPC3ARQYP54V01C'
    `);
    await client.query(`
      UPDATE product_variant
      SET title = 'Sand Beige - Unstitched Cut', sku = 'NAQSH-SILK-SAND-BEIGE'
      WHERE id = 'variant_01M3EW9BBPX6WS8D7XH1QQ6N1J'
    `);
    await client.query(`
      UPDATE product_variant
      SET title = 'Sun Mustard - Unstitched Cut', sku = 'NAQSH-MUSTARD-CHIKANKARI'
      WHERE id = 'variant_01M3EW9C1EN3XFGV8RTM7GXVHA'
    `);
    await client.query(`
      UPDATE product_variant
      SET title = 'Dusky Lilac - Unstitched Cut', sku = 'NAQSH-DUSKY-LILAC-LAWN'
      WHERE id = 'variant_01M3EW9DSNS2GT8276PF2A6CQY'
    `);

    // Remove redundant duplicate size variants for these products
    const redundantVariantIds = [
      'variant_01M3EW9ARQHJ9QAE2VAD14BTVJ',
      'variant_01M3EW9ARRV5610QKW57971A1X',
      'variant_01M3EW9ARRSGPQ5F28C6G795ST',
      'variant_01M3EW9ARSZGJXMP8J62BGPA6K',
      'variant_01M3EW9B57A01DR5V49PBG9KEN',
      'variant_01M3EW9B57WJ6QQ954ZN5NFVWX',
      'variant_01M3EW9BBP8AJAW762DM22CMVW',
      'variant_01M3EW9BBQWZ1J9CM1FC0MGNPC',
      'variant_01M3EW9BBQV5N8VMN34HMAGX7Y',
      'variant_01M3EW9BBRW7J226Y6RYMESNWB',
      'variant_01M3EW9C1FTMP48J1BVXZ6CDP9',
      'variant_01M3EW9DSPHRRG3N4ABJNJ4PW9',
      'variant_01M3EW9DSPGFCHJH66664NDCTG',
    ];
    await client.query(`
      DELETE FROM product_variant_price_set WHERE variant_id = ANY($1::text[])
    `, [redundantVariantIds]).catch(() => {});
    await client.query(`
      DELETE FROM product_variant_option WHERE variant_id = ANY($1::text[])
    `, [redundantVariantIds]).catch(() => {});
    await client.query(`
      DELETE FROM product_variant WHERE id = ANY($1::text[])
    `, [redundantVariantIds]).catch(() => {});

    // 4. LINK KIDS PRODUCTS TO LADIES & GENTS CATEGORIES AS REQUESTED
    console.log('[7] Linking girls products to ladies categories and boys products to gents categories...');
    const catLinks = [
      { prod: 'prod_naqsh_k_girls_3pc', cat: 'pcat_ladies_3pc' },
      { prod: 'prod_naqsh_k_girls_2pc', cat: 'pcat_ladies_2pc' },
      { prod: 'prod_naqsh_k_girls_silk', cat: 'pcat_ladies_silk' },
      { prod: 'prod_naqsh_k_girls_embroidery', cat: 'pcat_ladies_embroidery_waly' },
      { prod: 'prod_naqsh_k_girls_printed', cat: 'pcat_ladies_printed' },
      { prod: 'prod_naqsh_k_girls_linen', cat: 'pcat_ladies_linen' },
      { prod: 'prod_naqsh_k_boys_boski', cat: 'pcat_gents_boski' },
      { prod: 'prod_naqsh_k_boys_wash_wear', cat: 'pcat_gents_wash_wear' },
      { prod: 'prod_naqsh_k_boys_kurta', cat: 'pcat_gents_wash_wear' },
      { prod: 'prod_naqsh_k_boys_khaddar', cat: 'pcat_gents_kamalia_khaddar' },
      { prod: 'prod_naqsh_k_boys_wool', cat: 'pcat_gents_wool' },
      { prod: 'prod_naqsh_k_boys_ww_navy', cat: 'pcat_gents_wash_wear' },
    ];
    for (const link of catLinks) {
      await client.query(`
        INSERT INTO product_category_product (product_id, product_category_id)
        VALUES ($1, $2) ON CONFLICT DO NOTHING
      `, [link.prod, link.cat]);
    }

    // 5. CREATE CLEAN INVENTORY ITEMS FOR ALL PUBLISHED PRODUCTS & VARIANTS
    console.log('[8] Generating clean, searchable inventory items for all published products...');
    const variantsRes = await client.query(`
      SELECT pv.id as variant_id, pv.title as variant_title, pv.sku, p.id as product_id, p.title as product_title, p.handle as product_handle, p.material
      FROM product_variant pv
      JOIN product p ON p.id = pv.product_id
      WHERE p.status = 'published'
      ORDER BY p.title, pv.title
    `);
    console.log(`Found ${variantsRes.rows.length} valid product variants to populate inventory.`);

    const rows = variantsRes.rows;
    const batchSize = 100;

    for (let i = 0; i < rows.length; i += batchSize) {
      const chunk = rows.slice(i, i + batchSize);

      // 1. Batch insert inventory items
      const itemValues = [];
      const itemParams = [];
      chunk.forEach((row, idx) => {
        const offset = idx * 5;
        const invItemId = `iitem_${row.variant_id}`;
        const sku = row.sku || `NAQSH-${row.product_handle.toUpperCase().replace(/[^A-Z0-9]/g, '-')}`;
        const title = `${row.product_title} - ${row.variant_title.replace(/\s*-\s*Unstitched Cut/i, '')}`;
        const desc = `100% Unstitched Fabric Cut (${row.material || 'Premium Fabric'})`;
        const mat = row.material || 'Unstitched Fabric';
        itemValues.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, true, $${offset + 5}, NOW(), NOW())`);
        itemParams.push(invItemId, sku, title, desc, mat);
      });

      await client.query(`
        INSERT INTO inventory_item (id, sku, title, description, requires_shipping, material, created_at, updated_at)
        VALUES ${itemValues.join(', ')}
        ON CONFLICT (id) DO UPDATE SET
          sku = EXCLUDED.sku,
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          material = EXCLUDED.material,
          updated_at = NOW()
      `, itemParams);

      // 2. Batch insert variant inventory links
      const linkValues = [];
      const linkParams = [];
      chunk.forEach((row, idx) => {
        const offset = idx * 3;
        const invItemId = `iitem_${row.variant_id}`;
        linkValues.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, 1)`);
        linkParams.push(`pvii_${row.variant_id}`, row.variant_id, invItemId);
      });

      await client.query(`
        INSERT INTO product_variant_inventory_item (id, variant_id, inventory_item_id, required_quantity)
        VALUES ${linkValues.join(', ')}
        ON CONFLICT (variant_id, inventory_item_id) DO NOTHING
      `, linkParams);

      // 3. Batch insert inventory levels
      const levelValues = [];
      const levelParams = [];
      chunk.forEach((row, idx) => {
        const offset = idx * 3;
        const invItemId = `iitem_${row.variant_id}`;
        levelValues.push(`($${offset + 1}, $${offset + 2}, $${offset + 3}, 50, 0, 0, '{"value": "50"}', '{"value": "0"}', '{"value": "0"}', NOW(), NOW())`);
        levelParams.push(`ilev_${row.variant_id}`, invItemId, STOCK_LOCATION_ID);
      });

      await client.query(`
        INSERT INTO inventory_level (
          id, inventory_item_id, location_id, stocked_quantity, reserved_quantity, incoming_quantity, raw_stocked_quantity, raw_reserved_quantity, raw_incoming_quantity, created_at, updated_at
        ) VALUES ${levelValues.join(', ')}
        ON CONFLICT (id) DO UPDATE SET
          stocked_quantity = 50,
          raw_stocked_quantity = '{"value": "50"}',
          updated_at = NOW()
      `, levelParams);

      // 4. Update variants
      const variantIds = chunk.map(r => `'${r.variant_id}'`).join(', ');
      await client.query(`
        UPDATE product_variant
        SET manage_inventory = true, allow_backorder = false
        WHERE id IN (${variantIds})
      `);

      console.log(`Synced inventory batch ${i + chunk.length} / ${rows.length}...`);
    }

    await client.query('COMMIT');
    console.log(`SUCCESS! Synchronized all clean unstitched inventory items on ${name}!`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`Error on ${name}:`, err);
    throw err;
  } finally {
    await client.end();
  }
}

async function main() {
  await cleanupAndSync(NEON_URL, 'NEON_DB');
  await cleanupAndSync(RAILWAY_URL, 'RAILWAY_DB');
  console.log('\nALL DATABASES INVENTORY COMPLETELY CLEANED UP AND SYNCHRONIZED!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
