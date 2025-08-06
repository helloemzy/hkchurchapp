import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Database } from '../../../../../lib/supabase/database.types';

interface RouteContext {
  params: { id: string };
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prayerRequestId = context.params.id;

    // Check if prayer request exists
    const { data: prayerRequest, error: requestError } = await supabase
      .from('prayer_requests')
      .select('id, user_id, is_public')
      .eq('id', prayerRequestId)
      .single();

    if (requestError || !prayerRequest) {
      return NextResponse.json({ error: 'Prayer request not found' }, { status: 404 });
    }

    // Check if user can access this prayer (public or own request)
    if (!prayerRequest.is_public && prayerRequest.user_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if user has already prayed for this request today
    const today = new Date().toLocaleDateString('en-CA', { 
      timeZone: 'Asia/Hong_Kong' 
    });
    
    const { data: existingInteraction } = await supabase
      .from('prayer_interactions')
      .select('id')
      .eq('prayer_request_id', prayerRequestId)
      .eq('user_id', user.id)
      .eq('action', 'prayed')
      .gte('created_at', `${today}T00:00:00.000Z`)
      .single();

    if (existingInteraction) {
      return NextResponse.json({ 
        message: 'You have already prayed for this request today',
        already_prayed: true 
      });
    }

    // Create prayer interaction
    const { data: interaction, error: interactionError } = await supabase
      .from('prayer_interactions')
      .insert({
        prayer_request_id: prayerRequestId,
        user_id: user.id,
        action: 'prayed'
      })
      .select()
      .single();

    if (interactionError) {
      console.error('Error creating prayer interaction:', interactionError);
      return NextResponse.json({ error: 'Failed to record prayer' }, { status: 500 });
    }

    // Increment prayer count
    const { error: updateError } = await supabase
      .from('prayer_requests')
      .update({ 
        prayer_count: supabase.sql`prayer_count + 1` 
      })
      .eq('id', prayerRequestId);

    if (updateError) {
      console.error('Error updating prayer count:', updateError);
      // Don't fail the request if count update fails
    }

    return NextResponse.json({ 
      interaction,
      message: 'Prayer recorded successfully' 
    }, { status: 201 });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}