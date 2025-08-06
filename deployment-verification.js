#!/usr/bin/env node

/**
 * Hong Kong Church PWA - Deployment Verification Script
 * This script provides comprehensive verification of your deployment
 */

const https = require('https');
const http = require('http');

class DeploymentVerifier {
  constructor(baseUrl = 'hkchurchapp.vercel.app') {
    this.baseUrl = baseUrl.replace(/^https?:\/\//, '');
    this.results = {
      connectivity: false,
      cspCompliance: false,
      pwaFeatures: false,
      performanceMetrics: {},
      securityHeaders: {},
      errors: []
    };
  }

  async verify() {
    console.log('🔍 Starting Hong Kong Church PWA Deployment Verification...\n');
    
    try {
      await this.checkConnectivity();
      await this.checkCSPCompliance();
      await this.checkPWAFeatures();
      await this.checkSecurityHeaders();
      await this.checkPerformance();
      
      this.generateReport();
    } catch (error) {
      console.error('❌ Verification failed:', error.message);
      this.results.errors.push(error.message);
    }
  }

  async checkConnectivity() {
    console.log('📡 Checking connectivity...');
    
    return new Promise((resolve, reject) => {
      const req = https.request(`https://${this.baseUrl}`, { 
        method: 'HEAD',
        timeout: 10000 
      }, (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('✅ Site is accessible');
          this.results.connectivity = true;
          resolve(true);
        } else {
          console.log(`❌ Site returned status: ${res.statusCode}`);
          this.results.errors.push(`HTTP ${res.statusCode} response`);
          resolve(false);
        }
      });
      
      req.on('error', (error) => {
        console.log(`❌ Connection failed: ${error.message}`);
        this.results.errors.push(`Connection error: ${error.message}`);
        resolve(false);
      });
      
      req.on('timeout', () => {
        console.log('❌ Connection timeout');
        this.results.errors.push('Connection timeout');
        req.destroy();
        resolve(false);
      });
      
      req.end();
    });
  }

  async checkCSPCompliance() {
    console.log('🛡️  Checking Content Security Policy...');
    
    return new Promise((resolve) => {
      const req = https.request(`https://${this.baseUrl}`, (res) => {
        const csp = res.headers['content-security-policy'];
        
        if (csp) {
          console.log('✅ CSP header present');
          
          // Check for common CSP violations that were fixed
          const hasUnsafeInline = csp.includes("'unsafe-inline'");
          const hasProperScriptSrc = csp.includes('script-src') && csp.includes('vercel.app');
          const hasProperStyleSrc = csp.includes('style-src') && csp.includes('fonts.googleapis.com');
          
          if (hasProperScriptSrc && hasProperStyleSrc) {
            console.log('✅ CSP configuration appears correct');
            this.results.cspCompliance = true;
          } else {
            console.log('⚠️  CSP may need adjustment');
          }
          
        } else {
          console.log('❌ No CSP header found');
          this.results.errors.push('Missing CSP header');
        }
        
        resolve(true);
      });
      
      req.on('error', () => resolve(false));
      req.end();
    });
  }

  async checkPWAFeatures() {
    console.log('📱 Checking PWA features...');
    
    const manifestCheck = await this.checkResource('/manifest.json', 'application/json');
    const swCheck = await this.checkResource('/sw.js', 'javascript');
    const iconCheck = await this.checkResource('/icons/icon-192x192.png', 'image');
    
    if (manifestCheck && swCheck && iconCheck) {
      console.log('✅ PWA features are properly configured');
      this.results.pwaFeatures = true;
    } else {
      console.log('❌ Some PWA features are missing');
      this.results.errors.push('PWA configuration incomplete');
    }
  }

  async checkResource(path, expectedType) {
    return new Promise((resolve) => {
      const req = https.request(`https://${this.baseUrl}${path}`, { method: 'HEAD' }, (res) => {
        const contentType = res.headers['content-type'] || '';
        const isCorrectType = contentType.includes(expectedType) || 
                             (expectedType === 'image' && contentType.includes('image')) ||
                             (expectedType === 'javascript' && contentType.includes('application/javascript'));
        
        if (res.statusCode === 200 && isCorrectType) {
          console.log(`✅ ${path} is accessible`);
          resolve(true);
        } else {
          console.log(`❌ ${path} check failed (${res.statusCode})`);
          resolve(false);
        }
      });
      
      req.on('error', () => {
        console.log(`❌ ${path} request failed`);
        resolve(false);
      });
      
      req.end();
    });
  }

