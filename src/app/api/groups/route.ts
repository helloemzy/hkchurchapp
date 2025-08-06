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
    const openToJoin = searchParams.get('open_to_join')
    const language = searchParams.get('language')
    const genderPreference = searchParams.get('gender_preference')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const search = searchParams.get('search')

    let query = supabase
      .from('small_groups')
      .select(`
        *,
        leader:profiles!small_groups_leader_id_fkey(
          id,
          full_name,
          avatar_url
        ),
        memberships:group_memberships(
          id,
          user_id,
          role,
          status,
          user:profiles!group_memberships_user_id_fkey(
            id,
            full_name,
            avatar_url
          )
        )
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })

    // Apply filters
    if (category) {
      query = query.eq('category', category)
    }

    if (openToJoin === 'true') {
      query = query.eq('is_open_to_join', true)
    }

    if (language) {
      query = query.eq('language_primary', language)
    }

    if (genderPreference) {
      query = query.eq('gender_preference', genderPreference)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,name_zh.ilike.%${search}%,description_zh.ilike.%${search}%`)
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: groups, error } = await query

    if (error) {
      console.error('Groups fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch groups', details: error.message },
        { status: 500 }
      )
    }

    // Process groups to include computed fields
    const processedGroups = groups?.map(group => {
      const activeMembers = group.memberships?.filter(m => m.status === 'active') || []
      return {
        ...group,
        active_members: activeMembers.length,
        is_full: group.max_members ? activeMembers.length >= group.max_members : false,
        spots_remaining: group.max_members ? Math.max(0, group.max_members - activeMembers.length) : null
      }
    })

    return NextResponse.json({
      groups: processedGroups,
      total: groups?.length || 0,
      offset,
      limit
    })

  } catch (error) {
    console.error('Unexpected error in groups GET:', error)
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

    // Check if user has permission to create groups (group_leader, pastor, admin, or super_admin)
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    const allowedRoles = ['group_leader', 'pastor', 'admin', 'super_admin']
    if (!userRole || !allowedRoles.includes(userRole.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const groupData = await request.json()

    // Validate required fields
    const requiredFields = ['name', 'description', 'category']
    for (const field of requiredFields) {
      if (!groupData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Set defaults and process data
    const processedData = {
      ...groupData,
      leader_id: user.id,
      current_members: 1, // Leader is automatically a member
      co_leaders: groupData.co_leaders || [],
      is_open_to_join: groupData.is_open_to_join ?? true,
      requires_approval: groupData.requires_approval ?? true,
      is_public: groupData.is_public ?? true,
      language_primary: groupData.language_primary || 'zh-HK',
      gender_preference: groupData.gender_preference || 'mixed',
      contact_method: groupData.contact_method || 'app_only'
    }

    const { data: group, error } = await supabase
      .from('small_groups')
      .insert(processedData)
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
      console.error('Group creation error:', error)
      return NextResponse.json(
        { error: 'Failed to create group', details: error.message },
        { status: 500 }
      )
    }

    // Create leader membership
    const { error: membershipError } = await supabase
      .from('group_memberships')
      .insert({
        group_id: group.id,
        user_id: user.id,
        role: 'leader',
        status: 'active',
        joined_at: new Date().toISOString(),
        approved_by: user.id,
        approved_at: new Date().toISOString()
      })

    if (membershipError) {
      console.error('Leader membership creation error:', membershipError)
      // Don't fail the group creation, but log the error
    }

    return NextResponse.json(group, { status: 201 })

  } catch (error) {
    console.error('Unexpected error in groups POST:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}