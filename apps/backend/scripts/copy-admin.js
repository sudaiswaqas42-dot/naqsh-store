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

// Unique destinations where Medusa runtime or Railway might look for admin build
const rawDestinations = [
  path.resolve(__dirname, '../public/admin'),
  path.resolve(process.cwd(), 'public/admin'),
  path.resolve(__dirname, '../.medusa/server/public/admin'),
  path.resolve(process.cwd(), '.medusa/server/public/admin')
];

const destinations = Array.from(new Set(rawDestinations.map(d => path.resolve(d))));

// Function to recursively patch all JS/MJS bundle chunks to enforce 50MB file upload limit
function patchUploadLimit(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      patchUploadLimit(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.mjs'))) {
      try {
        let content = fs.readFileSync(fullPath, 'utf8');
        let modified = false;

        if (content.includes('1048576')) {
          content = content.replace(/1048576/g, '52428800');
          modified = true;
        }
        if (content.includes('1024 * 1024') || content.includes('1024*1024')) {
          content = content.replace(/1024\s*\*\s*1024/g, '52428800');
          modified = true;
        }
        if (content.includes('__MAX_UPLOAD_FILE_SIZE__')) {
          content = content.replace(/__MAX_UPLOAD_FILE_SIZE__/g, '52428800');
          modified = true;
        }
        if (content.includes('DEFAULT_MAX_FILE_SIZE =')) {
          content = content.replace(/DEFAULT_MAX_FILE_SIZE\s*=\s*[^;]+;/g, 'DEFAULT_MAX_FILE_SIZE = 52428800;');
          modified = true;
        }
        if (content.includes('...regions?.map(') || content.includes('...regions.map(')) {
          content = content.replace(/\.\.\.regions\?\.map\(/g, '...[]?.map(');
          content = content.replace(/\.\.\.regions\.map\(/g, '...[]?.map(');
          modified = true;
          console.log(`[copy-admin] Removed duplicate Price Region column in: ${entry.name}`);
        }

        if (modified) {
          fs.writeFileSync(fullPath, content, 'utf8');
          console.log(`[copy-admin] Enforced 50MB upload limit in: ${entry.name}`);
        }
      } catch (err) {
        console.warn(`[copy-admin] Could not patch ${entry.name}:`, err.message);
      }
    }
  }
}

if (sourceDir) {
  console.log(`Found admin build at: ${sourceDir}`);
  for (const dest of destinations) {
    try {
      if (path.resolve(sourceDir) !== path.resolve(dest)) {
        fs.mkdirSync(dest, { recursive: true });
        fs.cpSync(sourceDir, dest, { recursive: true, force: true });
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

// Enforce 50MB limit in all destinations and sourceDir
console.log('[copy-admin] Patching bundles for 50MB file upload limit...');
if (sourceDir) patchUploadLimit(sourceDir);
for (const dest of destinations) {
  patchUploadLimit(dest);
}
console.log('[copy-admin] Admin bundles ready with 50MB file upload support.');
