import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Database } from '../../../../lib/supabase/database.types';
import { inputValidation } from '../../../../lib/security/input-validation';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { searchParams } = new URL(request.url);
    
    // Get query parameters
    const book = searchParams.get('book');
    const chapter = inputValidation.sanitizeNumber(searchParams.get('chapter'));
    const verse = inputValidation.sanitizeNumber(searchParams.get('verse'));
    const lang = searchParams.get('lang') || 'en';
    const search = searchParams.get('search');
    const limit = inputValidation.sanitizeNumber(searchParams.get('limit'), 50);
    const offset = inputValidation.sanitizeNumber(searchParams.get('offset'), 0);

    // Search functionality
    if (search) {
      const { data: searchResults, error: searchError } = await supabase
        .rpc('search_bible_verses', {
          search_query: inputValidation.sanitizeInput(search),
          lang: lang,
          book_filter: book ? inputValidation.sanitizeInput(book) : null,
          limit_results: limit
        });

      if (searchError) {
        console.error('Error searching Bible verses:', searchError);
        return NextResponse.json({ error: 'Search failed' }, { status: 500 });
      }

      return NextResponse.json({ 
        verses: searchResults || [],
        pagination: {
          limit,
          offset: 0,
          total: searchResults?.length || 0
        }
      });
    }

    // Specific verse lookup
    if (book && chapter && verse) {
      const { data: verseData, error } = await supabase
        .from('bible_verses')
        .select('*')
        .eq('book_name', inputValidation.sanitizeInput(book))
        .eq('chapter', chapter)
        .eq('verse', verse)
        .single();

      if (error) {
        return NextResponse.json({ error: 'Verse not found' }, { status: 404 });
      }

      const transformedVerse = {
        ...verseData,
        text: lang === 'zh' ? verseData.text_zh : verseData.text_en,
        reference: `${verseData.book_name} ${verseData.chapter}:${verseData.verse}`
      };

      return NextResponse.json({ verse: transformedVerse });
    }

    // Chapter lookup
    if (book && chapter) {
      let query = supabase
        .from('bible_verses')
        .select('*')
        .eq('book_name', inputValidation.sanitizeInput(book))
        .eq('chapter', chapter)
        .order('verse', { ascending: true });

      const { data: verses, error } = await query;

      if (error) {
        console.error('Error fetching chapter verses:', error);
        return NextResponse.json({ error: 'Failed to fetch verses' }, { status: 500 });
      }

      // Transform verses based on language preference
      const transformedVerses = verses?.map(verse => ({
        ...verse,
        text: lang === 'zh' ? verse.text_zh : verse.text_en,
        reference: `${verse.book_name} ${verse.chapter}:${verse.verse}`
      }));

      return NextResponse.json({ 
        verses: transformedVerses || [],
        book: book,
        chapter: chapter,
        total_verses: verses?.length || 0
      });
    }

    // Book info lookup
    if (book) {
      const { data: bookInfo, error: bookError } = await supabase
        .from('bible_books')
        .select('*')
        .eq('name', inputValidation.sanitizeInput(book))
        .single();

      if (bookError) {
        return NextResponse.json({ error: 'Book not found' }, { status: 404 });
      }

      return NextResponse.json({ 
        book: {
          ...bookInfo,
          name: lang === 'zh' ? bookInfo.name_zh : bookInfo.name
        }
      });
    }

    // List all books
    const { data: books, error: booksError } = await supabase
      .from('bible_books')
      .select('*')
      .order('book_order', { ascending: true });

    if (booksError) {
      console.error('Error fetching books:', booksError);
      return NextResponse.json({ error: 'Failed to fetch books' }, { status: 500 });
    }

    // Transform books based on language preference
    const transformedBooks = books?.map(book => ({
      ...book,
      display_name: lang === 'zh' ? book.name_zh : book.name
    }));

    return NextResponse.json({ books: transformedBooks || [] });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}