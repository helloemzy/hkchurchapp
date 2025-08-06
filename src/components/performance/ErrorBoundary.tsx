'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
}

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
}

class ErrorBoundary extends Component<Props, State> {
  private crashReportTimeout?: NodeJS.Timeout;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Generate unique error ID
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
    
    // Report error with performance context
    this.reportError(error, errorInfo);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 React Error Boundary');
      console.error('Error:', error);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }
  }

  private getDeviceType(): 'mobile' | 'desktop' {
    if (typeof window === 'undefined') return 'desktop';
    return window.innerWidth <= 768 ? 'mobile' : 'desktop';
  }

  private async reportError(error: Error, errorInfo: ErrorInfo) {
    try {
      // Get current performance metrics
      const performanceData = this.getPerformanceContext();
      
      const report: ErrorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: Date.now(),
        url: typeof window !== 'undefined' ? window.location.href : 'unknown',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        errorId: this.state.errorId || 'unknown',
        deviceType: this.getDeviceType(),
      };

      // Send to Vercel Analytics
      if (typeof window !== 'undefined' && window.va) {
        window.va('track', 'Error Boundary', {
          error: error.message,
          errorId: report.errorId,
          deviceType: report.deviceType,
          url: report.url,
        });
      }

      // Send detailed report to our API
      if (process.env.NODE_ENV === 'production') {
        await fetch('/api/analytics/errors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...report,
            performanceData,
          }),
        });
      }

      console.error('Error reported with ID:', report.errorId);

    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }

  private getPerformanceContext() {
    if (typeof window === 'undefined' || !window.performance) {
      return null;
    }

    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const memory = (performance as any).memory;

      return {
        // Navigation timing
        loadTime: navigation?.loadEventEnd - navigation?.navigationStart || 0,
        domContentLoaded: navigation?.domContentLoadedEventEnd - navigation?.navigationStart || 0,
        
        // Memory usage (if available)
        memoryUsed: memory?.usedJSHeapSize || 0,
        memoryLimit: memory?.jsHeapSizeLimit || 0,
        
        // Current timestamp
        timestamp: Date.now(),
      };
    } catch (error) {
      console.warn('Could not collect performance context:', error);
      return null;
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: undefined,
    });
  };

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  private copyErrorDetails = () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;

    const errorDetails = [
      `Error ID: ${this.state.errorId}`,
      `Message: ${this.state.error?.message}`,
      `Stack: ${this.state.error?.stack}`,
      `Component Stack: ${this.state.errorInfo?.componentStack}`,
      `URL: ${window.location.href}`,
      `Timestamp: ${new Date().toISOString()}`,
      `User Agent: ${navigator.userAgent}`,
    ].join('\n\n');

    navigator.clipboard.writeText(errorDetails).then(() => {
      console.log('Error details copied to clipboard');
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <Card className="w-full max-w-md p-6">
            <div className="text-center">
              <div className="text-6xl mb-4">😔</div>
              
              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                Something went wrong
              </h1>
              
              <p className="text-gray-600 mb-6">
                We're sorry, but something unexpected happened. The error has been reported automatically.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6 text-left">
                  <h3 className="text-sm font-medium text-red-800 mb-2">
                    Error Details (Development)
                  </h3>
                  <p className="text-sm text-red-700 font-mono break-all">
                    {this.state.error.message}
                  </p>
                  {this.state.errorId && (
                    <p className="text-xs text-red-600 mt-2">
                      Error ID: {this.state.errorId}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-3">
                <Button
                  onClick={this.handleRetry}
                  className="w-full"
                  variant="default"
                >
                  Try Again
                </Button>
                
                <Button
                  onClick={this.handleReload}
                  className="w-full"
                  variant="outline"
                >
                  Reload Page
                </Button>

                {process.env.NODE_ENV === 'development' && (
                  <Button
                    onClick={this.copyErrorDetails}
                    className="w-full"
                    variant="outline"
                    size="sm"
                  >
                    Copy Error Details
                  </Button>
                )}
              </div>

              <p className="text-xs text-gray-500 mt-6">
                If this problem continues, please contact support with error ID: {this.state.errorId}
              </p>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;