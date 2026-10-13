const { Client } = require('pg');

const NEON_URL = 'postgresql://neondb_owner:npg_N5jy4HXSbDed@ep-delicate-bird-azhwwm8f-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
const RAILWAY_URL = 'postgresql://postgres:UYdliHHIlLqHXqgptVsUSlXqKUdMeqxD@reseau.proxy.rlwy.net:41305/railway';

// 20 Authentic Pakistani 100% Unstitched Products
const SAMPLE_PRODUCTS = [
  // --- WOMEN UNSTITCHED ---
  {
    id: 'prod_naqsh_w_3pc_lawn',
    title: 'Noor-e-Kashmir 3-Piece Luxury Unstitched Embroidered Lawn Suit',
    handle: 'noor-e-kashmir-3pc-luxury-lawn',
    description: 'Artisanal 3-piece unstitched luxury ensemble featuring high-density digital printed Swiss Lawn shirt with heavy schiffli embroidered organza neckline patch, silk dupatta, and dyed cotton trousers.',
    material: 'Swiss Lawn & Pure Silk Dupatta',
    price: 8950,
    category_id: 'pcat_ladies_3pc',
    collection_id: 'pcol_01M3EW9AMZVBG5B2NTDTB82R20', // Summer Lawn '25
    color: 'Crimson Red',
    gender: 'women',
    brand: 'NAQSH Atelier'
  },
  {
    id: 'prod_naqsh_w_2pc_linen',
    title: 'Gul-Bahar 2-Piece Fine Slub Linen Unstitched Printed Cut',
    handle: 'gul-bahar-2pc-slub-linen',
    description: 'Classic 2-piece printed unstitched cut featuring 3.0 meters fine breathable slub linen shirt and 2.5 meters coordinated linen dupatta.',
    material: 'Slub Linen',
    price: 4850,
    category_id: 'pcat_ladies_2pc',
    collection_id: 'pcol_01M3EW9AN0H0SHFZCG3EX8K3T6', // Bestsellers
    color: 'Teal Green',
    gender: 'women',
    brand: 'NAQSH Atelier'
  },
  {
    id: 'prod_naqsh_w_silk_festive',
    title: 'Shahana Heirloom Pure Silk 3-Piece Festive Unstitched Suit',
    handle: 'shahana-pure-silk-festive-3pc',
    description: 'Opulent heirloom pure raw silk 3-piece suit cut featuring resham and tilla hand embroidery motifs with pure banarsi zari organza dupatta.',
    material: 'Pure Raw Silk & Zari Dupatta',
    price: 15500,
    category_id: 'pcat_ladies_silk',
    collection_id: 'pcol_01M3EW9AN0HPT5N86V8VD3XMBH', // Festive Formals
    color: 'Ivory Gold',
    gender: 'women',
    brand: 'NAQSH Atelier'
  },
  {
    id: 'prod_naqsh_w_karandi',
    title: 'Koh-e-Noor Luxury Winter Karandi Unstitched Embroidered Suit',
    handle: 'koh-e-noor-luxury-karandi-suit',
    description: 'Heavy textured winter karandi unstitched fabric with intricate wool thread embroidery borders and matching warm karandi shawl.',
    material: 'Textured Winter Karandi',
    price: 9450,
    category_id: 'pcat_ladies_karandi',
    collection_id: 'pcol_01M3EW9AN0N3S3NXBXRFR0SP4Q', // Unstitched Luxury Edit
    color: 'Navy Blue',
    gender: 'women',
    brand: 'NAQSH Atelier'
  },

  // --- MEN UNSTITCHED ---
  {
    id: 'prod_naqsh_m_boski',
    title: 'Shehanshah 6-Pound Pure Chinese Silk Boski 4-Meter Unstitched Cut',
    handle: 'shehanshah-pure-silk-boski-4m',
    description: 'Traditional authentic 6-pound pure silk Boski fabric imported from China. 4.0 meters suit length delivering unmatched heirloom luster, natural fall, and supreme comfort.',
    material: '100% Pure Silk Boski',
    price: 16500,
    category_id: 'pcat_gents_boski',
    collection_id: 'pcol_01M3EW9AN0HPT5N86V8VD3XMBH',
    color: 'Classic Cream',
    gender: 'men',
    brand: 'NAQSH Atelier'
  },
  {
    id: 'prod_naqsh_m_wash_wear',
    title: 'Executive Micro-Poly Wrinkle-Free Wash & Wear 4.5-Meter Fabric Cut',
    handle: 'executive-wrinkle-free-wash-wear-cut',
    description: 'All-weather, wrinkle-resistant executive suit cut. 4.5 meters length with graceful crease retention, soft textured finish, and rich color fastness.',
    material: 'Micro-Poly Wash & Wear',
    price: 5250,
    category_id: 'pcat_gents_wash_wear',
    collection_id: 'pcol_01M3EW9AN0H0SHFZCG3EX8K3T6',
    color: 'Charcoal Grey',
    gender: 'men',
    brand: 'NAQSH Atelier'
  },
  {
    id: 'prod_naqsh_m_italian',
    title: 'Milano Superfine 120s High-Twist Cotton Unstitched Suit Length',
    handle: 'milano-superfine-120s-cotton-suit',
    description: 'Italian imported 120s high-twist combed cotton suit fabric. 4.5 meters unstitched cut with crisp matte finish designed for summer elegance.',
    material: 'High-Twist Combed Cotton',
    price: 7850,
    category_id: 'pcat_gents_italian',
    collection_id: 'pcol_01M3EW9AMZVBG5B2NTDTB82R20',
    color: 'Pure White',
    gender: 'men',
    brand: 'NAQSH Atelier'
  },
  {
    id: 'prod_naqsh_m_khaddar',
    title: 'Kamalia Handspun Pure Cotton Heavy Khaddar 7-Meter Suit Cut',
    handle: 'kamalia-handspun-heavy-khaddar-7m',
    description: 'Authentic Kamalia hand-loomed 100% cotton winter khaddar. 7.0 meters traditional cut with artisanal slub texture providing natural winter insulation.',
    material: 'Handspun Kamalia Cotton',
    price: 4950,
    category_id: 'pcat_gents_kamalia_khaddar',
    collection_id: 'pcol_01M3EW9AN0N3S3NXBXRFR0SP4Q',
    color: 'Earth Brown',
    gender: 'men',
    brand: 'NAQSH Atelier'
  },

  // --- KIDS (GIRLS & BOYS) UNSTITCHED ---
  {
    id: 'prod_naqsh_k_girls_3pc',
    title: 'Girls Gul-Pari 3-Piece Festive Chiffon & Lawn Unstitched Suit Cut',
    handle: 'girls-gul-pari-3pc-chiffon-lawn',
    description: 'Festive unstitched fabric cut designed for girls (Ages 6-14). Includes 2.5 meters soft lawn shirt with embroidered neckline, 2 meters chiffon dupatta, and 2 meters dyed cambric trousers.',
    material: 'Soft Swiss Lawn & Chiffon',
    price: 4250,
    category_id: 'pcat_girls_3pc',
    collection_id: 'pcol_01M3EW9AN0HPT5N86V8VD3XMBH',
    color: 'Dusty Rose Pink',
    gender: 'girls',
    brand: 'NAQSH Atelier'
  },
  {
    id: 'prod_naqsh_k_girls_2pc',
    title: 'Girls Sitara 2-Piece Printed Cotton Unstitched Frock Fabric Cut',
    handle: 'girls-sitara-2pc-printed-cotton-cut',
    description: 'Gentle breathable printed cotton unstitched fabric (3.5 meters total) for tailoring traditional girls gharara, frock, or shalwar kameez.',
    material: '100% Breathable Cotton',
    price: 2950,
    category_id: 'pcat_girls_2pc',
    collection_id: 'pcol_01M3EW9AMZVBG5B2NTDTB82R20',
    color: 'Mustard Yellow',
    gender: 'girls',
    brand: 'NAQSH Atelier'
  },
  {
    id: 'prod_naqsh_k_boys_boski',
    title: 'Boys Chhota Nawab Pure Silk Boski 2.5-Meter Kurta Fabric Cut',
    handle: 'boys-chhota-nawab-pure-silk-boski',
    description: 'Heirloom pure silk Boski 2.5 meters unstitched cut tailored for young boys festive kurta wear. Soft gentle texture on sensitive skin with timeless sheen.',
    material: '100% Pure Silk Boski',
    price: 5450,
    category_id: 'pcat_boys_boski',
    collection_id: 'pcol_01M3EW9AN0HPT5N86V8VD3XMBH',
    color: 'Off-White Silk',
    gender: 'boys',
    brand: 'NAQSH Atelier'
  },
  {
    id: 'prod_naqsh_k_boys_wash_wear',
    title: 'Boys Bahadur Executive Wash & Wear 3-Meter Kurta Shalwar Fabric',
    handle: 'boys-bahadur-wash-wear-kurta-cut',
    description: 'Durable, wrinkle-resistant 3.0 meters unstitched fabric cut for tailoring boys eastern kurta shalwar suit. High strength weave for easy daily maintenance.',
    material: 'Executive Wash & Wear',
    price: 2850,
    category_id: 'pcat_boys_wash_wear',
    collection_id: 'pcol_01M3EW9AN0H0SHFZCG3EX8K3T6',
    color: 'Steel Blue',
    gender: 'boys',
    brand: 'NAQSH Atelier'
  },

  // --- BRANDS (KHAADI, SAPPHIRE, GUL AHMED, J., ALKARAM, LIMELIGHT) ---
  {
    id: 'prod_brand_khaadi_lawn',
    title: 'Khaadi 3-Piece Luxury Embroidered Lawn Unstitched Ensemble',
    handle: 'khaadi-3pc-luxury-embroidered-lawn',
    description: 'Original Khaadi unstitched 3-piece luxury suit. Embroidered lawn shirt front with organza lace borders, printed silk dupatta, and cambric trousers.',
    material: 'Khaadi Swiss Lawn',
    price: 8450,
    category_id: 'pcat_khaadi_women_3pc',
    collection_id: 'pcol_khaadi',
    color: 'Burgundy',
    gender: 'women',
    brand: 'Khaadi'
  },
  {
    id: 'prod_brand_sapphire_silk',
    title: 'Sapphire 3-Piece Signature Silk Dupatta Unstitched Collection',
    handle: 'sapphire-3pc-signature-silk-dupatta',
    description: 'Original Sapphire unstitched designer suite. Digital printed lawn front and back, 100% pure silk printed dupatta, and plain dyed trousers.',
    material: 'Sapphire Lawn & Pure Silk',
    price: 7950,
    category_id: 'pcat_sapphire_women_silk',
    collection_id: 'pcol_sapphire',
    color: 'Emerald Green',
    gender: 'women',
    brand: 'Sapphire'
  },
  {
    id: 'prod_brand_gul_ahmed_latha',
    title: 'Gul Ahmed Chairman Super Latha 4.5-Meter Gents Unstitched Fabric',
    handle: 'gul-ahmed-chairman-super-latha',
    description: 'Authentic Gul Ahmed Chairman pure Egyptian cotton latha. 4.5 meters unstitched cut featuring signature stiff crisp finish and cooling touch.',
    material: 'Gul Ahmed Egyptian Latha',
    price: 6450,
    category_id: 'pcat_gul_ahmed_men_cotton',
    collection_id: 'pcol_gul_ahmed',
    color: 'Snow White',
    gender: 'men',
    brand: 'Gul Ahmed'
  },
  {
    id: 'prod_brand_j_dot_boski',
    title: 'J. Junaid Jamshed Pure Silk Heirloom Boski 4-Meter Gents Cut',
    handle: 'j-dot-pure-silk-heirloom-boski',
    description: 'Original J. Junaid Jamshed pure silk Boski 4-meter unstitched cut. Traditional Pakistani luxury fabric with natural ivory sheen and heavy drape.',
    material: 'J. Pure Silk Boski',
    price: 15950,
    category_id: 'pcat_j_dot_men_boski',
    collection_id: 'pcol_j_dot',
    color: 'Ivory Cream',
    gender: 'men',
    brand: 'J. Junaid Jamshed'
  },
  {
    id: 'prod_brand_alkaram_3pc',
    title: 'Alkaram Studio 3-Piece Festive Jacquard Unstitched Suit',
    handle: 'alkaram-3pc-festive-jacquard-suit',
    description: 'Original Alkaram Studio 3-piece unstitched festive collection. Self-jacquard shirt length with schiffli embroidered hem and organza dupatta.',
    material: 'Alkaram Jacquard & Organza',
    price: 7450,
    category_id: 'pcat_alkaram_women_3pc',
    collection_id: 'pcol_alkaram',
    color: 'Plum Purple',
    gender: 'women',
    brand: 'Alkaram Studio'
  },
  {
    id: 'prod_brand_limelight_2pc',
    title: 'Limelight 2-Piece Vibrant Digital Print Unstitched Cambric Cut',
    handle: 'limelight-2pc-digital-print-cambric',
    description: 'Original Limelight 2-piece unstitched daily wear cut. Printed cambric shirt (3 meters) and printed voile dupatta (2.5 meters).',
    material: 'Limelight Cambric & Voile',
    price: 3650,
    category_id: 'pcat_limelight_women_2pc',
    collection_id: 'pcol_limelight',
    color: 'Coral Peach',
    gender: 'women',
    brand: 'Limelight'
  },

  // --- SALE SPECIALS ---
  {
    id: 'prod_naqsh_sale_w_suit',
    title: 'Zeenat 3-Piece Festive Lawn Unstitched Suit [End of Season Sale]',
    handle: 'zeenat-3pc-festive-lawn-sale',
    description: 'End of Season Sale special: 3-piece luxury embroidered lawn unstitched suit cut at 35% discount.',
    material: 'Swiss Lawn & Chiffon Dupatta',
    price: 4950,
    category_id: 'pcat_sale_women',
    collection_id: 'pcol_01M3EW9AMZVBG5B2NTDTB82R20',
    color: 'Olive Green',
    gender: 'women',
    brand: 'NAQSH Atelier'
  },
  {
    id: 'prod_naqsh_sale_m_suit',
    title: 'Darbari Wash & Wear 4.5-Meter Gents Cut [Special Festive Offer]',
    handle: 'darbari-wash-wear-gents-cut-sale',
    description: 'Special Festive Offer: 4.5-meter executive wrinkle-free wash & wear suit cut at 30% discount.',
    material: 'Executive Wash & Wear',
    price: 3450,
    category_id: 'pcat_sale_men',
    collection_id: 'pcol_01M3EW9AN0H0SHFZCG3EX8K3T6',
    color: 'Slate Grey',
    gender: 'men',
    brand: 'NAQSH Atelier'
  }
];

