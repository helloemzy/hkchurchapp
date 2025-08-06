'use client';

import { useEffect } from 'react';
import { initPerformanceMonitoring } from '../../lib/performance/web-vitals';

export default function PerformanceMonitor() {
  useEffect(() => {
    // Initialize performance monitoring when component mounts
    initPerformanceMonitoring();
  }, []);

  // This component doesn't render anything visible
  return null;
}