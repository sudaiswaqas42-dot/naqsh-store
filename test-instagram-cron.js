/**
 * Standalone Local Tester for Instagram Reels Cron & Graph API Integration
 * Run: node test-instagram-cron.js
 */

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/naqsh_instagram";
const DB_NAME = "naqsh_instagram";

async function testInstagramIntegration() {
  console.log("=================================================");
  console.log("NAQSH Instagram Reels & Cron Job Local Diagnostic");
  console.log("=================================================\n");

  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  console.log(`1. Checking Environment Token: ${token ? "PRESENT (" + token.slice(0, 10) + "...)" : "NOT SET in process.env"}`);

  // Test MongoDB Connection
  console.log(`\n2. Testing MongoDB connection at: ${MONGODB_URI}...`);
  let client;
  let mongoConnected = false;
  try {
    client = new MongoClient(MONGODB_URI, { serverSelectionTimeoutMS: 2500 });
    await client.connect();
    mongoConnected = true;
    console.log("✓ MongoDB Connected Successfully!");
    
    const db = client.db(DB_NAME);
    const reelsCount = await db.collection("instagram_reels").countDocuments();
    const tokenDoc = await db.collection("instagram_tokens").findOne({ id: "active_token" });
    
    console.log(`  - Stored Reels count in DB: ${reelsCount}`);
    console.log(`  - Active Token in DB: ${tokenDoc ? "EXISTS (expires: " + tokenDoc.expiresAt + ")" : "None yet"}`);
  } catch (err) {
    console.log(`⚠ MongoDB connection skipped or not running locally: ${err.message}`);
    console.log("  (The system automatically uses fallback cache in .cache/instagram_reels_backup.json)");
  } finally {
    if (client) await client.close();
  }

  // Test Instagram Graph API if token is provided
  if (token) {
    console.log("\n3. Testing Instagram Graph API Live Media Endpoint...");
    try {
      const url = `https://graph.instagram.com/me/media?fields=id,media_type,media_product_type,media_url,thumbnail_url,permalink,timestamp&access_token=${encodeURIComponent(token)}`;
      const res = await fetch(url);
      console.log(`  - HTTP Status: ${res.status}`);
      if (res.ok) {
        const json = await res.json();
        const data = json.data || [];
        const reels = data.filter(item => item.media_product_type === "REELS" || item.media_type === "VIDEO");
        console.log(`  ✓ Graph API responded with ${data.length} total media items!`);
        console.log(`  ✓ Found ${reels.length} REELS items ready for sync.`);
      } else {
        const errText = await res.text();
        console.log(`  ⚠ Graph API returned: ${errText}`);
      }
    } catch (e) {
      console.log(`  ⚠ Fetch error: ${e.message}`);
    }

    console.log("\n4. Testing Token Refresh API Endpoint...");
    try {
      const refreshUrl = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(token)}`;
      const res = await fetch(refreshUrl);
      console.log(`  - HTTP Status: ${res.status}`);
      const text = await res.text();
      console.log(`  - Response: ${text.slice(0, 150)}...`);
    } catch (e) {
      console.log(`  ⚠ Refresh test error: ${e.message}`);
    }
  } else {
    console.log("\n3. To test live Graph API fetch, export your token:");
    console.log("   $env:INSTAGRAM_ACCESS_TOKEN=\"your_token_here\"");
    console.log("   node test-instagram-cron.js");
  }

  console.log("\n=================================================");
  console.log("Diagnostic complete.");
  console.log("=================================================");
}

testInstagramIntegration().catch(console.error);
