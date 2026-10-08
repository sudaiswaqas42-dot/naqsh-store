const { Client } = require('pg');

const LOCAL_URL = 'postgres://postgres:1234@localhost/medusa-naqsh-store';
const RAILWAY_URL = 'postgresql://postgres:UYdliHHIlLqHXqgptVsUSlXqKUdMeqxD@reseau.proxy.rlwy.net:41305/railway';
const NEON_URL = 'postgresql://neondb_owner:npg_N5jy4HXSbDed@ep-delicate-bird-azhwwm8f-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

async function syncTarget(targetUrl, targetName, localProductIds, localHomepageSections) {
  console.log(`\n========================================`);
  console.log(`SYNCING TO ${targetName.toUpperCase()}...`);
  console.log(`========================================`);

  const client = new Client({ connectionString: targetUrl });
  await client.connect();

  try {
    await client.query('BEGIN');

    // 1. Identify stitched products to delete
    const currentProdRes = await client.query('SELECT id, handle FROM product');
    const toDeleteIds = currentProdRes.rows
      .filter(r => !localProductIds.has(r.id))
      .map(r => r.id);

    console.log(`[${targetName}] Total products before: ${currentProdRes.rows.length}`);
    console.log(`[${targetName}] Stitched products to remove: ${toDeleteIds.length}`);

    if (toDeleteIds.length > 0) {
      const chunkSize = 400;
      for (let i = 0; i < toDeleteIds.length; i += chunkSize) {
        const chunk = toDeleteIds.slice(i, i + chunkSize);

        // A. Variants & their relations
        const varRes = await client.query(
          `SELECT id FROM product_variant WHERE product_id = ANY($1::text[])`,
          [chunk]
        );
        const variantIds = varRes.rows.map(r => r.id);

        if (variantIds.length > 0) {
          // Get price_set_ids
          const psRes = await client.query(
            `SELECT price_set_id FROM product_variant_price_set WHERE variant_id = ANY($1::text[])`,
            [variantIds]
          );
          const priceSetIds = psRes.rows.map(r => r.price_set_id).filter(Boolean);

          // Delete product_variant_price_set
          await client.query(
            `DELETE FROM product_variant_price_set WHERE variant_id = ANY($1::text[])`,
            [variantIds]
          );

          // Delete price & price_set
          if (priceSetIds.length > 0) {
            await client.query(
              `DELETE FROM price WHERE price_set_id = ANY($1::text[])`,
              [priceSetIds]
            );
            await client.query(
              `DELETE FROM price_set WHERE id = ANY($1::text[])`,
              [priceSetIds]
            );
          }

          // Delete product_variant_inventory_item
          await client.query(
            `DELETE FROM product_variant_inventory_item WHERE variant_id = ANY($1::text[])`,
            [variantIds]
          );

          // Delete product_variant_option
          await client.query(
            `DELETE FROM product_variant_option WHERE variant_id = ANY($1::text[])`,
            [variantIds]
          ).catch(() => {});

          // Delete product_variant_product_image
          await client.query(
            `DELETE FROM product_variant_product_image WHERE variant_id = ANY($1::text[])`,
            [variantIds]
          ).catch(() => {});

          // Nullify cart_line_item & order_line_item
          await client.query(
            `UPDATE cart_line_item SET variant_id = NULL WHERE variant_id = ANY($1::text[])`,
            [variantIds]
          ).catch(() => {});
          await client.query(
            `UPDATE order_line_item SET variant_id = NULL WHERE variant_id = ANY($1::text[])`,
            [variantIds]
          ).catch(() => {});

          // Delete product_variant
          await client.query(
            `DELETE FROM product_variant WHERE id = ANY($1::text[])`,
            [variantIds]
          );
        }

        // B. Options & values
        const ppoRes = await client.query(
          `SELECT id, product_option_id FROM product_product_option WHERE product_id = ANY($1::text[])`,
          [chunk]
        );
        const ppoIds = ppoRes.rows.map(r => r.id);
        const optionIds = ppoRes.rows.map(r => r.product_option_id).filter(Boolean);

        if (ppoIds.length > 0) {
          await client.query(
            `DELETE FROM product_product_option_value WHERE product_product_option_id = ANY($1::text[])`,
            [ppoIds]
          ).catch(() => {});
          await client.query(
            `DELETE FROM product_product_option WHERE id = ANY($1::text[])`,
            [ppoIds]
          );
        }
        if (optionIds.length > 0) {
          await client.query(
            `DELETE FROM product_option_value WHERE option_id = ANY($1::text[])`,
            [optionIds]
          ).catch(() => {});
          await client.query(
            `DELETE FROM product_option WHERE id = ANY($1::text[])`,
            [optionIds]
          ).catch(() => {});
        }

        // C. Clean other direct links
        await client.query(
          `DELETE FROM product_category_product WHERE product_id = ANY($1::text[])`,
          [chunk]
        ).catch(() => {});

        await client.query(
          `DELETE FROM image WHERE product_id = ANY($1::text[])`,
          [chunk]
        ).catch(() => {});

        await client.query(
          `DELETE FROM product_tags WHERE product_id = ANY($1::text[])`,
          [chunk]
        ).catch(() => {});

        await client.query(
          `DELETE FROM product_sales_channel WHERE product_id = ANY($1::text[])`,
          [chunk]
        ).catch(() => {});

        await client.query(
          `DELETE FROM product_shipping_profile WHERE product_id = ANY($1::text[])`,
          [chunk]
        ).catch(() => {});

        // D. Delete product
        await client.query(
          `DELETE FROM product WHERE id = ANY($1::text[])`,
          [chunk]
        );

        console.log(`[${targetName}] Successfully deleted chunk of ${chunk.length} products...`);
      }
    }

    // 2. Delete stitched categories
    const stitchedCatHandles = [
      'women-stitched',
      'men-stitched',
      'ready-to-wear',
      'co-ords',
      'festive-formals',
      'kurta-shalwar',
      'waistcoats',
      'casual-men',
      'shirts',
      'sweatshirts',
      'pants',
      'merch',
      'girls-stitched',
      'boys-stitched'
    ];
    await client.query(
      `DELETE FROM product_category WHERE handle = ANY($1::text[])`,
      [stitchedCatHandles]
    );
    console.log(`[${targetName}] Stitched categories removed.`);

    // 3. Rename collection pret-edit to unstitched-edit
    await client.query(`
      UPDATE product_collection 
      SET title = 'Unstitched Luxury Edit', handle = 'unstitched-edit' 
      WHERE handle IN ('pret-edit', 'pret')
    `).catch(() => {});
    console.log(`[${targetName}] Collection unstitched-edit updated.`);

    // 4. Sync homepage_section from local to production
    for (const sec of localHomepageSections) {
      await client.query(`
        INSERT INTO homepage_section (key, type, title, subtitle, cta_text, cta_link, rank, is_active, settings, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
        ON CONFLICT (key) DO UPDATE
        SET type = EXCLUDED.type,
            title = EXCLUDED.title,
            subtitle = EXCLUDED.subtitle,
            cta_text = EXCLUDED.cta_text,
            cta_link = EXCLUDED.cta_link,
            rank = EXCLUDED.rank,
            is_active = EXCLUDED.is_active,
            settings = EXCLUDED.settings,
            updated_at = NOW()
      `, [
        sec.key,
        sec.type,
        sec.title,
        sec.subtitle,
        sec.cta_text,
        sec.cta_link,
        sec.rank,
        sec.is_active,
        JSON.stringify(sec.settings)
      ]);
    }
    console.log(`[${targetName}] Synced ${localHomepageSections.length} homepage sections with 100% unstitched configuration.`);

    // 5. Update Children category titles & descriptions to 100% Unstitched
    await client.query(`
      UPDATE product_category 
      SET name = 'Girls Unstitched Fabrics', description = 'Fine fabrics and handcrafted festive unstitched cuts for girls.'
      WHERE handle IN ('girls', 'girls-eastern', 'girls-unstitched')
    `);
    await client.query(`
      UPDATE product_category 
      SET name = 'Boys Unstitched Kurta Fabrics', description = 'Traditional unstitched kurta & shalwar fabrics and suit cuts for boys.'
      WHERE handle IN ('boys', 'boys-eastern', 'boys-unstitched')
    `);
    console.log(`[${targetName}] Children categories set to 100% Unstitched.`);

    await client.query('COMMIT');

    const finalCount = await client.query('SELECT count(*) FROM product');
    console.log(`✓ [${targetName}] SUCCESS! Final authentic unstitched products count: ${finalCount.rows[0].count}`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`✗ [${targetName}] Failed to sync:`, error);
    throw error;
  } finally {
    await client.end();
  }
}

async function run() {
  console.log('Connecting to local DB to extract reference data...');
  const local = new Client({ connectionString: LOCAL_URL });
  await local.connect();

  const prodRes = await local.query('SELECT id FROM product');
  const localProductIds = new Set(prodRes.rows.map(r => r.id));
  console.log(`Loaded ${localProductIds.size} local unstitched product IDs.`);

  const secRes = await local.query('SELECT key, type, title, subtitle, cta_text, cta_link, rank, is_active, settings FROM homepage_section');
  const localHomepageSections = secRes.rows;
  console.log(`Loaded ${localHomepageSections.length} local homepage sections.`);

  await local.end();

  // Sync Railway
  await syncTarget(RAILWAY_URL, 'Railway Live Production', localProductIds, localHomepageSections);

  // Sync Neon
  await syncTarget(NEON_URL, 'Neon Live Database', localProductIds, localHomepageSections);

  console.log('\n============================================================');
  console.log('🎉 ALL PRODUCTION LIVE DATABASES SUCCESSFULLY UPDATED TO 100% UNSTITCHED!');
  console.log('============================================================');
}

run().catch(e => {
  console.error('Fatal error during production sync:', e);
  process.exit(1);
});
