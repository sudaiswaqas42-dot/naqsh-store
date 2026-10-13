const { Client } = require('pg');

const NEON_URL = 'postgresql://neondb_owner:npg_N5jy4HXSbDed@ep-delicate-bird-azhwwm8f-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

async function main() {
  const c = new Client({ connectionString: NEON_URL });
  await c.connect();

  const res1 = await c.query("SELECT count(*) FROM product WHERE handle LIKE '%stitched%'");
  console.log('Handle contains stitched:', res1.rows[0].count);

  const res2 = await c.query("SELECT count(*) FROM product WHERE handle LIKE '%unstitched%'");
  console.log('Handle contains unstitched:', res2.rows[0].count);

  const handlePrefixes = await c.query(`
    SELECT split_part(handle, '-', 1) || '-' || split_part(handle, '-', 2) || '-' || split_part(handle, '-', 3) as prefix, count(*) 
    FROM product 
    GROUP BY prefix 
    ORDER BY count DESC
  `);
  console.log('\nProduct handle breakdown:', handlePrefixes.rows);

  await c.end();
}

main().catch(console.error);
