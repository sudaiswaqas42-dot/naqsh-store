const { Client } = require('pg');

const NEON_URL = 'postgresql://neondb_owner:npg_N5jy4HXSbDed@ep-delicate-bird-azhwwm8f-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
const RAILWAY_URL = 'postgresql://postgres:UYdliHHIlLqHXqgptVsUSlXqKUdMeqxD@reseau.proxy.rlwy.net:41305/railway';

async function refactorDatabase(url, name) {
  console.log(`\n======================================================`);
  console.log(`STARTING MASTER CATALOG REFACTOR ON: ${name}`);
  console.log(`======================================================`);

  const client = new Client({ connectionString: url });
  await client.connect();

  try {
    await client.query('BEGIN');

    // =========================================================================
    // STEP 1: DELETE ALL STITCHED AND USELESS / DEMO PRODUCTS
    // =========================================================================
    console.log('[1] Identifying stitched & demo products to delete...');
    const junkProductsRes = await client.query(`
      SELECT id FROM product 
      WHERE handle LIKE 'nq-women-stitched-%' 
         OR handle LIKE 'nq-men-stitched-%'
         OR handle IN ('shorts', 'sweatshirt', 'sweatpants', 't-shirt')
         OR handle LIKE 't-shirt%'
    `);
    const junkProductIds = junkProductsRes.rows.map(r => r.id);
    console.log(`Found ${junkProductIds.length} stitched/demo products to delete.`);

    if (junkProductIds.length > 0) {
      // Find variant IDs
      const varRes = await client.query(`
        SELECT id FROM product_variant WHERE product_id = ANY($1::text[])
      `, [junkProductIds]);
      const variantIds = varRes.rows.map(r => r.id);
      console.log(`Found ${variantIds.length} associated variants to delete.`);

      if (variantIds.length > 0) {
        // Delete variant price set links and prices
        const pvpsRes = await client.query(`
          SELECT price_set_id FROM product_variant_price_set WHERE variant_id = ANY($1::text[])
        `, [variantIds]);
        const priceSetIds = pvpsRes.rows.map(r => r.price_set_id);

        await client.query(`DELETE FROM product_variant_price_set WHERE variant_id = ANY($1::text[])`, [variantIds]);
        if (priceSetIds.length > 0) {
          await client.query(`DELETE FROM price WHERE price_set_id = ANY($1::text[])`, [priceSetIds]);
          await client.query(`DELETE FROM price_set WHERE id = ANY($1::text[])`, [priceSetIds]);
        }

        // Delete variant inventory links
        await client.query(`DELETE FROM product_variant_inventory_item WHERE variant_id = ANY($1::text[])`, [variantIds]).catch(() => {});
        // Delete variant option values
        await client.query(`DELETE FROM product_variant_option WHERE variant_id = ANY($1::text[])`, [variantIds]);
        // Delete variant image links
        await client.query(`DELETE FROM product_variant_product_image WHERE variant_id = ANY($1::text[])`, [variantIds]).catch(() => {});
        // Delete cart line items / order line items if any
        await client.query(`DELETE FROM cart_line_item WHERE variant_id = ANY($1::text[])`, [variantIds]).catch(() => {});
        await client.query(`DELETE FROM order_line_item WHERE variant_id = ANY($1::text[])`, [variantIds]).catch(() => {});

        // Delete variants
        await client.query(`DELETE FROM product_variant WHERE id = ANY($1::text[])`, [variantIds]);
      }

      // Delete product tags, category links, images, options
      await client.query(`DELETE FROM product_tags WHERE product_id = ANY($1::text[])`, [junkProductIds]);
      await client.query(`DELETE FROM product_category_product WHERE product_id = ANY($1::text[])`, [junkProductIds]);
      await client.query(`DELETE FROM image WHERE product_id = ANY($1::text[])`, [junkProductIds]);
      await client.query(`DELETE FROM product_product_option WHERE product_id = ANY($1::text[])`, [junkProductIds]);

      // Delete products
      await client.query(`DELETE FROM product WHERE id = ANY($1::text[])`, [junkProductIds]);
      console.log(`Successfully deleted ${junkProductIds.length} stitched/demo products!`);
    }

    // =========================================================================
    // STEP 2: CATEGORY HIERARCHY (100% UNSTITCHED + BRANDS + GIRLS & BOYS)
    // =========================================================================
    console.log('[2] Rebuilding complete Category Hierarchy...');

    const womenId = 'pcat_01M3EW9AGX87DJN0W7RP7Z6041';
    const menId = 'pcat_01M3EW9AGYE2YT2P17ZSGFVTB9';
    const kidsId = 'pcat_01M3EW9AH0GANVEYN4WGW0SM50';
    const saleId = 'pcat_01M3EW9AH4V6S14CNHCRM6H2YK';
    const brandsRootId = 'pcat_brands_root';

    // Helper to upsert category
    async function upsertCat(id, name, handle, desc, parentId, rank = 0) {
      await client.query(`
        INSERT INTO product_category (id, name, handle, description, parent_category_id, rank, is_active, is_internal, mpath)
        VALUES ($1, $2, $3, $4, $5, $6, true, false, $1)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          handle = EXCLUDED.handle,
          description = EXCLUDED.description,
          parent_category_id = EXCLUDED.parent_category_id,
          rank = EXCLUDED.rank,
          is_active = true,
          is_internal = false
      `, [id, name, handle, desc, parentId, rank]);
    }

    // Top-Level Categories
    await upsertCat(womenId, 'Women', 'women', '100% Unstitched Ladies Fabrics, Luxury Suits & Shawls', null, 0);
    await upsertCat(menId, 'Men', 'men', '100% Unstitched Gents Fabrics, Pure Boski & Latha Cuts', null, 1);
    await upsertCat(kidsId, 'Kids', 'kids', 'Unstitched Eastern Fabrics for Girls & Boys', null, 2);
    await upsertCat(saleId, 'Sale', 'sale', 'Exclusive Sale on Unstitched Fabrics', null, 3);
    await upsertCat(brandsRootId, 'Brands & Designer Labels', 'brands', 'Original Pakistani Designer Unstitched Collections', null, 4);

    // --- WOMEN SUBCATEGORIES ---
    const womenSubs = [
      { id: 'pcat_ladies_3pc', name: '3-Piece Luxury Unstitched', handle: '3pc', desc: 'Embroidered shirt, dupatta & trouser fabric' },
      { id: 'pcat_ladies_2pc', name: '2-Piece Unstitched', handle: '2pc', desc: 'Shirt & dupatta / Shirt & trouser cuts' },
      { id: 'pcat_ladies_silk', name: 'Pure Silk', handle: 'silk', desc: 'Pure raw silk & banarsi 3-piece fabrics' },
      { id: 'pcat_ladies_linen', name: 'Fine Linen', handle: 'linen', desc: 'Breathable textured unstitched linen' },
      { id: 'pcat_ladies_dhanak', name: 'Winter Dhanak', handle: 'dhanak', desc: 'Warm brushed winter dhanak fabrics' },
      { id: 'pcat_ladies_khaddar', name: 'Handspun Khaddar', handle: 'khaddar', desc: 'Authentic textured cotton khaddar' },
      { id: 'pcat_ladies_karandi', name: 'Luxury Karandi', handle: 'karandi', desc: 'Classic winter karandi weave' },
      { id: 'pcat_ladies_embroidery_waly', name: 'Embroidery Waly Suits', handle: 'embroidery-waly', desc: 'Heavy tilla & resham embroidered unstitched cuts' },
      { id: 'pcat_ladies_printed', name: 'Printed Lawn & Cuts', handle: 'printed', desc: 'High-definition digital floral prints' }
    ];
    for (let i = 0; i < womenSubs.length; i++) {
      const s = womenSubs[i];
      await upsertCat(s.id, s.name, s.handle, s.desc, womenId, i);
    }

    // --- MEN SUBCATEGORIES ---
    const menSubs = [
      { id: 'pcat_gents_boski', name: 'Pure Silk Boski', handle: 'boski', desc: 'Heirloom 6-pound pure silk boski 4-meter cuts' },
      { id: 'pcat_gents_italian', name: 'Italian Superfine', handle: 'italian', desc: 'Imported high-twist combed cotton suit lengths' },
      { id: 'pcat_gents_wash_wear', name: 'Executive Wash & Wear', handle: 'wash-wear', desc: 'Wrinkle-free micro-poly fabric for men' },
      { id: 'pcat_gents_kamalia_khaddar', name: 'Kamalia Khaddar', handle: 'kamalia-khaddar', desc: 'Handspun authentic Kamalia cotton khaddar 7-meter suit lengths' },
      { id: 'pcat_gents_wool', name: 'Winter Wool & Blends', handle: 'wool', desc: 'Warm blended wool and merino winter cuts' }
    ];
    for (let i = 0; i < menSubs.length; i++) {
      const s = menSubs[i];
      await upsertCat(s.id, s.name, s.handle, s.desc, menId, i);
    }

    // --- KIDS (GIRLS & BOYS) SUBCATEGORIES ---
    const girlsId = 'pcat_01M3EW9AKN2TK634D7T4SZS573';
    const boysId = 'pcat_01M3EW9AKQY520YNZN4B7M0NQ6';
    await upsertCat(girlsId, 'Girls Unstitched Fabrics', 'girls', 'Unstitched festive & daily cuts for girls', kidsId, 0);
    await upsertCat(boysId, 'Boys Unstitched Kurta Fabrics', 'boys', 'Unstitched kurta & shalwar cuts for boys', kidsId, 1);

    // Subcategories under Girls (Ladies cuts for Girls)
    const girlsSubs = [
      { id: 'pcat_girls_3pc', name: 'Girls 3-Piece Unstitched', handle: 'girls-3pc', desc: 'Complete 3-piece unstitched festive suit for girls' },
      { id: 'pcat_girls_2pc', name: 'Girls 2-Piece Unstitched', handle: 'girls-2pc', desc: 'Coordinated unstitched frock & trousers cut' },
      { id: 'pcat_girls_silk', name: 'Girls Pure Silk & Chiffon', handle: 'girls-silk', desc: 'Festive silk and chiffon unstitched fabric' },
      { id: 'pcat_girls_embroidery', name: 'Girls Festive Embroidery Suits', handle: 'girls-embroidery', desc: 'Zari and resham embroidered girls fabric' },
      { id: 'pcat_girls_printed', name: 'Girls Printed Lawn Cuts', handle: 'girls-printed', desc: 'Gentle floral prints on soft lawn' },
      { id: 'pcat_girls_linen', name: 'Girls Soft Linen & Dhanak', handle: 'girls-linen', desc: 'Warm gentle winter cuts for girls' }
    ];
    for (let i = 0; i < girlsSubs.length; i++) {
      const s = girlsSubs[i];
      await upsertCat(s.id, s.name, s.handle, s.desc, girlsId, i);
    }

    // Subcategories under Boys (Gents cuts for Boys)
    const boysSubs = [
      { id: 'pcat_boys_boski', name: 'Boys Pure Silk Boski', handle: 'boys-boski', desc: 'Pure silk heirloom kurta cuts for young boys' },
      { id: 'pcat_boys_wash_wear', name: 'Boys Executive Wash & Wear', handle: 'boys-wash-wear', desc: 'Wrinkle-resistant durable kurta pajama fabric' },
      { id: 'pcat_boys_kurta', name: 'Boys Traditional Kurta Fabric', handle: 'boys-kurta', desc: 'Classic cotton kurta fabric cuts' },
      { id: 'pcat_boys_khaddar', name: 'Boys Kamalia Khaddar', handle: 'boys-khaddar', desc: 'Authentic cotton winter khaddar for boys' },
      { id: 'pcat_boys_wool', name: 'Boys Winter Wool Blend', handle: 'boys-wool', desc: 'Warm winter fabric for boys waistcoats & kurtas' }
    ];
    for (let i = 0; i < boysSubs.length; i++) {
      const s = boysSubs[i];
      await upsertCat(s.id, s.name, s.handle, s.desc, boysId, i);
    }

    // --- SALE SUBCATEGORIES ---
    const saleSubs = [
      { id: 'pcat_sale_women', name: 'Ladies Unstitched Sale', handle: 'sale-women', desc: 'Special discounts on Women unstitched fabrics' },
      { id: 'pcat_sale_men', name: 'Gents Unstitched Sale', handle: 'sale-men', desc: 'Special discounts on Men unstitched fabrics' },
      { id: 'pcat_01M3EW9AKXGM7NG6EV4ZWEJ9ME', name: 'Clearance Unstitched Cuts', handle: 'clearance', desc: 'Final markdowns on end-of-season cuts' },
      { id: 'pcat_01M3EW9AKXZXVTMN34FYFH4MVY', name: 'Special Festive Offers', handle: 'special-offers', desc: 'Limited edition festive bundle offers' }
    ];
    for (let i = 0; i < saleSubs.length; i++) {
      const s = saleSubs[i];
      await upsertCat(s.id, s.name, s.handle, s.desc, saleId, i);
    }

    // --- BRANDS & DESIGNER LABELS HIERARCHY ---
    const brandsData = [
      {
        id: 'pcat_brand_khaadi',
        name: 'Khaadi',
        handle: 'brand-khaadi',
        desc: 'Khaadi Original Unstitched Fabrics',
        women: [
          { id: 'pcat_khaadi_women_3pc', name: 'Khaadi 3-Piece Luxury Unstitched', handle: 'khaadi-women-3pc' },
          { id: 'pcat_khaadi_women_2pc', name: 'Khaadi 2-Piece Printed Cuts', handle: 'khaadi-women-2pc' },
          { id: 'pcat_khaadi_women_printed', name: 'Khaadi Signature Lawn', handle: 'khaadi-women-printed' },
          { id: 'pcat_khaadi_women_embroidery', name: 'Khaadi Embroidered Edit', handle: 'khaadi-women-embroidery' }
        ],
        men: [
          { id: 'pcat_khaadi_men_wash_wear', name: 'Khaadi Executive Wash & Wear', handle: 'khaadi-men-wash-wear' },
          { id: 'pcat_khaadi_men_cotton', name: 'Khaadi Pure Cotton Kurta Cut', handle: 'khaadi-men-cotton' }
        ]
      },
      {
        id: 'pcat_brand_sapphire',
        name: 'Sapphire',
        handle: 'brand-sapphire',
        desc: 'Sapphire Unstitched Lawn & Silk Collections',
        women: [
          { id: 'pcat_sapphire_women_3pc', name: 'Sapphire 3-Piece Luxury Unstitched', handle: 'sapphire-women-3pc' },
          { id: 'pcat_sapphire_women_silk', name: 'Sapphire Silk Dupatta Sets', handle: 'sapphire-women-silk' },
          { id: 'pcat_sapphire_women_lawn', name: 'Sapphire Daily Lawn Prints', handle: 'sapphire-women-lawn' }
        ],
        men: [
          { id: 'pcat_sapphire_men_wash_wear', name: 'Sapphire Classic Wash & Wear', handle: 'sapphire-men-wash-wear' },
          { id: 'pcat_sapphire_men_boski', name: 'Sapphire Pure Silk Boski', handle: 'sapphire-men-boski' }
        ]
      },
      {
        id: 'pcat_brand_gul_ahmed',
        name: 'Gul Ahmed',
        handle: 'brand-gul-ahmed',
        desc: 'Gul Ahmed Original Lawn & Chairman Latha',
        women: [
          { id: 'pcat_gul_ahmed_women_3pc', name: 'Gul Ahmed 3-Piece Luxury Lawn', handle: 'gul-ahmed-women-3pc' },
          { id: 'pcat_gul_ahmed_women_karandi', name: 'Gul Ahmed Karandi & Khaddar', handle: 'gul-ahmed-women-karandi' }
        ],
        men: [
          { id: 'pcat_gul_ahmed_men_cotton', name: 'Gul Ahmed Chairman Latha & Cotton', handle: 'gul-ahmed-men-cotton' },
          { id: 'pcat_gul_ahmed_men_wool', name: 'Gul Ahmed Winter Wool Blends', handle: 'gul-ahmed-men-wool' }
        ]
      },
      {
        id: 'pcat_brand_j_dot',
        name: 'J. Junaid Jamshed',
        handle: 'brand-j-dot',
        desc: 'J. Traditional Heirloom Unstitched Fabrics',
        women: [
          { id: 'pcat_j_dot_women_3pc', name: 'J. 3-Piece Embroidered Unstitched', handle: 'j-dot-women-3pc' },
          { id: 'pcat_j_dot_women_silk', name: 'J. Cast & Silk Collection', handle: 'j-dot-women-silk' }
        ],
        men: [
          { id: 'pcat_j_dot_men_boski', name: 'J. Pure Silk Heirloom Boski', handle: 'j-dot-men-boski' },
          { id: 'pcat_j_dot_men_kamalia', name: 'J. Kamalia Khaddar 7-Meter Suit', handle: 'j-dot-men-kamalia' },
          { id: 'pcat_j_dot_men_wash_wear', name: 'J. Executive Wash & Wear', handle: 'j-dot-men-wash-wear' }
        ]
      },
      {
        id: 'pcat_brand_alkaram',
        name: 'Alkaram Studio',
        handle: 'brand-alkaram',
        desc: 'Alkaram Studio Premium Unstitched Weaves',
        women: [
          { id: 'pcat_alkaram_women_3pc', name: 'Alkaram 3-Piece Luxury Lawn', handle: 'alkaram-women-3pc' },
          { id: 'pcat_alkaram_women_linen', name: 'Alkaram Fine Linen & Dhanak', handle: 'alkaram-women-linen' }
        ],
        men: [
          { id: 'pcat_alkaram_men_italian', name: 'Alkaram Italian Superfine Cotton', handle: 'alkaram-men-italian' },
          { id: 'pcat_alkaram_men_wash_wear', name: 'Alkaram Micro Poly Wash & Wear', handle: 'alkaram-men-wash-wear' }
        ]
      },
      {
        id: 'pcat_brand_limelight',
        name: 'Limelight',
        handle: 'brand-limelight',
        desc: 'Limelight Contemporary Unstitched Cuts',
        women: [
          { id: 'pcat_limelight_women_2pc', name: 'Limelight 2-Piece Printed Cuts', handle: 'limelight-women-2pc' },
          { id: 'pcat_limelight_women_3pc', name: 'Limelight Jacquard & Silk Edits', handle: 'limelight-women-3pc' }
        ],
        men: [
          { id: 'pcat_limelight_men_wash_wear', name: 'Limelight Easy-Care Wash & Wear', handle: 'limelight-men-wash-wear' },
          { id: 'pcat_limelight_men_kurta', name: 'Limelight Classic Kurta Fabrics', handle: 'limelight-men-kurta' }
        ]
      }
    ];

    for (let bIdx = 0; bIdx < brandsData.length; bIdx++) {
      const b = brandsData[bIdx];
      // Insert Brand category under Brands Root
      await upsertCat(b.id, b.name, b.handle, b.desc, brandsRootId, bIdx);

      // Brand Women Category
      const bWomenId = `${b.id}_women`;
      await upsertCat(bWomenId, `${b.name} Ladies Unstitched`, `${b.handle}-women`, `${b.name} Ladies Unstitched Fabrics`, b.id, 0);
      for (let wIdx = 0; wIdx < b.women.length; wIdx++) {
        const ws = b.women[wIdx];
        await upsertCat(ws.id, ws.name, ws.handle, `${ws.name} by ${b.name}`, bWomenId, wIdx);
      }

      // Brand Men Category
      const bMenId = `${b.id}_men`;
      await upsertCat(bMenId, `${b.name} Gents Unstitched`, `${b.handle}-men`, `${b.name} Gents Unstitched Fabrics`, b.id, 1);
      for (let mIdx = 0; mIdx < b.men.length; mIdx++) {
        const ms = b.men[mIdx];
        await upsertCat(ms.id, ms.name, ms.handle, `${ms.name} by ${b.name}`, bMenId, mIdx);
      }
    }

    // --- RECOMPUTE MPATH FOR ALL CATEGORIES ---
    console.log('[3] Calculating materialized path (mpath) for complete hierarchy...');
    const allCats = await client.query('SELECT id, parent_category_id FROM product_category');
    const catMap = new Map();
    allCats.rows.forEach(c => catMap.set(c.id, c.parent_category_id));

    function getMpath(id) {
      const parts = [id];
      let cur = catMap.get(id);
      while (cur) {
        parts.unshift(cur);
        cur = catMap.get(cur);
      }
      return parts.join('.');
    }

    for (const c of allCats.rows) {
      const mpath = getMpath(c.id);
      await client.query('UPDATE product_category SET mpath = $1 WHERE id = $2', [mpath, c.id]);
    }
    console.log(`Updated mpath for all ${allCats.rows.length} categories.`);

    // =========================================================================
    // STEP 3: PARTITION AUTHENTIC UNSTITCHED PRODUCTS ACROSS BRANDS & COLLECTIONS
    // =========================================================================
    console.log('[4] Partitioning authentic unstitched products across Brands and Collections...');

    // Fetch all remaining authentic products
    const womenProdsRes = await client.query(`
      SELECT id, title, handle FROM product WHERE handle LIKE 'nq-women-unstitched-%' ORDER BY id
    `);
    const menProdsRes = await client.query(`
      SELECT id, title, handle FROM product WHERE handle LIKE 'nq-men-unstitched-%' ORDER BY id
    `);
    const childrenProdsRes = await client.query(`
      SELECT id, title, handle FROM product WHERE handle LIKE 'nq-children-%' ORDER BY id
    `);

    const womenProds = womenProdsRes.rows;
    const menProds = menProdsRes.rows;
    const childrenProds = childrenProdsRes.rows;

    console.log(`Available authentic products: Women=${womenProds.length}, Men=${menProds.length}, Children=${childrenProds.length}`);

    // Helper: Link products to category in bulk
    async function linkCat(prodIds, catId) {
      if (!prodIds || !prodIds.length) return;
      await client.query(`
        INSERT INTO product_category_product (product_id, product_category_id)
        SELECT pid, $2 FROM unnest($1::text[]) AS pid
        ON CONFLICT DO NOTHING
      `, [prodIds, catId]);
    }

    // Helper: Link products to tag in bulk
    async function linkTag(prodIds, tagId) {
      if (!prodIds || !prodIds.length) return;
      await client.query(`
        INSERT INTO product_tags (product_id, product_tag_id)
        SELECT pid, $2 FROM unnest($1::text[]) AS pid
        ON CONFLICT DO NOTHING
      `, [prodIds, tagId]);
    }

    // Ensure ptag_j_dot exists as alias too
    await client.query(`
      INSERT INTO product_tag (id, value) 
      VALUES ('ptag_j_dot', 'J. Junaid Jamshed') 
      ON CONFLICT DO NOTHING
    `);

    // Brand tag IDs
    const brandTags = {
      'pcol_khaadi': 'ptag_khaadi',
      'pcol_sapphire': 'ptag_sapphire',
      'pcol_gul_ahmed': 'ptag_gul_ahmed',
      'pcol_j_dot': 'ptag_j__junaid_jamshed',
      'pcol_alkaram': 'ptag_alkaram',
      'pcol_limelight': 'ptag_limelight'
    };

    // Partition Women products among 6 brands (approx 150 each) + Atelier
    const brandColKeys = [
      'pcol_khaadi',
      'pcol_sapphire',
      'pcol_gul_ahmed',
      'pcol_j_dot',
      'pcol_alkaram',
      'pcol_limelight'
    ];

    const womenPerBrand = Math.floor(womenProds.length / 7);
    const menPerBrand = Math.floor(menProds.length / 7);

    for (let b = 0; b < brandColKeys.length; b++) {
      const colId = brandColKeys[b];
      const tagId = brandTags[colId];
      const bData = brandsData[b];

      // Assign Women unstitched chunk
      const bWomenProds = womenProds.slice(b * womenPerBrand, (b + 1) * womenPerBrand);
      const bWomenIds = bWomenProds.map(p => p.id);
      await client.query(`UPDATE product SET collection_id = $1 WHERE id = ANY($2::text[])`, [colId, bWomenIds]);
      await linkTag(bWomenIds, tagId);
      await linkCat(bWomenIds, `${bData.id}_women`);
      // Distribute to brand women subcategories
      for (let s = 0; s < bData.women.length; s++) {
        const subCat = bData.women[s];
        const subIds = bWomenIds.filter((_, idx) => idx % bData.women.length === s);
        await linkCat(subIds, subCat.id);
      }

      // Assign Men unstitched chunk
      const bMenProds = menProds.slice(b * menPerBrand, (b + 1) * menPerBrand);
      const bMenIds = bMenProds.map(p => p.id);
      await linkTag(bMenIds, tagId);
      await linkCat(bMenIds, `${bData.id}_men`);
      // Distribute to brand men subcategories
      for (let s = 0; s < bData.men.length; s++) {
        const subCat = bData.men[s];
        const subIds = bMenIds.filter((_, idx) => idx % bData.men.length === s);
        await linkCat(subIds, subCat.id);
      }

      console.log(`Brand ${bData.name}: Assigned ${bWomenIds.length} Ladies and ${bMenIds.length} Gents cards.`);
    }

    // Remaining Women & Men products assigned to Seasonal Collections
    const atelierWomen = womenProds.slice(6 * womenPerBrand);
    const atelierMen = menProds.slice(6 * menPerBrand);

    const summerCol = 'pcol_01M3EW9AMZVBG5B2NTDTB82R20'; // Summer Lawn '25
    const festiveCol = 'pcol_01M3EW9AN0HPT5N86V8VD3XMBH'; // Festive Formals
    const bestsellersCol = 'pcol_01M3EW9AN0H0SHFZCG3EX8K3T6'; // Bestsellers
    const luxuryCol = 'pcol_01M3EW9AN0N3S3NXBXRFR0SP4Q'; // Unstitched Luxury Edit

    // Assign collections to remaining products
    const atelierWomenIds = atelierWomen.map(p => p.id);
    const splitW = Math.floor(atelierWomenIds.length / 4);
    await client.query(`UPDATE product SET collection_id = $1 WHERE id = ANY($2::text[])`, [summerCol, atelierWomenIds.slice(0, splitW)]);
    await client.query(`UPDATE product SET collection_id = $1 WHERE id = ANY($2::text[])`, [festiveCol, atelierWomenIds.slice(splitW, splitW * 2)]);
    await client.query(`UPDATE product SET collection_id = $1 WHERE id = ANY($2::text[])`, [bestsellersCol, atelierWomenIds.slice(splitW * 2, splitW * 3)]);
    await client.query(`UPDATE product SET collection_id = $1 WHERE id = ANY($2::text[])`, [luxuryCol, atelierWomenIds.slice(splitW * 3)]);

    // Link ALL Women products to top-level Women & respective fabric categories
    const allWomenIds = womenProds.map(p => p.id);
    await linkCat(allWomenIds, womenId);
    for (let s = 0; s < womenSubs.length; s++) {
      const sub = womenSubs[s];
      const slice = allWomenIds.filter((_, i) => i % womenSubs.length === s);
      await linkCat(slice, sub.id);
    }

    // Link ALL Men products to top-level Men & respective fabric categories
    const allMenIds = menProds.map(p => p.id);
    await linkCat(allMenIds, menId);
    for (let s = 0; s < menSubs.length; s++) {
      const sub = menSubs[s];
      const slice = allMenIds.filter((_, i) => i % menSubs.length === s);
      await linkCat(slice, sub.id);
    }

    // Distribute Children products to Girls and Boys
    const girlsProds = childrenProds.slice(0, Math.floor(childrenProds.length / 2));
    const boysProds = childrenProds.slice(Math.floor(childrenProds.length / 2));
    const girlsIds = girlsProds.map(p => p.id);
    const boysIds = boysProds.map(p => p.id);

    await linkCat(girlsIds, kidsId);
    await linkCat(girlsIds, girlsId);
    for (let s = 0; s < girlsSubs.length; s++) {
      const sub = girlsSubs[s];
      const slice = girlsIds.filter((_, i) => i % girlsSubs.length === s);
      await linkCat(slice, sub.id);
    }

    await linkCat(boysIds, kidsId);
    await linkCat(boysIds, boysId);
    for (let s = 0; s < boysSubs.length; s++) {
      const sub = boysSubs[s];
      const slice = boysIds.filter((_, i) => i % boysSubs.length === s);
      await linkCat(slice, sub.id);
    }
    console.log(`Children partitioned: Girls=${girlsIds.length}, Boys=${boysIds.length}`);

    // Link Sale Products
    const saleWomenIds = allWomenIds.slice(0, 150);
    const saleMenIds = allMenIds.slice(0, 100);
    await linkCat([...saleWomenIds, ...saleMenIds], saleId);
    await linkCat(saleWomenIds, 'pcat_sale_women');
    await linkCat(saleMenIds, 'pcat_sale_men');
    await linkCat(saleWomenIds.slice(0, 50), 'pcat_01M3EW9AKXGM7NG6EV4ZWEJ9ME'); // Clearance
    await linkCat(saleMenIds.slice(0, 50), 'pcat_01M3EW9AKXZXVTMN34FYFH4MVY'); // Special Offers

    // =========================================================================
    // STEP 4: ENSURE SINGLE PKR PRICING FIELD IN ADMIN
    // =========================================================================
    console.log('[5] Ensuring 100% clean PKR pricing...');
    await client.query(`DELETE FROM store_currency WHERE currency_code != 'pkr'`);
    await client.query(`UPDATE store_currency SET is_default = true WHERE currency_code = 'pkr'`);

    await client.query('COMMIT');
    console.log(`\n>>> MASTER CATALOG REFACTOR COMPLETED SUCCESSFULLY ON ${name} <<<\n`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`ERROR ON ${name}:`, err);
    throw err;
  } finally {
    await client.end();
  }
}

(async () => {
  try {
    await refactorDatabase(NEON_URL, 'NEON_DB');
    await refactorDatabase(RAILWAY_URL, 'RAILWAY_DB');
    console.log('ALL DATABASES SUCCESSFULLY REFACTORED AND SYNCHRONIZED!');
  } catch (e) {
    console.error('Migration failed:', e);
    process.exit(1);
  }
})();
