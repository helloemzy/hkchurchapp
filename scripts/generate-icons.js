#!/usr/bin/env node

/**
 * PWA Icon Generator Script
 * This script creates all required PWA icons from the existing favicon
 */

const fs = require('fs');
const path = require('path');

// PWA icon sizes needed
const iconSizes = [
  { size: 16, name: 'icon-16x16.png' },
  { size: 32, name: 'icon-32x32.png' },
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' }
];

// Apple splash screen sizes
const splashSizes = [
  { width: 640, height: 1136, name: 'apple-splash-640-1136.png' },
  { width: 750, height: 1334, name: 'apple-splash-750-1334.png' },
  { width: 1125, height: 2436, name: 'apple-splash-1125-2436.png' },
  { width: 1242, height: 2208, name: 'apple-splash-1242-2208.png' },
  { width: 1536, height: 2048, name: 'apple-splash-1536-2048.png' },
  { width: 1668, height: 2224, name: 'apple-splash-1668-2224.png' },
  { width: 2048, height: 2732, name: 'apple-splash-2048-2732.png' }
];

// Shortcut icon sizes
const shortcutIcons = [
  { name: 'shortcut-devotion.png', size: 96 },
  { name: 'shortcut-prayer.png', size: 96 },
  { name: 'shortcut-events.png', size: 96 }
];

const iconsDir = path.join(__dirname, '../public/icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

/**
 * Create SVG icon with church theme
 */
function createChurchSVG(size, type = 'main') {
  const color = '#7C3AED'; // Theme color from manifest
  
  if (type === 'devotion') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
      <rect width="${size}" height="${size}" fill="white" rx="${size * 0.15}"/>
      <g transform="translate(${size * 0.2}, ${size * 0.15})">
        <rect x="0" y="${size * 0.3}" width="${size * 0.6}" height="${size * 0.5}" fill="${color}" rx="2"/>
        <path d="M${size * 0.1} ${size * 0.35} L${size * 0.5} ${size * 0.35} M${size * 0.1} ${size * 0.45} L${size * 0.5} ${size * 0.45} M${size * 0.1} ${size * 0.55} L${size * 0.4} ${size * 0.55}" stroke="white" stroke-width="1" opacity="0.8"/>
      </g>
    </svg>`;
  }
  
  if (type === 'prayer') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
      <rect width="${size}" height="${size}" fill="white" rx="${size * 0.15}"/>
      <g transform="translate(${size * 0.25}, ${size * 0.2})">
        <path d="M0 ${size * 0.3} Q${size * 0.25} ${size * 0.1} ${size * 0.5} ${size * 0.3} Q${size * 0.25} ${size * 0.5} 0 ${size * 0.3}" fill="${color}"/>
        <circle cx="${size * 0.25}" cy="${size * 0.45}" r="${size * 0.05}" fill="${color}"/>
      </g>
    </svg>`;
  }
  
  if (type === 'events') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
      <rect width="${size}" height="${size}" fill="white" rx="${size * 0.15}"/>
      <g transform="translate(${size * 0.15}, ${size * 0.15})">
        <rect x="0" y="${size * 0.1}" width="${size * 0.7}" height="${size * 0.6}" fill="${color}" rx="3"/>
        <rect x="0" y="${size * 0.1}" width="${size * 0.7}" height="${size * 0.15}" fill="${color}" rx="3"/>
        <circle cx="${size * 0.2}" cy="${size * 0.05}" r="${size * 0.03}" fill="${color}"/>
        <circle cx="${size * 0.5}" cy="${size * 0.05}" r="${size * 0.03}" fill="${color}"/>
      </g>
    </svg>`;
  }
  
  // Main church icon
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    <rect width="${size}" height="${size}" fill="white" rx="${size * 0.15}"/>
    <g transform="translate(${size * 0.2}, ${size * 0.1})">
      <!-- Church building -->
      <rect x="0" y="${size * 0.4}" width="${size * 0.6}" height="${size * 0.4}" fill="${color}"/>
      <!-- Church roof -->
      <polygon points="${size * -0.05},${size * 0.4} ${size * 0.3},${size * 0.15} ${size * 0.65},${size * 0.4}" fill="${color}"/>
      <!-- Cross on top -->
      <rect x="${size * 0.275}" y="${size * 0.05}" width="${size * 0.05}" height="${size * 0.2}" fill="${color}"/>
      <rect x="${size * 0.225}" y="${size * 0.1}" width="${size * 0.15}" height="${size * 0.05}" fill="${color}"/>
      <!-- Door -->
      <rect x="${size * 0.225}" y="${size * 0.6}" width="${size * 0.15}" height="${size * 0.2}" fill="white" rx="3"/>
      <!-- Windows -->
      <rect x="${size * 0.1}" y="${size * 0.5}" width="${size * 0.08}" height="${size * 0.08}" fill="white" rx="2"/>
      <rect x="${size * 0.42}" y="${size * 0.5}" width="${size * 0.08}" height="${size * 0.08}" fill="white" rx="2"/>
    </g>
  </svg>`;
}

/**
 * Create splash screen SVG
 */
