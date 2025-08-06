#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

// Performance budgets (in bytes)
const PERFORMANCE_BUDGETS = {
  javascript: 250 * 1024,  // 250KB
  css: 50 * 1024,         // 50KB
  images: 500 * 1024,     // 500KB
  total: 1000 * 1024,     // 1MB
};

// Color codes for console output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getStatusColor(size, budget) {
  const percentage = (size / budget) * 100;
  if (percentage <= 75) return colors.green;
  if (percentage <= 90) return colors.yellow;
  return colors.red;
}

async function getDirectorySize(dirPath) {
  if (!fs.existsSync(dirPath)) return 0;
  
  let totalSize = 0;
  const files = await readdir(dirPath);
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stats = await stat(filePath);
    
    if (stats.isDirectory()) {
      totalSize += await getDirectorySize(filePath);
    } else {
      totalSize += stats.size;
    }
  }
  
  return totalSize;
}

async function analyzeBundles() {
  console.log(`${colors.bold}${colors.blue}📊 Bundle Size Analysis${colors.reset}\n`);
  
  const buildDir = '.next';
  if (!fs.existsSync(buildDir)) {
    console.log(`${colors.red}❌ Build directory not found. Run 'npm run build' first.${colors.reset}`);
    process.exit(1);
  }
  
  // Analyze different asset types
  const analysis = {
    javascript: 0,
    css: 0,
    images: 0,
    other: 0,
    total: 0
  };
  
  // Analyze JavaScript bundles
  const jsDir = path.join(buildDir, 'static', 'chunks');
  if (fs.existsSync(jsDir)) {
    analysis.javascript = await getDirectorySize(jsDir);
  }
  
  // Analyze CSS bundles
  const cssDir = path.join(buildDir, 'static', 'css');
  if (fs.existsSync(cssDir)) {
    analysis.css = await getDirectorySize(cssDir);
  }
  
  // Analyze media/images
  const mediaDir = path.join(buildDir, 'static', 'media');
  if (fs.existsSync(mediaDir)) {
    analysis.images = await getDirectorySize(mediaDir);
  }
  
  // Calculate total
  analysis.total = analysis.javascript + analysis.css + analysis.images + analysis.other;
  
  // Report results
  console.log('Bundle Size Report:');
  console.log('==================');
  
  const jsColor = getStatusColor(analysis.javascript, PERFORMANCE_BUDGETS.javascript);
  const jsPercentage = ((analysis.javascript / PERFORMANCE_BUDGETS.javascript) * 100).toFixed(1);
  console.log(`${jsColor}JavaScript: ${formatBytes(analysis.javascript)} / ${formatBytes(PERFORMANCE_BUDGETS.javascript)} (${jsPercentage}%)${colors.reset}`);
  
  const cssColor = getStatusColor(analysis.css, PERFORMANCE_BUDGETS.css);
  const cssPercentage = ((analysis.css / PERFORMANCE_BUDGETS.css) * 100).toFixed(1);
  console.log(`${cssColor}CSS: ${formatBytes(analysis.css)} / ${formatBytes(PERFORMANCE_BUDGETS.css)} (${cssPercentage}%)${colors.reset}`);
  
  const imgColor = getStatusColor(analysis.images, PERFORMANCE_BUDGETS.images);
  const imgPercentage = ((analysis.images / PERFORMANCE_BUDGETS.images) * 100).toFixed(1);
  console.log(`${imgColor}Images: ${formatBytes(analysis.images)} / ${formatBytes(PERFORMANCE_BUDGETS.images)} (${imgPercentage}%)${colors.reset}`);
  
  const totalColor = getStatusColor(analysis.total, PERFORMANCE_BUDGETS.total);
  const totalPercentage = ((analysis.total / PERFORMANCE_BUDGETS.total) * 100).toFixed(1);
  console.log(`${totalColor}Total: ${formatBytes(analysis.total)} / ${formatBytes(PERFORMANCE_BUDGETS.total)} (${totalPercentage}%)${colors.reset}`);
  
  console.log('\n');
  
  // Check for budget violations
  let violations = 0;
  
  if (analysis.javascript > PERFORMANCE_BUDGETS.javascript) {
    console.log(`${colors.red}❌ JavaScript bundle exceeds budget by ${formatBytes(analysis.javascript - PERFORMANCE_BUDGETS.javascript)}${colors.reset}`);
    violations++;
  }
  
  if (analysis.css > PERFORMANCE_BUDGETS.css) {
    console.log(`${colors.red}❌ CSS bundle exceeds budget by ${formatBytes(analysis.css - PERFORMANCE_BUDGETS.css)}${colors.reset}`);
    violations++;
  }
  
  if (analysis.images > PERFORMANCE_BUDGETS.images) {
    console.log(`${colors.red}❌ Image assets exceed budget by ${formatBytes(analysis.images - PERFORMANCE_BUDGETS.images)}${colors.reset}`);
    violations++;
  }
  
  if (analysis.total > PERFORMANCE_BUDGETS.total) {
    console.log(`${colors.red}❌ Total bundle size exceeds budget by ${formatBytes(analysis.total - PERFORMANCE_BUDGETS.total)}${colors.reset}`);
    violations++;
  }
  
  if (violations === 0) {
    console.log(`${colors.green}✅ All bundles are within performance budgets!${colors.reset}`);
  } else {
    console.log(`\n${colors.red}⚠️  ${violations} performance budget violation(s) detected${colors.reset}`);
  }
  
  // Generate recommendations
  console.log('\n' + colors.bold + 'Optimization Recommendations:' + colors.reset);
  console.log('================================');
  
  if (analysis.javascript > PERFORMANCE_BUDGETS.javascript * 0.8) {
    console.log('🔍 JavaScript optimization suggestions:');
    console.log('  - Use dynamic imports for heavy components');
    console.log('  - Implement code splitting by routes');
    console.log('  - Remove unused dependencies');
    console.log('  - Use tree shaking for third-party libraries');
  }
  
  if (analysis.css > PERFORMANCE_BUDGETS.css * 0.8) {
    console.log('🎨 CSS optimization suggestions:');
    console.log('  - Remove unused CSS rules');
    console.log('  - Use CSS-in-JS for component-specific styles');
    console.log('  - Implement critical CSS extraction');
  }
  
  if (analysis.images > PERFORMANCE_BUDGETS.images * 0.8) {
    console.log('🖼️  Image optimization suggestions:');
    console.log('  - Use Next.js Image component with optimization');
    console.log('  - Implement WebP/AVIF formats');
    console.log('  - Use responsive images with srcset');
  }
  
  // Save report to file
  const report = {
    timestamp: new Date().toISOString(),
    analysis,
    budgets: PERFORMANCE_BUDGETS,
    violations,
  };
  
  fs.writeFileSync('bundle-analysis.json', JSON.stringify(report, null, 2));
  console.log(`\n📄 Detailed report saved to bundle-analysis.json`);
  
  // Exit with error code if there are violations
  if (violations > 0) {
    process.exit(1);
  }
}

