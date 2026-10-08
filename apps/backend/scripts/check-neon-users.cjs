const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://neondb_owner:npg_N5jy4HXSbDed@ep-delicate-bird-azhwwm8f-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require' });
pool.query('SELECT id, email FROM "user"').then(r => {
  console.log('Neon users:', r.rows);
  return pool.query("SELECT * FROM auth_identity");
}).then(r => {
  console.log('Auth identities:', r.rows.map(x => ({ id: x.id, provider: x.provider, entity_id: x.entity_id })));
  pool.end();
}).catch(e => {
  console.error(e);
  pool.end();
});
