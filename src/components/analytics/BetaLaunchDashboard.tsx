'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { 
  Users, 
  TrendingUp, 
  Heart, 
  BookOpen, 
  MessageCircle, 
  Clock,
  Globe,
  Smartphone,
  Target,
  Calendar
} from 'lucide-react';

interface BetaMetrics {
  // User Engagement Metrics
  totalUsers: number;
  activeUsersToday: number;
  activeUsersWeek: number;
  averageSessionDuration: number;
  
  // Spiritual Impact Metrics
  devotionsCompleted: number;
  prayerRequestsShared: number;
  prayerResponsesGiven: number;
  bibleChaptersRead: number;
  bookmarksCreated: number;
  
  // Cultural & Language Metrics
  languagePreference: {
    'zh-HK': number;
    'en': number;
  };
  
  // Technical Performance
  pwaInstallRate: number;
  offlineUsage: number;
  coreWebVitals: {
    lcp: number;
    fid: number;
    cls: number;
  };
  
  // Community Health
  communityInteractionRate: number;
  moderationRequired: number;
  userSatisfactionScore: number;
  
  // Beta Phase Progress
  phaseMetrics: {
    phase1: { invited: number; activated: number; retention: number };
    phase2: { invited: number; activated: number; retention: number };
    phase3: { invited: number; activated: number; retention: number };
  };
  
  // Daily Progress Tracking
  dailyMetrics: Array<{
    date: string;
    newUsers: number;
    activeUsers: number;
    devotionsCompleted: number;
    prayersShared: number;
  }>;
}

interface BetaLaunchDashboardProps {
  className?: string;
  refreshInterval?: number; // in milliseconds
}

