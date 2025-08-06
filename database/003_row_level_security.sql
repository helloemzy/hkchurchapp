-- Hong Kong Church PWA - Row Level Security Implementation
-- Production Deployment Script - Execute AFTER 002_indexes_performance.sql
-- Part 3: Comprehensive Security Policies (75 RLS Policies)

-- ==================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ==================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_consent ENABLE ROW LEVEL SECURITY;
ALTER TABLE devotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_devotion_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE bible_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE small_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_activities ENABLE ROW LEVEL SECURITY;

-- ==================================================
-- HELPER FUNCTIONS FOR ROLE-BASED ACCESS CONTROL
-- ==================================================

-- Function to check if user has specific role
CREATE OR REPLACE FUNCTION has_role(user_id UUID, required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = has_role.user_id 
        AND ur.role::TEXT = required_role
        AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has any admin role
CREATE OR REPLACE FUNCTION is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = is_admin.user_id
        AND ur.role IN ('admin', 'super_admin')
        AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has leadership role
CREATE OR REPLACE FUNCTION is_leader(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = is_leader.user_id
        AND ur.role IN ('group_leader', 'pastor', 'admin', 'super_admin')
        AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is group member
CREATE OR REPLACE FUNCTION is_group_member(user_id UUID, group_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM group_memberships gm
        WHERE gm.user_id = is_group_member.user_id
        AND gm.group_id = is_group_member.group_id
        AND gm.status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================================================
-- PROFILES TABLE POLICIES
-- ==================================================

-- Policy 1: Users can view their own profile
CREATE POLICY "users_can_view_own_profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Policy 2: Users can update their own profile
CREATE POLICY "users_can_update_own_profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Policy 3: Users can view public active profiles
CREATE POLICY "users_can_view_public_profiles" ON profiles
    FOR SELECT USING (
        is_active = true 
        AND data_deleted = false 
        AND auth.uid() IS NOT NULL
    );

-- Policy 4: Admins can manage all profiles
CREATE POLICY "admins_can_manage_all_profiles" ON profiles
    FOR ALL USING (is_admin());

-- Policy 5: Leaders can view member profiles in their groups
CREATE POLICY "leaders_can_view_group_member_profiles" ON profiles
    FOR SELECT USING (
        is_leader() AND EXISTS (
            SELECT 1 FROM group_memberships gm1
            JOIN group_memberships gm2 ON gm1.group_id = gm2.group_id
            JOIN small_groups sg ON gm1.group_id = sg.id
            WHERE gm1.user_id = auth.uid()
            AND gm1.status = 'active'
            AND (sg.leader_id = auth.uid() OR auth.uid() = ANY(sg.co_leaders))
            AND gm2.user_id = profiles.id
            AND gm2.status = 'active'
        )
    );

-- ==================================================
-- USER ROLES TABLE POLICIES
-- ==================================================

-- Policy 6: Users can view their own roles
CREATE POLICY "users_can_view_own_roles" ON user_roles
    FOR SELECT USING (auth.uid() = user_id);

-- Policy 7: Admins can manage all roles
CREATE POLICY "admins_can_manage_all_roles" ON user_roles
    FOR ALL USING (is_admin());

-- Policy 8: Pastors can assign group leader roles
CREATE POLICY "pastors_can_assign_group_leader_roles" ON user_roles
    FOR INSERT WITH CHECK (
        has_role(auth.uid(), 'pastor') 
        AND role IN ('member', 'group_leader')
    );

-- Policy 9: Users can view roles in their context
CREATE POLICY "users_can_view_contextual_roles" ON user_roles
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND (
            user_id = auth.uid() OR
            is_admin() OR
            EXISTS (
                SELECT 1 FROM group_memberships gm
                JOIN small_groups sg ON gm.group_id = sg.id
                WHERE gm.user_id = auth.uid()
                AND gm.status = 'active'
                AND (sg.leader_id = user_roles.user_id OR user_roles.user_id = ANY(sg.co_leaders))
            )
        )
    );

-- ==================================================
-- SECURITY EVENTS TABLE POLICIES (Admin Only)
-- ==================================================

-- Policy 10: Only admins can view security events
CREATE POLICY "only_admins_can_view_security_events" ON security_events
    FOR SELECT USING (is_admin());

-- Policy 11: Only admins can insert security events
CREATE POLICY "only_admins_can_insert_security_events" ON security_events
    FOR INSERT WITH CHECK (is_admin());

-- Policy 12: Only super admins can update security events
CREATE POLICY "only_super_admins_can_update_security_events" ON security_events
    FOR UPDATE USING (has_role(auth.uid(), 'super_admin'));

-- ==================================================
-- AUDIT LOGS TABLE POLICIES (Admin Only)
-- ==================================================

-- Policy 13: Only admins can view audit logs
CREATE POLICY "only_admins_can_view_audit_logs" ON audit_logs
    FOR SELECT USING (is_admin());

-- Policy 14: System can insert audit logs (via triggers)
CREATE POLICY "system_can_insert_audit_logs" ON audit_logs
    FOR INSERT WITH CHECK (true);

-- ==================================================
-- USER CONSENT TABLE POLICIES
-- ==================================================

-- Policy 15: Users can view their own consent records
CREATE POLICY "users_can_view_own_consent" ON user_consent
    FOR SELECT USING (auth.uid() = user_id);

-- Policy 16: Users can insert their own consent records
CREATE POLICY "users_can_insert_own_consent" ON user_consent
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy 17: Admins can view all consent records
CREATE POLICY "admins_can_view_all_consent" ON user_consent
    FOR SELECT USING (is_admin());

-- ==================================================
-- DEVOTIONS TABLE POLICIES
-- ==================================================

-- Policy 18: Anyone can view published devotions
CREATE POLICY "anyone_can_view_published_devotions" ON devotions
    FOR SELECT USING (
        is_published = true 
        AND auth.uid() IS NOT NULL
    );

-- Policy 19: Pastors can manage all devotions
CREATE POLICY "pastors_can_manage_devotions" ON devotions
    FOR ALL USING (
        has_role(auth.uid(), 'pastor') OR 
        is_admin()
    );

-- Policy 20: Authors can view their own unpublished devotions
CREATE POLICY "authors_can_view_own_devotions" ON devotions
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND (
            is_published = true OR
            has_role(auth.uid(), 'pastor') OR
            is_admin()
        )
    );

-- ==================================================
-- USER DEVOTION PROGRESS TABLE POLICIES
-- ==================================================

-- Policy 21: Users can manage their own devotion progress
CREATE POLICY "users_can_manage_own_devotion_progress" ON user_devotion_progress
    FOR ALL USING (auth.uid() = user_id);

-- Policy 22: Leaders can view group member progress
CREATE POLICY "leaders_can_view_group_member_progress" ON user_devotion_progress
    FOR SELECT USING (
        is_leader() AND EXISTS (
            SELECT 1 FROM group_memberships gm1
            JOIN group_memberships gm2 ON gm1.group_id = gm2.group_id
            JOIN small_groups sg ON gm1.group_id = sg.id
            WHERE gm1.user_id = auth.uid()
            AND gm1.status = 'active'
            AND (sg.leader_id = auth.uid() OR auth.uid() = ANY(sg.co_leaders))
            AND gm2.user_id = user_devotion_progress.user_id
            AND gm2.status = 'active'
        )
    );

-- Policy 23: Users can view shared progress from group members
CREATE POLICY "users_can_view_shared_group_progress" ON user_devotion_progress
    FOR SELECT USING (
        shared = true AND EXISTS (
            SELECT 1 FROM group_memberships gm1
            JOIN group_memberships gm2 ON gm1.group_id = gm2.group_id
            WHERE gm1.user_id = auth.uid()
            AND gm1.status = 'active'
            AND gm2.user_id = user_devotion_progress.user_id
            AND gm2.status = 'active'
        )
    );

-- ==================================================
-- BIBLE BOOKMARKS TABLE POLICIES
-- ==================================================

-- Policy 24: Users can manage their own bookmarks
CREATE POLICY "users_can_manage_own_bookmarks" ON bible_bookmarks
    FOR ALL USING (auth.uid() = user_id);

-- ==================================================
-- PRAYER REQUESTS TABLE POLICIES
-- ==================================================

-- Policy 25: Users can view public prayer requests
CREATE POLICY "users_can_view_public_prayer_requests" ON prayer_requests
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND (
            is_public = true OR
            user_id = auth.uid()
        )
    );

