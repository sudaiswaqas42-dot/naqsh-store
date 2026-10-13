const { Client } = require('pg');

const NEON_URL = 'postgresql://neondb_owner:npg_N5jy4HXSbDed@ep-delicate-bird-azhwwm8f-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
const RAILWAY_URL = 'postgresql://postgres:UYdliHHIlLqHXqgptVsUSlXqKUdMeqxD@reseau.proxy.rlwy.net:41305/railway';

const KIDS_PRODUCTS = [
  // --- GIRLS UNSTITCHED ---
  {
    id: 'prod_naqsh_k_girls_3pc',
    title: 'Girls Gul-Pari 3-Piece Festive Chiffon & Lawn Unstitched Suit Cut',
    handle: 'girls-gul-pari-3pc-chiffon-lawn',
    description: 'Festive 3-piece unstitched ensemble tailored for young girls: 2.25 meters embroidered lawn shirt with organza neckline border, pure chiffon dupatta cut, and soft dyed cotton trousers.',
    material: 'Fine Lawn & Chiffon Dupatta Cut',
    price: 4950,
    leaf_category_id: 'pcat_girls_3pc',
    gender_category_id: 'pcat_01M3EW9AKN2TK634D7T4SZS573', // girls
    color: 'Fuchsia Pink',
    gender: 'girls',
    brand: 'NAQSH Junior',
    image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=85'
  },
  {
    id: 'prod_naqsh_k_girls_2pc',
    title: 'Girls Sitara 2-Piece Printed Cotton Unstitched Frock Fabric Cut',
    handle: 'girls-sitara-2pc-printed-cotton-cut',
    description: 'Breezy everyday 2-piece unstitched fabric cut: 2.5 meters printed cambric cotton suitable for frock or shirt, with matching 1.75 meters dyed trousers fabric.',
    material: 'Pure Cambric Cotton Cut',
    price: 2950,
    leaf_category_id: 'pcat_girls_2pc',
    gender_category_id: 'pcat_01M3EW9AKN2TK634D7T4SZS573',
    color: 'Mint Green',
    gender: 'girls',
    brand: 'NAQSH Junior',
    image: 'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?auto=format&fit=crop&w=800&q=85'
  },
  {
    id: 'prod_naqsh_k_girls_silk',
    title: 'Girls Noori Pure Silk & Organza Hand-Embroidered Festive Unstitched Cut',
    handle: 'girls-noori-pure-silk-organza-cut',
    description: 'Luxury festive unstitched cut: 2.5 meters raw silk fabric with delicate gold zari booti embroidery and embellished tissue organza dupatta.',
    material: 'Raw Silk & Tissue Organza',
    price: 5850,
    leaf_category_id: 'pcat_girls_silk',
    gender_category_id: 'pcat_01M3EW9AKN2TK634D7T4SZS573',
    color: 'Peach Gold',
    gender: 'girls',
    brand: 'NAQSH Junior',
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=85'
  },
  {
    id: 'prod_naqsh_k_girls_embroidery',
    title: 'Girls Chandni Resham & Zari Heavy Embroidered Unstitched Suit',
    handle: 'girls-chandni-heavy-embroidered-suit',
    description: 'Intricately embroidered festive unstitched 3-piece cut: 2.25 meters embroidered net shirt fabric with resham threadwork, satin slip, and matching dupatta.',
    material: 'Embroidered Net & Chiffon',
    price: 6450,
    leaf_category_id: 'pcat_girls_embroidery',
    gender_category_id: 'pcat_01M3EW9AKN2TK634D7T4SZS573',
    color: 'Ivory White',
    gender: 'girls',
    brand: 'NAQSH Junior',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=85'
  },
  {
    id: 'prod_naqsh_k_girls_printed',
    title: 'Girls Pari-Rukh Pastel Digital Printed Lawn 2-Piece Cut',
    handle: 'girls-pari-rukh-printed-lawn-cut',
    description: 'Charming pastel floral printed unstitched lawn cut: 2.5 meters soft lightweight lawn fabric for festive and casual young girls outfits.',
    material: 'Digital Printed Lawn',
    price: 3250,
    leaf_category_id: 'pcat_girls_printed',
    gender_category_id: 'pcat_01M3EW9AKN2TK634D7T4SZS573',
    color: 'Lilac Blossom',
    gender: 'girls',
    brand: 'NAQSH Junior',
    image: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=800&q=85'
  },
  {
    id: 'prod_naqsh_k_girls_linen',
    title: 'Girls Mah-e-Noor Warm Slub Linen & Dhanak Winter Unstitched Cut',
    handle: 'girls-mah-e-noor-slub-linen-cut',
    description: 'Cozy winter unstitched suit cut: 2.5 meters textured Dhanak linen fabric with embroidered sleeve and neckline patches.',
    material: 'Warm Slub Linen & Dhanak',
    price: 3850,
    leaf_category_id: 'pcat_girls_linen',
    gender_category_id: 'pcat_01M3EW9AKN2TK634D7T4SZS573',
    color: 'Ruby Red',
    gender: 'girls',
    brand: 'NAQSH Junior',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=85'
  },

  // --- BOYS UNSTITCHED ---
  {
    id: 'prod_naqsh_k_boys_boski',
    title: 'Boys Chhota Nawab Pure Silk Boski 2.5-Meter Kurta Fabric Cut',
    handle: 'boys-chhota-nawab-pure-silk-boski',
    description: 'Authentic 100% pure silk Boski 2.5-meter fabric cut for young boys festive kurta and shalwar. Heirloom handloom texture with natural silk sheen.',
    material: '100% Pure Silk Boski (6-Pound)',
    price: 5450,
    leaf_category_id: 'pcat_boys_boski',
    gender_category_id: 'pcat_01M3EW9AKQY520YNZN4B7M0NQ6', // boys
    color: 'Natural Cream',
    gender: 'boys',
    brand: 'NAQSH Junior',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=85'
  },
  {
    id: 'prod_naqsh_k_boys_wash_wear',
    title: 'Boys Bahadur Executive Wash & Wear 3-Meter Kurta Shalwar Fabric',
    handle: 'boys-bahadur-wash-wear-kurta-cut',
    description: 'Easy-care, crease-resistant micro-poly wash & wear fabric cut: 3.0 meters unstitched piece tailored for boys durable daily & festive kurtas.',
    material: 'Micro-Poly Wash & Wear',
    price: 2950,
    leaf_category_id: 'pcat_boys_wash_wear',
    gender_category_id: 'pcat_01M3EW9AKQY520YNZN4B7M0NQ6',
    color: 'Sky Blue',
    gender: 'boys',
    brand: 'NAQSH Junior',
    image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=85'
  },
  {
    id: 'prod_naqsh_k_boys_kurta',
    title: 'Boys Shehroz Classic Cotton Kurta Shalwar 2.75-Meter Fabric Cut',
    handle: 'boys-shehroz-cotton-kurta-cut',
    description: 'Crisp 100% combed cotton unstitched fabric cut: 2.75 meters breathable fabric for traditional Pakistani boys kurta pajama.',
    material: '100% Combed Cotton',
    price: 2450,
    leaf_category_id: 'pcat_boys_kurta',
    gender_category_id: 'pcat_01M3EW9AKQY520YNZN4B7M0NQ6',
    color: 'Pure White',
    gender: 'boys',
    brand: 'NAQSH Junior',
    image: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=85'
  },
  {
    id: 'prod_naqsh_k_boys_khaddar',
    title: 'Boys Rustam Authentic Kamalia Khaddar 3-Meter Heavy Suit Cut',
    handle: 'boys-rustam-kamalia-khaddar-cut',
    description: 'Heritage handspun Kamalia Khaddar 3.0-meter unstitched cut: heavy textured winter cotton weave for warm and handsome traditional wear.',
    material: 'Handspun Kamalia Khaddar',
    price: 3650,
    leaf_category_id: 'pcat_boys_khaddar',
    gender_category_id: 'pcat_01M3EW9AKQY520YNZN4B7M0NQ6',
    color: 'Camel Fawn',
    gender: 'boys',
    brand: 'NAQSH Junior',
    image: 'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?auto=format&fit=crop&w=800&q=85'
  },
  {
    id: 'prod_naqsh_k_boys_wool',
    title: 'Boys Sultan Warm Winter Wool Blend Kurta & Waistcoat Fabric',
    handle: 'boys-sultan-winter-wool-cut',
    description: 'Refined wool blend unstitched fabric cut: 3.0 meters fabric ideal for winter kurtas and tailored festive waistcoats.',
    material: 'Warm Wool Blend Weave',
    price: 4250,
    leaf_category_id: 'pcat_boys_wool',
    gender_category_id: 'pcat_01M3EW9AKQY520YNZN4B7M0NQ6',
    color: 'Charcoal Grey',
    gender: 'boys',
    brand: 'NAQSH Junior',
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=85'
  },
  {
    id: 'prod_naqsh_k_boys_ww_navy',
    title: 'Boys Koh-e-Noor Royal Micro Poly Wrinkle-Free Wash & Wear Cut',
    handle: 'boys-koh-e-noor-wash-wear-navy',
    description: 'Premium wrinkle-resistant executive wash & wear unstitched cut: 3.0 meters dark navy fabric for formal and Eid wear.',
    material: 'Wrinkle-Free Wash & Wear',
    price: 2850,
    leaf_category_id: 'pcat_boys_wash_wear',
    gender_category_id: 'pcat_01M3EW9AKQY520YNZN4B7M0NQ6',
    color: 'Navy Blue',
    gender: 'boys',
    brand: 'NAQSH Junior',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=85'
  }
];

