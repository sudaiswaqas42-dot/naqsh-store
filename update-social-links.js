const { Client } = require('pg');
const client = new Client({ connectionString: process.env.DATABASE_URL });
async function main() {
  await client.connect();
  const links = {
    facebook: 'https://www.facebook.com/share/1EgwjwJypC/',
    instagram: 'https://www.instagram.com/naqsh._.store?stkn=NDFrMTE5b3YwODI2',
    tiktok: 'https://tiktok.com/@naqsh._.store',
    pinterest: 'https://pinterest.com/naqshbrand'
  };
  await client.query('UPDATE homepage_section SET settings = $1 WHERE "key" = \'social_links\'', [JSON.stringify(links)]);
  console.log('SUCCESSFULLY UPDATED SOCIAL LINKS IN DB');
  await client.end();
}
main().catch(console.error);