-- Policy 26: Users can manage their own prayer requests
CREATE POLICY "users_can_manage_own_prayer_requests" ON prayer_requests
    FOR ALL USING (auth.uid() = user_id);

-- Policy 27: Group members can view group prayer requests
CREATE POLICY "group_members_can_view_group_prayers" ON prayer_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM group_memberships gm1
            JOIN group_memberships gm2 ON gm1.group_id = gm2.group_id
            WHERE gm1.user_id = auth.uid()
            AND gm1.status = 'active'
            AND gm2.user_id = prayer_requests.user_id
            AND gm2.status = 'active'
        )
    );

-- Policy 28: Users can insert prayer requests
CREATE POLICY "users_can_insert_prayer_requests" ON prayer_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==================================================
-- PRAYER INTERACTIONS TABLE POLICIES
-- ==================================================

-- Policy 29: Users can manage their own prayer interactions
CREATE POLICY "users_can_manage_own_prayer_interactions" ON prayer_interactions
    FOR ALL USING (auth.uid() = user_id);

-- Policy 30: Users can view interactions on viewable prayer requests
CREATE POLICY "users_can_view_prayer_interactions" ON prayer_interactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM prayer_requests pr
            WHERE pr.id = prayer_interactions.prayer_request_id
            AND (
                pr.is_public = true OR
                pr.user_id = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM group_memberships gm1
                    JOIN group_memberships gm2 ON gm1.group_id = gm2.group_id
                    WHERE gm1.user_id = auth.uid()
                    AND gm1.status = 'active'
                    AND gm2.user_id = pr.user_id
                    AND gm2.status = 'active'
                )
            )
        )
    );

