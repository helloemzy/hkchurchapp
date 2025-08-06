import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Database } from '../../../../lib/supabase/database.types';
import { inputValidation } from '../../../../lib/security/input-validation';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const devotionId = searchParams.get('devotion_id');
    
    if (devotionId) {
      // Get progress for specific devotion
      const { data: progress, error } = await supabase
        .from('user_devotion_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('devotion_id', devotionId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching devotion progress:', error);
        return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
      }

      return NextResponse.json({ progress });
    }

    // Get all user progress
    const { data: progressList, error } = await supabase
      .from('user_devotion_progress')
      .select(`
        *,
        devotions (
          id,
          title,
          title_zh,
          date,
          scripture_reference
        )
      `)
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false });

    if (error) {
      console.error('Error fetching user progress:', error);
      return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
    }

    return NextResponse.json({ progress: progressList });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    if (!body.devotion_id) {
      return NextResponse.json({ error: 'Missing devotion_id' }, { status: 400 });
    }

    const progressData = {
      user_id: user.id,
      devotion_id: inputValidation.sanitizeInput(body.devotion_id),
      completed_at: new Date().toISOString(),
      reflection_notes: body.reflection_notes ? inputValidation.sanitizeInput(body.reflection_notes, 1000) : null,
      shared: Boolean(body.shared),
      bookmarked: Boolean(body.bookmarked),
    };

    // Use upsert to handle duplicate entries
    const { data: progress, error } = await supabase
      .from('user_devotion_progress')
      .upsert(progressData, {
        onConflict: 'user_id,devotion_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving devotion progress:', error);
      return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 });
    }

    // Update reading streak
    await updateReadingStreak(supabase, user.id);

    return NextResponse.json({ progress }, { status: 201 });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function updateReadingStreak(supabase: any, userId: string) {
  try {
    // Get current streak data
    const { data: streak, error: streakError } = await supabase
      .from('reading_streaks')
      .select('*')
      .eq('user_id', userId)
      .single();

    const today = new Date().toLocaleDateString('en-CA', { 
      timeZone: 'Asia/Hong_Kong' 
    });

    if (streakError && streakError.code === 'PGRST116') {
      // Create new streak record
      await supabase
        .from('reading_streaks')
        .insert({
          user_id: userId,
          current_streak: 1,
          longest_streak: 1,
          last_read_date: today,
          total_devotions_read: 1,
          achievements: []
        });
    } else if (streak) {
      const lastReadDate = new Date(streak.last_read_date);
      const todayDate = new Date(today);
      const dayDiff = Math.floor((todayDate.getTime() - lastReadDate.getTime()) / (1000 * 60 * 60 * 24));

      let newCurrentStreak = streak.current_streak;
      
      if (dayDiff === 1) {
        // Consecutive day
        newCurrentStreak = streak.current_streak + 1;
      } else if (dayDiff > 1) {
        // Streak broken
        newCurrentStreak = 1;
      }
      // If dayDiff === 0, same day, no change to streak

      const newLongestStreak = Math.max(streak.longest_streak, newCurrentStreak);

      await supabase
        .from('reading_streaks')
        .update({
          current_streak: newCurrentStreak,
          longest_streak: newLongestStreak,
          last_read_date: today,
          total_devotions_read: streak.total_devotions_read + (dayDiff === 0 ? 0 : 1),
        })
        .eq('user_id', userId);
    }
  } catch (error) {
    console.error('Error updating reading streak:', error);
    // Don't throw error as this is secondary functionality
  }
}