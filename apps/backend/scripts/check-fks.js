const { Client } = require('pg');
const RAILWAY_URL = 'postgresql://postgres:UYdliHHIlLqHXqgptVsUSlXqKUdMeqxD@reseau.proxy.rlwy.net:41305/railway';

async function checkFks() {
  const client = new Client({ connectionString: RAILWAY_URL });
  await client.connect();
  try {
    const res = await client.query(`
      SELECT
        tc.table_schema, 
        tc.constraint_name, 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND ccu.table_name='order';
    `);
    console.log("Foreign keys referencing 'order':");
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error("Error checking FKs:", err);
  } finally {
    await client.end();
  }
}

checkFks();
