const { Client } = require('pg');

const GENTS_CATEGORIES = [
  { handle: 'italian', name: 'Italian', description: 'Premium Italian Unstitched Fabric Cuts' },
  { handle: 'boski', name: 'Boski', description: 'Traditional Pure Silk Boski Unstitched Fabric' },
  { handle: 'wash-wear', name: 'Wash & Wear', description: 'Easy Care Wrinkle-Resistant Wash & Wear Fabric' },
  { handle: 'wool', name: 'Wool', description: 'Warm Winter Blend Wool Unstitched Fabric' },
  { handle: 'kamalia-khaddar', name: 'Kamalia Khaddar', description: 'Authentic Handspun Kamalia Khaddar' },
];

const LADIES_CATEGORIES = [
  { handle: 'dhanak', name: 'Dhanak', description: 'Warm Winter Dhanak Unstitched Suits' },
  { handle: 'khaddar', name: 'Khaddar', description: 'Traditional Handspun Winter Khaddar Suits' },
  { handle: 'linen', name: 'Linen', description: 'Pure Slub Linen Unstitched 2pc & 3pc Suits' },
  { handle: 'karandi', name: 'Karandi', description: 'Winter Classic Karandi Embroidered Cuts' },
  { handle: 'silk', name: 'Silk', description: 'Pure Festive Raw Silk & Medium Silk Fabrics' },
  { handle: 'printed', name: 'Printed', description: 'Digital Printed Premium Lawn & Khaddar' },
  { handle: 'embroidery-waly', name: 'Embroidery Waly', description: 'Heavily Embroidered Festive & Formal Unstitched' },
  { handle: '2pc', name: '2pc', description: '2-Piece Unstitched Shirt & Dupatta / Trouser' },
  { handle: '3pc', name: '3pc', description: 'Complete 3-Piece Luxury Unstitched Suits' },
];

const GENTS_IMAGES = [
  'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=800&q=85',
];

const WOMEN_UNSTITCHED_IMAGES = [
  'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=800&q=85',
];

const CHILDREN_IMAGES = [
  'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1543332164-6e82f355badc?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=85',
];

