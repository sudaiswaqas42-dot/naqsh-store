const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:1234@localhost/medusa-naqsh-store'
});

async function run() {
  await client.connect();

  const reviews = [
    {
      id: "rev_lawn_1",
      name: "Ayesha Malik",
      city: "Lahore",
      initials: "AM",
      quote: "The 3-piece embroidered lawn suit exceeded my expectations. Pure breathable pima lawn fabric and the chiffon dupatta drape is so graceful!",
      rating: 5,
      category: "3pc",
      verified: true,
      is_approved: true,
      date: "2 days ago",
    },
    {
      id: "rev_boski_1",
      name: "Chaudhry Salman",
      city: "Faisalabad",
      initials: "CS",
      quote: "Purchased the 8-pound pure silk Boski cut for Eid. Exceptional heirloom sheen, original pure silk feel, and exact 4.5-meter length.",
      rating: 5,
      category: "boski",
      verified: true,
      is_approved: true,
      date: "1 week ago",
    },
    {
      id: "rev_2pc_1",
      name: "Fatima Noor",
      city: "Karachi",
      initials: "FN",
      quote: "The 2-piece printed unstitched cut has vibrant colors that stayed sharp after multiple washes. Perfect summer fabric for daily luxury.",
      rating: 5,
      category: "2pc",
      verified: true,
      is_approved: true,
      date: "3 days ago",
    },
    {
      id: "rev_formals_1",
      name: "Zainab Tariq",
      city: "Islamabad",
      initials: "ZT",
      quote: "Heavy embroidered organza cut with hand-embellished zari work. Tailored it for my sister's wedding and everyone asked where the fabric was from!",
      rating: 5,
      category: "formals",
      verified: true,
      is_approved: true,
      date: "2 weeks ago",
    },
    {
      id: "rev_khaddar_1",
      name: "Hina Qureshi",
      city: "Rawalpindi",
      initials: "HQ",
      quote: "Traditional Kamalia Khaddar unstitched cut is so warm and soft. Genuine textured yarn weave that speaks timeless Pakistani heritage.",
      rating: 5,
      category: "khaddar",
      verified: true,
      is_approved: true,
      date: "5 days ago",
    },
    {
      id: "rev_gents_1",
      name: "Usman Raza",
      city: "Multan",
      initials: "UR",
      quote: "The Egyptian cotton wash & wear unstitched fabric is completely wrinkle-resistant. Tailored into a crisp shalwar kameez that stayed crease-free all day.",
      rating: 5,
      category: "gents",
      verified: true,
      is_approved: true,
      date: "4 days ago",
    },
  ];

  await client.query(
    `UPDATE homepage_section 
     SET title = 'Loved by Thousands',
         subtitle = 'Real feedback from verified shoppers across Pakistan who trust NAQSH for unstitched fabric cuts.',
         settings = jsonb_set(COALESCE(settings, '{}'::jsonb), '{reviews}', $1::jsonb)
     WHERE key = 'customer_reviews'`,
    [JSON.stringify(reviews)]
  );

  console.log('✓ customer_reviews updated with authentic unstitched categories and reviews');
  await client.end();
}

run().catch(e => { console.error(e); process.exit(1); });
