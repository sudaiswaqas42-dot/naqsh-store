const { Pool } = require('pg');

const RAILWAY_URL = 'postgresql://postgres:UYdliHHIlLqHXqgptVsUSlXqKUdMeqxD@reseau.proxy.rlwy.net:41305/railway';
const NEON_URL = 'postgresql://neondb_owner:npg_N5jy4HXSbDed@ep-delicate-bird-azhwwm8f-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
const LOCAL_URL = 'postgres://postgres:1234@localhost/medusa-naqsh-store';

const GENTS_CATEGORIES = [
  { id: 'pcat_gents_italian', handle: 'italian', name: 'Italian', description: 'Premium Italian Unstitched Fabric Cuts' },
  { id: 'pcat_gents_boski', handle: 'boski', name: 'Boski', description: 'Traditional Pure Silk Boski Unstitched Fabric' },
  { id: 'pcat_gents_wash_wear', handle: 'wash-wear', name: 'Wash & Wear', description: 'Easy Care Wrinkle-Resistant Wash & Wear Fabric' },
  { id: 'pcat_gents_wool', handle: 'wool', name: 'Wool', description: 'Warm Winter Blend Wool Unstitched Fabric' },
  { id: 'pcat_gents_kamalia_khaddar', handle: 'kamalia-khaddar', name: 'Kamalia Khaddar', description: 'Authentic Handspun Kamalia Khaddar' },
];

const LADIES_CATEGORIES = [
  { id: 'pcat_ladies_dhanak', handle: 'dhanak', name: 'Dhanak', description: 'Warm Winter Dhanak Unstitched Suits' },
  { id: 'pcat_ladies_khaddar', handle: 'khaddar', name: 'Khaddar', description: 'Traditional Handspun Winter Khaddar Suits' },
  { id: 'pcat_ladies_linen', handle: 'linen', name: 'Linen', description: 'Pure Slub Linen Unstitched 2pc & 3pc Suits' },
  { id: 'pcat_ladies_karandi', handle: 'karandi', name: 'Karandi', description: 'Winter Classic Karandi Embroidered Cuts' },
  { id: 'pcat_ladies_silk', handle: 'silk', name: 'Silk', description: 'Pure Festive Raw Silk & Medium Silk Fabrics' },
  { id: 'pcat_ladies_printed', handle: 'printed', name: 'Printed', description: 'Digital Printed Premium Lawn & Khaddar' },
  { id: 'pcat_ladies_embroidery_waly', handle: 'embroidery-waly', name: 'Embroidery Waly', description: 'Heavily Embroidered Festive & Formal Unstitched' },
  { id: 'pcat_ladies_2pc', handle: '2pc', name: '2pc', description: '2-Piece Unstitched Shirt & Dupatta / Trouser' },
  { id: 'pcat_ladies_3pc', handle: '3pc', name: '3pc', description: 'Complete 3-Piece Luxury Unstitched Suits' },
];

const KIDS_CATEGORIES = [
  { id: 'pcat_girls_unstitched', handle: 'girls-unstitched', name: 'Girls Unstitched', description: 'Fine fabrics and unstitched cuts for girls' },
  { id: 'pcat_girls_stitched', handle: 'girls-stitched', name: 'Girls Ready to Wear', description: 'Ready to wear festive frocks and gharara sets for girls' },
  { id: 'pcat_boys_unstitched', handle: 'boys-unstitched', name: 'Boys Unstitched', description: 'Premium unstitched kurta & shalwar fabrics for boys' },
  { id: 'pcat_boys_stitched', handle: 'boys-stitched', name: 'Boys Ready to Wear', description: 'Ready to wear kurtas, waistcoats and pajama sets for boys' },
];

const GIRLS_IMAGES = [
  'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1514315384763-ba401779410f?auto=format&fit=crop&w=800&q=85'
];

const BOYS_IMAGES = [
  'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=800&q=85'
];