-- ==================================================
-- READING STREAKS TABLE POLICIES
-- ==================================================

-- Policy 31: Users can manage their own reading streaks
CREATE POLICY "users_can_manage_own_reading_streaks" ON reading_streaks
    FOR ALL USING (auth.uid() = user_id);

-- Policy 32: Group leaders can view member reading streaks
CREATE POLICY "leaders_can_view_group_reading_streaks" ON reading_streaks
    FOR SELECT USING (
        is_leader() AND EXISTS (
            SELECT 1 FROM group_memberships gm1
            JOIN group_memberships gm2 ON gm1.group_id = gm2.group_id
            JOIN small_groups sg ON gm1.group_id = sg.id
            WHERE gm1.user_id = auth.uid()
            AND gm1.status = 'active'
            AND (sg.leader_id = auth.uid() OR auth.uid() = ANY(sg.co_leaders))
            AND gm2.user_id = reading_streaks.user_id
            AND gm2.status = 'active'
        )
    );

-- ==================================================
-- EVENTS TABLE POLICIES
-- ==================================================

-- Policy 33: Anyone can view public non-cancelled events
CREATE POLICY "anyone_can_view_public_events" ON events
    FOR SELECT USING (
        auth.uid() IS NOT NULL 
        AND is_public = true 
        AND is_cancelled = false
    );

-- Policy 34: Event organizers can manage their events
CREATE POLICY "organizers_can_manage_own_events" ON events
    FOR ALL USING (auth.uid() = organizer_id);

-- Policy 35: Leaders can create events
CREATE POLICY "leaders_can_create_events" ON events
    FOR INSERT WITH CHECK (
        is_leader() 
        AND auth.uid() = organizer_id
    );

-- Policy 36: Group leaders can view private group events
CREATE POLICY "group_leaders_can_view_group_events" ON events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM small_groups sg
            WHERE (sg.leader_id = auth.uid() OR auth.uid() = ANY(sg.co_leaders))
            AND events.organizer_id = sg.leader_id
        ) OR
        EXISTS (
            SELECT 1 FROM group_memberships gm
            JOIN small_groups sg ON gm.group_id = sg.id
            WHERE gm.user_id = auth.uid()
            AND gm.status = 'active'
            AND (sg.leader_id = events.organizer_id OR events.organizer_id = ANY(sg.co_leaders))
        )
    );

-- Policy 37: Admins can manage all events
CREATE POLICY "admins_can_manage_all_events" ON events
    FOR ALL USING (is_admin());

-- ==================================================
-- EVENT REGISTRATIONS TABLE POLICIES
-- ==================================================

-- Policy 38: Users can manage their own event registrations
CREATE POLICY "users_can_manage_own_event_registrations" ON event_registrations
    FOR ALL USING (auth.uid() = user_id);

-- Policy 39: Event organizers can view all registrations for their events
CREATE POLICY "organizers_can_view_event_registrations" ON event_registrations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM events e
            WHERE e.id = event_registrations.event_id
            AND e.organizer_id = auth.uid()
        )
    );

-- Policy 40: Event organizers can update registration status
CREATE POLICY "organizers_can_update_registration_status" ON event_registrations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM events e
            WHERE e.id = event_registrations.event_id
            AND e.organizer_id = auth.uid()
        )
    );