// Detailed file analysis
async function analyzeDetailedBundles() {
  const chunksDir = path.join('.next', 'static', 'chunks');
  if (!fs.existsSync(chunksDir)) return;
  
  console.log('\n' + colors.bold + 'Detailed Bundle Analysis:' + colors.reset);
  console.log('========================');
  
  const chunks = await readdir(chunksDir);
  const chunkSizes = [];
  
  for (const chunk of chunks) {
    if (chunk.endsWith('.js')) {
      const filePath = path.join(chunksDir, chunk);
      const stats = await stat(filePath);
      chunkSizes.push({ name: chunk, size: stats.size });
    }
  }
  
  // Sort by size (largest first)
  chunkSizes.sort((a, b) => b.size - a.size);
  
  console.log('Largest JavaScript chunks:');
  chunkSizes.slice(0, 10).forEach((chunk, index) => {
    const color = chunk.size > 50000 ? colors.red : chunk.size > 25000 ? colors.yellow : colors.green;
    console.log(`${index + 1}. ${color}${chunk.name}: ${formatBytes(chunk.size)}${colors.reset}`);
  });
}

// Main execution
async function main() {
  try {
    await analyzeBundles();
    await analyzeDetailedBundles();
  } catch (error) {
    console.error(`${colors.red}Error analyzing bundles: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { analyzeBundles, formatBytes };