function createSplashSVG(width, height) {
  const color = '#7C3AED';
  const centerX = width / 2;
  const centerY = height / 2;
  const size = Math.min(width, height) * 0.3;
  
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    <rect width="${width}" height="${height}" fill="white"/>
    <g transform="translate(${centerX - size/2}, ${centerY - size/2})">
      <!-- Church building -->
      <rect x="0" y="${size * 0.4}" width="${size}" height="${size * 0.4}" fill="${color}"/>
      <!-- Church roof -->
      <polygon points="${size * -0.1},${size * 0.4} ${size * 0.5},${size * 0.1} ${size * 1.1},${size * 0.4}" fill="${color}"/>
      <!-- Cross on top -->
      <rect x="${size * 0.45}" y="0" width="${size * 0.1}" height="${size * 0.25}" fill="${color}"/>
      <rect x="${size * 0.35}" y="${size * 0.08}" width="${size * 0.3}" height="${size * 0.08}" fill="${color}"/>
      <!-- Door -->
      <rect x="${size * 0.35}" y="${size * 0.55}" width="${size * 0.3}" height="${size * 0.25}" fill="white" rx="${size * 0.05}"/>
      <!-- Windows -->
      <rect x="${size * 0.15}" y="${size * 0.5}" width="${size * 0.15}" height="${size * 0.15}" fill="white" rx="${size * 0.02}"/>
      <rect x="${size * 0.7}" y="${size * 0.5}" width="${size * 0.15}" height="${size * 0.15}" fill="white" rx="${size * 0.02}"/>
    </g>
    <text x="${centerX}" y="${height - 100}" text-anchor="middle" fill="${color}" font-family="system-ui" font-size="32" font-weight="600">Hong Kong Church</text>
  </svg>`;
}

console.log('🏗️  Generating PWA icons...');

// Generate main PWA icons
iconSizes.forEach(({ size, name }) => {
  const svgContent = createChurchSVG(size);
  const svgPath = path.join(iconsDir, name.replace('.png', '.svg'));
  fs.writeFileSync(svgPath, svgContent);
  console.log(`✅ Created ${name.replace('.png', '.svg')}`);
});

// Generate shortcut icons
shortcutIcons.forEach(({ name, size }) => {
  const type = name.split('-')[1].split('.')[0]; // Extract type from filename
  const svgContent = createChurchSVG(size, type);
  const svgPath = path.join(iconsDir, name.replace('.png', '.svg'));
  fs.writeFileSync(svgPath, svgContent);
  console.log(`✅ Created ${name.replace('.png', '.svg')}`);
});

// Generate splash screens
splashSizes.forEach(({ width, height, name }) => {
  const svgContent = createSplashSVG(width, height);
  const svgPath = path.join(iconsDir, name.replace('.png', '.svg'));
  fs.writeFileSync(svgPath, svgContent);
  console.log(`✅ Created ${name.replace('.png', '.svg')}`);
});

console.log('✨ Icon generation complete!');
console.log('\n📝 Note: SVG files have been created. For production, these should be converted to PNG files.');
console.log('You can use tools like ImageMagick, Sharp, or online converters to create PNG versions.');

// Create a README for the icons directory
const iconReadme = `# PWA Icons

This directory contains all the PWA icons and splash screens for the Hong Kong Church PWA.

## Generated Files

### Main PWA Icons (SVG format)
- icon-16x16.svg - Favicon (16x16)
- icon-32x32.svg - Favicon (32x32)
- icon-72x72.svg - Android Chrome (72x72)
- icon-96x96.svg - Android Chrome (96x96)
- icon-128x128.svg - Android Chrome (128x128)
- icon-144x144.svg - Android Chrome (144x144)
- icon-152x152.svg - Apple Touch (152x152)
- icon-192x192.svg - Android Chrome (192x192)
- icon-384x384.svg - Android Chrome (384x384)
- icon-512x512.svg - Android Chrome (512x512)

### Shortcut Icons
- shortcut-devotion.svg - Daily devotion shortcut
- shortcut-prayer.svg - Prayer requests shortcut
- shortcut-events.svg - Events shortcut

### Apple Splash Screens
- apple-splash-640-1136.svg - iPhone 5/SE
- apple-splash-750-1334.svg - iPhone 6/7/8
- apple-splash-1125-2436.svg - iPhone X/XS
- apple-splash-1242-2208.svg - iPhone Plus
- apple-splash-1536-2048.svg - iPad
- apple-splash-1668-2224.svg - iPad Pro 10.5"
- apple-splash-2048-2732.svg - iPad Pro 12.9"

## Converting to PNG

For production use, convert these SVG files to PNG format using:

\`\`\`bash
# Using ImageMagick (if installed)
convert icon-192x192.svg icon-192x192.png

# Using Sharp CLI (npm install -g sharp-cli)
sharp -i icon-192x192.svg -o icon-192x192.png

# Or use online tools like:
# - https://convertio.co/svg-png/
# - https://cloudconvert.com/svg-to-png
\`\`\`

## Icon Design

The icons feature a minimalist church design with:
- Purple theme color (#7C3AED) matching the app theme
- Church building with cross on top
- White background with rounded corners
- Clean, recognizable design that works at all sizes
`;

fs.writeFileSync(path.join(iconsDir, 'README.md'), iconReadme);
console.log('📖 Created icons/README.md');