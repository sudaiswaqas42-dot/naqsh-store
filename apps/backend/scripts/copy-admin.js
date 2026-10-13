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

// Function to inject custom styles into index.html
function patchCustomStyles(dir) {
  const indexPath = path.join(dir, 'index.html');
  if (fs.existsSync(indexPath)) {
    try {
      let html = fs.readFileSync(indexPath, 'utf8');
      const customStyle = `<style id="naqsh-admin-styles">
  /* Fix Inventory Availability and Edit Drawer Layout */
  [role="dialog"] table,
  dialog table,
  table[data-table],
  .ui-drawer table {
    width: 100% !important;
    min-width: 560px !important;
    border-collapse: separate !important;
    border-spacing: 0 !important;
    margin-top: 16px !important;
    background: #ffffff !important;
    border-radius: 8px !important;
    border: 1px solid #e5e7eb !important;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04) !important;
    overflow: hidden !important;
  }

  [role="dialog"] th,
  dialog th,
  .ui-drawer th {
    background-color: #f8fafc !important;
    color: #475569 !important;
    font-weight: 600 !important;
    font-size: 13px !important;
    letter-spacing: 0.03em !important;
    padding: 12px 18px !important;
    border-bottom: 1px solid #e2e8f0 !important;
    text-align: left !important;
  }

  [role="dialog"] td,
  dialog td,
  .ui-drawer td {
    padding: 14px 18px !important;
    border-bottom: 1px solid #f1f5f9 !important;
    color: #0f172a !important;
    font-size: 14px !important;
    vertical-align: middle !important;
  }

  [role="dialog"] td input,
  dialog td input,
  .ui-drawer td input {
    min-width: 120px !important;
    width: 100% !important;
    max-width: 200px !important;
    padding: 8px 12px !important;
    border: 1.5px solid #cbd5e1 !important;
    border-radius: 6px !important;
    font-size: 14px !important;
    background-color: #ffffff !important;
    transition: all 0.2s ease !important;
  }

  [role="dialog"] td input:focus,
  dialog td input:focus,
  .ui-drawer td input:focus {
    border-color: #047857 !important;
    outline: none !important;
    box-shadow: 0 0 0 3px rgba(4, 120, 87, 0.15) !important;
  }

  /* Make inventory drawer / modal container look spacious and clean */
  [role="dialog"] > div:last-child {
    padding: 24px !important;
  }
</style>`;

      if (!html.includes('id="naqsh-admin-styles"')) {
        if (html.includes('</head>')) {
          html = html.replace('</head>', `${customStyle}\n</head>`);
        } else {
          html = html + customStyle;
        }
        fs.writeFileSync(indexPath, html, 'utf8');
        console.log(`[copy-admin] Injected custom layout styles into: ${indexPath}`);
      }
    } catch (err) {
      console.warn(`[copy-admin] Could not patch styles in ${indexPath}:`, err.message);
    }
  }
}

// Enforce 50MB limit and custom styles in all destinations and sourceDir
console.log('[copy-admin] Patching bundles for 50MB file upload limit and custom layout styles...');
if (sourceDir) {
  patchUploadLimit(sourceDir);
  patchCustomStyles(sourceDir);
}
for (const dest of destinations) {
  patchUploadLimit(dest);
  patchCustomStyles(dest);
}
console.log('[copy-admin] Admin bundles ready with 50MB file upload support & custom styles.');

