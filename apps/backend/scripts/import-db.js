const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { Client } = require('pg');

async function importDatabase(targetDbUrl) {
  const dbUrl = targetDbUrl || process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL is not set!');
  }

  const exportPath = path.resolve(__dirname, '../local_db_export.json.gz');
  if (!fs.existsSync(exportPath)) {
    throw new Error(`Export file not found at: ${exportPath}`);
  }

  console.log('Reading and decompressing export data...');
  const compressed = fs.readFileSync(exportPath);
  const jsonStr = zlib.gunzipSync(compressed).toString('utf-8');
  const exportData = JSON.parse(jsonStr);
  const tableNames = Object.keys(exportData);
  console.log(`Loaded ${tableNames.length} tables from export.`);

  const client = new Client({ connectionString: dbUrl });
  await client.connect();
  console.log('Connected to target database successfully.');

  try {
    // 1. Temporarily disable foreign key constraints
    console.log('Disabling triggers / foreign keys temporarily...');
    await client.query("SET session_replication_role = 'replica';");

    // 2. Clear target tables (except internal migrations if we want, or clear all data tables)
    // We clear all tables present in the export
    console.log('Clearing existing data from target tables...');
    for (const table of tableNames) {
      try {
        await client.query(`TRUNCATE TABLE "${table}" CASCADE`);
      } catch (err) {
        // Table might not exist yet or error, which is fine
        try {
          await client.query(`DELETE FROM "${table}"`);
        } catch (e) {}
      }
    }

    // 3. Insert data table by table in batches
    console.log('Inserting data into target tables...');
    for (const table of tableNames) {
      const rows = exportData[table];
      if (!rows || rows.length === 0) continue;

      const columns = Object.keys(rows[0]);
      const quotedCols = columns.map(c => `"${c}"`).join(', ');

      const batchSize = 250;
      let inserted = 0;

      for (let i = 0; i < rows.length; i += batchSize) {
        const chunk = rows.slice(i, i + batchSize);
        const values = [];
        const valuePlaceholders = [];

        chunk.forEach((row, rowIdx) => {
          const rowPlaceholders = [];
          columns.forEach((col, colIdx) => {
            const paramIdx = rowIdx * columns.length + colIdx + 1;
            rowPlaceholders.push(`$${paramIdx}`);
            let val = row[col];
            // Format object/array fields as JSON strings if needed
            if (val !== null && typeof val === 'object' && !(val instanceof Date)) {
              val = JSON.stringify(val);
            }
            values.push(val);
          });
          valuePlaceholders.push(`(${rowPlaceholders.join(', ')})`);
        });

        const sql = `INSERT INTO "${table}" (${quotedCols}) VALUES ${valuePlaceholders.join(', ')}`;
        try {
          await client.query(sql, values);
          inserted += chunk.length;
        } catch (insertErr) {
          console.error(`Error inserting into ${table} (batch ${i}-${i + chunk.length}):`, insertErr.message);
          // Try row by row for this chunk to recover as much as possible
          for (const singleRow of chunk) {
            try {
              const singleValues = columns.map(c => {
                let v = singleRow[c];
                if (v !== null && typeof v === 'object' && !(v instanceof Date)) return JSON.stringify(v);
                return v;
              });
              const singleSql = `INSERT INTO "${table}" (${quotedCols}) VALUES (${columns.map((_, idx) => `$${idx + 1}`).join(', ')})`;
              await client.query(singleSql, singleValues);
              inserted++;
            } catch (singleErr) {
              // Ignore single row errors if incompatible schema
            }
          }
        }
      }

      console.log(`  ✓ ${table}: restored ${inserted}/${rows.length} rows`);
    }

    // 4. Reset sequences
    console.log('Resetting sequences...');
    const seqRes = await client.query(`
      SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public'
    `);
    for (const seq of seqRes.rows) {
      try {
        await client.query(`SELECT setval('"${seq.sequence_name}"', (SELECT COALESCE(MAX(id), 1) FROM "${seq.sequence_name.replace(/_id_seq$/, '')}"))`);
      } catch (e) {}
    }

    // 5. Re-enable foreign key constraints
    console.log('Re-enabling triggers / foreign keys...');
    await client.query("SET session_replication_role = 'origin';");

    console.log('==============================================');
    console.log('DATABASE RESTORE COMPLETED SUCCESSFULLY!');
    console.log('==============================================');
    return { success: true };
  } catch (err) {
    console.error('Database restore error:', err);
    try {
      await client.query("SET session_replication_role = 'origin';");
    } catch (e) {}
    throw err;
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  importDatabase().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { importDatabase };
