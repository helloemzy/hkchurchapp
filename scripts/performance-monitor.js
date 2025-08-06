#!/usr/bin/env node

/**
 * Production Performance Monitoring Script
 * Hong Kong Church PWA
 * 
 * This script runs continuous performance monitoring and generates alerts
 * for performance degradation.
 */

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs').promises;
const path = require('path');

const PRODUCTION_URL = 'https://hong-kong-church-pwa.vercel.app';
const MONITOR_INTERVAL = 300000; // 5 minutes
const RESULTS_DIR = './monitoring-results';

// Performance thresholds
const THRESHOLDS = {
  desktop: {
    LCP: 2500,
    FCP: 1800,
    CLS: 0.1,
    TBT: 300,
    TTI: 3800
  },
  mobile: {
    LCP: 2500,
    FCP: 1800,
    CLS: 0.1,
    TBT: 300,
    TTI: 3800
  }
};

// Hong Kong specific test locations (simulated via user agents)
const HK_TEST_CONFIGS = {
  'HK-Desktop': {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    deviceScaleFactor: 1,
    mobile: false,
    width: 1366,
    height: 768
  },
  'HK-Mobile-4G': {
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    deviceScaleFactor: 3,
    mobile: true,
    width: 390,
    height: 844,
    throttling: {
      rttMs: 150,
      throughputKbps: 1638.4,
      cpuSlowdownMultiplier: 4
    }
  },
  'HK-Mobile-3G': {
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    deviceScaleFactor: 3,
    mobile: true,
    width: 390,
    height: 844,
    throttling: {
      rttMs: 300,
      throughputKbps: 780,
      cpuSlowdownMultiplier: 4
    }
  }
};

async function ensureDirectory() {
  try {
    await fs.mkdir(RESULTS_DIR, { recursive: true });
  } catch (error) {
    console.error('Failed to create results directory:', error);
  }
}

async function runLighthouseTest(config, configName) {
  let chrome;
  try {
    console.log(`Starting Lighthouse test for ${configName}...`);
    
    chrome = await chromeLauncher.launch({
      chromeFlags: ['--headless', '--no-sandbox', '--disable-dev-shm-usage']
    });

    const options = {
      logLevel: 'error',
      output: 'json',
      port: chrome.port,
      emulatedFormFactor: config.mobile ? 'mobile' : 'desktop',
      throttling: config.throttling || undefined
    };

    const runnerResult = await lighthouse(PRODUCTION_URL, options);

    if (!runnerResult) {
      throw new Error('Lighthouse returned null result');
    }

    const report = runnerResult.lhr;
    
    // Extract key metrics
    const metrics = {
      timestamp: new Date().toISOString(),
      configName,
      url: PRODUCTION_URL,
      performance: {
        score: Math.round(report.categories.performance.score * 100),
        LCP: Math.round(report.audits['largest-contentful-paint'].numericValue),
        FCP: Math.round(report.audits['first-contentful-paint'].numericValue),
        CLS: Math.round(report.audits['cumulative-layout-shift'].numericValue * 1000) / 1000,
        TBT: Math.round(report.audits['total-blocking-time'].numericValue),
        TTI: Math.round(report.audits.interactive.numericValue)
      },
      pwa: {
        score: Math.round(report.categories.pwa.score * 100),
        serviceWorker: report.audits['service-worker'].score,
        installable: report.audits['installable-manifest'].score,
        offlineSupport: report.audits['works-offline'].score
      },
      accessibility: {
        score: Math.round(report.categories.accessibility.score * 100)
      },
      seo: {
        score: Math.round(report.categories.seo.score * 100)
      }
    };

    return metrics;
  } catch (error) {
    console.error(`Lighthouse test failed for ${configName}:`, error);
    return null;
  } finally {
    if (chrome) {
      await chrome.kill();
    }
  }
}

function checkThresholds(metrics) {
  const alerts = [];
  const thresholds = THRESHOLDS[metrics.configName.includes('Mobile') ? 'mobile' : 'desktop'];
  
  Object.entries(thresholds).forEach(([metric, threshold]) => {
    const value = metrics.performance[metric];
    if (value > threshold) {
      alerts.push({
        metric,
        value,
        threshold,
        severity: value > threshold * 1.5 ? 'critical' : 'warning'
      });
    }
  });

  // Performance score alerts
  if (metrics.performance.score < 90) {
    alerts.push({
      metric: 'Performance Score',
      value: metrics.performance.score,
      threshold: 90,
      severity: metrics.performance.score < 50 ? 'critical' : 'warning'
    });
  }

  // PWA score alerts
  if (metrics.pwa.score < 100) {
    alerts.push({
      metric: 'PWA Score',
      value: metrics.pwa.score,
      threshold: 100,
      severity: 'info'
    });
  }

  return alerts;
}

