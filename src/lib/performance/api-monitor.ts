// API Performance Monitoring Utility
export interface APIMetric {
  endpoint: string;
  method: string;
  duration: number;
  status: number;
  timestamp: number;
  size?: number;
  error?: string;
  userAgent?: string;
  deviceType?: 'mobile' | 'desktop';
}

class APIMonitor {
  private metrics: APIMetric[] = [];
  private maxMetrics = 1000;

  // Track API request performance
  async trackRequest<T>(
    endpoint: string,
    method: string,
    requestFn: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    const timestamp = Date.now();
    
    try {
      const result = await requestFn();
      const duration = performance.now() - startTime;
      
      // Extract response size if possible
      let size: number | undefined;
      if (result && typeof result === 'object') {
        try {
          size = new TextEncoder().encode(JSON.stringify(result)).length;
        } catch {
          // Ignore size calculation errors
        }
      }
      
      const metric: APIMetric = {
        endpoint,
        method,
        duration,
        status: 200, // Assume success if no error
        timestamp,
        size,
        deviceType: this.getDeviceType(),
      };
      
      this.addMetric(metric);
      
      // Log slow API calls
      if (duration > 1000) {
        console.warn(`Slow API call detected: ${method} ${endpoint} took ${duration.toFixed(2)}ms`);
        
        // Send to analytics
        this.sendToAnalytics(metric, 'slow_api_call');
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      const metric: APIMetric = {
        endpoint,
        method,
        duration,
        status: 500, // Assume server error
        timestamp,
        error: error instanceof Error ? error.message : 'Unknown error',
        deviceType: this.getDeviceType(),
      };
      
      this.addMetric(metric);
      this.sendToAnalytics(metric, 'api_error');
      
      throw error;
    }
  }

  // Add metric to collection
  private addMetric(metric: APIMetric) {
    this.metrics.push(metric);
    
    // Keep only the latest metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  // Get device type
  private getDeviceType(): 'mobile' | 'desktop' {
    if (typeof window === 'undefined') return 'desktop';
    return window.innerWidth <= 768 ? 'mobile' : 'desktop';
  }

  // Send to analytics
  private sendToAnalytics(metric: APIMetric, eventType: string) {
    // Send to Vercel Analytics
    if (typeof window !== 'undefined' && window.va) {
      window.va('track', eventType, {
        endpoint: metric.endpoint,
        method: metric.method,
        duration: Math.round(metric.duration),
        status: metric.status,
        deviceType: metric.deviceType,
      });
    }
    
    // Send to our performance API in production
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/analytics/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'api_metric',
          ...metric,
        }),
      }).catch(console.error);
    }
  }

  // Get performance statistics
  getStatistics(timeframe: number = 3600000): {
    totalRequests: number;
    averageResponseTime: number;
    errorRate: number;
    slowRequests: number;
    endpointStats: Record<string, {
      count: number;
      averageTime: number;
      errorCount: number;
      slowCount: number;
    }>;
  } {
    const now = Date.now();
    const recentMetrics = this.metrics.filter(
      metric => (now - metric.timestamp) <= timeframe
    );
    
    if (recentMetrics.length === 0) {
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        errorRate: 0,
        slowRequests: 0,
        endpointStats: {},
      };
    }
    
    const totalRequests = recentMetrics.length;
    const totalTime = recentMetrics.reduce((sum, metric) => sum + metric.duration, 0);
    const averageResponseTime = totalTime / totalRequests;
    
    const errorCount = recentMetrics.filter(metric => metric.status >= 400).length;
    const errorRate = (errorCount / totalRequests) * 100;
    
    const slowRequests = recentMetrics.filter(metric => metric.duration > 1000).length;
    
    // Calculate per-endpoint statistics
    const endpointStats: Record<string, {
      count: number;
      averageTime: number;
      errorCount: number;
      slowCount: number;
    }> = {};
    
    recentMetrics.forEach(metric => {
      const key = `${metric.method} ${metric.endpoint}`;
      
      if (!endpointStats[key]) {
        endpointStats[key] = {
          count: 0,
          averageTime: 0,
          errorCount: 0,
          slowCount: 0,
        };
      }
      
      const stats = endpointStats[key];
      stats.count++;
      stats.averageTime = (stats.averageTime * (stats.count - 1) + metric.duration) / stats.count;
      
      if (metric.status >= 400) stats.errorCount++;
      if (metric.duration > 1000) stats.slowCount++;
    });
    
    return {
      totalRequests,
      averageResponseTime,
      errorRate,
      slowRequests,
      endpointStats,
    };
  }

  // Clear metrics
  clearMetrics() {
    this.metrics = [];
  }

  // Export metrics for analysis
  exportMetrics(timeframe?: number): APIMetric[] {
    if (!timeframe) return [...this.metrics];
    
    const now = Date.now();
    return this.metrics.filter(
      metric => (now - metric.timestamp) <= timeframe
    );
  }
}

// Global instance
export const apiMonitor = new APIMonitor();

// Wrapper for fetch to automatically track API calls
export async function monitoredFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const method = options.method || 'GET';
  const endpoint = new URL(url, window.location.origin).pathname;
  
  return apiMonitor.trackRequest(endpoint, method, async () => {
    const response = await fetch(url, options);
    
    // Track HTTP status
    const metric: Partial<APIMetric> = {
      status: response.status,
    };
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response;
  });
}

// Hook for React components to use monitored API calls
export function useAPIMonitor() {
  return {
    trackRequest: apiMonitor.trackRequest.bind(apiMonitor),
    getStatistics: apiMonitor.getStatistics.bind(apiMonitor),
    clearMetrics: apiMonitor.clearMetrics.bind(apiMonitor),
    exportMetrics: apiMonitor.exportMetrics.bind(apiMonitor),
  };
}