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
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const groupId = params.id
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'active'

    // Check if user has access to view members
    const { data: group } = await supabase
      .from('small_groups')
      .select('leader_id, co_leaders, is_public')
      .eq('id', groupId)
      .single()

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    // Check if user is a member or leader
    const { data: userMembership } = await supabase
      .from('group_memberships')
      .select('role, status')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single()

    const isLeader = group.leader_id === user.id
    const isCoLeader = group.co_leaders?.includes(user.id)
    const isMember = userMembership?.status === 'active'

    // Check permissions
    if (!isLeader && !isCoLeader && !isMember) {
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

    // Fetch members
    const { data: members, error } = await supabase
      .from('group_memberships')
      .select(`
        *,
        user:profiles!group_memberships_user_id_fkey(
          id,
          full_name,
          avatar_url,
          email
        )
      `)
      .eq('group_id', groupId)
      .eq('status', status)
      .order('joined_at', { ascending: true })

    if (error) {
      console.error('Members fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch members', details: error.message },
        { status: 500 }
      )
    }

    // Filter sensitive information based on permissions
    const processedMembers = members?.map(member => {
      const canViewDetails = isLeader || isCoLeader || member.user_id === user.id

      return {
        ...member,
        user: {
          ...member.user,
          email: canViewDetails ? member.user?.email : undefined
        }
      }
    })

    return NextResponse.json(processedMembers)

  } catch (error) {
    console.error('Unexpected error in members GET:', error)
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

    const groupId = params.id
    const { memberId, action, role, notes } = await request.json()

    // Get group details
    const { data: group } = await supabase
      .from('small_groups')
      .select('leader_id, co_leaders, current_members, max_members')
      .eq('id', groupId)
      .single()

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    // Check permissions (only leader, co-leader, or admin can manage members)
    const isLeader = group.leader_id === user.id
    const isCoLeader = group.co_leaders?.includes(user.id)

    if (!isLeader && !isCoLeader) {
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

    // Get the membership to be updated
    const { data: membership } = await supabase
      .from('group_memberships')
      .select('*')
      .eq('group_id', groupId)
      .eq('user_id', memberId)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Membership not found' }, { status: 404 })
    }

    let updateData: any = {
      updated_at: new Date().toISOString()
    }

    // Handle different actions
    switch (action) {
      case 'approve':
        if (membership.status !== 'pending') {
          return NextResponse.json({ error: 'Can only approve pending memberships' }, { status: 400 })
        }
        
        // Check capacity
        if (group.max_members && group.current_members >= group.max_members) {
          return NextResponse.json({ error: 'Group is at capacity' }, { status: 400 })
        }

        updateData = {
          ...updateData,
          status: 'active',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          notes: notes || null
        }

        // Update group member count
        await supabase
          .from('small_groups')
          .update({ 
            current_members: group.current_members + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', groupId)

        break

      case 'reject':
        if (membership.status !== 'pending') {
          return NextResponse.json({ error: 'Can only reject pending memberships' }, { status: 400 })
        }
        
        updateData = {
          ...updateData,
          status: 'removed',
          notes: notes || 'Membership request rejected'
        }
        break

      case 'remove':
        if (membership.status !== 'active') {
          return NextResponse.json({ error: 'Can only remove active memberships' }, { status: 400 })
        }

        updateData = {
          ...updateData,
          status: 'removed',
          notes: notes || 'Removed from group'
        }

        // Update group member count
        await supabase
          .from('small_groups')
          .update({ 
            current_members: Math.max(0, group.current_members - 1),
            updated_at: new Date().toISOString()
          })
          .eq('id', groupId)

        break

      case 'change_role':
        if (!['member', 'co_leader'].includes(role)) {
          return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
        }

        // Only leader can change roles (co-leaders cannot promote to co-leader)
        if (!isLeader) {
          return NextResponse.json({ error: 'Only group leader can change member roles' }, { status: 403 })
        }

        updateData = {
          ...updateData,
          role: role,
          notes: notes || `Role changed to ${role}`
        }

        // Update group co_leaders array if needed
        if (role === 'co_leader') {
          const newCoLeaders = [...(group.co_leaders || []), memberId]
          await supabase
            .from('small_groups')
            .update({ 
              co_leaders: newCoLeaders,
              updated_at: new Date().toISOString()
            })
            .eq('id', groupId)
        } else if (membership.role === 'co_leader') {
          const newCoLeaders = (group.co_leaders || []).filter(id => id !== memberId)
          await supabase
            .from('small_groups')
            .update({ 
              co_leaders: newCoLeaders,
              updated_at: new Date().toISOString()
            })
            .eq('id', groupId)
        }

        break

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    // Update membership
    const { data: updatedMembership, error } = await supabase
      .from('group_memberships')
      .update(updateData)
      .eq('id', membership.id)
      .select(`
        *,
        user:profiles!group_memberships_user_id_fkey(
          id,
          full_name,
          avatar_url,
          email
        )
      `)
      .single()

    if (error) {
      console.error('Membership update error:', error)
      return NextResponse.json(
        { error: 'Failed to update membership', details: error.message },
        { status: 500 }
      )
    }

    // Create activity log
    await supabase
      .from('group_activities')
      .insert({
        group_id: groupId,
        activity_type: 'announcement',
        title: `Member ${action}`,
        title_zh: `成員${action === 'approve' ? '批准' : action === 'remove' ? '移除' : '更新'}`,
        description: `${updatedMembership.user?.full_name} was ${action}d`,
        created_by: user.id
      })

    return NextResponse.json(updatedMembership)

  } catch (error) {
    console.error('Unexpected error in members PUT:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}