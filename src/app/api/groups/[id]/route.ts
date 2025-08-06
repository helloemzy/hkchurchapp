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
    const groupId = params.id

    const { data: group, error } = await supabase
      .from('small_groups')
      .select(`
        *,
        leader:profiles!small_groups_leader_id_fkey(
          id,
          full_name,
          avatar_url,
          email
        ),
        memberships:group_memberships(
          id,
          user_id,
          role,
          status,
          joined_at,
          user:profiles!group_memberships_user_id_fkey(
            id,
            full_name,
            avatar_url
          )
        ),
        activities:group_activities(
          id,
          activity_type,
          title,
          title_zh,
          description,
          description_zh,
          scheduled_for,
          created_at,
          created_by,
          creator:profiles!group_activities_created_by_fkey(
            id,
            full_name,
            avatar_url
          )
        )
      `)
      .eq('id', groupId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Group not found' }, { status: 404 })
      }
      console.error('Group fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch group', details: error.message },
        { status: 500 }
      )
    }

    // Check if group is public or user has access
    if (!group.is_public) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return NextResponse.json({ error: 'Group not found' }, { status: 404 })
      }

      // Check if user is a member or has admin role
      const isMember = group.memberships?.some(m => m.user_id === user.id && m.status === 'active')
      
      if (!isMember) {
        const { data: userRole } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single()

        const adminRoles = ['pastor', 'admin', 'super_admin']
        if (!userRole || !adminRoles.includes(userRole.role)) {
          return NextResponse.json({ error: 'Group not found' }, { status: 404 })
        }
      }
    }

    // Process memberships and activities
    const activeMembers = group.memberships?.filter(m => m.status === 'active') || []
    const pendingMembers = group.memberships?.filter(m => m.status === 'pending') || []
    const recentActivities = group.activities?.slice(0, 10) || []

    const processedGroup = {
      ...group,
      active_members_count: activeMembers.length,
      pending_members_count: pendingMembers.length,
      is_full: group.max_members ? activeMembers.length >= group.max_members : false,
      spots_remaining: group.max_members ? Math.max(0, group.max_members - activeMembers.length) : null,
      recent_activities: recentActivities
    }

    return NextResponse.json(processedGroup)

  } catch (error) {
    console.error('Unexpected error in group GET:', error)
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
    const updateData = await request.json()

    // Check if user can update this group
    const { data: existingGroup } = await supabase
      .from('small_groups')
      .select('leader_id, co_leaders')
      .eq('id', groupId)
      .single()

    if (!existingGroup) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    // Check permissions
    const isLeader = existingGroup.leader_id === user.id
    const isCoLeader = existingGroup.co_leaders?.includes(user.id)

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

    // Remove fields that shouldn't be updated directly
    const { id, created_at, current_members, leader_id, ...allowedUpdates } = updateData

    const { data: group, error } = await supabase
      .from('small_groups')
      .update({
        ...allowedUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', groupId)
      .select(`
        *,
        leader:profiles!small_groups_leader_id_fkey(
          id,
          full_name,
          avatar_url
        )
      `)
      .single()

    if (error) {
      console.error('Group update error:', error)
      return NextResponse.json(
        { error: 'Failed to update group', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(group)

  } catch (error) {
    console.error('Unexpected error in group PUT:', error)
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

    // Check if user can delete this group
    const { data: existingGroup } = await supabase
      .from('small_groups')
      .select('leader_id, current_members')
      .eq('id', groupId)
      .single()

    if (!existingGroup) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 })
    }

    // Check permissions (only leader or admin can delete)
    const canDelete = existingGroup.leader_id === user.id

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

    // Delete group (memberships and activities will be deleted via cascade)
    const { error } = await supabase
      .from('small_groups')
      .delete()
      .eq('id', groupId)

    if (error) {
      console.error('Group deletion error:', error)
      return NextResponse.json(
        { error: 'Failed to delete group', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Group deleted successfully' })

  } catch (error) {
    console.error('Unexpected error in group DELETE:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}