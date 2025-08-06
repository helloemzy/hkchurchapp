import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Database } from '../../../../lib/supabase/database.types';
import { inputValidation } from '../../../../lib/security/input-validation';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { searchParams } = new URL(request.url);
    
    const reference = searchParams.get('ref');
    const lang = searchParams.get('lang') || 'en';

    if (!reference) {
      return NextResponse.json({ error: 'Reference parameter required' }, { status: 400 });
    }

    // Use the database function to parse and fetch the verse
    const { data: verseData, error } = await supabase
      .rpc('get_verse_by_reference', {
        reference_text: inputValidation.sanitizeInput(reference),
        lang: lang
      });

    if (error) {
      console.error('Error fetching verse by reference:', error);
      return NextResponse.json({ error: 'Failed to fetch verse' }, { status: 500 });
    }

    if (!verseData || verseData.length === 0) {
      return NextResponse.json({ error: 'Verse not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      verse: verseData[0],
      parsed_reference: reference
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}