async function run(url, name) {
  console.log(`\n=== RUNNING ON ${name} ===`);
  const client = new Client({ connectionString: url });
  await client.connect();

  try {
    await client.query('BEGIN');

    // 1. DELETE ANY STITCHED CHILDREN PRODUCTS
    console.log('[1] Deleting 500 stitched nq-children-* products...');
    const childRes = await client.query(`SELECT id FROM product WHERE handle LIKE 'nq-children-%'`);
    const childIds = childRes.rows.map(r => r.id);
    console.log(`Found ${childIds.length} stitched children products to delete.`);

    if (childIds.length > 0) {
      const varRes = await client.query(`SELECT id FROM product_variant WHERE product_id = ANY($1::text[])`, [childIds]);
      const varIds = varRes.rows.map(r => r.id);
      if (varIds.length > 0) {
        const pvps = await client.query(`SELECT price_set_id FROM product_variant_price_set WHERE variant_id = ANY($1::text[])`, [varIds]);
        const psIds = pvps.rows.map(r => r.price_set_id);
        await client.query(`DELETE FROM product_variant_price_set WHERE variant_id = ANY($1::text[])`, [varIds]);
        if (psIds.length > 0) {
          await client.query(`DELETE FROM price WHERE price_set_id = ANY($1::text[])`, [psIds]);
          await client.query(`DELETE FROM price_set WHERE id = ANY($1::text[])`, [psIds]);
        }
        await client.query(`DELETE FROM product_variant_inventory_item WHERE variant_id = ANY($1::text[])`, [varIds]).catch(() => {});
        await client.query(`DELETE FROM product_variant_option WHERE variant_id = ANY($1::text[])`, [varIds]);
        await client.query(`DELETE FROM product_variant_product_image WHERE variant_id = ANY($1::text[])`, [varIds]).catch(() => {});
        await client.query(`DELETE FROM cart_line_item WHERE variant_id = ANY($1::text[])`, [varIds]).catch(() => {});
        await client.query(`DELETE FROM order_line_item WHERE variant_id = ANY($1::text[])`, [varIds]).catch(() => {});
        await client.query(`DELETE FROM product_variant WHERE id = ANY($1::text[])`, [varIds]);
      }
      await client.query(`DELETE FROM product_tags WHERE product_id = ANY($1::text[])`, [childIds]);
      await client.query(`DELETE FROM product_category_product WHERE product_id = ANY($1::text[])`, [childIds]);
      await client.query(`DELETE FROM image WHERE product_id = ANY($1::text[])`, [childIds]);
      await client.query(`DELETE FROM product_product_option WHERE product_id = ANY($1::text[])`, [childIds]);
      await client.query(`DELETE FROM product WHERE id = ANY($1::text[])`, [childIds]);
      console.log(`Deleted ${childIds.length} stitched children products!`);
    }

    // 2. INSERT 20 AUTHENTIC 100% UNSTITCHED SAMPLE PRODUCTS
    console.log('[2] Inserting 20 authentic 100% unstitched sample products...');
    for (const p of SAMPLE_PRODUCTS) {
      // Upsert product
      await client.query(`
        INSERT INTO product (
          id, title, handle, description, material, collection_id, status, is_giftcard, discountable, metadata
        ) VALUES (
          $1, $2, $3, $4, $5, $6, 'published', false, true, $7
        ) ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          handle = EXCLUDED.handle,
          description = EXCLUDED.description,
          material = EXCLUDED.material,
          collection_id = EXCLUDED.collection_id,
          status = 'published',
          metadata = EXCLUDED.metadata
      `, [
        p.id,
        p.title,
        p.handle,
        p.description,
        p.material,
        p.collection_id,
        JSON.stringify({
          fabric_type: 'Unstitched',
          stitching: 'Unstitched',
          brand: p.brand,
          gender: p.gender,
          color: p.color
        })
      ]);

      // Category association
      if (p.category_id) {
        await client.query(`
          INSERT INTO product_category_product (product_id, product_category_id)
          VALUES ($1, $2) ON CONFLICT DO NOTHING
        `, [p.id, p.category_id]);
      }

      // Variant and Price Set
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
        VALUES ($1, $2, $3) ON CONFLICT DO NOTHING
      `, [`pvps_${p.id}`, variantId, priceSetId]);
    }

    console.log(`Successfully seeded 20 authentic 100% unstitched products with PKR prices into ${name}!`);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`Error on ${name}:`, err);
    throw err;
  } finally {
    await client.end();
  }
}

(async () => {
  await run(NEON_URL, 'NEON');
  await run(RAILWAY_URL, 'RAILWAY');
  console.log('ALL DATABASES COMPLETED CLEANUP & SAMPLE PRODUCTS INSERTION!');
})();
