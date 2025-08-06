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
    const book = searchParams.get('book');
    const chapter = searchParams.get('chapter');
    const limit = inputValidation.sanitizeNumber(searchParams.get('limit'), 50);
    const offset = inputValidation.sanitizeNumber(searchParams.get('offset'), 0);

    let query = supabase
      .from('bible_bookmarks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Apply filters
    if (book) {
      query = query.eq('book', inputValidation.sanitizeInput(book));
    }

    if (chapter) {
      query = query.eq('chapter', inputValidation.sanitizeNumber(chapter));
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: bookmarks, error } = await query;

    if (error) {
      console.error('Error fetching bookmarks:', error);
      return NextResponse.json({ error: 'Failed to fetch bookmarks' }, { status: 500 });
    }

    return NextResponse.json({ 
      bookmarks,
      pagination: {
        limit,
        offset,
        total: bookmarks?.length || 0
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
    const requiredFields = ['book', 'chapter', 'verse', 'verse_text'];
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Sanitize inputs
    const bookmarkData = {
      user_id: user.id,
      book: inputValidation.sanitizeInput(body.book),
      chapter: inputValidation.sanitizeNumber(body.chapter),
      verse: inputValidation.sanitizeNumber(body.verse),
      verse_text: inputValidation.sanitizeInput(body.verse_text, 1000),
      verse_text_zh: body.verse_text_zh ? inputValidation.sanitizeInput(body.verse_text_zh, 1000) : null,
      notes: body.notes ? inputValidation.sanitizeInput(body.notes, 2000) : null,
      color: inputValidation.sanitizeInput(body.color) || '#7C3AED',
    };

    // Use upsert to handle duplicate bookmarks
    const { data: bookmark, error } = await supabase
      .from('bible_bookmarks')
      .upsert(bookmarkData, {
        onConflict: 'user_id,book,chapter,verse'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating bookmark:', error);
      return NextResponse.json({ error: 'Failed to create bookmark' }, { status: 500 });
    }

    return NextResponse.json({ bookmark }, { status: 201 });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const bookmarkId = searchParams.get('id');

    if (!bookmarkId) {
      return NextResponse.json({ error: 'Missing bookmark ID' }, { status: 400 });
    }

    const { error } = await supabase
      .from('bible_bookmarks')
      .delete()
      .eq('id', bookmarkId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting bookmark:', error);
      return NextResponse.json({ error: 'Failed to delete bookmark' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Bookmark deleted successfully' });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}