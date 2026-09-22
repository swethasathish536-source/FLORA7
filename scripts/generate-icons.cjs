const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#5C2533" />
      <stop offset="50%" stop-color="#431822" />
      <stop offset="100%" stop-color="#2D0D15" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FCE7F0" />
      <stop offset="50%" stop-color="#E5A9B4" />
      <stop offset="100%" stop-color="#B76E79" />
    </linearGradient>
    <linearGradient id="petalGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FCE7F0" />
      <stop offset="50%" stop-color="#F4B8C7" />
      <stop offset="100%" stop-color="#B76E79" />
    </linearGradient>
    <linearGradient id="petalGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#B76E79" />
      <stop offset="60%" stop-color="#D48493" />
      <stop offset="100%" stop-color="#FCE7F0" />
    </linearGradient>
    <radialGradient id="pearlShine" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="60%" stop-color="#FFF0F5" />
      <stop offset="100%" stop-color="#DDA0B0" />
    </radialGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000000" flood-opacity="0.35" />
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="512" height="512" rx="108" fill="url(#bgGrad)" />

  <!-- Outer Decorative Ring -->
  <circle cx="256" cy="240" r="186" fill="none" stroke="url(#goldGrad)" stroke-width="4" stroke-opacity="0.35" />
  <circle cx="256" cy="240" r="176" fill="none" stroke="url(#goldGrad)" stroke-width="1.5" stroke-dasharray="6,6" stroke-opacity="0.4" />

  <!-- Satin Ribbon Rose Core & Outer Petals -->
  <g filter="url(#glow)">
    <!-- Layer 1 Outer Petals -->
    <path d="M 256 95 C 310 95 385 140 375 220 C 370 255 340 300 300 330 C 230 380 150 340 135 270 C 120 200 190 100 256 95 Z" fill="url(#petalGrad1)" opacity="0.9" />
    <path d="M 256 95 C 200 95 130 145 140 225 C 145 260 180 305 220 335 C 290 380 365 335 375 265 C 385 195 315 100 256 95 Z" fill="url(#petalGrad2)" opacity="0.85" />

    <!-- Layer 2 Mid Fold Petals -->
    <path d="M 256 130 C 295 130 350 165 345 225 C 340 255 315 285 285 305 C 230 345 170 310 160 255 C 150 200 205 135 256 130 Z" fill="url(#petalGrad1)" />
    <path d="M 256 145 C 220 145 175 180 180 230 C 185 255 210 280 235 295 C 280 325 330 295 335 250 C 340 205 295 150 256 145 Z" fill="url(#petalGrad2)" />

    <!-- Layer 3 Inner Satin Rose Swirl -->
    <path d="M 256 175 C 280 175 315 198 310 238 C 305 260 285 278 265 290 C 228 310 192 288 185 252 C 178 215 220 178 256 175 Z" fill="url(#petalGrad1)" />
    
    <!-- Rose Center Spiral Bud -->
    <path d="M 256 200 C 272 200 292 215 290 238 C 288 255 272 268 256 270 C 238 270 224 255 224 238 C 224 218 240 200 256 200 Z" fill="#5C2533" />
    <path d="M 256 208 C 265 208 276 216 275 228 C 274 238 265 246 256 248 C 246 248 238 238 238 228 C 238 217 247 208 256 208 Z" fill="url(#goldGrad)" />
    
    <!-- Luminous Center Pearl -->
    <circle cx="256" cy="228" r="14" fill="url(#pearlShine)" filter="url(#glow)" />
    <ellipse cx="251" cy="223" rx="4" ry="2.5" fill="#FFFFFF" opacity="0.9" />

    <!-- Sparkle Stars -->
    <path d="M 370 140 L 373 152 L 385 155 L 373 158 L 370 170 L 367 158 L 355 155 L 367 152 Z" fill="#FCE7F0" />
    <path d="M 140 160 L 142 170 L 152 172 L 142 174 L 140 184 L 138 174 L 128 172 L 138 170 Z" fill="#FCE7F0" />
    <path d="M 365 310 L 367 318 L 375 320 L 367 322 L 365 330 L 363 322 L 355 320 L 363 318 Z" fill="#FCE7F0" opacity="0.8" />
  </g>

  <!-- Typography: FLORA7 -->
  <text x="256" y="420" text-anchor="middle" font-family="'Playfair Display', Georgia, serif" font-weight="900" font-size="44" fill="#FCE7F0" letter-spacing="9">FLORA7</text>
  <text x="256" y="445" text-anchor="middle" font-family="-apple-system, sans-serif" font-weight="700" font-size="14" fill="#E5A9B4" letter-spacing="4">LOVE UNFOLDED</text>
