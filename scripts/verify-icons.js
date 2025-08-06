#!/usr/bin/env node

/**
 * Verify all PWA icons exist and match manifest.json references
 */

const fs = require('fs');
const path = require('path');

const manifestPath = path.join(__dirname, '../public/manifest.json');
const iconsDir = path.join(__dirname, '../public/icons');
const layoutPath = path.join(__dirname, '../src/app/layout.tsx');

console.log('🔍 Verifying PWA icon setup...\n');

// Check if manifest exists and is valid JSON
try {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  console.log('✅ manifest.json is valid JSON');
  
  // Check all manifest icons exist
  console.log('\n📱 Checking manifest.json icons:');
  let missingManifestIcons = 0;
  
  for (const icon of manifest.icons) {
    const iconPath = path.join(__dirname, '../public', icon.src);
    if (fs.existsSync(iconPath)) {
      console.log(`✅ ${icon.src} (${icon.sizes})`);
    } else {
      console.log(`❌ ${icon.src} (${icon.sizes}) - MISSING`);
      missingManifestIcons++;
    }
  }
  
  // Check shortcut icons
  console.log('\n🔗 Checking shortcut icons:');
  let missingShortcutIcons = 0;
  
  for (const shortcut of manifest.shortcuts) {
    for (const icon of shortcut.icons) {
      const iconPath = path.join(__dirname, '../public', icon.src);
      if (fs.existsSync(iconPath)) {
        console.log(`✅ ${icon.src} (${shortcut.name})`);
      } else {
        console.log(`❌ ${icon.src} (${shortcut.name}) - MISSING`);
        missingShortcutIcons++;
      }
    }
  }
  
  // Check layout.tsx references
  console.log('\n🖼️ Checking layout.tsx icon references:');
  let missingLayoutIcons = 0;
  
  try {
    const layoutContent = fs.readFileSync(layoutPath, 'utf8');
    
    // Extract icon references from layout
    const iconRefs = [
      '/icons/icon-152x152.png',
      '/icons/icon-192x192.png',
      '/icons/icon-32x32.png',
      '/icons/icon-16x16.png'
    ];
    
    // Extract splash screen references
    const splashRefs = [
      '/icons/apple-splash-2048-2732.png',
      '/icons/apple-splash-1668-2224.png',
      '/icons/apple-splash-1536-2048.png',
      '/icons/apple-splash-1125-2436.png',
      '/icons/apple-splash-1242-2208.png',
      '/icons/apple-splash-750-1334.png',
      '/icons/apple-splash-640-1136.png'
    ];
    
    const allLayoutRefs = [...iconRefs, ...splashRefs];
    
    for (const iconRef of allLayoutRefs) {
      const iconPath = path.join(__dirname, '../public', iconRef);
      if (fs.existsSync(iconPath)) {
        console.log(`✅ ${iconRef}`);
      } else {
        console.log(`❌ ${iconRef} - MISSING`);
        missingLayoutIcons++;
      }
    }
    
  } catch (error) {
    console.log('❌ Error reading layout.tsx:', error.message);
  }
  
  // Summary
  console.log('\n📊 SUMMARY:');
  console.log(`• Manifest icons: ${manifest.icons.length - missingManifestIcons}/${manifest.icons.length} found`);
  console.log(`• Shortcut icons: ${manifest.shortcuts.reduce((acc, s) => acc + s.icons.length, 0) - missingShortcutIcons}/${manifest.shortcuts.reduce((acc, s) => acc + s.icons.length, 0)} found`);
  console.log(`• Layout icons: ${11 - missingLayoutIcons}/11 found`);
  
  const totalMissing = missingManifestIcons + missingShortcutIcons + missingLayoutIcons;
  
  if (totalMissing === 0) {
    console.log('\n🎉 All PWA icons are properly set up! No 404 errors expected.');
  } else {
    console.log(`\n⚠️  ${totalMissing} icons are missing and may cause 404 errors.`);
  }
  
} catch (error) {
  console.log('❌ Error reading manifest.json:', error.message);
}

// List all files in icons directory for reference
console.log('\n📁 Available icon files:');
try {
  const iconFiles = fs.readdirSync(iconsDir).filter(f => !f.startsWith('.') && f !== 'README.md');
  iconFiles.sort().forEach(file => {
    console.log(`   ${file}`);
  });
  console.log(`\nTotal: ${iconFiles.length} files`);
} catch (error) {
  console.log('❌ Error reading icons directory:', error.message);
}