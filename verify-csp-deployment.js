#!/usr/bin/env node

/**
 * CSP Deployment Verification Script
 * Checks if the deployed site has the correct CSP headers with 'unsafe-inline'
 */

const https = require('https');

const SITE_URL = 'https://hkchurchapp.vercel.app';

async function checkCSPHeaders() {
  console.log('🔍 Verifying CSP headers on deployed site...\n');
  console.log(`Target URL: ${SITE_URL}`);
  console.log('Expected: script-src should include "unsafe-inline"\n');

  try {
    const response = await fetch(SITE_URL, { method: 'HEAD' });
    const headers = response.headers;
    
    const csp = headers.get('content-security-policy');
    
    if (!csp) {
      console.log('❌ CRITICAL: No Content-Security-Policy header found!');
      return false;
    }
    
    console.log('✅ CSP header found');
    console.log('\nFull CSP header:');
    console.log('-'.repeat(80));
    console.log(csp);
    console.log('-'.repeat(80));
    
    // Check for unsafe-inline in script-src
    const hasUnsafeInline = csp.includes("'unsafe-inline'");
    const scriptSrcMatch = csp.match(/script-src[^;]*/);
    
    console.log('\n🔍 Analysis:');
    
    if (hasUnsafeInline) {
      console.log('✅ "unsafe-inline" directive found in CSP');
    } else {
      console.log('❌ "unsafe-inline" directive NOT found in CSP');
    }
    
    if (scriptSrcMatch) {
      console.log('\n📋 script-src directive:');
      console.log(scriptSrcMatch[0]);
      
      const scriptSrcHasUnsafeInline = scriptSrcMatch[0].includes("'unsafe-inline'");
      
      if (scriptSrcHasUnsafeInline) {
        console.log('✅ script-src includes "unsafe-inline" - CSP FIX SUCCESSFUL!');
        return true;
      } else {
        console.log('❌ script-src does NOT include "unsafe-inline" - CSP issue persists');
        return false;
      }
    } else {
      console.log('❌ No script-src directive found in CSP');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error checking CSP headers:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚨 CSP Deployment Verification Tool');
  console.log('===================================\n');
  
  const success = await checkCSPHeaders();
  
  console.log('\n📋 VERIFICATION RESULT:');
  console.log('======================');
  
  if (success) {
    console.log('🎉 SUCCESS: CSP headers are correctly deployed!');
    console.log('   The Hong Kong Church PWA should now load without CSP violations.');
    process.exit(0);
  } else {
    console.log('💥 FAILURE: CSP headers are still missing "unsafe-inline"');
    console.log('   Possible causes:');
    console.log('   1. Deployment is still in progress (wait 2-3 minutes)');
    console.log('   2. Vercel cache needs more time to invalidate');
    console.log('   3. There may be conflicting CSP sources');
    console.log('\n   Next steps:');
    console.log('   - Wait 5 minutes and run this script again');
    console.log('   - Check Vercel deployment logs');
    console.log('   - Consider adding a temporary robots.txt deployment to force cache clear');
    process.exit(1);
  }
}

// Make fetch available in Node.js if not present
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

main().catch(console.error);