const fs = require('fs');
const path = 'c:/Users/User/Desktop/Projects/naqsh-project/naqsh-store/apps/storefront/src/modules/store/templates/catalog.tsx';

let content = fs.readFileSync(path, 'utf8');
const isCrlf = content.includes('\r\n');
content = content.replace(/\r\n/g, '\n');

content = content.replace(
  'badgeText: "Haute Couture & Pret",\n    accentSubtitle: "Intricate resham embroideries, fine festive lawn, and hand-embellished pure silk silhouettes."',
  'badgeText: "100% Luxury Unstitched Fabrics",\n    accentSubtitle: "Intricate resham embroideries, fine festive lawn, and hand-embellished pure silk unstitched cuts."'
);

content = content.replace(
  'badgeText: "Bespoke Eastern Wear",\n    accentSubtitle: "Raw silk kurtas, tailored jacquard waistcoats, and embroidered bandhgala collars."',
  'badgeText: "100% Gents Unstitched Fabrics",\n    accentSubtitle: "Pure silk Boski, Egyptian combed cotton, and luxury wrinkle-free wash-and-wear suit cuts."'
);

content = content.replace(
  'badgeText: "Signature Wardrobe",\n    accentSubtitle: "Handcrafted fabrics. Refined silhouettes. Elegance that whispers rather than shouts."',
  'badgeText: "100% Unstitched Atelier",\n    accentSubtitle: "Handcrafted pure unstitched fabrics. Refined textures. Elegance that whispers rather than shouts."'
);

if (isCrlf) {
  content = content.replace(/\n/g, '\r\n');
}

fs.writeFileSync(path, content, 'utf8');
console.log('✓ catalog.tsx hero banners successfully updated!');