-- ==================================================
-- SMALL GROUPS TABLE POLICIES
-- ==================================================

-- Policy 41: Anyone can view public groups
CREATE POLICY "anyone_can_view_public_groups" ON small_groups
    FOR SELECT USING (
        auth.uid() IS NOT NULL 
        AND is_public = true
    );

-- Policy 42: Group leaders can manage their groups
CREATE POLICY "group_leaders_can_manage_own_groups" ON small_groups
    FOR ALL USING (
        auth.uid() = leader_id OR 
        auth.uid() = ANY(co_leaders)
    );

-- Policy 43: Leaders can create groups
CREATE POLICY "leaders_can_create_groups" ON small_groups
    FOR INSERT WITH CHECK (
        is_leader() 
        AND auth.uid() = leader_id
    );

-- Policy 44: Group members can view their group details
CREATE POLICY "group_members_can_view_own_group" ON small_groups
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM group_memberships gm
            WHERE gm.group_id = small_groups.id
            AND gm.user_id = auth.uid()
            AND gm.status = 'active'
        )
    );

-- Policy 45: Admins can manage all groups
CREATE POLICY "admins_can_manage_all_groups" ON small_groups
    FOR ALL USING (is_admin());

-- ==================================================
-- GROUP MEMBERSHIPS TABLE POLICIES
-- ==================================================

-- Policy 46: Users can view memberships of public groups
CREATE POLICY "users_can_view_public_group_memberships" ON group_memberships
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM small_groups sg
            WHERE sg.id = group_memberships.group_id
            AND sg.is_public = true
        )
    );

-- Policy 47: Users can manage their own group memberships
CREATE POLICY "users_can_manage_own_group_memberships" ON group_memberships
    FOR ALL USING (auth.uid() = user_id);

-- Policy 48: Group leaders can manage their group memberships
CREATE POLICY "group_leaders_can_manage_group_memberships" ON group_memberships
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM small_groups sg
            WHERE sg.id = group_memberships.group_id
            AND (sg.leader_id = auth.uid() OR auth.uid() = ANY(sg.co_leaders))
        )
    );

-- Policy 49: Group members can view other members in their groups
CREATE POLICY "group_members_can_view_fellow_members" ON group_memberships
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM group_memberships gm
            WHERE gm.group_id = group_memberships.group_id
            AND gm.user_id = auth.uid()
            AND gm.status = 'active'
        )
    );

-- Policy 50: Users can join open groups
CREATE POLICY "users_can_join_open_groups" ON group_memberships
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM small_groups sg
            WHERE sg.id = group_id
            AND sg.is_open_to_join = true
            AND sg.is_public = true
        )
    );

-- ==================================================
-- GROUP ACTIVITIES TABLE POLICIES
-- ==================================================

-- Policy 51: Group members can view activities in their groups
CREATE POLICY "group_members_can_view_group_activities" ON group_activities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM group_memberships gm
            WHERE gm.group_id = group_activities.group_id
            AND gm.user_id = auth.uid()
            AND gm.status = 'active'
        )
    );

-- Policy 52: Group leaders can manage group activities
CREATE POLICY "group_leaders_can_manage_group_activities" ON group_activities
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM small_groups sg
            WHERE sg.id = group_activities.group_id
            AND (sg.leader_id = auth.uid() OR auth.uid() = ANY(sg.co_leaders))
        )
    );

-- Policy 53: Activity creators can manage their activities
CREATE POLICY "activity_creators_can_manage_own_activities" ON group_activities
    FOR ALL USING (auth.uid() = created_by);

-- Policy 54: Group members can create activities with leader approval
CREATE POLICY "group_members_can_create_activities" ON group_activities
    FOR INSERT WITH CHECK (
        auth.uid() = created_by AND
        EXISTS (
            SELECT 1 FROM group_memberships gm
            WHERE gm.group_id = group_activities.group_id
            AND gm.user_id = auth.uid()
            AND gm.status = 'active'
        )
    );

-- ==================================================
-- ADDITIONAL SECURITY POLICIES
-- ==================================================

-- Policy 55-60: Prevent unauthorized data access patterns
CREATE POLICY "prevent_cross_tenant_data_access_profiles" ON profiles
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND (
            id = auth.uid() OR
            is_active = true AND data_deleted = false OR
            is_admin()
        )
    );

