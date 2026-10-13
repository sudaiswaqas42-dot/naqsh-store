const { Client } = require('pg');

const NEON_URL = 'postgresql://neondb_owner:npg_N5jy4HXSbDed@ep-delicate-bird-azhwwm8f-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';
const RAILWAY_URL = 'postgresql://postgres:UYdliHHIlLqHXqgptVsUSlXqKUdMeqxD@reseau.proxy.rlwy.net:41305/railway';
const STOCK_LOCATION_ID = 'sloc_01M3EW98XJ4RACZA75YDSA0ZJE';

const NEW_PRODUCTS = [
  // 1. GIRLS 3-PIECE
  {
    id: 'prod_naqsh_task_g_3pc',
    title: 'Girls Gul-e-Lala 3-Piece Festive Chiffon & Embroidered Lawn Cut',
    handle: 'girls-gul-e-lala-3pc-chiffon-lawn',
    description: 'Festive 3-piece unstitched ensemble tailored for girls: 2.25m embroidered lawn shirt, pure chiffon dupatta cut, and soft dyed cambric trousers.',
    material: 'Luxury Lawn & Pure Chiffon Dupatta',
    price: 5250,
    categories: ['pcat_girls_3pc', 'pcat_ladies_3pc', 'pcat_01M3EW9AKN2TK634D7T4SZS573', 'pcat_01M3EW9AH0GANVEYN4WGW0SM50'],
    gender: 'girls',
    brand: 'NAQSH Junior',
    color: 'Blush Pink',
    image: '/task-images/naqsh-task-product-1.jpg',
    sku: 'NQ-GRL-3PC-01'
  },
  // 2. GIRLS 2-PIECE
  {
    id: 'prod_naqsh_task_g_2pc',
    title: 'Girls Pari-Zad 2-Piece Contemporary Printed Lawn Fabric Cut',
    handle: 'girls-pari-zad-2pc-printed-lawn',
    description: 'Breezy everyday 2-piece unstitched cut: 2.5m premium digital printed lawn fabric with dyed matching trousers cut.',
    material: 'Fine Digital Printed Lawn',
    price: 3150,
    categories: ['pcat_girls_2pc', 'pcat_ladies_2pc', 'pcat_01M3EW9AKN2TK634D7T4SZS573', 'pcat_01M3EW9AH0GANVEYN4WGW0SM50'],
    gender: 'girls',
    brand: 'NAQSH Junior',
    color: 'Mint Aqua',
    image: '/task-images/naqsh-task-product-2.jpg',
    sku: 'NQ-GRL-2PC-02'
  },
  // 3. GIRLS SILK
  {
    id: 'prod_naqsh_task_g_silk',
    title: 'Girls Sitara-e-Subah Hand-Embroidered Raw Silk Festive Cut',
    handle: 'girls-sitara-raw-silk-festive',
    description: 'Luxury festive raw silk ensemble: 2.5m pure raw silk with intricate gold thread booti work and sheer tissue organza border.',
    material: 'Raw Silk & Tissue Organza',
    price: 6150,
    categories: ['pcat_girls_silk', 'pcat_ladies_silk', 'pcat_01M3EW9AKN2TK634D7T4SZS573', 'pcat_01M3EW9AH0GANVEYN4WGW0SM50'],
    gender: 'girls',
    brand: 'NAQSH Junior',
    color: 'Royal Magenta',
    image: '/task-images/naqsh-task-product-3.jpg',
    sku: 'NQ-GRL-SLK-03'
  },
  // 4. GIRLS LINEN / DHANAK
  {
    id: 'prod_naqsh_task_g_linen',
    title: 'Girls Mah-Noor Winter Slub Linen & Dhanak Warm Suit Cut',
    handle: 'girls-mah-noor-slub-linen-dhanak',
    description: 'Cozy winter unstitched suit cut: 2.5m textured slub linen fabric with embroidered sleeve patches and warm dhanak finish.',
    material: 'Warm Slub Linen & Dhanak',
    price: 3950,
    categories: ['pcat_girls_linen', 'pcat_ladies_linen', 'pcat_01M3EW9AKN2TK634D7T4SZS573', 'pcat_01M3EW9AH0GANVEYN4WGW0SM50'],
    gender: 'girls',
    brand: 'NAQSH Junior',
    color: 'Crimson Red',
    image: '/task-images/naqsh-task-product-4.jpg',
    sku: 'NQ-GRL-LIN-04'
  },
  // 5. BOYS BOSKI
  {
    id: 'prod_naqsh_task_b_boski',
    title: 'Boys Shahi Heirloom Pure Silk Boski 2.5-Meter Kurta Cut',
    handle: 'boys-shahi-pure-silk-boski',
    description: 'Authentic 100% pure silk Boski 2.5m fabric cut for boys festive kurta and shalwar. Distinct natural soft cream fall and silk lustre.',
    material: '100% Pure Silk Boski (6-Pound)',
    price: 5650,
    categories: ['pcat_boys_boski', 'pcat_gents_boski', 'pcat_01M3EW9AKQY520YNZN4B7M0NQ6', 'pcat_01M3EW9AH0GANVEYN4WGW0SM50'],
    gender: 'boys',
    brand: 'NAQSH Junior',
    color: 'Natural Cream',
    image: '/task-images/naqsh-task-product-5.jpg',
    sku: 'NQ-BOY-BSK-05'
  },
  // 6. BOYS WASH & WEAR
  {
    id: 'prod_naqsh_task_b_washwear',
    title: 'Boys Bahadur Executive Wrinkle-Free Wash & Wear Suit Cut',
    handle: 'boys-bahadur-wash-wear-cut',
    description: 'Durable and breathable wash-and-wear 2.75m cut engineered for young boys daily and festive eastern wear. Non-crease micro polyester blend.',
    material: 'Executive Poly-Viscose Micro Blend',
    price: 2850,
    categories: ['pcat_boys_wash_wear', 'pcat_gents_wash_wear', 'pcat_01M3EW9AKQY520YNZN4B7M0NQ6', 'pcat_01M3EW9AH0GANVEYN4WGW0SM50'],
    gender: 'boys',
    brand: 'NAQSH Junior',
    color: 'Steel Blue',
    image: '/task-images/naqsh-task-product-6.jpg',
    sku: 'NQ-BOY-WNW-06'
  },
  // 7. BOYS WOOL
  {
    id: 'prod_naqsh_task_b_wool',
    title: 'Boys Koh-e-Noor Winter Wool Blend Kurta & Waistcoat Cut',
    handle: 'boys-kohenoor-winter-wool-cut',
    description: 'Warm winter tailored cut: 2.5m imported wool blend fabric suitable for boys traditional kurtas and waistcoats.',
    material: 'Imported Merino Wool Blend',
    price: 4350,
    categories: ['pcat_boys_wool', 'pcat_gents_wool', 'pcat_01M3EW9AKQY520YNZN4B7M0NQ6', 'pcat_01M3EW9AH0GANVEYN4WGW0SM50'],
    gender: 'boys',
    brand: 'NAQSH Junior',
    color: 'Charcoal Grey',
    image: '/task-images/naqsh-task-product-7.jpg',
    sku: 'NQ-BOY-WOL-07'
  },
  // 8. BOYS KHADDAR
  {
    id: 'prod_naqsh_task_b_khaddar',
    title: 'Boys Rustam Kamalia Traditional Heavy Handspun Khaddar Cut',
    handle: 'boys-rustam-kamalia-heavy-khaddar',
    description: 'Traditional 100% handspun Kamalia Khaddar 3-meter cut. High-density handloom weave providing warmth and classic crisp fall.',
    material: '100% Handspun Kamalia Khaddar',
    price: 3750,
    categories: ['pcat_boys_khaddar', 'pcat_gents_kamalia_khaddar', 'pcat_01M3EW9AKQY520YNZN4B7M0NQ6', 'pcat_01M3EW9AH0GANVEYN4WGW0SM50'],
    gender: 'boys',
    brand: 'NAQSH Junior',
    color: 'Mustard Amber',
    image: '/task-images/naqsh-task-product-8.jpg',
    sku: 'NQ-BOY-KHD-08'
  },
  // 9. WOMEN 3-PIECE
  {
    id: 'prod_naqsh_task_w_3pc',
    title: 'Gul-e-Rana 3-Piece Luxury Resham Embroidered Unstitched Lawn',
    handle: 'gul-e-rana-3pc-luxury-embroidered-lawn',
    description: 'Sumptuous 3-piece unstitched ensemble: 3m heavy resham embroidered lawn shirt with organza hem border, digital silk dupatta cut, and dyed cambric trousers.',
    material: 'Festive Fine Lawn & Digital Pure Silk Dupatta',
    price: 9450,
    categories: ['pcat_ladies_3pc', 'pcat_01M3EW9AGX87DJN0W7RP7Z6041'],
    gender: 'women',
    brand: 'NAQSH Atelier',
    color: 'Emerald Green',
    image: '/task-images/naqsh-task-product-9.jpg',
    sku: 'NQ-WMN-3PC-09'
  },
  // 10. WOMEN 2-PIECE
  {
    id: 'prod_naqsh_task_w_2pc',
    title: 'Rang-Reza 2-Piece Contemporary Digital Printed Lawn Fabric Cut',
    handle: 'rang-reza-2pc-printed-lawn-cut',
    description: 'Vibrant modern prints on fine combed lawn: 2.5m digital print shirt fabric with matching 2m cambric trousers cut.',
    material: '100% Combed Digital Lawn',
    price: 3650,
    categories: ['pcat_ladies_2pc', 'pcat_01M3EW9AGX87DJN0W7RP7Z6041'],
    gender: 'women',
    brand: 'NAQSH Atelier',
    color: 'Cobalt Azure',
    image: '/task-images/naqsh-task-product-10.jpg',
    sku: 'NQ-WMN-2PC-10'
  },
  // 11. WOMEN SILK
  {
    id: 'prod_naqsh_task_w_silk',
    title: 'Mehr-un-Nisa Pure Chiffon & Silk Jacquard Festive 3-Piece Cut',
    handle: 'mehr-un-nisa-pure-silk-jacquard-festive',
    description: 'Heirloom evening festive cut: 3m pure silk jacquard shirt with gold tilla embroidery patches and 2.5m hand-embellished pure chiffon dupatta.',
    material: 'Pure Silk Jacquard & Embroidered Chiffon',
    price: 11850,
    categories: ['pcat_ladies_silk', 'pcat_01M3EW9AGX87DJN0W7RP7Z6041'],
    gender: 'women',
    brand: 'NAQSH Atelier',
    color: 'Ivory Gold',
    image: '/task-images/naqsh-task-product-11.jpg',
    sku: 'NQ-WMN-SLK-11'
  },
  // 12. WOMEN DHANAK / LINEN
  {
    id: 'prod_naqsh_task_w_dhanak',
    title: 'Kohsar Winter Slub Linen & Dhanak Heavy Embroidered Ensemble',
    handle: 'kohsar-winter-slub-linen-dhanak-cut',
    description: 'Warm textured winter unstitched suit cut: 3m heavy slub linen shirt with wool shawl dupatta cut and dyed linen trousers.',
    material: 'Heavy Slub Linen & Wool Shawl Cut',
    price: 6850,
    categories: ['pcat_ladies_dhanak', 'pcat_ladies_linen', 'pcat_01M3EW9AGX87DJN0W7RP7Z6041'],
    gender: 'women',
    brand: 'NAQSH Atelier',
    color: 'Deep Plum',
    image: '/task-images/naqsh-task-product-12.jpg',
    sku: 'NQ-WMN-DHN-12'
  },
  // 13. MEN BOSKI
  {
    id: 'prod_naqsh_task_m_boski',
    title: 'Heirloom Pure Silk Boski (6-Pound) 7-Meter Gents Suit Cut',
    handle: 'heirloom-pure-silk-boski-6-pound-cut',
    description: 'Certified 100% pure Chinese cocoon silk spun into authentic Pakistani Boski. 7-meter full suit cut featuring natural weight and timeless silk drape.',
    material: '100% Pure Silk Boski (6-Pound Heritage Weight)',
    price: 12500,
    categories: ['pcat_gents_boski', 'pcat_01M3EW9AGYE2YT2P17ZSGFVTB9'],
    gender: 'men',
    brand: 'NAQSH Atelier',
    color: 'Vintage Ivory',
    image: '/task-images/naqsh-task-product-13.jpg',
    sku: 'NQ-MEN-BSK-13'
  },
  // 14. MEN ITALIAN SUITING
  {
    id: 'prod_naqsh_task_m_italian',
    title: 'Italian Superfine Tropical Poly-Viscose 4.5-Meter Suiting Cut',
    handle: 'italian-superfine-tropical-suiting-cut',
    description: 'Super 120s finish Italian tropical fabric cut. Fluid fall, anti-wrinkle properties, and matte luxury texture for bespoke eastern kurtas.',
    material: 'Super 120s Italian Tropical Poly-Viscose',
    price: 5950,
    categories: ['pcat_gents_italian', 'pcat_01M3EW9AGYE2YT2P17ZSGFVTB9'],
    gender: 'men',
    brand: 'NAQSH Atelier',
    color: 'Midnight Navy',
    image: '/task-images/naqsh-task-product-14.jpg',
    sku: 'NQ-MEN-ITL-14'
  },
  // 15. MEN WASH & WEAR
  {
    id: 'prod_naqsh_task_m_washwear',
    title: 'Executive Wrinkle-Free Easy-Care Wash & Wear 4.5-Meter Fabric Cut',
    handle: 'executive-wrinkle-free-wash-wear-cut',
    description: 'Premium daily-wear wash and wear fabric cut: 4.5m generous length with micro-filament yarn preventing wrinkles and maintaining crisp collar lines.',
    material: 'High-Twist Microfilament Wash & Wear',
    price: 3650,
    categories: ['pcat_gents_wash_wear', 'pcat_01M3EW9AGYE2YT2P17ZSGFVTB9'],
    gender: 'men',
    brand: 'NAQSH Atelier',
    color: 'Slate Smoke',
    image: '/task-images/naqsh-task-product-15.jpg',
    sku: 'NQ-MEN-WNW-15'
  },
  // 16. MEN KHADDAR
  {
    id: 'prod_naqsh_task_m_khaddar',
    title: 'Authentic Kamalia Traditional Heavy Handspun Khaddar 7-Meter Suit Cut',
    handle: 'authentic-kamalia-heavy-khaddar-7m-cut',
    description: 'Original Kamalia handloom 7-meter full suit cut. Crafted from pure cotton thick yarns, delivering unmistakable texture, warmth, and dignity.',
    material: '100% Traditional Kamalia Handloom Khaddar',
    price: 4450,
    categories: ['pcat_gents_kamalia_khaddar', 'pcat_01M3EW9AGYE2YT2P17ZSGFVTB9'],
    gender: 'men',
    brand: 'NAQSH Atelier',
    color: 'Earth Brown',
    image: '/task-images/naqsh-task-product-16.jpg',
    sku: 'NQ-MEN-KHD-16'
  },
  // 17. BRAND - KHAADI WOMEN
  {
    id: 'prod_naqsh_task_br_khaadi_3pc',
    title: 'Khaadi Signature Luxury Embroidered 3-Piece Unstitched Lawn Cut',
    handle: 'khaadi-signature-3pc-luxury-lawn-cut',
    description: 'Authentic Khaadi unstitched ensemble: 3m printed & resham embroidered lawn shirt, printed swiss voile dupatta, and dyed cambric shalwar fabric.',
    material: 'Pure Combed Lawn & Swiss Voile Dupatta',
    price: 8450,
    categories: ['pcat_khaadi_women_3pc', 'pcat_brand_khaadi_women', 'pcat_ladies_3pc', 'pcat_01M3EW9AGX87DJN0W7RP7Z6041'],
    gender: 'women',
    brand: 'khaadi',
    color: 'Terracotta Rust',
    image: '/task-images/naqsh-task-product-17.jpg',
    sku: 'KH-LAD-3PC-17'
  },
  // 18. BRAND - SAPPHIRE WOMEN
  {
    id: 'prod_naqsh_task_br_sapphire_silk',
    title: 'Sapphire Silk Dupatta Edit 3-Piece Luxury Unstitched Ensemble',
    handle: 'sapphire-silk-dupatta-3pc-unstitched-cut',
    description: 'Luxury unstitched festive collection: 3m finely woven jacquard lawn shirt with floral embroidery motifs, and 2.5m pure silk medium dupatta cut.',
    material: 'Jacquard Lawn & Pure Silk Dupatta',
    price: 9250,
    categories: ['pcat_sapphire_women_silk', 'pcat_brand_sapphire_women', 'pcat_ladies_silk', 'pcat_01M3EW9AGX87DJN0W7RP7Z6041'],
    gender: 'women',
    brand: 'sapphire',
    color: 'Rose Petal',
    image: '/task-images/naqsh-task-product-18.jpg',
    sku: 'SP-LAD-SLK-18'
  },
  // 19. BRAND - J. GENTS
  {
    id: 'prod_naqsh_task_br_jdot_washwear',
    title: 'J. Junaid Jamshed Executive Wash & Wear 4.5-Meter Gents Fabric Cut',
    handle: 'j-dot-executive-wash-wear-cut',
    description: 'Signature J. Gents unstitched collection: 4.5m premium wrinkle-resistant wash-and-wear fabric with smooth feel, high durability, and classic drape.',
    material: 'Signature Poly-Viscose Wash & Wear',
    price: 4950,
    categories: ['pcat_j_dot_men_wash_wear', 'pcat_brand_j_dot_men', 'pcat_gents_wash_wear', 'pcat_01M3EW9AGYE2YT2P17ZSGFVTB9'],
    gender: 'men',
    brand: 'j-dot',
    color: 'Jet Black',
    image: '/task-images/naqsh-task-product-19.jpg',
    sku: 'JD-GNT-WNW-19'
  },
  // 20. BRAND - GUL AHMED WOMEN
  {
    id: 'prod_naqsh_task_br_gulahmed_karandi',
    title: 'Gul Ahmed Traditional Karandi & Khaddar 3-Piece Unstitched Suit',
    handle: 'gul-ahmed-karandi-khaddar-3pc-cut',
    description: 'Iconic Gul Ahmed winter collection: 3m luxury Karandi shirt with woven neckline border, Karandi shawl dupatta cut, and dyed trousers.',
    material: 'Pure Handspun Karandi & Woven Shawl',
    price: 7650,
    categories: ['pcat_gul_ahmed_women_karandi', 'pcat_brand_gul_ahmed_women', 'pcat_ladies_karandi', 'pcat_01M3EW9AGX87DJN0W7RP7Z6041'],
    gender: 'women',
    brand: 'gul-ahmed',
    color: 'Olive Khaki',
    image: '/task-images/naqsh-task-product-20.jpg',
    sku: 'GA-LAD-KRD-20'
  }
];

