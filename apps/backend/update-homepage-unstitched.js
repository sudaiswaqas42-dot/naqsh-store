const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:1234@localhost/medusa-naqsh-store'
});

async function run() {
  await client.connect();
  console.log('Connected to PostgreSQL DB');

  // 1. Update fabric_strip (Image 2)
  const fabricStripCards = [
    {
      id: 'circle_1',
      title: '3-Piece Luxury Lawn',
      subtitle: 'Embroidered Voile & Chiffon',
      badge: 'TRENDING',
      link: '/categories/3pc',
      image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=85'
    },
    {
      id: 'circle_2',
      title: 'Unstitched 2-Piece',
      subtitle: 'Printed & Jacquard Lawn',
      badge: 'BESTSELLER',
      link: '/categories/2pc',
      image_url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=85'
    },
    {
      id: 'circle_3',
      title: 'Unstitched 1-Piece Cuts',
      subtitle: 'Embroidered Lawn & Cambric',
      badge: 'NEW IN',
      link: '/categories/women',
      image_url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=600&q=85'
    },
    {
      id: 'circle_4',
      title: 'Luxury Chiffon & Silk',
      subtitle: 'Festive Embroidered Couture',
      badge: 'HOT',
      link: '/categories/silk',
      image_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=85'
    },
    {
      id: 'circle_5',
      title: 'Handloom Pashmina',
      subtitle: 'Pure Cashmere & Wool Wraps',
      badge: 'HERITAGE',
      link: '/categories/women',
      image_url: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=600&q=85'
    },
    {
      id: 'circle_6',
      title: "Men's Unstitched Boski",
      subtitle: 'Pure Heirloom Silk 4.5m Cuts',
      badge: 'CLASSIC',
      link: '/categories/boski',
      image_url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=85'
    },
    {
      id: 'circle_7',
      title: "Men's Wash & Wear",
      subtitle: 'Fine Egyptian Cotton Suit Cuts',
      badge: 'POPULAR',
      link: '/categories/wash-wear',
      image_url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=600&q=85'
    },
    {
      id: 'circle_8',
      title: 'Junior Unstitched Cuts',
      subtitle: 'Festive Kids Fabric Lengths',
      badge: 'JUNIOR',
      link: '/categories/children',
      image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=85'
    }
  ];

  await client.query(
    `UPDATE homepage_section 
     SET subtitle = $1,
         settings = jsonb_set(COALESCE(settings, '{}'::jsonb), '{cards}', $2::jsonb)
     WHERE key = 'fabric_strip'`,
    [
      'Explore pure Pima lawn, artisanal formals, and handloom unstitched fabrics for modern celebrations.',
      JSON.stringify(fabricStripCards)
    ]
  );
  console.log('✓ fabric_strip updated');

  // 2. Update promo_banners (Task 3 / Image 3)
  const promoCards = [
    {
      id: 'card_lawn_spotlight',
      title: 'Summer Unstitched Lawn Edit',
      subtitle: 'Curated Pakistani Couture',
      badge: 'LIMITED EDITION',
      link: '/categories/women',
      image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=85'
    },
    {
      id: 'card_pret_spotlight',
      title: 'Festive Chiffon & Organza Edit',
      subtitle: 'Handcrafted Unstitched Coutures',
      badge: 'NEW ARRIVALS',
      link: '/categories/women',
      image_url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=85'
    }
  ];

  await client.query(
    `UPDATE homepage_section 
     SET settings = jsonb_set(COALESCE(settings, '{}'::jsonb), '{cards}', $1::jsonb)
     WHERE key = 'promo_banners'`,
    [JSON.stringify(promoCards)]
  );
  console.log('✓ promo_banners updated');

  // 3. Update sale_banner
  await client.query(
    `UPDATE homepage_section 
     SET title = 'Flat 20% Off Luxury Unstitched Fabrics & Seasonal Cuts',
         subtitle = 'Hand-embroidered lawn, pure silk dupattas, and Gents heirloom boski suit cuts. Applicable at checkout.',
         cta_text = 'Shop Unstitched Sale →',
         cta_link = '/categories/sale'
     WHERE key = 'sale_banner'`
  );
  console.log('✓ sale_banner updated');

  // 4. Update featured_categories
  const featuredCards = [
    {
      id: 'card_ladies_3pc',
      title: 'Ladies 3-Piece Luxury',
      subtitle: '1,250+ Fabric Cuts',
      badge: 'LUXURY LAWN',
      link: '/categories/3pc',
      image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=85'
    },
    {
      id: 'card_ladies_2pc',
      title: 'Ladies 2-Piece Printed',
      subtitle: '950+ Fabric Cuts',
      badge: 'BESTSELLER',
      link: '/categories/2pc',
      image_url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=85'
    },
    {
      id: 'card_silks',
      title: 'Pure Silk & Chiffon',
      subtitle: 'Festive Unstitched',
      badge: 'EXCLUSIVE',
      link: '/categories/silk',
      image_url: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=800&q=85'
    },
    {
      id: 'card_gents_boski',
      title: "Men's Pure Boski",
      subtitle: 'Heirloom Silk 4.5m Cuts',
      badge: 'PREMIUM SILK',
      link: '/categories/boski',
      image_url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=85'
    },
    {
      id: 'card_gents_cotton',
      title: "Men's Wash & Wear",
      subtitle: '1,000+ Fabric Cuts',
      badge: 'SUMMER EDITS',
      link: '/categories/wash-wear',
      image_url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=85'
    },
    {
      id: 'card_children',
      title: 'Children Unstitched',
      subtitle: 'Junior Festive Cuts',
      badge: 'JUNIOR FABRICS',
      link: '/categories/children',
      image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=85'
    }
  ];

  await client.query(
    `UPDATE homepage_section 
     SET title = 'Find Your Perfect Unstitched Cut',
         subtitle = 'Explore 100% pure unstitched fabrics: Ladies luxury lawn, pure silks, and Gents heirloom Boski cuts',
         settings = jsonb_set(COALESCE(settings, '{}'::jsonb), '{cards}', $1::jsonb)
     WHERE key = 'featured_categories'`,
    [JSON.stringify(featuredCards)]
  );
  console.log('✓ featured_categories updated');

  // 5. Update curated_tabs
  const curatedCards = [
    {
      id: 'card_crimson',
      title: 'Royal Crimson Embroidered Lawn 3-Piece',
      subtitle: 'LADIES UNSTITCHED',
      image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
      price: 6950,
      original_price: 8688,
      discount_percent: 20,
      badge: 'SALE',
      link: '/categories/3pc'
    },
    {
      id: 'card_organza',
      title: 'Ivory Pearl Organza Formal Ensemble Cut',
      subtitle: 'FESTIVE UNSTITCHED',
      image_url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
      price: 18500,
      original_price: 26428,
      discount_percent: 30,
      badge: 'SALE',
      link: '/categories/silk'
    },
    {
      id: 'card_silk_print',
      title: 'Printed Silk Unstitched Suit - Midnight Mirage',
      subtitle: '2-PIECE UNSTITCHED',
      image_url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80',
      price: 8200,
      original_price: 11714,
      discount_percent: 30,
      badge: 'SALE',
      link: '/categories/2pc'
    },
    {
      id: 'card_boski_suit',
      title: 'Pure Heirloom Silk Boski Unstitched Cut 4.5m',
      subtitle: 'GENTS HEIRLOOM',
      image_url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
      price: 14500,
      original_price: 18125,
      discount_percent: 20,
      badge: 'SALE',
      link: '/categories/boski'
    },
    {
      id: 'card_egyptian_cotton',
      title: 'Egyptian Combed Cotton Wash & Wear Cut 4.5m',
      subtitle: 'GENTS UNSTITCHED',
      image_url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80',
      price: 5200,
      original_price: 6500,
      discount_percent: 20,
      badge: 'SALE',
      link: '/categories/wash-wear'
    }
  ];

  await client.query(
    `UPDATE homepage_section 
     SET title = 'Curated Unstitched Cuts for You',
         subtitle = 'Hand-selected unstitched fabrics from our latest seasonal designer collections',
         cta_link = '/store',
         settings = jsonb_set(COALESCE(settings, '{}'::jsonb), '{cards}', $1::jsonb)
     WHERE key = 'curated_tabs'`,
    [JSON.stringify(curatedCards)]
  );
  console.log('✓ curated_tabs updated');

  await client.end();
  console.log('All homepage sections successfully updated to 100% Unstitched in database!');
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
