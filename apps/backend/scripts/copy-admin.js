const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, '../public/admin');
if (fs.existsSync(src)) {
  // 1. Copy to .medusa/server/public/admin
  const serverDest = path.resolve(__dirname, '../.medusa/server/public/admin');
  fs.mkdirSync(serverDest, { recursive: true });
  fs.cpSync(src, serverDest, { recursive: true });

  // 2. Copy to root public/admin
  const rootDest = path.resolve(__dirname, '../../../public/admin');
  try {
    fs.mkdirSync(rootDest, { recursive: true });
    fs.cpSync(src, rootDest, { recursive: true });
  } catch (e) {}

  console.log('Admin assets copied to all target directories successfully!');
} else {
  console.log('No public/admin directory found at', src);
}
