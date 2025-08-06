import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import webpush from 'web-push';

// Configure web-push with VAPID keys if available
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:your-email@hongkongchurch.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: Record<string, any>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { 
      userId, 
      notificationType, 
      payload, 
      immediate = false,
      targetLanguage = 'en'
    } = await request.json();

    if (!payload || !payload.title || !payload.body) {
      return NextResponse.json(
        { error: 'Invalid notification payload' },
        { status: 400 }
      );
    }

    // Get user subscriptions
    let query = supabase
      .from('push_subscriptions')
      .select('*');

    if (userId && userId !== 'broadcast') {
      query = query.eq('user_id', userId);
    }

    const { data: subscriptions, error: subscriptionError } = await query;

    if (subscriptionError) {
      console.error('Error fetching subscriptions:', subscriptionError);
      return NextResponse.json(
        { error: 'Failed to fetch subscriptions' },
        { status: 500 }
      );
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active subscriptions found',
        sent: 0
      });
    }

    // Filter subscriptions based on user preferences
    const validSubscriptions = await filterSubscriptionsByPreferences(
      supabase,
      subscriptions,
      notificationType,
      targetLanguage
    );

    const results = [];
    let successCount = 0;
    let failCount = 0;

    // Send notifications
    for (const subscription of validSubscriptions) {
      try {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh_key,
            auth: subscription.auth_key
          }
        };

        // Localize payload based on user preferences
        const localizedPayload = localizeNotificationPayload(
          payload,
          subscription.preferences,
          targetLanguage
        );

        await webpush.sendNotification(
          pushSubscription,
          JSON.stringify(localizedPayload)
        );

        successCount++;
        results.push({
          endpoint: subscription.endpoint,
          status: 'success'
        });

        // Log notification for analytics
        await logNotification(supabase, {
          user_id: subscription.user_id,
          notification_type: notificationType,
          payload: localizedPayload,
          status: 'sent',
          sent_at: new Date().toISOString()
        });

      } catch (error) {
        console.error('Error sending to subscription:', error);
        failCount++;
        results.push({
          endpoint: subscription.endpoint,
          status: 'failed',
          error: error.message
        });

        // If subscription is invalid, remove it
        if (error.statusCode === 410 || error.statusCode === 404) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('endpoint', subscription.endpoint);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Notifications sent: ${successCount} successful, ${failCount} failed`,
      sent: successCount,
      failed: failCount,
      results: results
    });

  } catch (error) {
    console.error('Error sending notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function filterSubscriptionsByPreferences(
  supabase: any,
  subscriptions: any[],
  notificationType: string,
  targetLanguage: string
) {
  const validSubscriptions = [];

  for (const subscription of subscriptions) {
    // Get user preferences
    const { data: preferences } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', subscription.user_id)
      .single();

    if (!preferences || !preferences.enabled) {
      continue;
    }

    // Check if notification type is enabled
    const isEnabled = checkNotificationTypeEnabled(preferences, notificationType);
    if (!isEnabled) {
      continue;
    }

    // Check quiet hours (Hong Kong timezone)
    if (preferences.quiet_hours?.enabled && isInQuietHours(preferences.quiet_hours)) {
      continue;
    }

    validSubscriptions.push({
      ...subscription,
      preferences
    });
  }

  return validSubscriptions;
}

function checkNotificationTypeEnabled(preferences: any, notificationType: string): boolean {
  switch (notificationType) {
    case 'devotion':
      return preferences.devotions?.enabled || false;
    case 'prayer':
      return preferences.prayers?.enabled || false;
    case 'event':
      return preferences.events?.enabled || false;
    case 'community':
      return preferences.community?.enabled || false;
    case 'reminder':
      return true; // Reminders are always enabled if notifications are on
    default:
      return false;
  }
}

function isInQuietHours(quietHours: any): boolean {
  if (!quietHours.enabled) {
    return false;
  }

  const now = new Date();
  const hkTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Hong_Kong' }));
  const currentHour = hkTime.getHours();
  const currentMinute = hkTime.getMinutes();
  const currentTime = currentHour * 60 + currentMinute;

  const [startHour, startMinute] = quietHours.start.split(':').map(Number);
  const [endHour, endMinute] = quietHours.end.split(':').map(Number);
  const startTime = startHour * 60 + startMinute;
  const endTime = endHour * 60 + endMinute;

  if (startTime < endTime) {
    return currentTime >= startTime && currentTime <= endTime;
  } else {
    return currentTime >= startTime || currentTime <= endTime;
  }
}

function localizeNotificationPayload(
  payload: NotificationPayload,
  preferences: any,
  targetLanguage: string
): NotificationPayload {
  // Use user's preferred language or fallback to target language
  const userLanguage = preferences?.devotions?.language || 
                      preferences?.community?.language || 
                      targetLanguage || 'en';

  // For now, return the payload as-is
  // In a full implementation, you would localize the title and body
  return {
    ...payload,
    data: {
      ...payload.data,
      language: userLanguage
    }
  };
}

async function logNotification(supabase: any, logData: any) {
  try {
    await supabase
      .from('notification_logs')
      .insert(logData);
  } catch (error) {
    console.error('Error logging notification:', error);
  }
}