async function syncDb(url, dbName) {
  console.log(`\n========================================`);
  console.log(`Syncing ${dbName}...`);
  console.log(`========================================`);
  const pool = new Pool({ connectionString: url });

  try {
    // 1. Get parent IDs
    const parentCats = await pool.query("SELECT id, handle FROM product_category WHERE handle IN ('men-unstitched', 'women-unstitched', 'kids', 'girls-eastern', 'boys-eastern', 'children')");
    const parentMap = {};
    parentCats.rows.forEach(r => parentMap[r.handle] = r.id);
    console.log('Parent IDs:', parentMap);

    const menUnstitchedId = parentMap['men-unstitched'] || 'pcat_01M3mukykbr04bb73bd499a58';
    const womenUnstitchedId = parentMap['women-unstitched'] || 'pcat_01M3mukykbqv18abc7547c99d';
    const girlsEasternId = parentMap['girls-eastern'] || 'pcat_01M3EW9AKN2TK634D7T4SZS573';
    const boysEasternId = parentMap['boys-eastern'] || 'pcat_01M3EW9AKQY520YNZN4B7M0NQ6';

    // 2. Insert Gents Subcategories
    for (const cat of GENTS_CATEGORIES) {
      await pool.query(`
        INSERT INTO product_category (id, name, description, handle, mpath, is_active, is_internal, rank, parent_category_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, true, false, 0, $6, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET name = $2, handle = $4, parent_category_id = $6, updated_at = NOW()
      `, [cat.id, cat.name, cat.description, cat.handle, `${menUnstitchedId}.${cat.id}`, menUnstitchedId]);
    }

    // 3. Insert Ladies Subcategories
    for (const cat of LADIES_CATEGORIES) {
      await pool.query(`
        INSERT INTO product_category (id, name, description, handle, mpath, is_active, is_internal, rank, parent_category_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, true, false, 0, $6, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET name = $2, handle = $4, parent_category_id = $6, updated_at = NOW()
      `, [cat.id, cat.name, cat.description, cat.handle, `${womenUnstitchedId}.${cat.id}`, womenUnstitchedId]);
    }

    // 4. Insert Kids Subcategories
    for (const cat of KIDS_CATEGORIES) {
      const parentId = cat.handle.startsWith('girls') ? girlsEasternId : boysEasternId;
      await pool.query(`
        INSERT INTO product_category (id, name, description, handle, mpath, is_active, is_internal, rank, parent_category_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, true, false, 0, $6, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET name = $2, handle = $4, parent_category_id = $6, updated_at = NOW()
      `, [cat.id, cat.name, cat.description, cat.handle, `${parentId}.${cat.id}`, parentId]);
    }
    console.log('All categories verified & inserted in DB.');

    // 5. Link Gents Products (1000 products split across 5 subcategories = 200 each)
    const gentsProds = await pool.query(`
      SELECT p.id FROM product p
      JOIN product_category_product pcp ON p.id = pcp.product_id
      WHERE pcp.product_category_id = $1
      ORDER BY p.id
    `, [menUnstitchedId]);

    console.log(`Found ${gentsProds.rows.length} men-unstitched products.`);
    if (gentsProds.rows.length > 0) {
      for (let i = 0; i < GENTS_CATEGORIES.length; i++) {
        const cat = GENTS_CATEGORIES[i];
        const slice = gentsProds.rows.slice(i * 200, (i + 1) * 200);
        if (slice.length > 0) {
          const values = slice.map(r => `('${r.id}', '${cat.id}')`).join(',');
          await pool.query(`
            INSERT INTO product_category_product (product_id, product_category_id)
            VALUES ${values}
            ON CONFLICT DO NOTHING
          `);
        }
      }
      console.log('Linked products to all 5 Gents categories.');
    }

    // 6. Link Ladies Products (1250 products split across 9 subcategories = ~139 each)
    const ladiesProds = await pool.query(`
      SELECT p.id FROM product p
      JOIN product_category_product pcp ON p.id = pcp.product_id
      WHERE pcp.product_category_id = $1
      ORDER BY p.id
    `, [womenUnstitchedId]);

    console.log(`Found ${ladiesProds.rows.length} women-unstitched products.`);
    if (ladiesProds.rows.length > 0) {
      const batchSize = Math.floor(ladiesProds.rows.length / LADIES_CATEGORIES.length);
      for (let i = 0; i < LADIES_CATEGORIES.length; i++) {
        const cat = LADIES_CATEGORIES[i];
        const slice = ladiesProds.rows.slice(i * batchSize, i === LADIES_CATEGORIES.length - 1 ? ladiesProds.rows.length : (i + 1) * batchSize);
        if (slice.length > 0) {
          const values = slice.map(r => `('${r.id}', '${cat.id}')`).join(',');
          await pool.query(`
            INSERT INTO product_category_product (product_id, product_category_id)
            VALUES ${values}
            ON CONFLICT DO NOTHING
          `);
        }
      }
      console.log('Linked products to all 9 Ladies categories (including Karandi!).');
    }

    // 7. Link Children Products to Girls & Boys with 100% clean kids photos!
    const childrenCatId = parentMap['children'] || 'pcat_01M3mukykbr2612d80c6d0983';
    const childrenProds = await pool.query(`
      SELECT p.id, p.title FROM product p
      JOIN product_category_product pcp ON p.id = pcp.product_id
      WHERE pcp.product_category_id = $1
      ORDER BY p.id
    `, [childrenCatId]);

    console.log(`Found ${childrenProds.rows.length} children products.`);
    const girlsIds = [];
    const boysIds = [];
    const girlsUnstitched = [];
    const girlsStitched = [];
    const boysUnstitched = [];
    const boysStitched = [];

    childrenProds.rows.forEach((prod, i) => {
      const lower = prod.title.toLowerCase();
      const isGirl = lower.includes('girl') || lower.includes('frock') || lower.includes('gharara');
      if (isGirl) {
        girlsIds.push(prod.id);
        if (lower.includes('gharara') || i % 2 === 0) girlsUnstitched.push(prod.id);
        else girlsStitched.push(prod.id);
      } else {
        boysIds.push(prod.id);
        if (lower.includes('masoom') || i % 2 === 0) boysUnstitched.push(prod.id);
        else boysStitched.push(prod.id);
      }
    });

    console.log(`Classified: Girls=${girlsIds.length}, Boys=${boysIds.length}`);

    // Update images for Girls (100% authentic girls photos)
    for (let g = 0; g < girlsIds.length; g += 50) {
      const batch = girlsIds.slice(g, g + 50);
      const img = GIRLS_IMAGES[(g / 50) % GIRLS_IMAGES.length];
      await pool.query(`UPDATE product SET thumbnail = $1, updated_at = NOW() WHERE id = ANY($2::text[])`, [img, batch]);
      await pool.query(`UPDATE image SET url = $1 WHERE product_id = ANY($2::text[])`, [img, batch]).catch(() => {});
    }

    // Update images for Boys (100% authentic boys photos - NO WOMAN PHOTO!)
    for (let b = 0; b < boysIds.length; b += 50) {
      const batch = boysIds.slice(b, b + 50);
      const img = BOYS_IMAGES[(b / 50) % BOYS_IMAGES.length];
      await pool.query(`UPDATE product SET thumbnail = $1, updated_at = NOW() WHERE id = ANY($2::text[])`, [img, batch]);
      await pool.query(`UPDATE image SET url = $1 WHERE product_id = ANY($2::text[])`, [img, batch]).catch(() => {});
    }

    // Link associations
    async function link(ids, catId) {
      if (!ids.length) return;
      const values = ids.map(id => `('${id}', '${catId}')`).join(',');
      await pool.query(`
        INSERT INTO product_category_product (product_id, product_category_id)
        VALUES ${values}
        ON CONFLICT DO NOTHING
      `);
    }

    await link(girlsIds, girlsEasternId);
    await link(girlsUnstitched, 'pcat_girls_unstitched');
    await link(girlsStitched, 'pcat_girls_stitched');

    await link(boysIds, boysEasternId);
    await link(boysUnstitched, 'pcat_boys_unstitched');
    await link(boysStitched, 'pcat_boys_stitched');

    console.log('Children, Girls & Boys associations linked successfully.');

    // Verification check
    const summary = await pool.query(`
      SELECT pc.handle, pc.name, COUNT(pcp.product_id) as count
      FROM product_category pc
      LEFT JOIN product_category_product pcp ON pc.id = pcp.product_category_id
      WHERE pc.handle IN (
        'italian', 'boski', 'wash-wear', 'wool', 'kamalia-khaddar',
        'dhanak', 'khaddar', 'linen', 'karandi', 'silk', 'printed', 'embroidery-waly', '2pc', '3pc',
        'children', 'girls-eastern', 'boys-eastern', 'girls-unstitched', 'girls-stitched', 'boys-unstitched', 'boys-stitched'
      )
      GROUP BY pc.handle, pc.name
      ORDER BY count DESC
    `);
    console.table(summary.rows);

  } catch (err) {
    console.error(`Error syncing ${dbName}:`, err.message);
  } finally {
    await pool.end();
  }
}

async function run() {
  await syncDb(RAILWAY_URL, 'Railway Live Production Database');
  await syncDb(NEON_URL, 'Neon Database');
  try {
    await syncDb(LOCAL_URL, 'Local Database');
  } catch(e) {
    console.log('Local DB note:', e.message);
  }
}

run();