async function seedProducts(url, name) {
  console.log(`\n==============================================`);
  console.log(`SEEDING 20 AUTHENTIC PRODUCTS ON ${name}`);
  console.log(`==============================================`);

  const client = new Client({ connectionString: url });
  await client.connect();

  try {
    await client.query('BEGIN');

    for (const p of NEW_PRODUCTS) {
      console.log(`Seeding product: ${p.title} (${p.sku})`);

      // 1. Insert or update product
      await client.query(`
        INSERT INTO product (
          id, title, handle, description, material, thumbnail, status, is_giftcard, discountable, metadata, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, 'published', false, true, $7, NOW(), NOW()
        ) ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          handle = EXCLUDED.handle,
          description = EXCLUDED.description,
          material = EXCLUDED.material,
          thumbnail = EXCLUDED.thumbnail,
          status = 'published',
          metadata = EXCLUDED.metadata,
          updated_at = NOW()
      `, [
        p.id,
        p.title,
        p.handle.startsWith('naqsh-task-') ? p.handle : ('naqsh-task-' + p.handle),
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

      // 2. Link categories
      for (const catId of p.categories) {
        await client.query(`
          INSERT INTO product_category_product (product_id, product_category_id)
          VALUES ($1, $2) ON CONFLICT DO NOTHING
        `, [p.id, catId]);
      }

      // 3. Image
      const imgId = `img_${p.id}`;
      await client.query(`
        INSERT INTO image (id, url, metadata, rank, product_id, created_at, updated_at)
        VALUES ($1, $2, '{}', 0, $3, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET url = EXCLUDED.url, product_id = EXCLUDED.product_id, updated_at = NOW()
      `, [imgId, p.image, p.id]);

      // 4. Price and Variant
      const variantId = `var_${p.id}`;
      const priceSetId = `pset_${p.id}`;
      const priceId = `price_${p.id}`;

      await client.query(`
        INSERT INTO price_set (id, created_at, updated_at)
        VALUES ($1, NOW(), NOW()) ON CONFLICT (id) DO NOTHING
      `, [priceSetId]);

      await client.query(`
        INSERT INTO price (id, price_set_id, currency_code, amount, raw_amount, created_at, updated_at)
        VALUES ($1, $2, 'pkr', $3, $4, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET amount = EXCLUDED.amount, raw_amount = EXCLUDED.raw_amount, updated_at = NOW()
      `, [priceId, priceSetId, p.price, JSON.stringify({ value: String(p.price), precision: 20 })]);

      await client.query(`
        INSERT INTO product_variant (
          id, product_id, title, sku, manage_inventory, allow_backorder, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, true, false, NOW(), NOW()
        ) ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          sku = EXCLUDED.sku,
          manage_inventory = true,
          allow_backorder = false,
          updated_at = NOW()
      `, [variantId, p.id, `${p.color} - Unstitched Cut`, p.sku]);

      await client.query(`
        INSERT INTO product_variant_price_set (id, variant_id, price_set_id)
        VALUES ($1, $2, $3)
        ON CONFLICT DO NOTHING
      `, [`pvps_${p.id}`, variantId, priceSetId]);

      // 6. Clean Inventory Item
      const invItemId = `iitem_${variantId}`;
      await client.query(`
        INSERT INTO inventory_item (
          id, sku, title, description, requires_shipping, material, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, true, $5, NOW(), NOW()
        ) ON CONFLICT (id) DO UPDATE SET
          sku = EXCLUDED.sku,
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          material = EXCLUDED.material,
          updated_at = NOW()
      `, [
        invItemId,
        p.sku,
        `${p.title} - ${p.color}`,
        `100% Unstitched Fabric Cut (${p.material})`,
        p.material
      ]);

      // 7. Variant Inventory Link
      await client.query(`
        INSERT INTO product_variant_inventory_item (
          id, variant_id, inventory_item_id, required_quantity
        ) VALUES ($1, $2, $3, 1)
        ON CONFLICT (variant_id, inventory_item_id) DO NOTHING
      `, [`pvii_${variantId}`, variantId, invItemId]);

      // 8. Inventory Level (50 In Stock)
      await client.query(`
        INSERT INTO inventory_level (
          id, inventory_item_id, location_id, stocked_quantity, reserved_quantity, incoming_quantity, raw_stocked_quantity, raw_reserved_quantity, raw_incoming_quantity, created_at, updated_at
        ) VALUES (
          $1, $2, $3, 50, 0, 0, '{"value": "50"}', '{"value": "0"}', '{"value": "0"}', NOW(), NOW()
        ) ON CONFLICT (id) DO UPDATE SET
          stocked_quantity = 50,
          raw_stocked_quantity = '{"value": "50"}',
          updated_at = NOW()
      `, [`ilev_${variantId}`, invItemId, STOCK_LOCATION_ID]);
    }

    await client.query('COMMIT');
    console.log(`SUCCESS: Seeded all 20 products with inventory on ${name}!`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`Error on ${name}:`, err);
    throw err;
  } finally {
    await client.end();
  }
}

async function main() {
  await seedProducts(NEON_URL, 'NEON_DB');
  await seedProducts(RAILWAY_URL, 'RAILWAY_DB');
  console.log('\nALL 20 PRODUCTS SUCCESSFULLY SEEDED ON BOTH DATABASES!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