</svg>`;

const maskableSvgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#5C2533" />
      <stop offset="50%" stop-color="#431822" />
      <stop offset="100%" stop-color="#2D0D15" />
    </linearGradient>
    <linearGradient id="goldGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FCE7F0" />
      <stop offset="50%" stop-color="#E5A9B4" />
      <stop offset="100%" stop-color="#B76E79" />
    </linearGradient>
    <linearGradient id="petalGrad1b" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FCE7F0" />
      <stop offset="50%" stop-color="#F4B8C7" />
      <stop offset="100%" stop-color="#B76E79" />
    </linearGradient>
    <linearGradient id="petalGrad2b" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#B76E79" />
      <stop offset="60%" stop-color="#D48493" />
      <stop offset="100%" stop-color="#FCE7F0" />
    </linearGradient>
    <radialGradient id="pearlShine2" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#FFFFFF" />
      <stop offset="60%" stop-color="#FFF0F5" />
      <stop offset="100%" stop-color="#DDA0B0" />
    </radialGradient>
  </defs>

  <!-- Full-bleed background for Android circle/squircle masking (no corners) -->
  <rect width="512" height="512" fill="url(#bgGrad2)" />

  <!-- Safe Zone Scale (80% centered) -->
  <g transform="translate(51.2, 51.2) scale(0.8)">
    <circle cx="256" cy="230" r="160" fill="none" stroke="url(#goldGrad2)" stroke-width="3" stroke-opacity="0.35" />
    
    <!-- Rose Petals -->
    <path d="M 256 100 C 305 100 370 140 360 215 C 355 250 330 290 295 320 C 230 365 155 330 140 265 C 128 200 195 105 256 100 Z" fill="url(#petalGrad1b)" opacity="0.9" />
    <path d="M 256 100 C 205 100 140 145 150 220 C 155 255 185 295 220 325 C 285 365 355 325 360 260 C 370 195 305 105 256 100 Z" fill="url(#petalGrad2b)" opacity="0.85" />

    <path d="M 256 135 C 290 135 340 168 335 222 C 330 250 308 278 280 296 C 230 332 175 300 165 250 C 156 200 208 140 256 135 Z" fill="url(#petalGrad1b)" />
    <path d="M 256 175 C 278 175 308 195 305 232 C 300 252 282 270 265 280 C 230 300 195 280 188 246 C 182 210 222 178 256 175 Z" fill="url(#petalGrad1b)" />

    <circle cx="256" cy="225" r="14" fill="url(#pearlShine2)" />

    <text x="256" y="405" text-anchor="middle" font-family="'Playfair Display', Georgia, serif" font-weight="900" font-size="44" fill="#FCE7F0" letter-spacing="8">FLORA7</text>
    <text x="256" y="432" text-anchor="middle" font-family="-apple-system, sans-serif" font-weight="700" font-size="14" fill="#E5A9B4" letter-spacing="4">LOVE UNFOLDED</text>
  </g>
</svg>`;

async function main() {
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // 1. Write SVG icons
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgIcon);
  fs.writeFileSync(path.join(publicDir, 'icon-maskable.svg'), maskableSvgIcon);

  // 2. Generate 192x192 PNG
  await sharp(Buffer.from(svgIcon))
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Generated pwa-192x192.png');

  // 3. Generate 512x512 PNG
  await sharp(Buffer.from(svgIcon))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Generated pwa-512x512.png');

  // 4. Generate Maskable 512x512 PNG
  await sharp(Buffer.from(maskableSvgIcon))
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('Generated pwa-maskable-512x512.png');

  // 5. Generate Apple Touch Icon 180x180 PNG
  await sharp(Buffer.from(svgIcon))
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png');

  // 6. Generate favicon 64x64 PNG
  await sharp(Buffer.from(svgIcon))
    .resize(64, 64)
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));
  console.log('Generated favicon.png');
}

main().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
