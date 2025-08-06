import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/supabase/database.types'

export async function POST(
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
    const { notes } = await request.json()

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (eventError) {
      if (eventError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 })
      }
      console.error('Event fetch error:', eventError)
      return NextResponse.json(
        { error: 'Failed to fetch event', details: eventError.message },
        { status: 500 }
      )
    }

    // Validation checks
    if (event.is_cancelled) {
      return NextResponse.json({ error: 'Event has been cancelled' }, { status: 400 })
    }

    if (!event.requires_registration) {
      return NextResponse.json({ error: 'Event does not require registration' }, { status: 400 })
    }

    if (event.registration_deadline && new Date(event.registration_deadline) < new Date()) {
      return NextResponse.json({ error: 'Registration deadline has passed' }, { status: 400 })
    }

    if (new Date(event.start_datetime) < new Date()) {
      return NextResponse.json({ error: 'Event has already started' }, { status: 400 })
    }

    // Check if user is already registered
    const { data: existingRegistration } = await supabase
      .from('event_registrations')
      .select('id, status')
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .single()

    if (existingRegistration && existingRegistration.status !== 'cancelled') {
      return NextResponse.json({ 
        error: 'Already registered for this event',
        registration: existingRegistration
      }, { status: 400 })
    }

    // Determine registration status
    let registrationStatus: 'registered' | 'waitlisted' = 'registered'
    
    if (event.max_capacity && event.current_registrations >= event.max_capacity) {
      registrationStatus = 'waitlisted'
    }

    // Create registration
    const registrationData = {
      event_id: eventId,
      user_id: user.id,
      status: registrationStatus,
      registered_at: new Date().toISOString(),
      notes: notes || null
    }

    const { data: registration, error: regError } = await supabase
      .from('event_registrations')
      .insert(registrationData)
      .select(`
        *,
        event:events!event_registrations_event_id_fkey(
          id,
          title,
          title_zh,
          start_datetime,
          location,
          location_zh
        ),
        user:profiles!event_registrations_user_id_fkey(
          id,
          full_name,
          email
        )
      `)
      .single()

    if (regError) {
      console.error('Registration creation error:', regError)
      return NextResponse.json(
        { error: 'Failed to register for event', details: regError.message },
        { status: 500 }
      )
    }

    // Update event registration count only if registered (not waitlisted)
    if (registrationStatus === 'registered') {
      const { error: updateError } = await supabase
        .from('events')
        .update({ 
          current_registrations: event.current_registrations + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', eventId)

      if (updateError) {
        console.error('Event update error:', updateError)
        // Don't fail the registration, just log the error
      }
    }

    return NextResponse.json(registration, { status: 201 })

  } catch (error) {
    console.error('Unexpected error in event registration:', error)
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

    // Get existing registration
    const { data: registration, error: regError } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .single()

    if (regError) {
      if (regError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Registration not found' }, { status: 404 })
      }
      console.error('Registration fetch error:', regError)
      return NextResponse.json(
        { error: 'Failed to fetch registration', details: regError.message },
        { status: 500 }
      )
    }

    if (registration.status === 'cancelled') {
      return NextResponse.json({ error: 'Registration already cancelled' }, { status: 400 })
    }

    // Get event details for capacity management
    const { data: event } = await supabase
      .from('events')
      .select('current_registrations, max_capacity')
      .eq('id', eventId)
      .single()

    // Cancel registration
    const { error: cancelError } = await supabase
      .from('event_registrations')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('id', registration.id)

    if (cancelError) {
      console.error('Registration cancellation error:', cancelError)
      return NextResponse.json(
        { error: 'Failed to cancel registration', details: cancelError.message },
        { status: 500 }
      )
    }

    // Update event registration count if it was an active registration
    if (registration.status === 'registered' && event) {
      const newCount = Math.max(0, event.current_registrations - 1)
      
      await supabase
        .from('events')
        .update({ 
          current_registrations: newCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', eventId)

      // Check if we can promote someone from waitlist
      if (event.max_capacity && newCount < event.max_capacity) {
        const { data: waitlistedRegistration } = await supabase
          .from('event_registrations')
          .select('id')
          .eq('event_id', eventId)
          .eq('status', 'waitlisted')
          .order('registered_at', { ascending: true })
          .limit(1)
          .single()

        if (waitlistedRegistration) {
          await supabase
            .from('event_registrations')
            .update({ 
              status: 'registered',
              updated_at: new Date().toISOString()
            })
            .eq('id', waitlistedRegistration.id)

          await supabase
            .from('events')
            .update({ 
              current_registrations: newCount + 1,
              updated_at: new Date().toISOString()
            })
            .eq('id', eventId)
        }
      }
    }

    return NextResponse.json({ message: 'Registration cancelled successfully' })

  } catch (error) {
    console.error('Unexpected error in registration cancellation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}