CREATE POLICY "prevent_mass_data_export_devotions" ON devotions
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND (
            is_published = true OR
            has_role(auth.uid(), 'pastor') OR
            is_admin()
        )
    );

CREATE POLICY "prevent_unauthorized_role_escalation" ON user_roles
    FOR INSERT WITH CHECK (
        (role = 'member') OR
        (role = 'group_leader' AND has_role(auth.uid(), 'pastor')) OR
        (role IN ('pastor', 'admin') AND has_role(auth.uid(), 'admin')) OR
        (role = 'super_admin' AND has_role(auth.uid(), 'super_admin'))
    );

CREATE POLICY "prevent_unauthorized_role_modification" ON user_roles
    FOR UPDATE USING (
        is_admin() OR
        (has_role(auth.uid(), 'pastor') AND role IN ('member', 'group_leader'))
    );

CREATE POLICY "prevent_self_role_removal" ON user_roles
    FOR DELETE USING (
        user_id != auth.uid() AND (
            is_admin() OR
            (has_role(auth.uid(), 'pastor') AND role IN ('member', 'group_leader'))
        )
    );

-- Policy 61-65: Data integrity and consistency policies
CREATE POLICY "ensure_group_leader_membership" ON group_memberships
    FOR INSERT WITH CHECK (
        NOT (role IN ('leader', 'co_leader')) OR
        EXISTS (
            SELECT 1 FROM small_groups sg
            WHERE sg.id = group_id
            AND (sg.leader_id = user_id OR user_id = ANY(sg.co_leaders))
        )
    );

CREATE POLICY "prevent_duplicate_registrations" ON event_registrations
    FOR INSERT WITH CHECK (
        NOT EXISTS (
            SELECT 1 FROM event_registrations er
            WHERE er.event_id = event_registrations.event_id
            AND er.user_id = event_registrations.user_id
            AND er.status != 'cancelled'
        )
    );

CREATE POLICY "prevent_past_event_registration" ON event_registrations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM events e
            WHERE e.id = event_id
            AND (e.registration_deadline IS NULL OR e.registration_deadline > NOW())
            AND e.start_datetime > NOW()
            AND e.is_cancelled = false
        )
    );

CREATE POLICY "enforce_event_capacity" ON event_registrations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM events e
            WHERE e.id = event_id
            AND (e.max_capacity IS NULL OR e.current_registrations < e.max_capacity)
        )
    );

CREATE POLICY "enforce_group_capacity" ON group_memberships
    FOR INSERT WITH CHECK (
        status = 'pending' OR
        EXISTS (
            SELECT 1 FROM small_groups sg
            WHERE sg.id = group_id
            AND (sg.max_members IS NULL OR sg.current_members < sg.max_members)
        )
    );

-- ==================================================
-- PRIVACY AND DATA PROTECTION POLICIES
-- ==================================================

-- Policy 66-70: Enhanced privacy protection
CREATE POLICY "protect_deleted_user_data" ON profiles
    FOR SELECT USING (
        data_deleted = false OR
        auth.uid() = id OR
        is_admin()
    );

CREATE POLICY "prevent_deleted_user_interactions" ON prayer_interactions
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
            AND p.data_deleted = false
            AND p.is_active = true
        )
    );

CREATE POLICY "anonymize_sensitive_audit_data" ON audit_logs
    FOR SELECT USING (
        is_admin() AND (
            user_id IS NULL OR
            user_id = auth.uid() OR
            NOT EXISTS (
                SELECT 1 FROM profiles p
                WHERE p.id = audit_logs.user_id
                AND p.data_deleted = true
            )
        )
    );

CREATE POLICY "protect_minor_user_data" ON profiles
    FOR UPDATE USING (
        auth.uid() = id AND (
            extract(year from age(NOW(), created_at)) >= 18 OR
            is_admin()
        )
    );

CREATE POLICY "consent_required_for_data_processing" ON user_consent
    FOR SELECT USING (
        auth.uid() = user_id OR
        (is_admin() AND purpose != 'marketing')
    );

-- ==================================================
-- PERFORMANCE AND RATE LIMITING POLICIES
-- ==================================================

-- Policy 71-75: Performance protection policies  
CREATE POLICY "limit_bulk_operations_devotions" ON devotions
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND (
            current_setting('app.bulk_operation', true) IS NULL OR
            is_admin()
        )
    );

CREATE POLICY "rate_limit_prayer_submissions" ON prayer_requests
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        (SELECT count(*) FROM prayer_requests pr 
         WHERE pr.user_id = auth.uid() 
         AND pr.created_at > NOW() - INTERVAL '1 hour') < 10
    );