async function saveResults(results) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `performance-${timestamp}.json`;
  const filepath = path.join(RESULTS_DIR, filename);
  
  try {
    await fs.writeFile(filepath, JSON.stringify(results, null, 2));
    console.log(`Results saved to: ${filepath}`);
  } catch (error) {
    console.error('Failed to save results:', error);
  }
}

async function generateSummaryReport(results) {
  const summary = {
    timestamp: new Date().toISOString(),
    overall: {
      averagePerformanceScore: Math.round(
        results.reduce((sum, r) => sum + r.performance.score, 0) / results.length
      ),
      averageLCP: Math.round(
        results.reduce((sum, r) => sum + r.performance.LCP, 0) / results.length
      ),
      averageCLS: Math.round(
        (results.reduce((sum, r) => sum + r.performance.CLS, 0) / results.length) * 1000
      ) / 1000
    },
    byConfig: {},
    alerts: []
  };

  results.forEach(result => {
    summary.byConfig[result.configName] = result;
    const alerts = checkThresholds(result);
    summary.alerts.push(...alerts.map(alert => ({
      ...alert,
      config: result.configName,
      timestamp: result.timestamp
    })));
  });

  return summary;
}

async function sendAlerts(summary) {
  const criticalAlerts = summary.alerts.filter(alert => alert.severity === 'critical');
  
  if (criticalAlerts.length > 0) {
    console.log('🚨 CRITICAL PERFORMANCE ALERTS:');
    criticalAlerts.forEach(alert => {
      console.log(`   ${alert.config}: ${alert.metric} = ${alert.value} (threshold: ${alert.threshold})`);
    });
  }

  const warningAlerts = summary.alerts.filter(alert => alert.severity === 'warning');
  
  if (warningAlerts.length > 0) {
    console.log('⚠️  WARNING PERFORMANCE ALERTS:');
    warningAlerts.forEach(alert => {
      console.log(`   ${alert.config}: ${alert.metric} = ${alert.value} (threshold: ${alert.threshold})`);
    });
  }

  if (summary.alerts.length === 0) {
    console.log('✅ All performance metrics within acceptable thresholds');
  }
}

async function runMonitoringCycle() {
  console.log('🔄 Starting performance monitoring cycle...');
  console.log(`Testing URL: ${PRODUCTION_URL}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  
  const results = [];
  
  for (const [configName, config] of Object.entries(HK_TEST_CONFIGS)) {
    const result = await runLighthouseTest(config, configName);
    if (result) {
      results.push(result);
      console.log(`✅ ${configName}: Performance Score ${result.performance.score}/100`);
    } else {
      console.log(`❌ ${configName}: Test failed`);
    }
  }

  if (results.length > 0) {
    await saveResults(results);
    const summary = await generateSummaryReport(results);
    await sendAlerts(summary);
    
    // Save summary report
    const summaryPath = path.join(RESULTS_DIR, 'latest-summary.json');
    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));
    
    console.log(`📊 Monitoring cycle completed. Tested ${results.length} configurations.`);
    console.log(`Average Performance Score: ${summary.overall.averagePerformanceScore}/100`);
    
    return summary;
  } else {
    console.log('❌ All tests failed - no results to process');
    return null;
  }
}

async function main() {
  console.log('🚀 Hong Kong Church PWA Performance Monitor');
  console.log('==========================================');
  
  await ensureDirectory();
  
  if (process.argv.includes('--once')) {
    // Run once and exit
    await runMonitoringCycle();
    process.exit(0);
  } else {
    // Continuous monitoring
    console.log(`⏰ Starting continuous monitoring (${MONITOR_INTERVAL/1000}s intervals)`);
    
    // Initial run
    await runMonitoringCycle();
    
    // Set up recurring monitoring
    setInterval(async () => {
      try {
        await runMonitoringCycle();
      } catch (error) {
        console.error('Monitoring cycle failed:', error);
      }
    }, MONITOR_INTERVAL);
    
    // Keep the process running
    process.on('SIGINT', () => {
      console.log('\n⏹️  Performance monitoring stopped');
      process.exit(0);
    });
  }
}

// Run the monitor
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  runMonitoringCycle,
  THRESHOLDS,
  HK_TEST_CONFIGS
};