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

  /* NAQSH Color Scheme & Sidebar Hover Fix */
  .dark {
    --bg-base: #0F2D22 !important;
    --bg-subtle: #081B14 !important;
    --bg-subtle-hover: #184233 !important;
    --bg-subtle-pressed: #225643 !important;
    --bg-component: #14382B !important;
    --bg-component-hover: #1D4C3A !important;
    --bg-field: #081B14 !important;
    --bg-field-hover: #184233 !important;
    --bg-field-component: #14382B !important;
    --bg-field-component-hover: #184233 !important;
    --bg-base-hover: #184233 !important;
    --bg-base-pressed: #225643 !important;
    --fg-base: #FAF9F6 !important;
    --fg-subtle: #EBE1D6 !important;
    --fg-interactive: #B6975A !important;
    --fg-interactive-hover: #D4BE8D !important;
    --border-base: #1D4C3A !important;
    --border-strong: #B6975A !important;
    --border-interactive: #B6975A !important;

    /* NAQSH Luxury Status Tags & Dots (Fix for pink dots -> Site luxury schema) */
    --tag-green-icon: #34D399 !important;
    --tag-green-text: #A7F3D0 !important;
    --tag-green-bg: #0E3324 !important;
    --tag-green-border: #18523A !important;

    --tag-orange-icon: #D4BE8D !important;
    --tag-orange-text: #F5EFE3 !important;
    --tag-orange-bg: #332A15 !important;
    --tag-orange-border: #574624 !important;

    --tag-red-icon: #C53030 !important;
    --tag-red-text: #FCA5A5 !important;
    --tag-red-bg: #2B1214 !important;
    --tag-red-border: #4D1D22 !important;

    --tag-neutral-icon: #A3B8AC !important;
    --tag-neutral-text: #FAF9F6 !important;
    --tag-neutral-bg: #1A382C !important;
    --tag-neutral-border: #2A5241 !important;
  }

  /* Table & Badge Status Dots Override (Eliminates pink #F87171, enforces NAQSH brand crimson) */
  .bg-ui-tag-red-icon,
  [class*="bg-ui-tag-red-icon"],
  div.bg-ui-tag-red-icon,
  span.bg-ui-tag-red-icon,
  [class*="[&_div]:bg-ui-tag-red-icon"] div {
    background-color: #9E3B42 !important;
  }
  .dark .bg-ui-tag-red-icon,
  .dark [class*="bg-ui-tag-red-icon"],
  .dark div.bg-ui-tag-red-icon,
  .dark span.bg-ui-tag-red-icon,
  .dark [class*="[&_div]:bg-ui-tag-red-icon"] div {
    background-color: #C53030 !important;
  }

  /* NAQSH Luxury Refresh Buttons */
  .naqsh-refresh-btn {
    display: inline-flex !important;
    align-items: center !important;
    gap: 6px !important;
    padding: 6px 14px !important;
    background-color: #14382B !important;
    color: #FAF9F6 !important;
    border: 1px solid #B6975A !important;
    border-radius: 6px !important;
    font-size: 12px !important;
    font-weight: 500 !important;
    line-height: 1.2 !important;
    cursor: pointer !important;
    transition: all 0.2s ease !important;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2) !important;
    user-select: none !important;
    text-decoration: none !important;
  }
  .naqsh-refresh-btn:hover {
    background-color: #1D4C3A !important;
    border-color: #D4BE8D !important;
    color: #FFFFFF !important;
    box-shadow: 0 0 10px rgba(182, 151, 90, 0.35) !important;
    transform: translateY(-1px) !important;
  }
  .naqsh-refresh-btn:active {
    background-color: #0F2D22 !important;
    transform: translateY(0) !important;
  }
  .naqsh-refresh-btn svg {
    width: 14px !important;
    height: 14px !important;
    color: #B6975A !important;
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }
  .naqsh-refresh-btn:hover svg {
    transform: rotate(180deg) !important;
    color: #D4BE8D !important;
  }
  .naqsh-refresh-btn.is-refreshing svg {
    animation: naqsh-spin 0.8s linear infinite !important;
  }
  @keyframes naqsh-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .naqsh-floating-refresh {
    position: fixed !important;
    bottom: 24px !important;
    right: 24px !important;
    z-index: 9999 !important;
    display: flex !important;
    align-items: center !important;
    gap: 8px !important;
    padding: 9px 16px !important;
    background: linear-gradient(135deg, #0F2D22, #14382B) !important;
    color: #FAF9F6 !important;
    border: 1.5px solid #B6975A !important;
    border-radius: 9999px !important;
    font-size: 13px !important;
    font-weight: 600 !important;
    letter-spacing: 0.02em !important;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4), 0 0 12px rgba(182, 151, 90, 0.25) !important;
    cursor: pointer !important;
    transition: all 0.25s ease !important;
  }
  .naqsh-floating-refresh:hover {
    background: linear-gradient(135deg, #14382B, #1D4C3A) !important;
    border-color: #D4BE8D !important;
    box-shadow: 0 10px 28px rgba(0, 0, 0, 0.5), 0 0 18px rgba(182, 151, 90, 0.4) !important;
    transform: translateY(-2px) !important;
  }

  .dark aside a,
  .dark nav a,
  .dark [data-sidebar] a,
  .dark aside button,
  .dark nav button,
  .dark [data-sidebar-item] {
    color: #FAF9F6 !important;
  }

  .dark aside a:hover,
  .dark nav a:hover,
  .dark [data-sidebar] a:hover,
  .dark [data-sidebar-item]:hover,
  .dark aside button:hover,
  .dark nav button:hover,
  .dark a[class*="hover:bg-ui-bg-subtle"]:hover,
  .dark button[class*="hover:bg-ui-bg-subtle"]:hover {
    background-color: #184233 !important;
    color: #FAF9F6 !important;
  }

  .dark aside a:hover *,
  .dark nav a:hover *,
  .dark [data-sidebar] a:hover *,
  .dark [data-sidebar-item]:hover *,
  .dark aside button:hover *,
  .dark nav button:hover * {
    color: #FAF9F6 !important;
  }

  .dark aside a:hover svg,
  .dark nav a:hover svg,
  .dark [data-sidebar] a:hover svg {
    color: #B6975A !important;
  }

  .dark [role="tooltip"],
  .dark [data-radix-popper-content-wrapper] [role="tooltip"],
  .dark [data-radix-tooltip-content] {
    background-color: #081B14 !important;
    color: #FAF9F6 !important;
    border: 1px solid #B6975A !important;
  }

  .dark [role="tooltip"] *,
  .dark [data-radix-tooltip-content] * {
    color: #FAF9F6 !important;
  }

  .dark [class*="bg-white"]:not(select):not(option):not(optgroup):not([role="menuitem"]):not([role="option"]):not([role="menu"]):not([role="listbox"]),
  .dark [class*="bg-[#FAF9F6]"]:not(select):not(option):not(optgroup):not([role="menuitem"]):not([role="option"]):not([role="menu"]):not([role="listbox"]),
  .dark [class*="bg-[#EBE1D6]"]:not(select):not(option):not(optgroup):not([role="menuitem"]):not([role="option"]):not([role="menu"]):not([role="listbox"]),
  .dark [class*="bg-[#E8E1D6]"]:not(select):not(option):not(optgroup):not([role="menuitem"]):not([role="option"]):not([role="menu"]):not([role="listbox"]) {
    color: #1A1A1A !important;
  }
  .dark [class*="bg-white"]:not(select):not(option):not(optgroup):not([role="menu"]):not([role="listbox"]) *:not(option):not(optgroup):not([role="menuitem"]):not([role="option"]),
  .dark [class*="bg-[#FAF9F6]"]:not(select):not(option):not(optgroup):not([role="menu"]):not([role="listbox"]) *:not(option):not(optgroup):not([role="menuitem"]):not([role="option"]),
  .dark [class*="bg-[#EBE1D6]"]:not(select):not(option):not(optgroup):not([role="menu"]):not([role="listbox"]) *:not(option):not(optgroup):not([role="menuitem"]):not([role="option"]),
  .dark [class*="bg-[#E8E1D6]"]:not(select):not(option):not(optgroup):not([role="menu"]):not([role="listbox"]) *:not(option):not(optgroup):not([role="menuitem"]):not([role="option"]) {
    color: #1A1A1A !important;
  }

  /* Light background elements must have dark text, but NEVER inside dropdowns or menus */
  body:not(.dark) .bg-white,
  body:not(.dark) [class*="bg-white"],
  body:not(.dark) [class*="bg-[#FAF9F6]"] {
    color: #1A1A1A !important;
  }

  /* Dropdown menus, Popovers & Radix Menus - Full contrast in NAQSH Admin */
  select,
  select option,
  select optgroup {
    background-color: #0F2D22 !important;
    border-color: #25493B !important;
    color: #FAF9F6 !important;
  }

  [role="menu"],
  [role="listbox"],
  [data-radix-menu-content],
  [data-radix-select-content],
  [data-radix-dropdown-menu-content],
  [data-radix-popper-content-wrapper] > div {
    background-color: #14382B !important;
    border: 1px solid #25493B !important;
    color: #FAF9F6 !important;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45) !important;
    border-radius: 8px !important;
  }

  [role="menu"] *,
  [role="listbox"] *,
  [data-radix-menu-content] *,
  [data-radix-select-content] *,
  [data-radix-dropdown-menu-content] *,
  [data-radix-popper-content-wrapper] > div *,
  [role="menuitem"],
  [role="menuitem"] *,
  [role="option"],
  [role="option"] * {
    color: #FAF9F6 !important;
  }

  /* Dropdown hover & highlighted states */
  [role="menuitem"]:hover,
  [role="menuitem"]:focus,
  [role="menuitem"][data-highlighted],
  [role="option"]:hover,
  [role="option"]:focus,
  [role="option"][data-highlighted],
  [data-radix-collection-item]:hover,
  [data-radix-collection-item]:focus,
  [data-radix-collection-item][data-highlighted] {
    background-color: #1D4C3A !important;
    color: #FAF9F6 !important;
  }
  [role="menuitem"]:hover *,
  [role="menuitem"]:focus *,
  [role="option"]:hover *,
  [role="option"]:focus * {
    color: #FAF9F6 !important;
  }

  select option:hover,
  select option:focus,
  select option:checked {
    background-color: #1D4C3A !important;
    color: #FAF9F6 !important;
  }

  /* Make inventory drawer / modal container look spacious and clean */
  [role="dialog"] > div:last-child {
    padding: 24px !important;
  }
</style>`;

      // Ensure no-cache meta tags are present so browsers never serve stale HTML
      const noCacheMeta = `<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />\n<meta http-equiv="Pragma" content="no-cache" />\n<meta http-equiv="Expires" content="0" />`;
      if (!html.includes('http-equiv="Cache-Control"')) {
        html = html.replace('<head>', `<head>\n${noCacheMeta}`);
      }

      const customScript = `<script id="naqsh-admin-enhancements">
(function() {
  // One-time automatic refresh per session / deployment version to clear stale bundle caches
  try {
    const REFRESH_KEY = 'naqsh-admin-refreshed-v20261014-final';
    if (!sessionStorage.getItem(REFRESH_KEY)) {
      sessionStorage.setItem(REFRESH_KEY, '1');
      window.location.reload();
      return;
    }
  } catch (e) {}

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

  function isColorValueInput(input) {
    if (!input || input.tagName !== 'INPUT' || input.type === 'hidden' || input.type === 'checkbox' || input.type === 'radio') return false;

    const role = input.getAttribute('role') || '';
    if (role === 'combobox') {
      const ariaLabel = (input.getAttribute('aria-label') || '').toLowerCase();
      const placeholder = (input.placeholder || '').toLowerCase();
      if (!placeholder.includes('red, blue') && !placeholder.includes('values')) {
        return false;
      }
    }

    const placeholder = (input.placeholder || '').toLowerCase();
    if (placeholder.includes('red') || placeholder.includes('blue') || placeholder.includes('green')) {
      return true;
    }

    const container = input.closest('div');
    const containerText = (container?.parentElement?.innerText || container?.innerText || '').toLowerCase();
    if (containerText.includes('select which values to use') || (containerText.includes('values') && !containerText.includes('define the options'))) {
      return true;
    }

    return false;
  }

  document.addEventListener('input', function(e) {
    if (e.target && isColorValueInput(e.target)) {
      activeInput = e.target;
      renderOptions(e.target.value, e.target);
    }
  });

  document.addEventListener('focusin', function(e) {
    if (e.target && isColorValueInput(e.target)) {
      activeInput = e.target;
      if (e.target.value) renderOptions(e.target.value, e.target);
    }
  });

  document.addEventListener('click', function(e) {
    if (dropdownEl && !dropdownEl.contains(e.target) && e.target !== activeInput) {
      dropdownEl.style.display = 'none';
    }
  });

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
  setInterval(checkInventoryState, 1000);

  // Dynamic menu & popover high contrast visibility enforcement
  function fixMenuVisibility() {
    document.querySelectorAll('[data-radix-popper-content-wrapper] > div, [role="menu"], [data-radix-menu-content], [data-radix-dropdown-menu-content], [data-radix-select-content]').forEach(menu => {
      menu.style.setProperty('background-color', '#14382B', 'important');
      menu.style.setProperty('border', '1px solid #25493B', 'important');
      menu.style.setProperty('box-shadow', '0 10px 30px rgba(0,0,0,0.45)', 'important');
      menu.style.setProperty('color', '#FAF9F6', 'important');
      menu.querySelectorAll('[role="menuitem"], [role="option"], button, span, a, p, div, svg').forEach(item => {
        if (!item.closest('input')) {
          item.style.setProperty('color', '#FAF9F6', 'important');
        }
      });
    });
  }
  document.addEventListener('pointerdown', () => setTimeout(fixMenuVisibility, 10));
  document.addEventListener('click', () => setTimeout(fixMenuVisibility, 10));
  setInterval(fixMenuVisibility, 300);

  // Enforce NAQSH Brand Status Dot Colors (Eliminate pink #f87171)
  function fixStatusDots() {
    document.querySelectorAll('.bg-ui-tag-red-icon, [class*="bg-ui-tag-red-icon"]').forEach(dot => {
      dot.style.setProperty('background-color', '#C53030', 'important');
    });
    // Check any dots/badges that might have inline or computed pink
    document.querySelectorAll('div.rounded-sm, span.rounded-sm, div.rounded-full').forEach(dot => {
      const bg = window.getComputedStyle(dot).backgroundColor;
      if (bg === 'rgb(248, 113, 113)' || bg === '#f87171' || bg === 'rgb(254, 202, 202)') {
        dot.style.setProperty('background-color', '#C53030', 'important');
      }
    });
  }

  // Refresh mechanism
  function triggerAdminRefresh(btn) {
    if (btn) {
      btn.classList.add('is-refreshing');
      const span = btn.querySelector('span');
      if (span) span.textContent = 'Refreshing...';
    }
    sessionStorage.setItem('naqsh-just-refreshed', 'true');
    setTimeout(() => {
      window.location.reload();
    }, 250);
  }

  function injectRefreshControls() {
    // 1. Table header "Export" button injection (Orders page - Image 1!)
    document.querySelectorAll('button').forEach(btn => {
      const text = (btn.textContent || '').trim();
      if (text === 'Export' && !btn.parentElement.querySelector('#naqsh-table-refresh-btn')) {
        const refreshBtn = document.createElement('button');
        refreshBtn.id = 'naqsh-table-refresh-btn';
        refreshBtn.type = 'button';
        refreshBtn.className = 'naqsh-refresh-btn';
        refreshBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path><path d="M3 22v-6h6"></path><path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path></svg><span>Refresh Page</span>';
        refreshBtn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          triggerAdminRefresh(refreshBtn);
        };
        btn.parentElement.insertBefore(refreshBtn, btn);
      }
    });

    // 2. Top navigation bar header injection
    const header = document.querySelector('header, [role="banner"], [data-header], .sticky.top-0');
    if (header && !document.getElementById('naqsh-topbar-refresh-btn')) {
      const rightArea = header.querySelector('div.flex.items-center:last-child') || header;
      const topRefreshBtn = document.createElement('button');
      topRefreshBtn.id = 'naqsh-topbar-refresh-btn';
      topRefreshBtn.type = 'button';
      topRefreshBtn.className = 'naqsh-refresh-btn';
      topRefreshBtn.style.marginRight = '8px';
      topRefreshBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path><path d="M3 22v-6h6"></path><path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path></svg><span>Refresh</span>';
      topRefreshBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        triggerAdminRefresh(topRefreshBtn);
      };
      if (rightArea.firstChild) {
        rightArea.insertBefore(topRefreshBtn, rightArea.firstChild);
      } else {
        rightArea.appendChild(topRefreshBtn);
      }
    }

    // 3. Floating Quick Refresh button
    if (!document.getElementById('naqsh-floating-refresh-btn')) {
      const floatBtn = document.createElement('button');
      floatBtn.id = 'naqsh-floating-refresh-btn';
      floatBtn.type = 'button';
      floatBtn.className = 'naqsh-floating-refresh';
      floatBtn.title = 'Refresh current page and live data (Shift+R)';
      floatBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;color:#B6975A;"><path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path><path d="M3 22v-6h6"></path><path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path></svg><span>Refresh Page</span>';
      floatBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        triggerAdminRefresh(floatBtn);
      };
      document.body.appendChild(floatBtn);
    }
  }

  // Keyboard shortcut: Shift + R to refresh admin page
  document.addEventListener('keydown', function(e) {
    if (e.shiftKey && (e.key === 'R' || e.key === 'r')) {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)) {
        return;
      }
      e.preventDefault();
      triggerAdminRefresh(document.getElementById('naqsh-floating-refresh-btn'));
    }
  });

  setInterval(() => {
    fixStatusDots();
    injectRefreshControls();
  }, 400);

  // Unregister any stale ServiceWorker so changes are active immediately
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      for (let r of registrations) { r.unregister(); }
    });
  }
})();
</script>`;

      if (html.includes('id="naqsh-admin-styles"')) {
        html = html.replace(/<style id="naqsh-admin-styles">[\s\S]*?<\/style>/, customStyle);
      } else if (html.includes('</head>')) {
        html = html.replace('</head>', `${customStyle}\n</head>`);
      } else {
        html = html + customStyle;
      }

      if (html.includes('id="naqsh-admin-enhancements"')) {
        html = html.replace(/<script id="naqsh-admin-enhancements">[\s\S]*?<\/script>/, customScript);
      } else if (html.includes('</body>')) {
        html = html.replace('</body>', `${customScript}\n</body>`);
      } else {
        html = html + customScript;
      }
      console.log(`[copy-admin] Injected/Updated custom layout styles & scripts into: ${indexPath}`);

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

