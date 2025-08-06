import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId') || 'anonymous';

    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching preferences:', error);
      return NextResponse.json(
        { error: 'Failed to fetch preferences' },
        { status: 500 }
      );
    }

    // Return default preferences if none exist
    const defaultPreferences = {
      user_id: userId,
      enabled: true,
      devotions: {
        enabled: true,
        time: '08:00',
        language: 'en'
      },
      events: {
        enabled: true,
        reminders: ['24h', '1h'],
        language: 'en'
      },
      prayers: {
        enabled: true,
        urgentOnly: false,
        language: 'en'
      },
      community: {
        enabled: true,
        groupMessages: true,
        achievements: true,
        weeklyCheckins: true,
        language: 'en'
      },
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '07:00'
      },
      batchNotifications: true,
      maxPerDay: 8
    };

    return NextResponse.json({
      success: true,
      preferences: data || defaultPreferences
    });

  } catch (error) {
    console.error('Error in preferences GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const preferences = await request.json();

    if (!preferences.user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('notification_preferences')
      .upsert({
        ...preferences,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Error storing preferences:', error);
      return NextResponse.json(
        { error: 'Failed to store preferences' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notification preferences updated successfully',
      preferences: data
    });

  } catch (error) {
    console.error('Error in preferences POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}