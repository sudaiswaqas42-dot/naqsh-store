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
        console.log(`[copy-admin] Injected custom layout styles into: ${indexPath}`);
      }

      const customScript = `<script id="naqsh-admin-enhancements">
(function() {
  const UNSTITCHED_COLORS = [
    "Black", "White", "Off White", "Cream", "Navy Blue", "Royal Blue", "Sky Blue",
    "Emerald Green", "Bottle Green", "Olive Green", "Mint Green", "Sea Green",
    "Maroon", "Burgundy", "Ruby Red", "Crimson", "Rust", "Mustard Yellow",
    "Gold", "Beige", "Camel", "Fawn", "Khaki", "Charcoal Grey", "Silver Grey",
    "Slate Grey", "Teal", "Plum", "Deep Purple", "Lilac", "Lavender", "Dusty Rose",
    "Peach", "Salmon Pink", "Baby Pink", "Chocolate Brown", "Coffee", "Copper", "Magenta"
  ];
  let dropdownEl = null;
  let activeInput = null;

  function createDropdown() {
    if (dropdownEl) return dropdownEl;
    dropdownEl = document.createElement('div');
    dropdownEl.id = 'naqsh-color-autocomplete';
    dropdownEl.style.cssText = 'position:absolute;z-index:99999;background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;box-shadow:0 10px 25px -5px rgba(0,0,0,0.1),0 8px 10px -6px rgba(0,0,0,0.1);max-height:220px;overflow-y:auto;width:220px;display:none;font-family:inherit;font-size:13px;padding:4px;';
    document.body.appendChild(dropdownEl);
    return dropdownEl;
  }

  function positionDropdown(input) {
    const rect = input.getBoundingClientRect();
    const dropdown = createDropdown();
    dropdown.style.top = (window.scrollY + rect.bottom + 4) + 'px';
    dropdown.style.left = (window.scrollX + rect.left) + 'px';
    dropdown.style.width = Math.max(rect.width, 220) + 'px';
  }

  function renderOptions(query, input) {
    const dropdown = createDropdown();
    const filtered = UNSTITCHED_COLORS.filter(c => c.toLowerCase().includes((query || '').toLowerCase().trim()));
    if (filtered.length === 0) { dropdown.style.display = 'none'; return; }
    dropdown.innerHTML = '';
    filtered.slice(0, 10).forEach(color => {
      const item = document.createElement('div');
      item.style.cssText = 'padding:7px 12px;cursor:pointer;border-radius:5px;color:#1e293b;font-weight:500;display:flex;align-items:center;gap:8px;transition:background-color 0.15s ease;';
      const swatchColor = color.toLowerCase().replace(/[^a-z]/g, '');
      item.innerHTML = '<span style="display:inline-block;width:12px;height:12px;border-radius:50%;border:1px solid rgba(0,0,0,0.15);background:' + swatchColor + ';"></span><span>' + color + '</span>';
      item.addEventListener('mouseenter', () => item.style.backgroundColor = '#f1f5f9');
      item.addEventListener('mouseleave', () => item.style.backgroundColor = 'transparent');
      item.addEventListener('mousedown', (e) => { e.preventDefault(); selectColor(color, input); });
      dropdown.appendChild(item);
    });
    positionDropdown(input);
    dropdown.style.display = 'block';
  }

  function selectColor(color, input) {
    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    if (nativeSetter) nativeSetter.call(input, color); else input.value = color;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
    input.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
    if (dropdownEl) dropdownEl.style.display = 'none';
    input.focus();
  }

  function isColorOrOptionInput(input) {
    if (!input || input.type === 'hidden' || input.type === 'checkbox' || input.type === 'radio') return false;
    const name = (input.name || '').toLowerCase();
    const id = (input.id || '').toLowerCase();
    const placeholder = (input.placeholder || '').toLowerCase();
    const ariaLabel = (input.getAttribute('aria-label') || '').toLowerCase();
    const formGroup = input.closest('div, label, [role="group"]');
    const groupText = formGroup ? (formGroup.innerText || '').toLowerCase() : '';
    return placeholder.includes('color') || placeholder.includes('value') || placeholder.includes('tag') ||
           name.includes('color') || name.includes('value') || id.includes('color') || id.includes('value') ||
           ariaLabel.includes('color') || groupText.includes('option value') || groupText.includes('variations') || groupText.includes('color');
  }

  document.addEventListener('input', function(e) {
    if (e.target && e.target.tagName === 'INPUT' && isColorOrOptionInput(e.target)) {
      activeInput = e.target;
      renderOptions(e.target.value, e.target);
    }
  });

  document.addEventListener('focusin', function(e) {
    if (e.target && e.target.tagName === 'INPUT' && isColorOrOptionInput(e.target)) {
      activeInput = e.target;
      if (e.target.value) renderOptions(e.target.value, e.target);
    }
  });

  document.addEventListener('click', function(e) {
    if (dropdownEl && !dropdownEl.contains(e.target) && e.target !== activeInput) {
      dropdownEl.style.display = 'none';
    }
  });

  // Helper to clear pre-populated tags if unwanted preset appears
  function handleTagAutoClear() {
    const colorLabels = document.querySelectorAll('label, div');
    colorLabels.forEach(el => {
      if (el.innerText && el.innerText.trim() === 'Color' && !el.dataset.hasClearBtn) {
        const parent = el.closest('div[class*="flex"], div[class*="grid"], div') || el.parentElement;
        if (parent) {
          const clearBtn = document.createElement('button');
          clearBtn.type = 'button';
          clearBtn.innerText = 'Clear All ✕';
          clearBtn.title = 'Remove all pre-filled colors';
          clearBtn.style.cssText = 'margin-left:10px;font-size:11px;font-weight:600;color:#dc2626;background:#fef2f2;border:1px solid #fecaca;padding:2px 8px;border-radius:4px;cursor:pointer;';
          clearBtn.onmousedown = function(e) {
            e.preventDefault();
            e.stopPropagation();
            const removeBtns = parent.querySelectorAll('button');
            removeBtns.forEach(btn => {
              if (btn !== clearBtn && (btn.innerText.includes('×') || btn.innerText.includes('✕') || btn.querySelector('svg') || (btn.getAttribute('aria-label') || '').toLowerCase().includes('remove'))) {
                btn.click();
              }
            });
          };
          el.style.display = 'inline-flex';
          el.style.alignItems = 'center';
          el.appendChild(clearBtn);
          el.dataset.hasClearBtn = 'true';
        }
      }
    });

    const allContainers = document.querySelectorAll('div');
    allContainers.forEach(container => {
      const heading = (container.previousElementSibling?.innerText || container.parentElement?.innerText || '').toLowerCase();
      if (heading.includes('color')) {
        const removeBtns = Array.from(container.querySelectorAll('button')).filter(b => 
          b.innerText.includes('×') || b.innerText.includes('✕') || b.querySelector('svg') || (b.getAttribute('aria-label') || '').toLowerCase().includes('remove')
        );
        if (removeBtns.length >= 6 && !container.dataset.autoWiped) {
          container.dataset.autoWiped = 'true';
          removeBtns.forEach(b => b.click());
          console.log('[NAQSH Admin] Auto-cleared ' + removeBtns.length + ' unwanted preset colors.');
        }
      }
    });
  }
  setInterval(handleTagAutoClear, 500);

  let lastCheckedUrl = '';
  function checkInventoryState() {
    const currentUrl = window.location.href;
    if (currentUrl !== lastCheckedUrl) {
      lastCheckedUrl = currentUrl;
      if (currentUrl.includes('/variants/')) {
        setTimeout(() => {
          const bodyText = document.body.innerText || '';
          if (bodyText.includes('Inventory items') && bodyText.includes('No records')) {
            fetch('/admin/auto-link-inventory', { method: 'POST', credentials: 'include' })
              .then(res => res.json())
              .then(data => {
                if (data && data.linked > 0) {
                  console.log('[NAQSH Admin] Auto-linked variant to inventory item. Refreshing view...');
                  window.location.reload();
                }
              })
              .catch(() => {});
          }
        }, 800);
      }
    }
  }
  setInterval(checkInventoryState, 1500);
})();
</script>`;

      if (!html.includes('id="naqsh-admin-enhancements"')) {
        if (html.includes('</body>')) {
          html = html.replace('</body>', `${customScript}\n</body>`);
        } else {
          html = html + customScript;
        }
        console.log(`[copy-admin] Injected custom scripts into: ${indexPath}`);
      }

      fs.writeFileSync(indexPath, html, 'utf8');
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