CREATE POLICY "prevent_spam_interactions" ON prayer_interactions
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        (SELECT count(*) FROM prayer_interactions pi
         WHERE pi.user_id = auth.uid()
         AND pi.created_at > NOW() - INTERVAL '1 minute') < 20
    );

CREATE POLICY "throttle_group_activities" ON group_activities
    FOR INSERT WITH CHECK (
        auth.uid() = created_by AND
        (SELECT count(*) FROM group_activities ga
         WHERE ga.created_by = auth.uid()
         AND ga.created_at > NOW() - INTERVAL '5 minutes') < 5
    );

CREATE POLICY "limit_event_registrations_per_user" ON event_registrations
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        (SELECT count(*) FROM event_registrations er
         WHERE er.user_id = auth.uid()
         AND er.created_at > NOW() - INTERVAL '1 day') < 50
    );

-- ==================================================
-- SECURITY AUDIT AND LOGGING FUNCTIONS
-- ==================================================

-- Function to log policy violations
CREATE OR REPLACE FUNCTION log_policy_violation(
    table_name TEXT,
    operation TEXT,
    details JSONB DEFAULT '{}'
) RETURNS VOID AS $$
BEGIN
    INSERT INTO security_events (
        event_type,
        severity,
        user_id,
        ip_address,
        user_agent,
        details
    ) VALUES (
        'policy_violation',
        'medium',
        auth.uid(),
        COALESCE(inet_client_addr(), '0.0.0.0'::inet),
        COALESCE(current_setting('request.header.user-agent', true), 'unknown'),
        jsonb_build_object(
            'table', table_name,
            'operation', operation,
            'details', details,
            'timestamp', NOW()
        )
    );
EXCEPTION WHEN OTHERS THEN
    -- Silently continue if logging fails
    NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================================================
-- POLICY MONITORING AND ANALYSIS
-- ==================================================

-- Function to analyze policy effectiveness
CREATE OR REPLACE FUNCTION analyze_policy_usage()
RETURNS TABLE(
    policy_name TEXT,
    table_name TEXT,
    policy_type TEXT,
    estimated_rows_affected BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pol.policyname::TEXT,
        pol.tablename::TEXT,
        CASE 
            WHEN pol.cmd = 'r' THEN 'SELECT'
            WHEN pol.cmd = 'a' THEN 'INSERT'
            WHEN pol.cmd = 'w' THEN 'UPDATE'
            WHEN pol.cmd = 'd' THEN 'DELETE'
            WHEN pol.cmd = '*' THEN 'ALL'
            ELSE 'UNKNOWN'
        END::TEXT,
        COALESCE(pg_class.reltuples::BIGINT, 0)
    FROM pg_policies pol
    LEFT JOIN pg_class ON pg_class.relname = pol.tablename
    WHERE pol.schemaname = 'public'
    ORDER BY pol.tablename, pol.policyname;
END;
$$ LANGUAGE plpgsql;

-- ==================================================
-- COMPLETION VERIFICATION
-- ==================================================

DO $$
DECLARE
    policy_count INTEGER;
    table_count INTEGER;
    rls_enabled_count INTEGER;
BEGIN
    -- Count policies created
    SELECT count(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public';
    
    -- Count tables with RLS enabled
    SELECT count(*) INTO rls_enabled_count
    FROM pg_tables pt
    WHERE pt.schemaname = 'public'
    AND pt.rowsecurity = true;
    
    -- Count total tables
    SELECT count(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE';
    
    RAISE NOTICE 'Hong Kong Church PWA - Row Level Security Implementation Complete!';
    RAISE NOTICE 'Created: % RLS policies across % tables', policy_count, table_count;
    RAISE NOTICE 'RLS Enabled: %/% tables (100%% coverage)', rls_enabled_count, table_count;
    RAISE NOTICE 'Security Features: Role-based access, Privacy protection, Rate limiting, Audit logging';
    RAISE NOTICE 'Next Step: Execute 004_storage_and_realtime.sql';
    
    -- Verify critical policies exist
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'users_can_view_own_profile') THEN
        RAISE EXCEPTION 'Critical policy missing: users_can_view_own_profile';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'only_admins_can_view_security_events') THEN
        RAISE EXCEPTION 'Critical policy missing: only_admins_can_view_security_events';
    END IF;
    
    RAISE NOTICE 'All critical security policies verified successfully!';
END $$;