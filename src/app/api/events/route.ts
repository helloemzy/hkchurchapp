import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/database.types'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { searchParams } = new URL(request.url)
    
    // Get query parameters
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const upcoming = searchParams.get('upcoming')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const search = searchParams.get('search')

    let query = supabase
      .from('events')
      .select(`
        *,
        organizer:profiles!events_organizer_id_fkey(
          id,
          full_name,
          avatar_url
        ),
        registrations:event_registrations(count)
      `)
      .eq('is_public', true)
      .eq('is_cancelled', false)
      .order('start_datetime', { ascending: true })

    // Apply filters
    if (category) {
      query = query.eq('category', category)
    }

    if (featured === 'true') {
      query = query.eq('is_featured', true)
    }

    if (upcoming === 'true') {
      const now = new Date().toISOString()
      query = query.gte('start_datetime', now)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,title_zh.ilike.%${search}%,description_zh.ilike.%${search}%`)
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: events, error } = await query

    if (error) {
      console.error('Events fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch events', details: error.message },
        { status: 500 }
      )
    }

    // Process events to include computed fields
    const processedEvents = events?.map(event => ({
      ...event,
      is_full: event.max_capacity ? event.current_registrations >= event.max_capacity : false,
      spots_remaining: event.max_capacity ? Math.max(0, event.max_capacity - event.current_registrations) : null,
      registration_open: event.requires_registration ? 
        (event.registration_deadline ? new Date(event.registration_deadline) > new Date() : true) : false
    }))

    return NextResponse.json({
      events: processedEvents,
      total: events?.length || 0,
      offset,
      limit
    })

  } catch (error) {
    console.error('Unexpected error in events GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to create events (pastor, admin, or super_admin)
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    const allowedRoles = ['pastor', 'admin', 'super_admin']
    if (!userRole || !allowedRoles.includes(userRole.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const eventData = await request.json()

    // Validate required fields
    const requiredFields = ['title', 'description', 'category', 'start_datetime', 'end_datetime']
    for (const field of requiredFields) {
      if (!eventData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Set defaults and process data
    const processedData = {
      ...eventData,
      organizer_id: user.id,
      timezone: eventData.timezone || 'Asia/Hong_Kong',
      cost_currency: eventData.cost_currency || 'HKD',
      current_registrations: 0,
      is_public: eventData.is_public ?? true,
      is_featured: eventData.is_featured ?? false,
      is_cancelled: false,
      requires_registration: eventData.requires_registration ?? true
    }

    const { data: event, error } = await supabase
      .from('events')
      .insert(processedData)
      .select(`
        *,
        organizer:profiles!events_organizer_id_fkey(
          id,
          full_name,
          avatar_url
        )
      `)
      .single()

    if (error) {
      console.error('Event creation error:', error)
      return NextResponse.json(
        { error: 'Failed to create event', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(event, { status: 201 })

  } catch (error) {
    console.error('Unexpected error in events POST:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}