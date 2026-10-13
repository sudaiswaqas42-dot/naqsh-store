const { Client } = require('pg');
const rlwyUrl = 'postgresql://postgres:UYdliHHIlLqHXqgptVsUSlXqKUdMeqxD@reseau.proxy.rlwy.net:41305/railway';

async function check() {
  const c = new Client({ connectionString: rlwyUrl });
  await c.connect();

  const total = await c.query(`
    SELECT count(*) FROM product
  `);
  console.log('Total products in database:', total.rows[0].count);

  const res = await c.query(`
    SELECT count(*) 
    FROM product 
    WHERE (handle LIKE 'nq-women-%' OR handle LIKE 'nq-men-%')
      AND (metadata::text ILIKE '%"fabric_type":"Stitched"%'
           OR title ILIKE '%pret%' 
           OR title ILIKE '%kurti%' 
           OR title ILIKE '%waistcoat%' 
           OR title ILIKE '%pajama%')
  `);
  console.log('Stitched in Women/Men:', res.rows[0].count);

  await c.end();
}

check().catch(console.error);
