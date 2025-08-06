'use client';

import { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { getPerformanceSnapshot } from '../../lib/performance/web-vitals';

interface PerformanceStats {
  count: number;
  metrics: Record<string, {
    average: number;
    median: number;
    p95: number;
    good: number;
    needsImprovement: number;
    poor: number;
  }>;
}

interface PerformanceSnapshot {
  dns: number;
  connection: number;
  ttfb: number;
  domLoaded: number;
  windowLoaded: number;
  fcp: number;
  memory: {
    used: number;
    total: number;
    limit: number;
  } | null;
  timestamp: number;
  url: string;
  deviceType: 'mobile' | 'desktop';
  connectionType: string;
}

export default function PerformanceDashboard() {
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [snapshot, setSnapshot] = useState<PerformanceSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPerformanceData();
    
    // Get current page performance
    const currentSnapshot = getPerformanceSnapshot();
    if (currentSnapshot) {
      setSnapshot(currentSnapshot as PerformanceSnapshot);
    }
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchPerformanceData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPerformanceData = async () => {
    try {
      const response = await fetch('/api/analytics/performance');
      if (!response.ok) {
        throw new Error('Failed to fetch performance data');
      }
      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getRatingColor = (good: number, needsImprovement: number, poor: number) => {
    const total = good + needsImprovement + poor;
    if (total === 0) return 'text-gray-500';
    
    const goodPercentage = (good / total) * 100;
    if (goodPercentage >= 75) return 'text-green-600';
    if (goodPercentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">Failed to load performance data: {error}</p>
          <button
            onClick={fetchPerformanceData}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Performance Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Current Page Performance */}
      {snapshot && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Current Page Performance</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-4">
              <div className="text-sm font-medium text-gray-500">TTFB</div>
              <div className="text-2xl font-bold">{formatDuration(snapshot.ttfb)}</div>
              <div className="text-xs text-gray-400">Time to First Byte</div>
            </Card>
            
            <Card className="p-4">
              <div className="text-sm font-medium text-gray-500">FCP</div>
              <div className="text-2xl font-bold">{formatDuration(snapshot.fcp)}</div>
              <div className="text-xs text-gray-400">First Contentful Paint</div>
            </Card>
            
            <Card className="p-4">
              <div className="text-sm font-medium text-gray-500">DOM Loaded</div>
              <div className="text-2xl font-bold">{formatDuration(snapshot.domLoaded)}</div>
              <div className="text-xs text-gray-400">DOM Content Loaded</div>
            </Card>
            
            <Card className="p-4">
              <div className="text-sm font-medium text-gray-500">Page Loaded</div>
              <div className="text-2xl font-bold">{formatDuration(snapshot.windowLoaded)}</div>
              <div className="text-xs text-gray-400">Window Load Complete</div>
            </Card>
          </div>

          {snapshot.memory && (
            <div className="mt-4">
              <h3 className="text-md font-medium mb-2">Memory Usage</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="p-4">
                  <div className="text-sm font-medium text-gray-500">Used</div>
                  <div className="text-xl font-bold">{formatBytes(snapshot.memory.used)}</div>
                </Card>
                
                <Card className="p-4">
                  <div className="text-sm font-medium text-gray-500">Total</div>
                  <div className="text-xl font-bold">{formatBytes(snapshot.memory.total)}</div>
                </Card>
                
                <Card className="p-4">
                  <div className="text-sm font-medium text-gray-500">Limit</div>
                  <div className="text-xl font-bold">{formatBytes(snapshot.memory.limit)}</div>
                </Card>
              </div>
            </div>
          )}

          <div className="mt-4 text-sm text-gray-500 flex space-x-4">
            <span>Device: {snapshot.deviceType}</span>
            <span>Connection: {snapshot.connectionType}</span>
            <span>URL: {snapshot.url}</span>
          </div>
        </div>
      )}

      {/* Core Web Vitals Statistics */}
      {stats && Object.keys(stats.metrics).length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">
            Core Web Vitals Statistics ({stats.count} measurements)
          </h2>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(stats.metrics).map(([metricName, metric]) => (
              <Card key={metricName} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-gray-900">{metricName}</div>
                  <div className={`text-sm font-semibold ${getRatingColor(metric.good, metric.needsImprovement, metric.poor)}`}>
                    {metric.good + metric.needsImprovement + metric.poor > 0 
                      ? `${Math.round((metric.good / (metric.good + metric.needsImprovement + metric.poor)) * 100)}% good`
                      : 'No data'
                    }
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Average:</span>
                    <span className="font-medium">{formatDuration(metric.average)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Median:</span>
                    <span className="font-medium">{formatDuration(metric.median)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">95th percentile:</span>
                    <span className="font-medium">{formatDuration(metric.p95)}</span>
                  </div>
                </div>
                
                <div className="mt-3 flex space-x-2 text-xs">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                    Good: {metric.good}
                  </span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                    Needs work: {metric.needsImprovement}
                  </span>
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded">
                    Poor: {metric.poor}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {(!stats || Object.keys(stats.metrics).length === 0) && (
        <div className="text-center py-8">
          <p className="text-gray-500">
            No performance data available yet. Visit some pages to collect metrics.
          </p>
        </div>
      )}
    </div>
  );
}