  async checkSecurityHeaders() {
    console.log('🔒 Checking security headers...');
    
    return new Promise((resolve) => {
      const req = https.request(`https://${this.baseUrl}`, (res) => {
        const securityHeaders = [
          'content-security-policy',
          'strict-transport-security',
          'x-content-type-options',
          'x-frame-options',
          'x-xss-protection'
        ];
        
        let headerCount = 0;
        securityHeaders.forEach(header => {
          if (res.headers[header]) {
            console.log(`✅ ${header} present`);
            this.results.securityHeaders[header] = res.headers[header];
            headerCount++;
          } else {
            console.log(`❌ ${header} missing`);
          }
        });
        
        if (headerCount >= 4) {
          console.log('✅ Security headers are well configured');
        } else {
          console.log('⚠️  Some security headers are missing');
          this.results.errors.push('Incomplete security headers');
        }
        
        resolve(true);
      });
      
      req.on('error', () => resolve(false));
      req.end();
    });
  }

  async checkPerformance() {
    console.log('⚡ Running basic performance check...');
    
    const startTime = Date.now();
    
    return new Promise((resolve) => {
      const req = https.request(`https://${this.baseUrl}`, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          const endTime = Date.now();
          const responseTime = endTime - startTime;
          const sizeKB = Math.round(data.length / 1024);
          
          console.log(`✅ Response time: ${responseTime}ms`);
          console.log(`✅ Page size: ${sizeKB}KB`);
          
          this.results.performanceMetrics = {
            responseTime,
            sizeKB,
            timestamp: new Date().toISOString()
          };
          
          if (responseTime < 3000) {
            console.log('✅ Response time is good');
          } else {
            console.log('⚠️  Response time could be improved');
          }
          
          resolve(true);
        });
      });
      
      req.on('error', () => resolve(false));
      req.end();
    });
  }

  generateReport() {
    console.log('\n📊 DEPLOYMENT VERIFICATION REPORT');
    console.log('===================================');
    
    const overallHealth = this.calculateOverallHealth();
    console.log(`Overall Health: ${overallHealth >= 80 ? '🟢 EXCELLENT' : 
                                   overallHealth >= 60 ? '🟡 GOOD' : 
                                   '🔴 NEEDS ATTENTION'} (${overallHealth}%)\n`);
    
    console.log('Checklist Results:');
    console.log(`✅ Site Accessibility: ${this.results.connectivity ? 'PASS' : 'FAIL'}`);
    console.log(`✅ CSP Compliance: ${this.results.cspCompliance ? 'PASS' : 'FAIL'}`);
    console.log(`✅ PWA Features: ${this.results.pwaFeatures ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Security Headers: ${Object.keys(this.results.securityHeaders).length >= 4 ? 'PASS' : 'PARTIAL'}`);
    
    if (this.results.performanceMetrics.responseTime) {
      console.log(`✅ Performance: ${this.results.performanceMetrics.responseTime}ms response time`);
    }
    
    if (this.results.errors.length > 0) {
      console.log('\n⚠️  Issues Found:');
      this.results.errors.forEach(error => console.log(`   • ${error}`));
    }
    
    console.log('\n🎯 Next Steps:');
    if (overallHealth >= 80) {
      console.log('   • ✅ Deployment is successful and ready for production!');
      console.log('   • Consider running Lighthouse audit for detailed performance metrics');
      console.log('   • Monitor error logs and user feedback');
    } else {
      console.log('   • Address the issues listed above');
      console.log('   • Re-run this verification after fixes');
      console.log('   • Check Vercel deployment logs for detailed error information');
    }
  }

  calculateOverallHealth() {
    let score = 0;
    let total = 0;
    
    // Connectivity (25%)
    if (this.results.connectivity) score += 25;
    total += 25;
    
    // CSP Compliance (25%)
    if (this.results.cspCompliance) score += 25;
    total += 25;
    
    // PWA Features (25%)
    if (this.results.pwaFeatures) score += 25;
    total += 25;
    
    // Security Headers (25%)
    const securityScore = (Object.keys(this.results.securityHeaders).length / 5) * 25;
    score += securityScore;
    total += 25;
    
    return Math.round((score / total) * 100);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const customUrl = args[0];
  
  const verifier = new DeploymentVerifier(customUrl);
  await verifier.verify();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = DeploymentVerifier;