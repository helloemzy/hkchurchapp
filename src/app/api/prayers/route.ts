import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Database } from '../../../lib/supabase/database.types';
import { inputValidation } from '../../../lib/security/input-validation';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isPublic = searchParams.get('public') === 'true';
    const myRequests = searchParams.get('my_requests') === 'true';
    const limit = inputValidation.sanitizeNumber(searchParams.get('limit'), 20);
    const offset = inputValidation.sanitizeNumber(searchParams.get('offset'), 0);

    let query = supabase
      .from('prayer_requests')
      .select(`
        *,
        profiles (
          full_name,
          avatar_url
        ),
        prayer_interactions (
          id,
          user_id,
          action
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (myRequests) {
      query = query.eq('user_id', user.id);
    } else if (isPublic) {
      query = query.eq('is_public', true);
    }

    if (category) {
      query = query.eq('category', category);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: prayers, error } = await query;

    if (error) {
      console.error('Error fetching prayer requests:', error);
      return NextResponse.json({ error: 'Failed to fetch prayer requests' }, { status: 500 });
    }

    // Add user interaction status to each prayer
    const prayersWithInteractions = prayers?.map(prayer => ({
      ...prayer,
      user_has_prayed: prayer.prayer_interactions?.some((i: any) => i.user_id === user.id),
      total_prayers: prayer.prayer_count || 0,
    }));

    return NextResponse.json({ 
      prayers: prayersWithInteractions,
      pagination: {
        limit,
        offset,
        total: prayers?.length || 0
      }
    });

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
    
    // Validate required fields
    if (!body.title || !body.description) {
      return NextResponse.json({ error: 'Missing required fields: title and description' }, { status: 400 });
    }

    // Sanitize inputs
    const prayerData = {
      user_id: user.id,
      title: inputValidation.sanitizeInput(body.title, 200),
      description: inputValidation.sanitizeInput(body.description, 2000),
      category: inputValidation.sanitizeInput(body.category) as Database['public']['Tables']['prayer_requests']['Insert']['category'] || 'personal',
      is_public: Boolean(body.is_public),
      is_answered: false,
      prayer_count: 0,
    };

    const { data: prayer, error } = await supabase
      .from('prayer_requests')
      .insert(prayerData)
      .select(`
        *,
        profiles (
          full_name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error('Error creating prayer request:', error);
      return NextResponse.json({ error: 'Failed to create prayer request' }, { status: 500 });
    }

    return NextResponse.json({ prayer }, { status: 201 });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}