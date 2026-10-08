const { Client } = require('pg');
const client = new Client({ connectionString: 'postgres://postgres:1234@localhost/medusa-naqsh-store' });

async function run() {
  await client.connect();
  const tables = ['product_option', 'product_option_value', 'product_image', 'product_category_product', 'product_variant', 'product'];
  for (const table of tables) {
    const res = await client.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = $1`,
      [table]
    );
    console.log(table, '->', res.rows.map(r => r.column_name).join(', '));
  }
  await client.end();
}

run().catch(console.error);
