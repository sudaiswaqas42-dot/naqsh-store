import os

out_dir = r"c:\Users\User\Desktop\Projects\naqsh-project\naqsh-store\apps\storefront\public\images\products"
os.makedirs(out_dir, exist_ok=True)

templates = [
    # Women Stitched (Pret & Formals)
    ("women_stitched_1", "#0F2D22", "#1B4D3E", "#B6975A", "LUXURY PRET", "EMBROIDERED SILK SHIRT"),
    ("women_stitched_2", "#5C1D24", "#7D2A33", "#DFBA73", "FESTIVE FORMAL", "ZARDOZI RAW SILK TUNIC"),
    ("women_stitched_3", "#1A2E40", "#2E4C66", "#C5A059", "CO-ORD SET", "MONOCHROME PRINTED SILK"),
    ("women_stitched_4", "#3E2723", "#5D4037", "#D4AF37", "ATELIER PRET", "HANDCRAFTED VELVET TOP"),
    ("women_stitched_5", "#2C3E50", "#34495E", "#E5C158", "EID EDIT", "ORGANZA JACQUARD JACKET"),
    
    # Women Unstitched (Lawn & Silks)
    ("women_unstitched_1", "#1A3C34", "#2E6356", "#D4AF37", "UNSTITCHED 3-PIECE", "FESTIVE LAWN &amp; CHIFFON"),
    ("women_unstitched_2", "#6B2D5C", "#8E3F7B", "#F3E5AB", "LUXURY LAWN", "SCHIFFLI EMBROIDERED SUIT"),
    ("women_unstitched_3", "#7A4A28", "#A06337", "#DFBA73", "RAW SILK SUIT", "PURE HEIRLOOM WEAVE"),
    ("women_unstitched_4", "#1F3A3D", "#325C61", "#E6C687", "SWISS LAWN", "ORGANZA DUPATTA 3PC"),
    ("women_unstitched_5", "#4A154B", "#611F69", "#FFD700", "WEDDING FESTIVE", "HEAVY TILLA WORK SUIT"),

    # Men Stitched (Kurtas & Waistcoats)
    ("men_stitched_1", "#1C2833", "#2C3E50", "#B6975A", "BESPOKE EASTERN", "JACQUARD SILK KURTA"),
    ("men_stitched_2", "#0B251B", "#164332", "#C5A059", "ATELIER MEN", "RAW SILK WAISTCOAT"),
    ("men_stitched_3", "#2C1D11", "#4A3525", "#DFBA73", "ROYAL BESPOKE", "BANDHGALA SHERWANI SUIT"),
    ("men_stitched_4", "#1E1E24", "#2B2B36", "#D4AF37", "FORMAL KURTA", "EMBROIDERED COLLAR KURTA"),
    ("men_stitched_5", "#162A2B", "#224244", "#E5C158", "CLASSIC EASTERN", "SHALWAR KAMEEZ SUIT"),

    # Men Unstitched (Latha & Boski)
    ("men_unstitched_1", "#212F3D", "#34495E", "#D4AF37", "MEN UNSTITCHED", "SUPERFINE EGYPTIAN COTTON"),
    ("men_unstitched_2", "#283747", "#3B4D61", "#DFBA73", "PURE BOSKI", "HEAVYWEIGHT SILK BOSKI"),
    ("men_unstitched_3", "#1B3022", "#2B4A36", "#B6975A", "PREMIUM LATHA", "HERITAGE WHITE LATHA"),
    ("men_unstitched_4", "#3E2723", "#4E342E", "#C5A059", "WASH &amp; WEAR", "WRINKLE-FREE BLEND FABRIC"),
    ("men_unstitched_5", "#263238", "#37474F", "#FFD700", "KARANDI WINTER", "HANDWOVEN WARM KARANDI"),

    # Children / Kids Eastern
    ("kids_eastern_1", "#145A32", "#1E8449", "#F1C40F", "KIDS EASTERN", "BOYS EMBROIDERED KURTA"),
    ("kids_eastern_2", "#6C3483", "#884EA0", "#F9E79F", "GIRLS FESTIVE", "CHIKANKARI FROCK &amp; DUPATTA"),
    ("kids_eastern_3", "#1B4F72", "#2874A6", "#FAD7A0", "LITTLE NAQSH", "BOYS WAISTCOAT SUIT"),
    ("kids_eastern_4", "#78281F", "#922B21", "#F5CBA7", "JUNIOR PRET", "GIRLS GHARARA SET"),
]

