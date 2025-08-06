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

    const groupId = params.id
    const { notes } = await request.json()

    // Get group details
    const { data: group, error: groupError } = await supabase
      .from('small_groups')
      .select('*')
      .eq('id', groupId)
      .single()

    if (groupError) {
      if (groupError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Group not found' }, { status: 404 })
      }
      console.error('Group fetch error:', groupError)
      return NextResponse.json(
        { error: 'Failed to fetch group', details: groupError.message },
        { status: 500 }
      )
    }

    // Validation checks
    if (!group.is_open_to_join) {
      return NextResponse.json({ error: 'Group is not open to new members' }, { status: 400 })
    }

    // Check if user is already a member
    const { data: existingMembership } = await supabase
      .from('group_memberships')
      .select('id, status')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single()

    if (existingMembership && existingMembership.status !== 'removed') {
      const statusMessage = existingMembership.status === 'pending' 
        ? 'Join request already submitted and pending approval'
        : 'Already a member of this group'
      
      return NextResponse.json({ 
        error: statusMessage,
        membership: existingMembership
      }, { status: 400 })
    }

    // Get current active member count
    const { data: activeMembers } = await supabase
      .from('group_memberships')
      .select('id')
      .eq('group_id', groupId)
      .eq('status', 'active')

    const currentCount = activeMembers?.length || 0

    // Check capacity
    if (group.max_members && currentCount >= group.max_members) {
      return NextResponse.json({ error: 'Group is at capacity' }, { status: 400 })
    }

    // Determine membership status
    let membershipStatus: 'active' | 'pending' = group.requires_approval ? 'pending' : 'active'
    let approvedBy: string | null = null
    let approvedAt: string | null = null

    if (!group.requires_approval) {
      approvedBy = group.leader_id // Auto-approved by leader
      approvedAt = new Date().toISOString()
    }

    // Create membership
    const membershipData = {
      group_id: groupId,
      user_id: user.id,
      role: 'member' as const,
      status: membershipStatus,
      joined_at: new Date().toISOString(),
      approved_by: approvedBy,
      approved_at: approvedAt,
      notes: notes || null
    }

    const { data: membership, error: membershipError } = await supabase
      .from('group_memberships')
      .insert(membershipData)
      .select(`
        *,
        group:small_groups!group_memberships_group_id_fkey(
          id,
          name,
          name_zh,
          category,
          leader_id
        ),
        user:profiles!group_memberships_user_id_fkey(
          id,
          full_name,
          email
        )
      `)
      .single()

    if (membershipError) {
      console.error('Membership creation error:', membershipError)
      return NextResponse.json(
        { error: 'Failed to join group', details: membershipError.message },
        { status: 500 }
      )
    }

    // Update group member count if approved immediately
    if (membershipStatus === 'active') {
      const { error: updateError } = await supabase
        .from('small_groups')
        .update({ 
          current_members: currentCount + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', groupId)

      if (updateError) {
        console.error('Group update error:', updateError)
        // Don't fail the join, just log the error
      }

      // Create welcome activity
      await supabase
        .from('group_activities')
        .insert({
          group_id: groupId,
          activity_type: 'announcement',
          title: 'New Member Joined',
          title_zh: '新成員加入',
          description: `${membership.user?.full_name} has joined the group`,
          description_zh: `${membership.user?.full_name} 已加入小組`,
          created_by: group.leader_id
        })
    }

    return NextResponse.json(membership, { status: 201 })

  } catch (error) {
    console.error('Unexpected error in group join:', error)
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

    const groupId = params.id

    // Get existing membership
    const { data: membership, error: membershipError } = await supabase
      .from('group_memberships')
      .select('*, group:small_groups!group_memberships_group_id_fkey(current_members)')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single()

    if (membershipError) {
      if (membershipError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Membership not found' }, { status: 404 })
      }
      console.error('Membership fetch error:', membershipError)
      return NextResponse.json(
        { error: 'Failed to fetch membership', details: membershipError.message },
        { status: 500 }
      )
    }

    if (membership.status === 'removed' || membership.status === 'inactive') {
      return NextResponse.json({ error: 'Membership already inactive' }, { status: 400 })
    }

    // Update membership status
    const { error: updateError } = await supabase
      .from('group_memberships')
      .update({ 
        status: 'inactive',
        updated_at: new Date().toISOString()
      })
      .eq('id', membership.id)

    if (updateError) {
      console.error('Membership update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to leave group', details: updateError.message },
        { status: 500 }
      )
    }

    // Update group member count if it was an active membership
    if (membership.status === 'active' && membership.group) {
      const newCount = Math.max(0, membership.group.current_members - 1)
      
      await supabase
        .from('small_groups')
        .update({ 
          current_members: newCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', groupId)
    }

    return NextResponse.json({ message: 'Left group successfully' })

  } catch (error) {
    console.error('Unexpected error in group leave:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}