import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/database.types'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const eventId = params.id

    const { data: event, error } = await supabase
      .from('events')
      .select(`
        *,
        organizer:profiles!events_organizer_id_fkey(
          id,
          full_name,
          avatar_url,
          email
        ),
        registrations:event_registrations(
          id,
          user_id,
          status,
          registered_at,
          user:profiles!event_registrations_user_id_fkey(
            id,
            full_name,
            avatar_url
          )
        )
      `)
      .eq('id', eventId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 })
      }
      console.error('Event fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch event', details: error.message },
        { status: 500 }
      )
    }

    // Check if event is public or user has access
    if (!event.is_public) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 })
      }

      // Check if user is organizer or has admin role
      if (event.organizer_id !== user.id) {
        const { data: userRole } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single()

        const adminRoles = ['pastor', 'admin', 'super_admin']
        if (!userRole || !adminRoles.includes(userRole.role)) {
          return NextResponse.json({ error: 'Event not found' }, { status: 404 })
        }
      }
    }

    // Add computed fields
    const processedEvent = {
      ...event,
      is_full: event.max_capacity ? event.current_registrations >= event.max_capacity : false,
      spots_remaining: event.max_capacity ? Math.max(0, event.max_capacity - event.current_registrations) : null,
      registration_open: event.requires_registration ? 
        (event.registration_deadline ? new Date(event.registration_deadline) > new Date() : true) : false,
      is_past: new Date(event.end_datetime) < new Date()
    }

    return NextResponse.json(processedEvent)

  } catch (error) {
    console.error('Unexpected error in event GET:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const eventId = params.id
    const updateData = await request.json()

    // Check if user can update this event
    const { data: existingEvent } = await supabase
      .from('events')
      .select('organizer_id')
      .eq('id', eventId)
      .single()

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Check permissions
    const canUpdate = existingEvent.organizer_id === user.id

    if (!canUpdate) {
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()

      const adminRoles = ['pastor', 'admin', 'super_admin']
      if (!userRole || !adminRoles.includes(userRole.role)) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
    }

    // Remove fields that shouldn't be updated directly
    const { id, created_at, current_registrations, ...allowedUpdates } = updateData

    const { data: event, error } = await supabase
      .from('events')
      .update({
        ...allowedUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', eventId)
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
      console.error('Event update error:', error)
      return NextResponse.json(
        { error: 'Failed to update event', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(event)

  } catch (error) {
    console.error('Unexpected error in event PUT:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const eventId = params.id

    // Check if user can delete this event
    const { data: existingEvent } = await supabase
      .from('events')
      .select('organizer_id, current_registrations')
      .eq('id', eventId)
      .single()

    if (!existingEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Check permissions
    const canDelete = existingEvent.organizer_id === user.id

    if (!canDelete) {
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()

      const adminRoles = ['admin', 'super_admin']
      if (!userRole || !adminRoles.includes(userRole.role)) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
    }

    // If event has registrations, mark as cancelled instead of deleting
    if (existingEvent.current_registrations > 0) {
      const { error } = await supabase
        .from('events')
        .update({
          is_cancelled: true,
          cancellation_reason: 'Event cancelled by organizer',
          updated_at: new Date().toISOString()
        })
        .eq('id', eventId)

      if (error) {
        console.error('Event cancellation error:', error)
        return NextResponse.json(
          { error: 'Failed to cancel event', details: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json({ message: 'Event cancelled successfully' })
    }

    // Delete event (and registrations via cascade)
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)

    if (error) {
      console.error('Event deletion error:', error)
      return NextResponse.json(
        { error: 'Failed to delete event', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Event deleted successfully' })

  } catch (error) {
    console.error('Unexpected error in event DELETE:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}