const CHILDREN_ROOT_ID = 'pcat_01M3EW9AH0GANVEYN4WGW0SM50';

async function seedDatabase(url, name) {
  console.log(`\n========================================`);
  console.log(`SEEDING KIDS UNSTITCHED PRODUCTS ON ${name}`);
  console.log(`========================================`);
  const client = new Client({ connectionString: url });
  await client.connect();

  try {
    await client.query('BEGIN');

    // 1. Ensure Root Children Category exists and has handle 'children'
    console.log(`[1] Ensuring children root category has handle 'children'...`);
    await client.query(`
      UPDATE product_category
      SET handle = 'children', name = 'Children'
      WHERE id = $1
    `, [CHILDREN_ROOT_ID]);

    // 2. Ensure Girls and Boys subcategories exist and have proper parent
    console.log(`[2] Ensuring girls and boys parent-child category relations...`);
    await client.query(`
      UPDATE product_category
      SET parent_category_id = $1
      WHERE id IN ('pcat_01M3EW9AKN2TK634D7T4SZS573', 'pcat_01M3EW9AKQY520YNZN4B7M0NQ6')
    `, [CHILDREN_ROOT_ID]);

    // Delete any old stitched product prod_01M3EW9CSKKKD3ZQE7EZ0JPMND
    await client.query(`
      DELETE FROM product_category_product WHERE product_id = 'prod_01M3EW9CSKKKD3ZQE7EZ0JPMND'
    `).catch(() => {});
    await client.query(`
      DELETE FROM product_variant WHERE product_id = 'prod_01M3EW9CSKKKD3ZQE7EZ0JPMND'
    `).catch(() => {});
    await client.query(`
      DELETE FROM product WHERE id = 'prod_01M3EW9CSKKKD3ZQE7EZ0JPMND'
    `).catch(() => {});

    // 3. Insert / Update Kids Products
    console.log(`[3] Inserting ${KIDS_PRODUCTS.length} authentic kids unstitched products...`);
    for (const p of KIDS_PRODUCTS) {
      await client.query(`
        INSERT INTO product (
          id, title, handle, description, material, thumbnail, status, is_giftcard, discountable, metadata
        ) VALUES (
          $1, $2, $3, $4, $5, $6, 'published', false, true, $7
        ) ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          handle = EXCLUDED.handle,
          description = EXCLUDED.description,
          material = EXCLUDED.material,
          thumbnail = EXCLUDED.thumbnail,
          status = 'published',
          metadata = EXCLUDED.metadata
      `, [
        p.id,
        p.title,
        p.handle,
        p.description,
        p.material,
        p.image,
        JSON.stringify({
          fabric_type: '100% Unstitched Fabric Cut',
          stitching: 'Unstitched',
          brand: p.brand,
          gender: p.gender,
          color: p.color
        })
      ]);

      // Category Links:
      // Link 1: Children Root Category
      await client.query(`
        INSERT INTO product_category_product (product_id, product_category_id)
        VALUES ($1, $2) ON CONFLICT DO NOTHING
      `, [p.id, CHILDREN_ROOT_ID]);

      // Link 2: Gender Category (Girls or Boys)
      await client.query(`
        INSERT INTO product_category_product (product_id, product_category_id)
        VALUES ($1, $2) ON CONFLICT DO NOTHING
      `, [p.id, p.gender_category_id]);

      // Link 3: Leaf Subcategory (e.g. pcat_girls_3pc, pcat_boys_boski)
      await client.query(`
        INSERT INTO product_category_product (product_id, product_category_id)
        VALUES ($1, $2) ON CONFLICT DO NOTHING
      `, [p.id, p.leaf_category_id]);

      // Image
      const imgId = `img_${p.id}`;
      await client.query(`
        INSERT INTO image (id, url, metadata, rank, product_id)
        VALUES ($1, $2, '{}', 0, $3)
        ON CONFLICT (id) DO UPDATE SET url = EXCLUDED.url, product_id = EXCLUDED.product_id
      `, [imgId, p.image, p.id]);

      // Price and Variant
      const variantId = `var_${p.id}`;
      const priceSetId = `pset_${p.id}`;
      const priceId = `price_${p.id}`;

      await client.query(`
        INSERT INTO price_set (id) VALUES ($1) ON CONFLICT DO NOTHING
      `, [priceSetId]);

      await client.query(`
        INSERT INTO price (id, price_set_id, currency_code, amount, raw_amount)
        VALUES ($1, $2, 'pkr', $3, $4)
        ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, raw_amount = EXCLUDED.raw_amount
      `, [priceId, priceSetId, p.price, JSON.stringify({ value: String(p.price), precision: 20 })]);

      await client.query(`
        INSERT INTO product_variant (id, product_id, title, sku, manage_inventory, allow_backorder)
        VALUES ($1, $2, $3, $4, false, false)
        ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title
      `, [variantId, p.id, `${p.color} - Unstitched Cut`, `NAQSH-${p.id.toUpperCase()}`]);

      await client.query(`
        INSERT INTO product_variant_price_set (id, variant_id, price_set_id)
        VALUES ($1, $2, $3)
        ON CONFLICT DO NOTHING
      `, [`pvps_${p.id}`, variantId, priceSetId]);
    }

    await client.query('COMMIT');
    console.log(`SUCCESSFULLY SEEDED KIDS UNSTITCHED PRODUCTS ON ${name}!`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`ERROR SEEDING ${name}:`, err);
    throw err;
  } finally {
    await client.end();
  }
}

async function main() {
  await seedDatabase(NEON_URL, 'NEON_DB');
  await seedDatabase(RAILWAY_URL, 'RAILWAY_DB');
  console.log('\nAll databases successfully updated!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
