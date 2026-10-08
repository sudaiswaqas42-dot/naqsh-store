const { Pool } = require('pg');

const NEON_URL = 'postgresql://neondb_owner:npg_N5jy4HXSbDed@ep-delicate-bird-azhwwm8f-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
const LOCAL_URL = 'postgres://postgres:1234@localhost/medusa-naqsh-store';

const GIRLS_IMAGES = [
  'photo-1518831959646-742c3a14ebf7',
  'photo-1596870230751-ebdfce98ec42',
  'photo-1516627145497-ae6968895b74',
  'photo-1544717305-2782549b5136',
  'photo-1514315384763-ba401779410f',
  'photo-1540479859555-17af45c78602',
  'photo-1519741497674-611481863552',
  'photo-1502086223501-7ea6ecd79368',
  'photo-1519340333755-56e9c1d04579'
];

const BOYS_IMAGES = [
  'photo-1508214751196-bcfd4ca60f91',
  'photo-1509198397868-475647b2a1e5',
  'photo-1519689680058-324335c77eba',
  'photo-1622290291468-a28f7a7dc6a8',
  'photo-1566492031773-4f4e44671857',
  'photo-1485546246426-74dc88dec4d9',
  'photo-1503919545889-aef636e10ad4'
];

async function updateDb(url, dbName) {
  console.log(`\n=== Updating ${dbName} ===`);
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
    console.log('Categories verified/created.');

    // 2. Fetch all products in 'children' category
    const res = await pool.query(`
      SELECT p.id, p.title 
      FROM product p 
      JOIN product_category_product pcp ON p.id = pcp.product_id 
      JOIN product_category pc ON pc.id = pcp.product_category_id 
      WHERE pc.handle = 'children'
    `);
    console.log(`Found ${res.rows.length} children products.`);

    let girlsCount = 0;
    let boysCount = 0;

    for (let i = 0; i < res.rows.length; i++) {
      const prod = res.rows[i];
      const titleLower = prod.title.toLowerCase();
      const isGirl = titleLower.includes('girl') || titleLower.includes('frock') || titleLower.includes('gharara');

      if (isGirl) {
        girlsCount++;
        // Girl image
        const imgId = GIRLS_IMAGES[i % GIRLS_IMAGES.length];
        const imgUrl = `https://images.unsplash.com/${imgId}?auto=format&fit=crop&w=800&q=85&girl=${i}`;

        await pool.query('UPDATE product SET thumbnail = $1, updated_at = NOW() WHERE id = $2', [imgUrl, prod.id]);
        await pool.query('UPDATE image SET url = $1 WHERE product_id = $2', [imgUrl, prod.id]).catch(() => {});

        // Link to girls-eastern (pcat_01M3EW9AKN2TK634D7T4SZS573)
        await pool.query(`
          INSERT INTO product_category_product (product_id, product_category_id)
          VALUES ($1, 'pcat_01M3EW9AKN2TK634D7T4SZS573')
          ON CONFLICT DO NOTHING
        `, [prod.id]);

        // Link to either stitched or unstitched subcategory
        const subCatId = (titleLower.includes('gharara') || i % 2 === 0) 
          ? 'pcat_girls_unstitched' 
          : 'pcat_girls_stitched';

        await pool.query(`
          INSERT INTO product_category_product (product_id, product_category_id)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING
        `, [prod.id, subCatId]);

      } else {
        boysCount++;
        // Boy image
        const imgId = BOYS_IMAGES[i % BOYS_IMAGES.length];
        const imgUrl = `https://images.unsplash.com/${imgId}?auto=format&fit=crop&w=800&q=85&boy=${i}`;

        await pool.query('UPDATE product SET thumbnail = $1, updated_at = NOW() WHERE id = $2', [imgUrl, prod.id]);
        await pool.query('UPDATE image SET url = $1 WHERE product_id = $2', [imgUrl, prod.id]).catch(() => {});

        // Link to boys-eastern (pcat_01M3EW9AKQY520YNZN4B7M0NQ6)
        await pool.query(`
          INSERT INTO product_category_product (product_id, product_category_id)
          VALUES ($1, 'pcat_01M3EW9AKQY520YNZN4B7M0NQ6')
          ON CONFLICT DO NOTHING
        `, [prod.id]);

        // Link to either stitched or unstitched subcategory
        const subCatId = (titleLower.includes('masoom') || i % 2 === 0) 
          ? 'pcat_boys_unstitched' 
          : 'pcat_boys_stitched';

        await pool.query(`
          INSERT INTO product_category_product (product_id, product_category_id)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING
        `, [prod.id, subCatId]);
      }
    }

    console.log(`Mapped: Girls = ${girlsCount}, Boys = ${boysCount}`);

    // Verify counts in categories
    const counts = await pool.query(`
      SELECT pc.handle, COUNT(pcp.product_id) as count
      FROM product_category pc
      LEFT JOIN product_category_product pcp ON pc.id = pcp.product_category_id
      WHERE pc.handle IN ('children', 'girls-eastern', 'boys-eastern', 'girls-unstitched', 'girls-stitched', 'boys-unstitched', 'boys-stitched')
      GROUP BY pc.handle
    `);
    console.table(counts.rows);

  } catch (err) {
    console.error(`Error updating ${dbName}:`, err.message);
  } finally {
    await pool.end();
  }
}

async function main() {
  await updateDb(NEON_URL, 'Neon Production DB');
  try {
    await updateDb(LOCAL_URL, 'Local PostgreSQL DB');
  } catch (e) {
    console.log('Local DB note:', e.message);
  }
}

main();
