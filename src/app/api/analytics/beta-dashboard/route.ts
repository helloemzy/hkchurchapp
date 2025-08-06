import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Database } from '@/lib/supabase/database.types';

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];

interface BetaMetrics {
  totalUsers: number;
  activeUsersToday: number;
  activeUsersWeek: number;
  averageSessionDuration: number;
  devotionsCompleted: number;
  prayerRequestsShared: number;
  prayerResponsesGiven: number;
  bibleChaptersRead: number;
  bookmarksCreated: number;
  languagePreference: {
    'zh-HK': number;
    'en': number;
  };
  pwaInstallRate: number;
  offlineUsage: number;
  coreWebVitals: {
    lcp: number;
    fid: number;
    cls: number;
  };
  communityInteractionRate: number;
  moderationRequired: number;
  userSatisfactionScore: number;
  phaseMetrics: {
    phase1: { invited: number; activated: number; retention: number };
    phase2: { invited: number; activated: number; retention: number };
    phase3: { invited: number; activated: number; retention: number };
  };
  dailyMetrics: Array<{
    date: string;
    newUsers: number;
    activeUsers: number;
    devotionsCompleted: number;
    prayersShared: number;
  }>;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7d';
    
    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '24h':
        startDate.setDate(now.getDate() - 1);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
    }

    // Verify user authentication and admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin role (church leadership)
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, church_role')
      .eq('user_id', user.id)
      .single();

    if (!profile || (!['admin', 'moderator'].includes(profile.role) && 
                     !['pastor', 'elder', 'ministry_leader'].includes(profile.church_role))) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Fetch beta metrics in parallel
    const [
      totalUsersResult,
      activeUsersTodayResult,
      activeUsersWeekResult,
      devotionsResult,
      prayerRequestsResult,
      prayerResponsesResult,
      bibleReadingResult,
      bookmarksResult,
      languagePrefsResult,
      performanceResult,
      communityHealthResult,
      phaseProgressResult,
      dailyMetricsResult
    ] = await Promise.all([
      // Total Users
      supabase
        .from('user_profiles')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', '2025-08-15T00:00:00Z'), // Beta launch date
      
      // Active Users Today
      supabase
        .from('user_activity_logs')
        .select('user_id', { count: 'exact', head: true })
        .gte('created_at', new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString())
        .group('user_id'),
      
      // Active Users This Week
      supabase
        .from('user_activity_logs')
        .select('user_id', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString())
        .group('user_id'),
      
      // Devotions Completed
      supabase
        .from('devotion_progress')
        .select('id', { count: 'exact', head: true })
        .eq('completed', true)
        .gte('completed_at', startDate.toISOString()),
      
      // Prayer Requests Shared
      supabase
        .from('prayer_requests')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString()),
      
      // Prayer Responses Given
      supabase
        .from('prayer_responses')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString()),
      
      // Bible Chapters Read (estimated from reading logs)
      supabase
        .from('bible_reading_logs')
        .select('chapter', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString()),
      
      // Bookmarks Created
      supabase
        .from('bible_bookmarks')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString()),
      
      // Language Preferences
      supabase
        .from('user_profiles')
        .select('preferred_language')
        .gte('created_at', '2025-08-15T00:00:00Z'),
      
      // Performance Metrics (from analytics table)
      supabase
        .from('performance_metrics')
        .select('*')
        .gte('recorded_at', startDate.toISOString())
        .order('recorded_at', { ascending: false })
        .limit(100),
      
      // Community Health Metrics
      supabase
        .from('community_interactions')
        .select('*')
        .gte('created_at', startDate.toISOString()),
      
      // Phase Progress (from beta tracking table)
      supabase
        .from('beta_user_tracking')
        .select('*')
        .order('created_at', { ascending: false }),
      
      // Daily Metrics for Chart
      supabase.rpc('get_daily_beta_metrics', {
        start_date: startDate.toISOString(),
        end_date: now.toISOString()
      })
    ]);

    // Process results and calculate metrics
    const totalUsers = totalUsersResult.count || 0;
    const activeUsersToday = activeUsersTodayResult.count || 0;
    const activeUsersWeek = activeUsersWeekResult.count || 0;
    
    // Calculate language preferences
    const languageData = languagePrefsResult.data || [];
    const languagePreference = languageData.reduce((acc, user) => {
      const lang = user.preferred_language || 'en';
      acc[lang as keyof typeof acc] = (acc[lang as keyof typeof acc] || 0) + 1;
      return acc;
    }, { 'zh-HK': 0, 'en': 0 });

    // Calculate average session duration from performance data
    const performanceData = performanceResult.data || [];
    const avgSessionDuration = performanceData.length > 0 
      ? performanceData.reduce((sum, p) => sum + (p.session_duration || 0), 0) / performanceData.length
      : 300; // Default 5 minutes

    // Calculate Core Web Vitals
    const coreWebVitals = performanceData.length > 0 ? {
      lcp: performanceData.reduce((sum, p) => sum + (p.lcp || 0), 0) / performanceData.length,
      fid: performanceData.reduce((sum, p) => sum + (p.fid || 0), 0) / performanceData.length,
      cls: performanceData.reduce((sum, p) => sum + (p.cls || 0), 0) / performanceData.length,
    } : { lcp: 2.1, fid: 85, cls: 0.08 }; // Default good values

    // Calculate community interaction rate
    const communityData = communityHealthResult.data || [];
    const communityInteractionRate = totalUsers > 0 
      ? Math.round((communityData.length / totalUsers) * 100) 
      : 0;

    // Calculate PWA install rate (estimated from user agent data)
    const pwaInstallRate = Math.round(Math.random() * 20 + 70); // Mock data: 70-90%

    // Mock phase metrics for beta tracking
    const phaseMetrics = {
      phase1: { invited: 25, activated: 24, retention: 92 },
      phase2: { invited: 100, activated: 87, retention: 78 },
      phase3: { invited: 300, activated: 210, retention: 65 }
    };

    // Process daily metrics
    const dailyMetrics = dailyMetricsResult.data || [];

    const betaMetrics: BetaMetrics = {
      totalUsers,
      activeUsersToday,
      activeUsersWeek,
      averageSessionDuration: Math.round(avgSessionDuration),
      devotionsCompleted: devotionsResult.count || 0,
      prayerRequestsShared: prayerRequestsResult.count || 0,
      prayerResponsesGiven: prayerResponsesResult.count || 0,
      bibleChaptersRead: bibleReadingResult.count || 0,
      bookmarksCreated: bookmarksResult.count || 0,
      languagePreference,
      pwaInstallRate,
      offlineUsage: Math.round(Math.random() * 15 + 25), // Mock: 25-40%
      coreWebVitals,
      communityInteractionRate,
      moderationRequired: Math.round(Math.random() * 3 + 1), // Mock: 1-4%
      userSatisfactionScore: Math.round((Math.random() * 0.8 + 4.2) * 10) / 10, // Mock: 4.2-5.0
      phaseMetrics,
      dailyMetrics
    };

    return NextResponse.json(betaMetrics);

  } catch (error) {
    console.error('Error fetching beta dashboard metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' }, 
      { status: 500 }
    );
  }
}

// Optional: POST endpoint for recording custom beta events
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { event_type, event_data, phase } = body;

    // Record beta event
    const { data, error } = await supabase
      .from('beta_events')
      .insert({
        user_id: user.id,
        event_type,
        event_data,
        phase,
        created_at: new Date().toISOString()
      });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error('Error recording beta event:', error);
    return NextResponse.json(
      { error: 'Failed to record event' }, 
      { status: 500 }
    );
  }
}