for name, c1, c2, gold, badge, title in templates:
    svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="100%" height="100%">
  <defs>
    <linearGradient id="bg_{name}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{c1}" />
      <stop offset="50%" stop-color="{c2}" />
      <stop offset="100%" stop-color="#08120E" />
    </linearGradient>
    <linearGradient id="gold_{name}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="{gold}" stop-opacity="0.2" />
      <stop offset="50%" stop-color="{gold}" stop-opacity="0.9" />
      <stop offset="100%" stop-color="{gold}" stop-opacity="0.2" />
    </linearGradient>
    <pattern id="motif_{name}" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M30 5 L35 25 L55 30 L35 35 L30 55 L25 35 L5 30 L25 25 Z" fill="none" stroke="{gold}" stroke-width="0.5" stroke-opacity="0.12" />
      <circle cx="30" cy="30" r="3" fill="{gold}" fill-opacity="0.08" />
    </pattern>
  </defs>

  <rect width="600" height="800" fill="url(#bg_{name})" />
  <rect width="600" height="800" fill="url(#motif_{name})" />

  <rect x="24" y="24" width="552" height="752" fill="none" stroke="{gold}" stroke-width="1" stroke-opacity="0.4" />
  <rect x="32" y="32" width="536" height="736" fill="none" stroke="{gold}" stroke-width="0.5" stroke-opacity="0.2" />

  <path d="M24 48 L48 24 M576 48 L552 24 M24 752 L48 776 M576 752 L552 776" stroke="{gold}" stroke-width="1" stroke-opacity="0.6" />

  <g transform="translate(300, 360)">
    <circle cx="0" cy="-20" r="160" fill="{gold}" fill-opacity="0.07" />
    <path d="M -80 -120 Q -40 -140 0 -135 Q 40 -140 80 -120 L 110 40 L 80 180 L -80 180 L -110 40 Z" fill="none" stroke="{gold}" stroke-width="2" stroke-opacity="0.75" />
    <path d="M 0 -135 L 0 50" stroke="{gold}" stroke-width="1.5" stroke-dasharray="3,3" stroke-opacity="0.8" />
    <path d="M -20 -130 L 0 -105 L 20 -130" fill="none" stroke="{gold}" stroke-width="2" />
    <circle cx="0" cy="-85" r="2" fill="{gold}" />
    <circle cx="0" cy="-60" r="2" fill="{gold}" />
    <circle cx="0" cy="-35" r="2" fill="{gold}" />
    <circle cx="0" cy="-10" r="2" fill="{gold}" />
    <circle cx="0" cy="15" r="2" fill="{gold}" />
    <path d="M -70 160 Q 0 140 70 160" fill="none" stroke="{gold}" stroke-width="1.5" stroke-opacity="0.85" />
    <path d="M -60 170 Q 0 152 60 170" fill="none" stroke="{gold}" stroke-width="1" stroke-opacity="0.6" />
  </g>

  <text x="300" y="90" text-anchor="middle" font-family="Cinzel, 'Playfair Display', serif" font-size="24" letter-spacing="6" fill="#FAF9F6">NAQSH</text>
  <text x="300" y="115" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" letter-spacing="4" fill="{gold}" font-weight="bold">WHERE IDENTITY BEGINS</text>
  <line x1="220" y1="128" x2="380" y2="128" stroke="url(#gold_{name})" stroke-width="1" />

  <g transform="translate(300, 600)">
    <rect x="-100" y="-14" width="200" height="28" rx="14" fill="#08120E" stroke="{gold}" stroke-width="1" stroke-opacity="0.8" />
    <text x="0" y="4" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="10" letter-spacing="2" fill="{gold}" font-weight="bold">{badge}</text>
  </g>

  <text x="300" y="670" text-anchor="middle" font-family="Cinzel, 'Playfair Display', serif" font-size="20" fill="#FAF9F6" font-weight="normal">{title}</text>
  <text x="300" y="700" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" fill="#CFC8BD" letter-spacing="1">HANDCRAFTED ATELIER EDITION</text>
</svg>'''

    file_path = os.path.join(out_dir, f"{name}.svg")
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(svg_content)

print(f"Successfully generated {len(templates)} luxury SVG product graphics")
