import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Rate limiting for performance data collection
const requests = new Map<string, number>();
const RATE_LIMIT = 100; // requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  url: string;
  timestamp: number;
  deviceType?: 'mobile' | 'desktop';
  connectionType?: string;
  userAgent?: string;
}

// Simple rate limiting
function checkRateLimit(clientId: string): boolean {
  const now = Date.now();
  const clientRequests = requests.get(clientId) || 0;
  
  // Clean up old entries
  if (now % 10000 < 100) { // Every ~10 seconds
    requests.clear();
  }
  
  if (clientRequests >= RATE_LIMIT) {
    return false;
  }
  
  requests.set(clientId, clientRequests + 1);
  return true;
}

// Store performance data (in production, this would go to a database)
const performanceData: PerformanceMetric[] = [];
const MAX_STORED_METRICS = 1000;

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const headersList = await headers();
    const forwarded = headersList.get('x-forwarded-for');
    const clientIp = forwarded ? forwarded.split(',')[0] : 'unknown';
    
    // Check rate limit
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const body = await request.json();
    
    // Validate the performance data
    if (!body.name || typeof body.value !== 'number' || !body.id) {
      return NextResponse.json(
        { error: 'Invalid performance data' },
        { status: 400 }
      );
    }

    // Add user agent and IP info
    const metric: PerformanceMetric = {
      ...body,
      userAgent: headersList.get('user-agent') || 'unknown',
      timestamp: Date.now(),
    };

    // Store the metric (limit storage size)
    performanceData.push(metric);
    if (performanceData.length > MAX_STORED_METRICS) {
      performanceData.shift(); // Remove oldest entry
    }

    // Log critical performance issues
    if (metric.rating === 'poor') {
      console.warn(`Poor performance detected: ${metric.name} = ${metric.value}ms on ${metric.url}`);
    }

    // In production, you would store this in a database or send to analytics service
    // For now, we'll just acknowledge receipt
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Performance analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to process performance data' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve performance statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const metric = searchParams.get('metric');
    const timeframe = parseInt(searchParams.get('timeframe') || '3600000'); // 1 hour default
    
    const now = Date.now();
    const filteredData = performanceData.filter(item => {
      const isInTimeframe = (now - item.timestamp) <= timeframe;
      const matchesMetric = !metric || item.name === metric;
      return isInTimeframe && matchesMetric;
    });

    // Calculate statistics
    const stats = {
      count: filteredData.length,
      metrics: {} as Record<string, {
        average: number;
        median: number;
        p95: number;
        good: number;
        needsImprovement: number;
        poor: number;
      }>
    };

    // Group by metric name
    const groupedMetrics: Record<string, number[]> = {};
    const ratings: Record<string, { good: number; needsImprovement: number; poor: number }> = {};

    filteredData.forEach(item => {
      if (!groupedMetrics[item.name]) {
        groupedMetrics[item.name] = [];
        ratings[item.name] = { good: 0, needsImprovement: 0, poor: 0 };
      }
      
      groupedMetrics[item.name].push(item.value);
      ratings[item.name][item.rating.replace('-', '') as keyof typeof ratings[string]]++;
    });

    // Calculate statistics for each metric
    Object.keys(groupedMetrics).forEach(metricName => {
      const values = groupedMetrics[metricName].sort((a, b) => a - b);
      const count = values.length;
      
      if (count === 0) return;
      
      const average = values.reduce((sum, val) => sum + val, 0) / count;
      const median = count % 2 === 0 
        ? (values[count / 2 - 1] + values[count / 2]) / 2
        : values[Math.floor(count / 2)];
      const p95Index = Math.floor(count * 0.95);
      const p95 = values[p95Index];
      
      stats.metrics[metricName] = {
        average: Math.round(average),
        median: Math.round(median),
        p95: Math.round(p95),
        good: ratings[metricName].good,
        needsImprovement: ratings[metricName].needsImprovement,
        poor: ratings[metricName].poor,
      };
    });

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Performance stats error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve performance statistics' },
      { status: 500 }
    );
  }
}