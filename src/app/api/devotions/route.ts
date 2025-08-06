import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Database } from '../../../lib/supabase/database.types';
import { inputValidation } from '../../../lib/security/input-validation';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { searchParams } = new URL(request.url);
    
    // Get query parameters
    const date = searchParams.get('date');
    const limit = inputValidation.sanitizeNumber(searchParams.get('limit'), 10);
    const offset = inputValidation.sanitizeNumber(searchParams.get('offset'), 0);
    const featured = searchParams.get('featured') === 'true';
    const lang = searchParams.get('lang') || 'en';

    let query = supabase
      .from('devotions')
      .select('*')
      .eq('is_published', true)
      .order('date', { ascending: false });

    // Apply filters
    if (date) {
      const sanitizedDate = inputValidation.sanitizeInput(date);
      query = query.eq('date', sanitizedDate);
    }

    if (featured) {
      query = query.eq('featured', true);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: devotions, error } = await query;

    if (error) {
      console.error('Error fetching devotions:', error);
      return NextResponse.json({ error: 'Failed to fetch devotions' }, { status: 500 });
    }

    // Transform data based on language preference
    const transformedDevotions = devotions?.map(devotion => ({
      ...devotion,
      title: lang === 'zh' && devotion.title_zh ? devotion.title_zh : devotion.title,
      content: lang === 'zh' && devotion.content_zh ? devotion.content_zh : devotion.content,
      scripture_text: lang === 'zh' && devotion.scripture_text_zh ? devotion.scripture_text_zh : devotion.scripture_text,
      reflection_questions: lang === 'zh' && devotion.reflection_questions_zh ? devotion.reflection_questions_zh : devotion.reflection_questions,
    }));

    return NextResponse.json({ 
      devotions: transformedDevotions,
      pagination: {
        limit,
        offset,
        total: devotions?.length || 0
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

    // Check if user has admin role
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!userRole || !['admin', 'super_admin', 'pastor'].includes(userRole.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'content', 'scripture_reference', 'scripture_text', 'date', 'author'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Sanitize inputs
    const devotionData = {
      title: inputValidation.sanitizeInput(body.title),
      title_zh: body.title_zh ? inputValidation.sanitizeInput(body.title_zh) : null,
      content: inputValidation.sanitizeInput(body.content, 5000),
      content_zh: body.content_zh ? inputValidation.sanitizeInput(body.content_zh, 5000) : null,
      scripture_reference: inputValidation.sanitizeInput(body.scripture_reference),
      scripture_text: inputValidation.sanitizeInput(body.scripture_text, 1000),
      scripture_text_zh: body.scripture_text_zh ? inputValidation.sanitizeInput(body.scripture_text_zh, 1000) : null,
      date: inputValidation.sanitizeInput(body.date),
      author: inputValidation.sanitizeInput(body.author),
      reflection_questions: Array.isArray(body.reflection_questions) ? body.reflection_questions.map((q: string) => inputValidation.sanitizeInput(q)) : [],
      reflection_questions_zh: body.reflection_questions_zh ? body.reflection_questions_zh.map((q: string) => inputValidation.sanitizeInput(q)) : null,
      tags: Array.isArray(body.tags) ? body.tags.map((t: string) => inputValidation.sanitizeInput(t)) : [],
      is_published: Boolean(body.is_published),
      featured: Boolean(body.featured),
      image_url: body.image_url ? inputValidation.sanitizeInput(body.image_url) : null,
    };

    const { data: devotion, error } = await supabase
      .from('devotions')
      .insert(devotionData)
      .select()
      .single();

    if (error) {
      console.error('Error creating devotion:', error);
      return NextResponse.json({ error: 'Failed to create devotion' }, { status: 500 });
    }

    return NextResponse.json({ devotion }, { status: 201 });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}