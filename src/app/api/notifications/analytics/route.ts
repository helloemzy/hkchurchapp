import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { 
      action, 
      notificationId, 
      notificationType, 
      userId,
      metadata = {} 
    } = await request.json();

    if (!action || !notificationType) {
      return NextResponse.json(
        { error: 'Action and notification type are required' },
        { status: 400 }
      );
    }

    // Store notification engagement data
    const { data, error } = await supabase
      .from('notification_analytics')
      .insert({
        user_id: userId || 'anonymous',
        notification_id: notificationId,
        notification_type: notificationType,
        action: action, // 'sent', 'click', 'close', 'dismiss'
        metadata: metadata,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error storing notification analytics:', error);
      return NextResponse.json(
        { error: 'Failed to store analytics data' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notification analytics recorded successfully'
    });

  } catch (error) {
    console.error('Error in notification analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const period = url.searchParams.get('period') || '7d'; // 7d, 30d, 90d
    const notificationType = url.searchParams.get('type');

    let startDate = new Date();
    switch (period) {
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    let query = supabase
      .from('notification_analytics')
      .select('*')
      .gte('created_at', startDate.toISOString());

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (notificationType) {
      query = query.eq('notification_type', notificationType);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching analytics:', error);
      return NextResponse.json(
        { error: 'Failed to fetch analytics data' },
        { status: 500 }
      );
    }

    // Process analytics data
    const analytics = processAnalyticsData(data || []);

    return NextResponse.json({
      success: true,
      period,
      analytics
    });

  } catch (error) {
    console.error('Error fetching notification analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function processAnalyticsData(data: any[]) {
  const summary = {
    totalSent: 0,
    totalClicks: 0,
    totalDismissals: 0,
    clickThroughRate: 0,
    engagementRate: 0,
    byType: {},
    byDay: {},
    topActions: {}
  };

  const typeStats = {};
  const dailyStats = {};
  const actionCounts = {};

  data.forEach(record => {
    const date = new Date(record.created_at).toDateString();
    const type = record.notification_type;
    const action = record.action;

    // Overall stats
    if (action === 'sent') summary.totalSent++;
    if (action === 'click') summary.totalClicks++;
    if (action === 'close' || action === 'dismiss') summary.totalDismissals++;

    // By type
    if (!typeStats[type]) {
      typeStats[type] = { sent: 0, clicks: 0, dismissals: 0 };
    }
    if (action === 'sent') typeStats[type].sent++;
    if (action === 'click') typeStats[type].clicks++;
    if (action === 'close' || action === 'dismiss') typeStats[type].dismissals++;

    // By day
    if (!dailyStats[date]) {
      dailyStats[date] = { sent: 0, clicks: 0, dismissals: 0 };
    }
    if (action === 'sent') dailyStats[date].sent++;
    if (action === 'click') dailyStats[date].clicks++;
    if (action === 'close' || action === 'dismiss') dailyStats[date].dismissals++;

    // Action counts
    actionCounts[action] = (actionCounts[action] || 0) + 1;
  });

  // Calculate rates
  summary.clickThroughRate = summary.totalSent > 0 ? 
    (summary.totalClicks / summary.totalSent) * 100 : 0;
  
  summary.engagementRate = summary.totalSent > 0 ? 
    ((summary.totalClicks + summary.totalDismissals) / summary.totalSent) * 100 : 0;

  // Process type stats
  Object.keys(typeStats).forEach(type => {
    const stats = typeStats[type];
    summary.byType[type] = {
      ...stats,
      clickThroughRate: stats.sent > 0 ? (stats.clicks / stats.sent) * 100 : 0,
      engagementRate: stats.sent > 0 ? 
        ((stats.clicks + stats.dismissals) / stats.sent) * 100 : 0
    };
  });

  summary.byDay = dailyStats;
  summary.topActions = actionCounts;

  return summary;
}