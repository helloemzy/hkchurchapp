import { onCLS, onFCP, onINP, onLCP, onTTFB, Metric } from 'web-vitals';

// Performance thresholds based on Google's Core Web Vitals
export const PERFORMANCE_THRESHOLDS = {
  LCP: { good: 2500, needs_improvement: 4000 }, // Largest Contentful Paint
  INP: { good: 200, needs_improvement: 500 },   // Interaction to Next Paint (replaces FID)
  CLS: { good: 0.1, needs_improvement: 0.25 },  // Cumulative Layout Shift
  FCP: { good: 1800, needs_improvement: 3000 }, // First Contentful Paint
  TTFB: { good: 800, needs_improvement: 1800 }, // Time to First Byte
};

export interface PerformanceData {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  url: string;
  timestamp: number;
  deviceType?: 'mobile' | 'desktop';
  connectionType?: string;
}

// Send performance metrics to analytics
function sendToAnalytics(data: PerformanceData) {
  // Send to Vercel Analytics
  if (typeof window !== 'undefined' && window.va) {
    window.va('track', 'Web Vitals', {
      metric: data.name,
      value: data.value,
      rating: data.rating,
      url: data.url,
      deviceType: data.deviceType,
    });
  }

  // Log performance data for debugging
  console.log('Performance Metric:', data);

  // Send to custom analytics endpoint if needed
  if (process.env.NODE_ENV === 'production') {
    fetch('/api/analytics/performance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }).catch((error) => {
      console.error('Failed to send performance data:', error);
    });
  }
}

// Get device type
function getDeviceType(): 'mobile' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  return window.innerWidth <= 768 ? 'mobile' : 'desktop';
}

// Get connection type
function getConnectionType(): string {
  if (typeof navigator !== 'undefined' && 'connection' in navigator) {
    const connection = (navigator as any).connection;
    return connection?.effectiveType || 'unknown';
  }
  return 'unknown';
}

// Process and send metric data
function handleMetric(metric: Metric) {
  const threshold = PERFORMANCE_THRESHOLDS[metric.name as keyof typeof PERFORMANCE_THRESHOLDS];
  
  let rating: 'good' | 'needs-improvement' | 'poor' = 'good';
  if (threshold) {
    if (metric.value > threshold.needs_improvement) {
      rating = 'poor';
    } else if (metric.value > threshold.good) {
      rating = 'needs-improvement';
    }
  }

  const performanceData: PerformanceData = {
    name: metric.name,
    value: metric.value,
    rating,
    delta: metric.delta,
    id: metric.id,
    url: window.location.pathname,
    timestamp: Date.now(),
    deviceType: getDeviceType(),
    connectionType: getConnectionType(),
  };

  sendToAnalytics(performanceData);
}

// Initialize Web Vitals monitoring
export function initWebVitals() {
  // Only run in browser environment
  if (typeof window === 'undefined') return;

  // Core Web Vitals
  onCLS(handleMetric);
  onINP(handleMetric);
  onLCP(handleMetric);
  
  // Additional metrics
  onFCP(handleMetric);
  onTTFB(handleMetric);
}

// Get current performance metrics snapshot
export function getPerformanceSnapshot() {
  if (typeof window === 'undefined' || !window.performance) {
    return null;
  }

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const paint = performance.getEntriesByType('paint');

  return {
    // Navigation timing
    dns: navigation.domainLookupEnd - navigation.domainLookupStart,
    connection: navigation.connectEnd - navigation.connectStart,
    ttfb: navigation.responseStart - navigation.requestStart,
    domLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
    windowLoaded: navigation.loadEventEnd - navigation.navigationStart,
    
    // Paint timing
    fcp: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
    
    // Memory usage (if available)
    memory: (performance as any).memory ? {
      used: (performance as any).memory.usedJSHeapSize,
      total: (performance as any).memory.totalJSHeapSize,
      limit: (performance as any).memory.jsHeapSizeLimit,
    } : null,
    
    // Current timestamp
    timestamp: Date.now(),
    url: window.location.pathname,
    deviceType: getDeviceType(),
    connectionType: getConnectionType(),
  };
}

// Monitor page load performance
export function monitorPageLoad() {
  if (typeof window === 'undefined') return;

  window.addEventListener('load', () => {
    // Wait a bit for all metrics to be available
    setTimeout(() => {
      const snapshot = getPerformanceSnapshot();
      if (snapshot) {
        console.log('Page Load Performance:', snapshot);
        
        // Send to analytics
        if (window.va) {
          window.va('track', 'Page Load', {
            ttfb: snapshot.ttfb,
            domLoaded: snapshot.domLoaded,
            windowLoaded: snapshot.windowLoaded,
            deviceType: snapshot.deviceType,
            url: snapshot.url,
          });
        }
      }
    }, 1000);
  });
}

// Monitor resource loading performance
export function monitorResourceLoading() {
  if (typeof window === 'undefined') return;

  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.entryType === 'resource') {
        const resource = entry as PerformanceResourceTiming;
        
        // Monitor slow resources (> 2 seconds)
        if (resource.duration > 2000) {
          console.warn('Slow resource detected:', {
            name: resource.name,
            duration: resource.duration,
            size: resource.transferSize,
          });
          
          if (window.va) {
            window.va('track', 'Slow Resource', {
              resource: resource.name,
              duration: resource.duration,
              size: resource.transferSize,
            });
          }
        }
      }
    });
  });

  observer.observe({ entryTypes: ['resource'] });
}

// Initialize all performance monitoring
export function initPerformanceMonitoring() {
  initWebVitals();
  monitorPageLoad();
  monitorResourceLoading();
}