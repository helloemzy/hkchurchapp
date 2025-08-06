import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

interface ErrorReport {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: number;
  url: string;
  userAgent: string;
  errorId: string;
  deviceType: 'mobile' | 'desktop';
  userId?: string;
  performanceData?: {
    loadTime: number;
    domContentLoaded: number;
    memoryUsed: number;
    memoryLimit: number;
    timestamp: number;
  };
}

// Simple in-memory storage for demo (in production, use a database)
const errorReports: ErrorReport[] = [];
const MAX_STORED_ERRORS = 1000;

// Rate limiting
const errorRequests = new Map<string, number>();
const ERROR_RATE_LIMIT = 50; // errors per minute per IP
const RATE_WINDOW = 60 * 1000; // 1 minute

function checkErrorRateLimit(clientId: string): boolean {
  const now = Date.now();
  const clientErrors = errorRequests.get(clientId) || 0;
  
  // Clean up old entries
  if (now % 10000 < 100) {
    errorRequests.clear();
  }
  
  if (clientErrors >= ERROR_RATE_LIMIT) {
    return false;
  }
  
  errorRequests.set(clientId, clientErrors + 1);
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const headersList = await headers();
    const forwarded = headersList.get('x-forwarded-for');
    const clientIp = forwarded ? forwarded.split(',')[0] : 'unknown';
    
    // Check rate limit
    if (!checkErrorRateLimit(clientIp)) {
      return NextResponse.json(
        { error: 'Error reporting rate limit exceeded' },
        { status: 429 }
      );
    }

    const errorReport: ErrorReport = await request.json();
    
    // Validate required fields
    if (!errorReport.message || !errorReport.errorId || !errorReport.timestamp) {
      return NextResponse.json(
        { error: 'Invalid error report data' },
        { status: 400 }
      );
    }

    // Add server-side timestamp
    errorReport.timestamp = Date.now();

    // Store the error report
    errorReports.push(errorReport);
    
    // Keep storage size manageable
    if (errorReports.length > MAX_STORED_ERRORS) {
      errorReports.shift();
    }

    // Log critical errors
    console.error(`Application Error [${errorReport.errorId}]:`, {
      message: errorReport.message,
      url: errorReport.url,
      deviceType: errorReport.deviceType,
      userAgent: errorReport.userAgent,
      stack: errorReport.stack ? errorReport.stack.substring(0, 500) + '...' : 'No stack trace',
      timestamp: new Date(errorReport.timestamp).toISOString(),
    });

    // In production, you might want to:
    // 1. Send to external error tracking service (Sentry, Bugsnag, etc.)
    // 2. Store in database
    // 3. Send alerts for critical errors
    // 4. Aggregate and analyze error patterns

    return NextResponse.json({ 
      success: true, 
      errorId: errorReport.errorId 
    });

  } catch (error) {
    console.error('Error analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to process error report' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = parseInt(searchParams.get('timeframe') || '86400000'); // 24 hours default
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const now = Date.now();
    const filteredErrors = errorReports
      .filter(error => (now - error.timestamp) <= timeframe)
      .slice(-limit)
      .reverse(); // Most recent first

    // Calculate error statistics
    const stats = {
      totalErrors: filteredErrors.length,
      errorsByDevice: {
        mobile: filteredErrors.filter(e => e.deviceType === 'mobile').length,
        desktop: filteredErrors.filter(e => e.deviceType === 'desktop').length,
      },
      topErrors: {} as Record<string, number>,
      errorTrends: [] as Array<{
        hour: string;
        count: number;
      }>,
    };

    // Count error types
    filteredErrors.forEach(error => {
      const errorKey = error.message.substring(0, 100); // Truncate for grouping
      stats.topErrors[errorKey] = (stats.topErrors[errorKey] || 0) + 1;
    });

    // Generate hourly error trends
    const hourlyBuckets: Record<string, number> = {};
    const hoursBack = 24;
    
    for (let i = 0; i < hoursBack; i++) {
      const hourStart = now - (i * 60 * 60 * 1000);
      const hourKey = new Date(hourStart).toISOString().substring(0, 13); // YYYY-MM-DDTHH
      hourlyBuckets[hourKey] = 0;
    }
    
    filteredErrors.forEach(error => {
      const errorHour = new Date(error.timestamp).toISOString().substring(0, 13);
      if (hourlyBuckets.hasOwnProperty(errorHour)) {
        hourlyBuckets[errorHour]++;
      }
    });
    
    stats.errorTrends = Object.entries(hourlyBuckets)
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => a.hour.localeCompare(b.hour));

    return NextResponse.json({
      stats,
      errors: filteredErrors.map(error => ({
        errorId: error.errorId,
        message: error.message,
        url: error.url,
        deviceType: error.deviceType,
        timestamp: error.timestamp,
        // Don't include sensitive data like stack traces or user agents in the response
      })),
    });

  } catch (error) {
    console.error('Error stats API error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve error statistics' },
      { status: 500 }
    );
  }
}