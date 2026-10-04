const fs = require('fs');
const path = require('path');

// Potential directories where medusa build might have put the admin build
const searchPaths = [
  path.resolve(__dirname, '../.medusa/server/public/admin'),
  path.resolve(__dirname, '../.medusa/admin'),
  path.resolve(__dirname, '../.medusa/client'),
  path.resolve(process.cwd(), '.medusa/server/public/admin'),
  path.resolve(process.cwd(), '.medusa/admin'),
  path.resolve(process.cwd(), '.medusa/client'),
  path.resolve(__dirname, '../../../.medusa/server/public/admin'),
  path.resolve(__dirname, '../../../.medusa/admin')
];

let sourceDir = null;
for (const p of searchPaths) {
  if (fs.existsSync(path.join(p, 'index.html'))) {
    sourceDir = p;
    break;
  }
}

// Destinations where Medusa runtime or Railway might look for admin build
const destinations = [
  path.resolve(__dirname, '../public/admin'),
  path.resolve(process.cwd(), 'public/admin'),
  path.resolve(__dirname, '../.medusa/server/public/admin'),
  path.resolve(process.cwd(), '.medusa/server/public/admin')
];

if (sourceDir) {
  console.log(`Found admin build at: ${sourceDir}`);
  for (const dest of destinations) {
    try {
      if (path.resolve(sourceDir) !== path.resolve(dest)) {
        fs.mkdirSync(dest, { recursive: true });
        fs.cpSync(sourceDir, dest, { recursive: true });
        console.log(`Copied admin build to: ${dest}`);
      }
    } catch (err) {
      console.warn(`Failed to copy to ${dest}:`, err.message);
    }
  }
} else {
  console.warn('Warning: Could not find admin build directory with index.html in search paths!');
  console.log('Checked paths:', searchPaths);

  // Fallback: Create a placeholder index.html so medusa start does not crash
  for (const dest of destinations) {
    try {
      fs.mkdirSync(dest, { recursive: true });
      const fallbackHtml = `<!DOCTYPE html><html><head><title>Medusa Admin</title></head><body><div id="root"><h1>Medusa Backend & Admin Running</h1></div></body></html>`;
      fs.writeFileSync(path.join(dest, 'index.html'), fallbackHtml);
      console.log(`Created fallback index.html at: ${dest}`);
    } catch (err) {
      console.warn(`Failed to create fallback at ${dest}:`, err.message);
    }
  }
}
