const { Client } = require('pg');

const COLOR_PALETTES = {
  'women-stitched': [
    ['Midnight Blue', 'Sand Beige'],
    ['Emerald Green', 'Ruby Red'],
    ['Ivory Gold', 'Dusky Rose'],
    ['Sage Green', 'Blush Pink'],
    ['Mustard Yellow', 'Charcoal Black'],
    ['Royal Cobalt', 'Champagne'],
    ['Plum Violet', 'Pearl White'],
    ['Terracotta', 'Olive Green'],
    ['Teal Blue', 'Sunset Peach'],
    ['Crimson Maroon', 'Warm Taupe'],
  ],
  'women-unstitched': [
    ['Lilac Bloom', 'Pistachio Green'],
    ['Ruby Crimson', 'Golden Ochre'],
    ['Powder Blue', 'Almond Ivory'],
    ['Deep Sapphire', 'Misty Rose'],
    ['Burnt Orange', 'Forest Green'],
    ['Orchid Violet', 'Honey Beige'],
    ['Coral Pink', 'Mint Frost'],
    ['Classic Black', 'Antique Gold'],
  ],
  'men-stitched': [
    ['Charcoal Black', 'Navy Blue'],
    ['Olive Green', 'Desert Sand'],
    ['Off White', 'Slate Gray'],
    ['Deep Maroon', 'Champagne Gold'],
    ['Steel Blue', 'Warm Brown'],
    ['Ivory Cream', 'Midnight Jet'],
  ],
  'men-unstitched': [
    ['Pure White', 'Off White'],
    ['Cream Ivory', 'Latte Brown'],
    ['Charcoal Navy', 'Ash Gray'],
    ['Egyptian Sand', 'Royal Indigo'],
  ],
  'children': [
    ['Coral Peach', 'Teal'],
    ['Baby Pink', 'Sky Blue'],
    ['Sunflower Yellow', 'Mint Green'],
    ['Ruby Red', 'Ivory Pearl'],
  ],
};

const DEFAULT_SIZES = ['Small', 'Medium', 'Large', 'XL'];

async function updateDatabase(dbUrl, label) {
  console.log(`\n========================================`);
  console.log(`Updating ${label}...`);
  console.log(`========================================`);

  const client = new Client({ connectionString: dbUrl });
  await client.connect();

  // 1. Update any legacy short size values in product_option_value table
  console.log('1. Updating short sizes (S, M, L, XL) in product_option_value...');
  await client.query("UPDATE product_option_value SET value = 'Small' WHERE value = 'S'");
  await client.query("UPDATE product_option_value SET value = 'Medium' WHERE value = 'M'");
  await client.query("UPDATE product_option_value SET value = 'Large' WHERE value = 'L'");
  await client.query("UPDATE product_option_value SET value = 'XL' WHERE value = 'XL'");
  await client.query("UPDATE product_option_value SET value = 'Extra Small' WHERE value = 'XS'");
  await client.query("UPDATE product_option_value SET value = '2XL' WHERE value = 'XXL' OR value = '2XL'");

  // 2. Fetch all products and their primary category
  console.log('2. Fetching products to update metadata with sizes and colors...');
  const res = await client.query(`
    SELECT p.id, p.title, p.metadata, pc.handle as category_handle
    FROM product p
    LEFT JOIN product_category_product pcp ON pcp.product_id = p.id
    LEFT JOIN product_category pc ON pc.id = pcp.product_category_id
  `);

  // De-duplicate products (some are linked to multiple categories)
  const productMap = new Map();
  for (const row of res.rows) {
    if (!productMap.has(row.id)) {
      productMap.set(row.id, row);
    } else if (row.category_handle && !row.category_handle.startsWith('women') && !row.category_handle.startsWith('men') && !row.category_handle.startsWith('kids')) {
      // prefer subcategory handle if available
      productMap.set(row.id, row);
    }
  }

  const products = Array.from(productMap.values());
  console.log(`Found ${products.length} unique products.`);

  const updates = [];
  let index = 0;
  for (const p of products) {
    index++;
    const cat = p.category_handle || 'women-stitched';
    let paletteKey = 'women-stitched';
    if (cat.includes('unstitched') && cat.includes('men')) {
      paletteKey = 'men-unstitched';
    } else if (cat.includes('unstitched')) {
      paletteKey = 'women-unstitched';
    } else if (cat.includes('men')) {
      paletteKey = 'men-stitched';
    } else if (cat.includes('child') || cat.includes('kid')) {
      paletteKey = 'children';
    } else if (cat.includes('women')) {
      paletteKey = 'women-stitched';
    }

    const paletteList = COLOR_PALETTES[paletteKey] || COLOR_PALETTES['women-stitched'];
    const chosenColors = paletteList[index % paletteList.length];

    const currentMeta = p.metadata || {};
    const updatedMeta = {
      ...currentMeta,
      sizes: currentMeta.sizes && Array.isArray(currentMeta.sizes) && currentMeta.sizes.length > 0
        ? currentMeta.sizes.map(s => s === 'S' ? 'Small' : s === 'M' ? 'Medium' : s === 'L' ? 'Large' : s)
        : DEFAULT_SIZES,
      colors: currentMeta.colors && Array.isArray(currentMeta.colors) && currentMeta.colors.length > 0
        ? currentMeta.colors
        : chosenColors,
    };

    updates.push({
      id: p.id,
      metadata: JSON.stringify(updatedMeta)
    });
  }

  console.log(`3. Executing chunked update for ${updates.length} products...`);
  const chunkSize = 500;
  for (let i = 0; i < updates.length; i += chunkSize) {
    const chunk = updates.slice(i, i + chunkSize);
    const values = chunk.map(c => `('${c.id}', '${c.metadata.replace(/'/g, "''")}')`).join(',');
    await client.query(`
      UPDATE product AS p
      SET metadata = c.metadata::jsonb
      FROM (VALUES ${values}) AS c(id, metadata)
      WHERE p.id = c.id
    `);
    console.log(`  Updated ${Math.min(i + chunkSize, updates.length)} / ${updates.length} products`);
  }

  console.log(`Successfully updated ${label}!`);
  await client.end();
}

async function main() {
  const localDbUrl = 'postgres://postgres:1234@localhost/medusa-naqsh-store';
  await updateDatabase(localDbUrl, 'Local PostgreSQL Database');

  const fs = require('fs');
  const path = require('path');
  const envDepPath = path.join(__dirname, '../.env.deployment');
  if (fs.existsSync(envDepPath)) {
    const envDep = fs.readFileSync(envDepPath, 'utf8');
    const match = envDep.match(/DATABASE_URL=(.+)/);
    if (match && match[1]) {
      const prodDbUrl = match[1].trim();
      await updateDatabase(prodDbUrl, 'Production Neon PostgreSQL Database');
    }
  }
}

main().catch(console.error);
