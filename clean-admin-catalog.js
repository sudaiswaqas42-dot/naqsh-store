const { Client } = require('pg');

const NEON_URL = 'postgresql://neondb_owner:npg_N5jy4HXSbDed@ep-delicate-bird-azhwwm8f-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
const RAILWAY_URL = 'postgresql://postgres:UYdliHHIlLqHXqgptVsUSlXqKUdMeqxD@reseau.proxy.rlwy.net:41305/railway';

async function updateDb(url, name) {
  console.log(`\n========================================`);
  console.log(`RUNNING CLEANUP ON: ${name}`);
  console.log(`========================================`);

  const client = new Client({ connectionString: url });
  await client.connect();

  try {
    await client.query('BEGIN');

    // 1. STORE CURRENCY: Keep ONLY 'pkr', remove 'usd' and 'eur'
    console.log('[1] Cleaning store currencies...');
    await client.query(`DELETE FROM store_currency WHERE currency_code IN ('usd', 'eur')`);
    await client.query(`UPDATE store_currency SET is_default = true WHERE currency_code = 'pkr'`);

    // 2. REGION CONSOLIDATION: Keep ONLY primary Pakistan region 'reg_01M3EW9A9FG35T1RVVX18VFGMF'
    console.log('[2] Consolidating regions...');
    const keepRegionId = 'reg_01M3EW9A9FG35T1RVVX18VFGMF';
    const removeRegionId = 'reg_01M3EW98QY2SGP87H13WFBDRM5';

    await client.query(`UPDATE cart SET region_id = $1 WHERE region_id = $2`, [keepRegionId, removeRegionId]).catch(() => {});
    await client.query(`UPDATE region SET name = 'Pakistan', currency_code = 'pkr' WHERE id = $1`, [keepRegionId]);
    await client.query(`DELETE FROM region WHERE id = $1`, [removeRegionId]).catch((e) => console.log('Region remove note:', e.message));

    // Also remove region-specific prices so ONLY currency PKR base price is used
    await client.query(`
      DELETE FROM price_rule 
      WHERE value = $1 OR value = $2
    `, [keepRegionId, removeRegionId]).catch(() => {});

    // Delete any USD prices from price table
    await client.query(`DELETE FROM price WHERE currency_code IN ('usd', 'eur')`).catch(() => {});

    // 3. CATEGORIES CLEANUP & REORGANIZATION (100% Unstitched)
    console.log('[3] Reorganizing categories to 100% Unstitched...');

    // Women top-level id: pcat_01M3EW9AGX87DJN0W7RP7Z6041
    const womenId = 'pcat_01M3EW9AGX87DJN0W7RP7Z6041';
    // Men top-level id: pcat_01M3EW9AGYE2YT2P17ZSGFVTB9
    const menId = 'pcat_01M3EW9AGYE2YT2P17ZSGFVTB9';
    // Kids top-level id: pcat_01M3EW9AH0GANVEYN4WGW0SM50
    const kidsId = 'pcat_01M3EW9AH0GANVEYN4WGW0SM50';
    // Sale top-level id: pcat_01M3EW9AH4V6S14CNHCRM6H2YK
    const saleId = 'pcat_01M3EW9AH4V6S14CNHCRM6H2YK';

    // Move Ladies unstitched subcategories DIRECTLY under Women
    const ladiesHandles = ['3pc', '2pc', 'silk', 'linen', 'dhanak', 'khaddar', 'karandi', 'embroidery-waly', 'printed'];
    await client.query(`
      UPDATE product_category 
      SET parent_category_id = $1, is_active = true 
      WHERE handle = ANY($2::text[])
    `, [womenId, ladiesHandles]);

    // Update Ladies subcategory readable names
    const ladiesNames = {
      '3pc': '3-Piece Luxury Unstitched',
      '2pc': '2-Piece Unstitched',
      'silk': 'Pure Silk',
      'linen': 'Fine Linen',
      'dhanak': 'Winter Dhanak',
      'khaddar': 'Handspun Khaddar',
      'karandi': 'Luxury Karandi',
      'embroidery-waly': 'Embroidery Waly Suits',
      'printed': 'Printed Lawn & Cuts'
    };
    for (const [h, n] of Object.entries(ladiesNames)) {
      await client.query(`UPDATE product_category SET name = $1 WHERE handle = $2`, [n, h]);
    }

    // Move Gents unstitched subcategories DIRECTLY under Men
    const gentsHandles = ['boski', 'italian', 'wash-wear', 'kamalia-khaddar', 'wool'];
    await client.query(`
      UPDATE product_category 
      SET parent_category_id = $1, is_active = true 
      WHERE handle = ANY($2::text[])
    `, [menId, gentsHandles]);

    // Update Gents subcategory readable names
    const gentsNames = {
      'boski': 'Pure Silk Boski',
      'italian': 'Italian Superfine',
      'wash-wear': 'Executive Wash & Wear',
      'kamalia-khaddar': 'Kamalia Khaddar',
      'wool': 'Winter Wool & Blends'
    };
    for (const [h, n] of Object.entries(gentsNames)) {
      await client.query(`UPDATE product_category SET name = $1 WHERE handle = $2`, [n, h]);
    }

    // Children: Move products from child categories to primary girls & boys
    const girlsPrimaryId = 'pcat_01M3EW9AKN2TK634D7T4SZS573';
    const boysPrimaryId = 'pcat_01M3EW9AKQY520YNZN4B7M0NQ6';

    await client.query(`
      INSERT INTO product_category_product (product_id, product_category_id)
      SELECT pcp.product_id, $1
      FROM product_category_product pcp
      JOIN product_category pc ON pcp.product_category_id = pc.id
      WHERE pc.handle IN ('girls-unstitched', 'girls-stitched')
      ON CONFLICT DO NOTHING
    `, [girlsPrimaryId]);

    await client.query(`
      INSERT INTO product_category_product (product_id, product_category_id)
      SELECT pcp.product_id, $1
      FROM product_category_product pcp
      JOIN product_category pc ON pcp.product_category_id = pc.id
      WHERE pc.handle IN ('boys-unstitched', 'boys-stitched')
      ON CONFLICT DO NOTHING
    `, [boysPrimaryId]);

    // Delete child stitched/unstitched duplicate sub-categories
    await client.query(`
      DELETE FROM product_category_product 
      WHERE product_category_id IN (
        SELECT id FROM product_category WHERE handle IN ('girls-unstitched', 'girls-stitched', 'boys-unstitched', 'boys-stitched', 'children')
      )
    `);
    await client.query(`
      DELETE FROM product_category 
      WHERE handle IN ('girls-unstitched', 'girls-stitched', 'boys-unstitched', 'boys-stitched', 'children')
    `);

    // Now update primary girls and boys categories
    await client.query(`
      UPDATE product_category 
      SET name = 'Girls Unstitched Fabrics', parent_category_id = $1, is_active = true, handle = 'girls' 
      WHERE id = $2
    `, [kidsId, girlsPrimaryId]);

    await client.query(`
      UPDATE product_category 
      SET name = 'Boys Unstitched Kurta Fabrics', parent_category_id = $1, is_active = true, handle = 'boys' 
      WHERE id = $2
    `, [kidsId, boysPrimaryId]);

    // Sale: Clearance & Special Offers
    await client.query(`
      UPDATE product_category 
      SET parent_category_id = $1, is_active = true 
      WHERE handle IN ('clearance', 'special-offers')
    `, [saleId]);

    // Re-link any products from obsolete categories to their respective parent (Women, Men, Kids)
    const womenObsoleteHandles = ['ready-to-wear', 'women-stitched', 'co-ords', 'festive-formals', 'women-unstitched'];
    const menObsoleteHandles = ['casual-men', 'kurta-shalwar', 'men-stitched', 'waistcoats', 'men-unstitched'];
    const kidsObsoleteHandles = [];
    const junkTopLevelHandles = ['shirts', 'sweatshirts', 'pants', 'merch', 'unstitched'];

    // Move products to Women
    await client.query(`
      INSERT INTO product_category_product (product_id, product_category_id)
      SELECT pcp.product_id, $1
      FROM product_category_product pcp
      JOIN product_category pc ON pcp.product_category_id = pc.id
      WHERE pc.handle = ANY($2::text[])
      ON CONFLICT DO NOTHING
    `, [womenId, womenObsoleteHandles]);

    // Move products to Men
    await client.query(`
      INSERT INTO product_category_product (product_id, product_category_id)
      SELECT pcp.product_id, $1
      FROM product_category_product pcp
      JOIN product_category pc ON pcp.product_category_id = pc.id
      WHERE pc.handle = ANY($2::text[])
      ON CONFLICT DO NOTHING
    `, [menId, menObsoleteHandles]);

    // Delete obsolete category links and categories
    const allToDeleteHandles = [
      ...junkTopLevelHandles,
      ...womenObsoleteHandles,
      ...menObsoleteHandles,
      ...kidsObsoleteHandles
    ];

    const catsToDelete = await client.query(
      `SELECT id FROM product_category WHERE handle = ANY($1::text[])`,
      [allToDeleteHandles]
    );
    const catIdsToDelete = catsToDelete.rows.map(r => r.id);

    if (catIdsToDelete.length > 0) {
      await client.query(
        `DELETE FROM product_category_product WHERE product_category_id = ANY($1::text[])`,
        [catIdsToDelete]
      );
      await client.query(
        `DELETE FROM product_category WHERE id = ANY($1::text[])`,
        [catIdsToDelete]
      );
      console.log(`Deleted ${catIdsToDelete.length} obsolete / stitched categories.`);
    }

    // 4. PRODUCT TYPES (Seed essential unstitched garment types)
    console.log('[4] Seeding product types...');
    const typesToSeed = [
      { id: 'ptyp_3pc_unstitched', value: '3-Piece Unstitched Suit' },
      { id: 'ptyp_2pc_unstitched', value: '2-Piece Unstitched Suit' },
      { id: 'ptyp_1pc_shirt', value: '1-Piece Shirt Fabric' },
      { id: 'ptyp_mens_suit', value: "Men's Unstitched Suit (4.5m)" },
      { id: 'ptyp_mens_kurta', value: "Men's Kurta Cut (2.5m)" },
      { id: 'ptyp_girls_festive', value: 'Girls Festive Unstitched Cut' },
      { id: 'ptyp_boys_kurta', value: 'Boys Kurta Unstitched Fabric' },
      { id: 'ptyp_shawl_dupatta', value: 'Shawl & Dupatta' },
    ];

    for (const t of typesToSeed) {
      await client.query(`
        INSERT INTO product_type (id, value, created_at, updated_at)
        VALUES ($1, $2, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET value = EXCLUDED.value
      `, [t.id, t.value]);
    }

    // 5. PRODUCT TAGS (Seed fabrics, styles, brands, seasons)
    console.log('[5] Seeding product tags...');
    const tagsToSeed = [
      // Fabrics
      'Lawn', 'Swiss Lawn', 'Chiffon', 'Silk', 'Jacquard', 'Organza', 
      'Khaddar', 'Cotton', 'Linen', 'Karandi', 'Dhanak', 'Boski', 
      'Wash & Wear', 'Latha', 'Wool',
      // Crafts / Styles
      'Embroidered', 'Digital Print', 'Handloom', 'Zari Work', 'Mirror Work', 
      'Festive', 'Luxury Lawn', 'Daily Wear', 'Formal',
      // Brands (For effortless Brand Page assignment)
      'Khaadi', 'Sapphire', 'Gul Ahmed', 'J. Junaid Jamshed', 'Alkaram', 'Limelight',
      // Seasons
      "Summer '25", "Winter '25", "Eid Collection"
    ];

    for (const tag of tagsToSeed) {
      const tagId = 'ptag_' + tag.toLowerCase().replace(/[^a-z0-9]/g, '_');
      await client.query(`
        INSERT INTO product_tag (id, value, created_at, updated_at)
        VALUES ($1, $2, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET value = EXCLUDED.value
      `, [tagId, tag]);
    }

    // 6. ENSURE NO DEFAULT PRESET COLORS (All options exclusive, no dummy presets)
    console.log('[6] Enforcing exclusive options and removing dummy color presets...');
    await client.query(`UPDATE product_option SET is_exclusive = true WHERE is_exclusive = false`);
    await client.query(`
      DELETE FROM product_option_value 
      WHERE id IN (
        SELECT pov.id
        FROM product_option_value pov
        LEFT JOIN product_variant_option pvo ON pvo.option_value_id = pov.id
        LEFT JOIN product_product_option_value ppov ON ppov.product_option_value_id = pov.id
        WHERE pvo.variant_id IS NULL AND ppov.id IS NULL
      )
    `);
    console.log(`Enforced exclusive options and cleaned dummy color presets.`);

    // 7. COLLECTIONS (Add Brand Collections & Clean unstitched edit)
    console.log('[7] Updating collections...');
    await client.query(`
      UPDATE product_collection 
      SET title = 'Unstitched Luxury Edit', handle = 'unstitched-edit' 
      WHERE handle IN ('pret-edit', 'pret')
    `).catch(() => {});

    const brandCollections = [
      { id: 'pcol_khaadi', title: 'Khaadi', handle: 'khaadi' },
      { id: 'pcol_sapphire', title: 'Sapphire', handle: 'sapphire' },
      { id: 'pcol_gul_ahmed', title: 'Gul Ahmed', handle: 'gul-ahmed' },
      { id: 'pcol_j_dot', title: 'J. Junaid Jamshed', handle: 'j-dot' },
      { id: 'pcol_alkaram', title: 'Alkaram Studio', handle: 'alkaram' },
      { id: 'pcol_limelight', title: 'Limelight', handle: 'limelight' },
    ];

    for (const bc of brandCollections) {
      await client.query(`
        INSERT INTO product_collection (id, title, handle, created_at, updated_at)
        VALUES ($1, $2, $3, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, handle = EXCLUDED.handle
      `, [bc.id, bc.title, bc.handle]);
    }

    await client.query('COMMIT');
    console.log(`✓ [${name}] CLEANUP & SEEDING COMPLETED SUCCESSFULLY!`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`✗ [${name}] FAILED:`, error);
    throw error;
  } finally {
    await client.end();
  }
}

async function run() {
  await updateDb(NEON_URL, 'Neon Live Database');
  await updateDb(RAILWAY_URL, 'Railway Live Database');
  console.log('\n============================================================');
  console.log('🎉 ALL DATABASES PERFECTLY CLEANED AND SEEDED!');
  console.log('============================================================');
}

run().catch(console.error);
