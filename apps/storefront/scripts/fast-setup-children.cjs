const { Pool } = require('pg');

const NEON_URL = 'postgresql://neondb_owner:npg_N5jy4HXSbDed@ep-delicate-bird-azhwwm8f-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
const LOCAL_URL = 'postgres://postgres:1234@localhost/medusa-naqsh-store';

const GIRLS_IMAGES = [
  'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1514315384763-ba401779410f?auto=format&fit=crop&w=800&q=85'
];

const BOYS_IMAGES = [
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=800&q=85'
];

async function fastUpdate(url, dbName) {
  console.log(`\n=== Fast Updating ${dbName} ===`);
  const pool = new Pool({ connectionString: url });
  try {
    // 1. Ensure categories exist
    const categoriesToEnsure = [
      {
        id: 'pcat_girls_unstitched',
        name: 'Girls Unstitched',
        handle: 'girls-unstitched',
        parent: 'pcat_01M3EW9AKN2TK634D7T4SZS573',
        mpath: 'pcat_01M3EW9AH0GANVEYN4WGW0SM50.pcat_01M3EW9AKN2TK634D7T4SZS573.pcat_girls_unstitched'
      },
      {
        id: 'pcat_girls_stitched',
        name: 'Girls Ready to Wear',
        handle: 'girls-stitched',
        parent: 'pcat_01M3EW9AKN2TK634D7T4SZS573',
        mpath: 'pcat_01M3EW9AH0GANVEYN4WGW0SM50.pcat_01M3EW9AKN2TK634D7T4SZS573.pcat_girls_stitched'
      },
      {
        id: 'pcat_boys_unstitched',
        name: 'Boys Unstitched',
        handle: 'boys-unstitched',
        parent: 'pcat_01M3EW9AKQY520YNZN4B7M0NQ6',
        mpath: 'pcat_01M3EW9AH0GANVEYN4WGW0SM50.pcat_01M3EW9AKQY520YNZN4B7M0NQ6.pcat_boys_unstitched'
      },
      {
        id: 'pcat_boys_stitched',
        name: 'Boys Ready to Wear',
        handle: 'boys-stitched',
        parent: 'pcat_01M3EW9AKQY520YNZN4B7M0NQ6',
        mpath: 'pcat_01M3EW9AH0GANVEYN4WGW0SM50.pcat_01M3EW9AKQY520YNZN4B7M0NQ6.pcat_boys_stitched'
      }
    ];

    for (const cat of categoriesToEnsure) {
      await pool.query(`
        INSERT INTO product_category (id, name, description, handle, mpath, is_active, is_internal, rank, parent_category_id, created_at, updated_at)
        VALUES ($1, $2, $2, $3, $4, true, false, 0, $5, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET name = $2, handle = $3, parent_category_id = $5, mpath = $4, updated_at = NOW()
      `, [cat.id, cat.name, cat.handle, cat.mpath, cat.parent]);
    }

    // 2. Fetch children products
    const res = await pool.query(`
      SELECT p.id, p.title 
      FROM product p 
      JOIN product_category_product pcp ON p.id = pcp.product_id 
      JOIN product_category pc ON pc.id = pcp.product_category_id 
      WHERE pc.handle = 'children'
    `);
    console.log(`Found ${res.rows.length} children products.`);

    const girlsIds = [];
    const boysIds = [];
    const girlsUnstitchedIds = [];
    const girlsStitchedIds = [];
    const boysUnstitchedIds = [];
    const boysStitchedIds = [];

    res.rows.forEach((prod, i) => {
      const titleLower = prod.title.toLowerCase();
      const isGirl = titleLower.includes('girl') || titleLower.includes('frock') || titleLower.includes('gharara');
      if (isGirl) {
        girlsIds.push(prod.id);
        if (titleLower.includes('gharara') || i % 2 === 0) {
          girlsUnstitchedIds.push(prod.id);
        } else {
          girlsStitchedIds.push(prod.id);
        }
      } else {
        boysIds.push(prod.id);
        if (titleLower.includes('masoom') || i % 2 === 0) {
          boysUnstitchedIds.push(prod.id);
        } else {
          boysStitchedIds.push(prod.id);
        }
      }
    });

    console.log(`Categorizing: Girls=${girlsIds.length}, Boys=${boysIds.length}`);

    // Update images in batches
    if (girlsIds.length > 0) {
      for (let g = 0; g < girlsIds.length; g += 50) {
        const batch = girlsIds.slice(g, g + 50);
        const img = GIRLS_IMAGES[(g / 50) % GIRLS_IMAGES.length];
        await pool.query(`UPDATE product SET thumbnail = $1, updated_at = NOW() WHERE id = ANY($2::text[])`, [img, batch]);
        await pool.query(`UPDATE image SET url = $1 WHERE product_id = ANY($2::text[])`, [img, batch]).catch(() => {});
      }
    }

    if (boysIds.length > 0) {
      for (let b = 0; b < boysIds.length; b += 50) {
        const batch = boysIds.slice(b, b + 50);
        const img = BOYS_IMAGES[(b / 50) % BOYS_IMAGES.length];
        await pool.query(`UPDATE product SET thumbnail = $1, updated_at = NOW() WHERE id = ANY($2::text[])`, [img, batch]);
        await pool.query(`UPDATE image SET url = $1 WHERE product_id = ANY($2::text[])`, [img, batch]).catch(() => {});
      }
    }

    // Batch link category associations
    async function linkCategory(prodIds, catId) {
      if (!prodIds.length) return;
      const values = prodIds.map(id => `('${id}', '${catId}')`).join(',');
      await pool.query(`
        INSERT INTO product_category_product (product_id, product_category_id)
        VALUES ${values}
        ON CONFLICT DO NOTHING
      `);
    }

    await linkCategory(girlsIds, 'pcat_01M3EW9AKN2TK634D7T4SZS573');
    await linkCategory(girlsUnstitchedIds, 'pcat_girls_unstitched');
    await linkCategory(girlsStitchedIds, 'pcat_girls_stitched');

    await linkCategory(boysIds, 'pcat_01M3EW9AKQY520YNZN4B7M0NQ6');
    await linkCategory(boysUnstitchedIds, 'pcat_boys_unstitched');
    await linkCategory(boysStitchedIds, 'pcat_boys_stitched');

    console.log(`Associations updated successfully for ${dbName}.`);

    const summary = await pool.query(`
      SELECT pc.handle, COUNT(pcp.product_id) as count
      FROM product_category pc
      LEFT JOIN product_category_product pcp ON pc.id = pcp.product_category_id
      WHERE pc.handle IN ('children', 'girls-eastern', 'boys-eastern', 'girls-unstitched', 'girls-stitched', 'boys-unstitched', 'boys-stitched')
      GROUP BY pc.handle
    `);
    console.table(summary.rows);

  } catch (err) {
    console.error(`Error:`, err.message);
  } finally {
    await pool.end();
  }
}

async function run() {
  await fastUpdate(NEON_URL, 'Neon Production DB');
  try {
    await fastUpdate(LOCAL_URL, 'Local DB');
  } catch (e) {
    console.log('Local note:', e.message);
  }
}

run();