async function updateDatabase(connectionString, name) {
  console.log(`\n========================================`);
  console.log(`Updating Database: ${name}`);
  console.log(`========================================`);

  const client = new Client({ connectionString });
  await client.connect();

  // 1. Get Parent Category IDs
  const menUnstitchedRow = await client.query("SELECT id FROM product_category WHERE handle = 'men-unstitched'");
  const womenUnstitchedRow = await client.query("SELECT id FROM product_category WHERE handle = 'women-unstitched'");
  const unstitchedRow = await client.query("SELECT id FROM product_category WHERE handle = 'unstitched'");

  const menUnstitchedId = menUnstitchedRow.rows[0]?.id;
  const womenUnstitchedId = womenUnstitchedRow.rows[0]?.id;
  const unstitchedId = unstitchedRow.rows[0]?.id;

  console.log('Men Unstitched ID:', menUnstitchedId);
  console.log('Women Unstitched ID:', womenUnstitchedId);
  console.log('Unstitched ID:', unstitchedId);

  // 2. Insert Gents Subcategories
  const gentsCategoryMap = {};
  for (let i = 0; i < GENTS_CATEGORIES.length; i++) {
    const cat = GENTS_CATEGORIES[i];
    const existing = await client.query("SELECT id FROM product_category WHERE handle = $1", [cat.handle]);
    let catId = existing.rows[0]?.id;
    if (!catId) {
      catId = `pcat_gents_${cat.handle.replace(/[^a-z0-9]/g, '_')}`;
      const mpath = menUnstitchedId ? `${menUnstitchedId}.${catId}` : catId;
      await client.query(`
        INSERT INTO product_category (id, name, description, handle, mpath, is_active, is_internal, rank, parent_category_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, true, false, $6, $7, NOW(), NOW())
      `, [catId, cat.name, cat.description, cat.handle, mpath, i + 1, menUnstitchedId]);
      console.log(`Inserted Gents Category: ${cat.name} (${cat.handle})`);
    } else {
      console.log(`Gents Category already exists: ${cat.name} (${catId})`);
    }
    gentsCategoryMap[cat.handle] = catId;
  }

  // 3. Insert Ladies Subcategories
  const ladiesCategoryMap = {};
  for (let i = 0; i < LADIES_CATEGORIES.length; i++) {
    const cat = LADIES_CATEGORIES[i];
    const existing = await client.query("SELECT id FROM product_category WHERE handle = $1", [cat.handle]);
    let catId = existing.rows[0]?.id;
    if (!catId) {
      catId = `pcat_ladies_${cat.handle.replace(/[^a-z0-9]/g, '_')}`;
      const mpath = womenUnstitchedId ? `${womenUnstitchedId}.${catId}` : catId;
      await client.query(`
        INSERT INTO product_category (id, name, description, handle, mpath, is_active, is_internal, rank, parent_category_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, true, false, $6, $7, NOW(), NOW())
      `, [catId, cat.name, cat.description, cat.handle, mpath, i + 1, womenUnstitchedId]);
      console.log(`Inserted Ladies Category: ${cat.name} (${cat.handle})`);
    } else {
      console.log(`Ladies Category already exists: ${cat.name} (${catId})`);
    }
    ladiesCategoryMap[cat.handle] = catId;
  }

  // 4. Update Men's Unstitched Products (Images, Categories & Metadata)
  console.log('\nAssigning Men Unstitched products to Gents categories & authentic Eastern fabric images...');
  const menProducts = await client.query(`
    SELECT p.id, p.title, p.metadata
    FROM product p
    JOIN product_category_product pcp ON p.id = pcp.product_id
    WHERE pcp.product_category_id = $1
    ORDER BY p.id
  `, [menUnstitchedId]);

  console.log(`Found ${menProducts.rows.length} Men's Unstitched products.`);

  const gentsKeys = Object.keys(gentsCategoryMap);
  for (let i = 0; i < menProducts.rows.length; i++) {
    const p = menProducts.rows[i];
    const catHandle = gentsKeys[i % gentsKeys.length];
    const catId = gentsCategoryMap[catHandle];
    const catName = GENTS_CATEGORIES.find(c => c.handle === catHandle).name;
    const imgUrl = GENTS_IMAGES[i % GENTS_IMAGES.length];

    // Link product to Gents subcategory if not already linked
    await client.query(`
      INSERT INTO product_category_product (product_id, product_category_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
    `, [p.id, catId]);

    // Ensure linked to unstitched
    if (unstitchedId) {
      await client.query(`
        INSERT INTO product_category_product (product_id, product_category_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
      `, [p.id, unstitchedId]);
    }

    // Update metadata and thumbnail
    const meta = p.metadata || {};
    meta.unstitched_type = catName;
    meta.fabric_type = 'Unstitched';
    meta.gender = 'men';
    meta.material = `${catName} Fabric`;

    await client.query(`
      UPDATE product
      SET thumbnail = $1, metadata = $2, material = $3
      WHERE id = $4
    `, [imgUrl, JSON.stringify(meta), `${catName} Fabric`, p.id]);
  }
  console.log(`Updated ${menProducts.rows.length} Men's Unstitched products!`);

  // 5. Update Women's Unstitched Products (Images, Categories & Metadata)
  console.log('\nAssigning Women Unstitched products to Ladies categories & authentic Eastern fabric images...');
  const womenProducts = await client.query(`
    SELECT p.id, p.title, p.metadata
    FROM product p
    JOIN product_category_product pcp ON p.id = pcp.product_id
    WHERE pcp.product_category_id = $1
    ORDER BY p.id
  `, [womenUnstitchedId]);

  console.log(`Found ${womenProducts.rows.length} Women's Unstitched products.`);

  const ladiesKeys = Object.keys(ladiesCategoryMap);
  for (let i = 0; i < womenProducts.rows.length; i++) {
    const p = womenProducts.rows[i];
    const catHandle = ladiesKeys[i % ladiesKeys.length];
    const catId = ladiesCategoryMap[catHandle];
    const catName = LADIES_CATEGORIES.find(c => c.handle === catHandle).name;
    const imgUrl = WOMEN_UNSTITCHED_IMAGES[i % WOMEN_UNSTITCHED_IMAGES.length];

    // Link product to Ladies subcategory
    await client.query(`
      INSERT INTO product_category_product (product_id, product_category_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
    `, [p.id, catId]);

    // Ensure linked to unstitched
    if (unstitchedId) {
      await client.query(`
        INSERT INTO product_category_product (product_id, product_category_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
      `, [p.id, unstitchedId]);
    }

    // Update metadata and thumbnail
    const meta = p.metadata || {};
    meta.unstitched_type = catName;
    meta.fabric_type = 'Unstitched';
    meta.gender = 'women';
    meta.material = `${catName} Unstitched`;

    await client.query(`
      UPDATE product
      SET thumbnail = $1, metadata = $2, material = $3
      WHERE id = $4
    `, [imgUrl, JSON.stringify(meta), `${catName} Unstitched`, p.id]);
  }
  console.log(`Updated ${womenProducts.rows.length} Women's Unstitched products!`);

  // 6. Fix Broken 404 Images across ALL Products (especially Children)
  console.log('\nFixing broken 404 images in Children and across the catalog...');
  const brokenUrl = 'https://images.unsplash.com/photo-1471286174890-9c112ffca56a';

  // Find all products with broken thumbnail
  const brokenProducts = await client.query(`
    SELECT id, title, thumbnail FROM product WHERE thumbnail LIKE '%1471286174890%'
  `);
  console.log(`Found ${brokenProducts.rows.length} products with broken thumbnail.`);

  for (let i = 0; i < brokenProducts.rows.length; i++) {
    const p = brokenProducts.rows[i];
    const replacement = CHILDREN_IMAGES[i % CHILDREN_IMAGES.length];
    await client.query(`UPDATE product SET thumbnail = $1 WHERE id = $2`, [replacement, p.id]);
  }

  // Update image table
  const updatedImageRows = await client.query(`
    UPDATE image
    SET url = 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=85'
    WHERE url LIKE '%1471286174890%'
  `);
  console.log(`Fixed broken URLs in image table (${updatedImageRows.rowCount} rows updated).`);

  await client.end();
  console.log(`Finished update for ${name}!`);
}

async function main() {
  const neonUrl = 'postgresql://neondb_owner:npg_N5jy4HXSbDed@ep-delicate-bird-azhwwm8f-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
  const localUrl = 'postgres://postgres:1234@localhost/medusa-naqsh-store';

  try {
    await updateDatabase(neonUrl, 'Neon Production Database');
  } catch(e) {
    console.error('Error updating Neon DB:', e);
  }

  try {
    await updateDatabase(localUrl, 'Local PostgreSQL Database');
  } catch(e) {
    console.error('Error updating Local DB (may be offline):', e.message);
  }
}

main().catch(console.error);
