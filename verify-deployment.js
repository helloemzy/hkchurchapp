#!/usr/bin/env node

/**
 * Deployment Verification Script
 * Verifies that the app is ready for Vercel deployment with proper CSP configuration
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Hong Kong Church PWA - Deployment Verification\n');

// Check critical files exist
const criticalFiles = [
  'next.config.ts',
  'middleware.ts', 
  'package.json',
  'src/app/layout.tsx',
  '.next/build-manifest.json'
];

console.log('📁 Checking critical files:');
let allFilesExist = true;

criticalFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - Missing`);
    allFilesExist = false;
  }
});

// Check package.json for required dependencies
console.log('\n📦 Checking dependencies:');
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const requiredDeps = [
  '@vercel/analytics',
  '@vercel/speed-insights', 
  'next',
  'react',
  'next-pwa'
];

requiredDeps.forEach(dep => {
  const hasRegularDep = packageJson.dependencies && packageJson.dependencies[dep];
  const hasDevDep = packageJson.devDependencies && packageJson.devDependencies[dep];
  
  if (hasRegularDep || hasDevDep) {
    const version = hasRegularDep || hasDevDep;
    console.log(`  ✅ ${dep}@${version}`);
  } else {
    console.log(`  ❌ ${dep} - Missing`);
    allFilesExist = false;
  }
});

// Check next.config.ts CSP configuration
console.log('\n🔒 Verifying CSP Configuration:');
const nextConfigPath = path.join(__dirname, 'next.config.ts');
const nextConfigContent = fs.readFileSync(nextConfigPath, 'utf8');

const cspChecks = [
  { name: 'Vercel Analytics Domain', pattern: 'va.vercel-scripts.com' },
  { name: 'Vercel Insights Domain', pattern: 'vitals.vercel-insights.com' },
  { name: 'Script-src directive', pattern: 'script-src' },
  { name: 'Unsafe-inline allowed', pattern: "'unsafe-inline'" },
  { name: 'Unsafe-eval allowed', pattern: "'unsafe-eval'" },
  { name: 'Data: protocol allowed', pattern: 'data:' }
];

cspChecks.forEach(check => {
  if (nextConfigContent.includes(check.pattern)) {
    console.log(`  ✅ ${check.name}`);
  } else {
    console.log(`  ❌ ${check.name} - Missing`);
    allFilesExist = false;
  }
});

// Check for problematic configurations
console.log('\n⚠️  Checking for problematic configurations:');
const problematicPatterns = [
  { name: 'Block-all-mixed-content', pattern: 'block-all-mixed-content', shouldExist: false },
  { name: 'Cross-Origin-Embedder-Policy require-corp', pattern: 'Cross-Origin-Embedder-Policy.*require-corp', shouldExist: false }
];

problematicPatterns.forEach(check => {
  const found = nextConfigContent.match(check.pattern);
  if (found && !check.shouldExist) {
    console.log(`  ⚠️  ${check.name} - Found (may cause issues)`);
  } else if (!found && check.shouldExist) {
    console.log(`  ❌ ${check.name} - Missing`);
  } else {
    console.log(`  ✅ ${check.name} - OK`);
  }
});

// Final status
console.log('\n' + '='.repeat(60));
if (allFilesExist) {
  console.log('🎉 DEPLOYMENT READY!');
  console.log('   Your Hong Kong Church PWA is configured for Vercel deployment.');
} else {
  console.log('❌ DEPLOYMENT NOT READY');
  console.log('   Please fix the issues above before deploying.');
}

console.log('\n📋 Next Steps:');
console.log('1. Commit your changes to Git');
console.log('2. Push to your repository');
console.log('3. Deploy to Vercel');
console.log('4. Test the deployed app for CSP violations');
console.log('5. Monitor browser console for any remaining errors');

console.log('\n💡 Quick Deploy Commands:');
console.log('   git add .');
console.log('   git commit -m "Fix CSP violations for Vercel deployment"');
console.log('   git push origin main');
console.log('   vercel --prod');