import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Database } from '../../../../lib/supabase/database.types';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'en';
    
    // Get today's date in Hong Kong timezone
    const today = new Date().toLocaleDateString('en-CA', { 
      timeZone: 'Asia/Hong_Kong' 
    });

    const { data: devotion, error } = await supabase
      .from('devotions')
      .select('*')
      .eq('date', today)
      .eq('is_published', true)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching today\'s devotion:', error);
      return NextResponse.json({ error: 'Failed to fetch devotion' }, { status: 500 });
    }

    if (!devotion) {
      // If no devotion for today, get the most recent published devotion
      const { data: latestDevotion, error: latestError } = await supabase
        .from('devotions')
        .select('*')
        .eq('is_published', true)
        .order('date', { ascending: false })
        .limit(1)
        .single();

      if (latestError) {
        return NextResponse.json({ error: 'No devotions available' }, { status: 404 });
      }

      const transformedDevotion = {
        ...latestDevotion,
        title: lang === 'zh' && latestDevotion.title_zh ? latestDevotion.title_zh : latestDevotion.title,
        content: lang === 'zh' && latestDevotion.content_zh ? latestDevotion.content_zh : latestDevotion.content,
        scripture_text: lang === 'zh' && latestDevotion.scripture_text_zh ? latestDevotion.scripture_text_zh : latestDevotion.scripture_text,
        reflection_questions: lang === 'zh' && latestDevotion.reflection_questions_zh ? latestDevotion.reflection_questions_zh : latestDevotion.reflection_questions,
      };

      return NextResponse.json({ devotion: transformedDevotion });
    }

    // Transform devotion based on language preference
    const transformedDevotion = {
      ...devotion,
      title: lang === 'zh' && devotion.title_zh ? devotion.title_zh : devotion.title,
      content: lang === 'zh' && devotion.content_zh ? devotion.content_zh : devotion.content,
      scripture_text: lang === 'zh' && devotion.scripture_text_zh ? devotion.scripture_text_zh : devotion.scripture_text,
      reflection_questions: lang === 'zh' && devotion.reflection_questions_zh ? devotion.reflection_questions_zh : devotion.reflection_questions,
    };

    return NextResponse.json({ devotion: transformedDevotion });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}