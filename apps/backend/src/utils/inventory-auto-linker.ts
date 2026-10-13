import { Client } from "pg"

export async function runInventoryAutoLinker(customConnectionString?: string): Promise<{ linked: number; details: string[] }> {
  const connectionString = customConnectionString || process.env.DATABASE_URL
  if (!connectionString) {
    return { linked: 0, details: [] }
  }

  const isLocal = connectionString.includes("localhost") || connectionString.includes("127.0.0.1")
  const client = new Client({
    connectionString,
    ssl: isLocal ? false : { rejectUnauthorized: false },
  })

  try {
    await client.connect()

    // Find default stock location
    const locRes = await client.query("SELECT id FROM stock_location ORDER BY created_at ASC LIMIT 1")
    const stockLocationId = locRes.rows[0]?.id || "sloc_01M3EW98XJ4RACZA75YDSA0ZJE"

    // Find unlinked variants
    const unlinked = await client.query(`
      SELECT pv.id as variant_id, pv.title as variant_title, pv.sku, p.title as prod_title, pv.product_id
      FROM product_variant pv
      JOIN product p ON p.id = pv.product_id
      LEFT JOIN product_variant_inventory_item pvii ON pvii.variant_id = pv.id
      WHERE pvii.id IS NULL
    `)

    const details: string[] = []

    for (const row of unlinked.rows) {
      const invItemId = `iitem_${row.variant_id}`
      const pviiId = `pvii_${row.variant_id}`
      const ilevId = `ilev_${row.variant_id}`
      const invTitle = `${row.prod_title} - ${row.variant_title}`
      const invSku = row.sku || `SKU-${row.variant_id.slice(-8)}`

      // 1. Insert or update inventory_item
      await client.query(`
        INSERT INTO inventory_item (id, sku, title, description, material, created_at, updated_at)
        VALUES ($1, $2, $3, $4, 'Unstitched Fabric', NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          sku = EXCLUDED.sku,
          updated_at = NOW()
      `, [invItemId, invSku, invTitle, `100% Unstitched Fabric - ${row.prod_title}`])

      // 2. Link variant to inventory item
      await client.query(`
        INSERT INTO product_variant_inventory_item (id, variant_id, inventory_item_id, required_quantity)
        VALUES ($1, $2, $3, 1)
        ON CONFLICT (variant_id, inventory_item_id) DO NOTHING
      `, [pviiId, row.variant_id, invItemId])

      // 3. Create inventory level with default 50 stock
      await client.query(`
        INSERT INTO inventory_level (
          id, inventory_item_id, location_id, stocked_quantity, reserved_quantity, incoming_quantity,
          raw_stocked_quantity, raw_reserved_quantity, raw_incoming_quantity, created_at, updated_at
        ) VALUES ($1, $2, $3, 50, 0, 0, '{"value": "50"}', '{"value": "0"}', '{"value": "0"}', NOW(), NOW())
        ON CONFLICT (id) DO UPDATE SET
          stocked_quantity = COALESCE(inventory_level.stocked_quantity, 50),
          raw_stocked_quantity = COALESCE(inventory_level.raw_stocked_quantity, '{"value": "50"}'),
          updated_at = NOW()
      `, [ilevId, invItemId, stockLocationId])

      // 4. Update variant manage_inventory
      await client.query(`
        UPDATE product_variant
        SET manage_inventory = true, allow_backorder = false
        WHERE id = $1
      `, [row.variant_id])

      details.push(`${invTitle} (${invSku})`)
    }

    return { linked: unlinked.rows.length, details }
  } finally {
    await client.end().catch(() => {})
  }
}
