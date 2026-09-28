const { Client } = require("pg")

async function check() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  })
  await client.connect()

  const users = await client.query('SELECT id, email, first_name, last_name FROM "user"')
  console.log("Users in DB:")
  console.table(users.rows)

  const auth = await client.query("SELECT id, provider, entity_id, provider_metadata FROM auth_identity")
  console.log("Auth identities:")
  console.table(auth.rows)

  await client.end()
}

check().catch(console.error)