export default function BetaLaunchDashboard({ 
  className = '', 
  refreshInterval = 300000 // 5 minutes
}: BetaLaunchDashboardProps) {
  const [metrics, setMetrics] = useState<BetaMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d'>('7d');

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/analytics/beta-dashboard?timeRange=${selectedTimeRange}`);
        if (response.ok) {
          const data = await response.json();
          setMetrics(data);
          setLastUpdated(new Date());
        }
      } catch (error) {
        console.error('Failed to fetch beta metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, refreshInterval);
    return () => clearInterval(interval);
  }, [selectedTimeRange, refreshInterval]);

  if (loading || !metrics) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const calculateSuccessRate = (metric: number, target: number) => {
    return Math.min(100, (metric / target) * 100);
  };

  const getSuccessColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Time Range Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Beta Launch Dashboard
          </h1>
          <p className="text-sm text-gray-600">
            Last updated: {lastUpdated.toLocaleString('zh-HK')}
          </p>
        </div>
        
        <div className="flex gap-2">
          {(['24h', '7d', '30d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setSelectedTimeRange(range)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                selectedTimeRange === range
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range === '24h' ? '24小時' : range === '7d' ? '7天' : '30天'}
            </button>
          ))}
        </div>
      </div>

      {/* Beta Phase Progress Overview */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-purple-600" />
          Beta Phase Progress
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Phase 1: Church Leadership */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <h3 className="font-medium text-gray-900">Phase 1: Church Leadership</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Invited:</span>
                <span className="font-medium">{metrics.phaseMetrics.phase1.invited}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Activated:</span>
                <span className="font-medium text-green-600">
                  {metrics.phaseMetrics.phase1.activated}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Retention:</span>
                <span className="font-medium text-purple-600">
                  {metrics.phaseMetrics.phase1.retention}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${(metrics.phaseMetrics.phase1.activated / metrics.phaseMetrics.phase1.invited) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Phase 2: Core Community */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <h3 className="font-medium text-gray-900">Phase 2: Core Community</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Invited:</span>
                <span className="font-medium">{metrics.phaseMetrics.phase2.invited}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Activated:</span>
                <span className="font-medium text-green-600">
                  {metrics.phaseMetrics.phase2.activated}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Retention:</span>
                <span className="font-medium text-purple-600">
                  {metrics.phaseMetrics.phase2.retention}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${(metrics.phaseMetrics.phase2.activated / metrics.phaseMetrics.phase2.invited) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Phase 3: Broader Community */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <h3 className="font-medium text-gray-900">Phase 3: Broader Community</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Invited:</span>
                <span className="font-medium">{metrics.phaseMetrics.phase3.invited}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Activated:</span>
                <span className="font-medium text-green-600">
                  {metrics.phaseMetrics.phase3.activated}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Retention:</span>
                <span className="font-medium text-purple-600">
                  {metrics.phaseMetrics.phase3.retention}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${(metrics.phaseMetrics.phase3.activated / metrics.phaseMetrics.phase3.invited) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Users */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalUsers}</p>
            </div>
          </div>
        </Card>

        {/* Daily Active Users */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Daily Active</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.activeUsersToday}</p>
              <p className={`text-xs ${getSuccessColor(calculateSuccessRate(metrics.activeUsersToday, metrics.totalUsers * 0.6))}`}>
                {calculateSuccessRate(metrics.activeUsersToday, metrics.totalUsers * 0.6).toFixed(0)}% of target
              </p>
            </div>
          </div>
        </Card>

        {/* Session Duration */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg. Session</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(metrics.averageSessionDuration / 60)}m
              </p>
            </div>
          </div>
        </Card>

        {/* PWA Install Rate */}
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Smartphone className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">PWA Installs</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.pwaInstallRate}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Spiritual Impact Metrics */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Heart className="h-5 w-5 text-purple-600" />
          Spiritual Impact Metrics
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="p-3 bg-purple-100 rounded-lg inline-flex mb-2">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{metrics.devotionsCompleted}</p>
            <p className="text-sm text-gray-600">Devotions Completed</p>
          </div>
          
          <div className="text-center">
            <div className="p-3 bg-blue-100 rounded-lg inline-flex mb-2">
              <MessageCircle className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{metrics.prayerRequestsShared}</p>
            <p className="text-sm text-gray-600">Prayer Requests</p>
          </div>
          
          <div className="text-center">
            <div className="p-3 bg-green-100 rounded-lg inline-flex mb-2">
              <Heart className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{metrics.prayerResponsesGiven}</p>
            <p className="text-sm text-gray-600">Prayer Responses</p>
          </div>
          
          <div className="text-center">
            <div className="p-3 bg-yellow-100 rounded-lg inline-flex mb-2">
              <BookOpen className="h-6 w-6 text-yellow-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{metrics.bibleChaptersRead}</p>
            <p className="text-sm text-gray-600">Bible Chapters Read</p>
          </div>
        </div>
      </Card>

      {/* Cultural & Language Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Language Preference */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5 text-purple-600" />
            Language Preferences
          </h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Traditional Chinese (繁體中文)</span>
                <span className="text-sm font-bold text-gray-900">
                  {((metrics.languagePreference['zh-HK'] / metrics.totalUsers) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-purple-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(metrics.languagePreference['zh-HK'] / metrics.totalUsers) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">English</span>
                <span className="text-sm font-bold text-gray-900">
                  {((metrics.languagePreference['en'] / metrics.totalUsers) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(metrics.languagePreference['en'] / metrics.totalUsers) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </Card>

        {/* Community Health */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-600" />
            Community Health
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Community Interaction Rate</span>
              <span className={`font-bold ${getSuccessColor(metrics.communityInteractionRate)}`}>
                {metrics.communityInteractionRate}%
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">User Satisfaction Score</span>
              <span className={`font-bold ${getSuccessColor(metrics.userSatisfactionScore)}`}>
                {metrics.userSatisfactionScore}/5.0
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Moderation Required</span>
              <span className={`font-bold ${metrics.moderationRequired < 5 ? 'text-green-600' : 'text-yellow-600'}`}>
                {metrics.moderationRequired}%
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Offline Usage</span>
              <span className="font-bold text-blue-600">
                {metrics.offlineUsage}%
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Core Web Vitals */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Technical Performance - Core Web Vitals</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Largest Contentful Paint</p>
            <p className={`text-3xl font-bold ${metrics.coreWebVitals.lcp <= 2.5 ? 'text-green-600' : 'text-yellow-600'}`}>
              {metrics.coreWebVitals.lcp.toFixed(1)}s
            </p>
            <p className="text-xs text-gray-500">Target: ≤ 2.5s</p>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">First Input Delay</p>
            <p className={`text-3xl font-bold ${metrics.coreWebVitals.fid <= 100 ? 'text-green-600' : 'text-yellow-600'}`}>
              {metrics.coreWebVitals.fid.toFixed(0)}ms
            </p>
            <p className="text-xs text-gray-500">Target: ≤ 100ms</p>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Cumulative Layout Shift</p>
            <p className={`text-3xl font-bold ${metrics.coreWebVitals.cls <= 0.1 ? 'text-green-600' : 'text-yellow-600'}`}>
              {metrics.coreWebVitals.cls.toFixed(3)}
            </p>
            <p className="text-xs text-gray-500">Target: ≤ 0.1</p>
          </div>
        </div>
      </Card>

      {/* Success Targets Summary */}
      <Card className="p-6 bg-primary-50">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-purple-600" />
          Beta Success Targets Summary
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Daily Active Rate</p>
            <p className={`text-xl font-bold ${getSuccessColor(calculateSuccessRate(metrics.activeUsersToday, metrics.totalUsers * 0.6))}`}>
              {calculateSuccessRate(metrics.activeUsersToday, metrics.totalUsers * 0.6).toFixed(0)}%
            </p>
            <p className="text-xs text-gray-500">Target: 60%</p>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Community Engagement</p>
            <p className={`text-xl font-bold ${getSuccessColor(metrics.communityInteractionRate)}`}>
              {metrics.communityInteractionRate}%
            </p>
            <p className="text-xs text-gray-500">Target: 50%</p>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">PWA Installation</p>
            <p className={`text-xl font-bold ${getSuccessColor(metrics.pwaInstallRate)}`}>
              {metrics.pwaInstallRate}%
            </p>
            <p className="text-xs text-gray-500">Target: 75%</p>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">User Satisfaction</p>
            <p className={`text-xl font-bold ${getSuccessColor(metrics.userSatisfactionScore * 20)}`}>
              {metrics.userSatisfactionScore.toFixed(1)}/5.0
            </p>
            <p className="text-xs text-gray-500">Target: 4.5+</p>
          </div>
        </div>
      </Card>
    </div>
  );
}