-- Hong Kong Church PWA - Security and Row Level Security (RLS) Policies
-- Production Deployment Script - Execute after 002_indexes_and_performance.sql
-- Part 3: Comprehensive Security Implementation with 75+ RLS Policies

-- ==================================================
-- ENABLE ROW LEVEL SECURITY
-- ==================================================

-- Enable RLS on all user-data tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_consent ENABLE ROW LEVEL SECURITY;
ALTER TABLE devotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_devotion_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE bible_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE small_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_activities ENABLE ROW LEVEL SECURITY;

-- Enable RLS on audit and monitoring tables
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE query_performance_log ENABLE ROW LEVEL SECURITY;

-- ==================================================
-- SECURITY HELPER FUNCTIONS
-- ==================================================

-- Function to get current user's role
CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID DEFAULT auth.uid())
RETURNS user_role AS $$
BEGIN
    RETURN (
        SELECT role 
        FROM user_roles 
        WHERE user_id = user_uuid 
        ORDER BY 
            CASE role
                WHEN 'super_admin' THEN 1
                WHEN 'admin' THEN 2
                WHEN 'pastor' THEN 3
                WHEN 'group_leader' THEN 4
                WHEN 'member' THEN 5
            END
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has minimum role
CREATE OR REPLACE FUNCTION has_role_or_higher(required_role user_role, user_uuid UUID DEFAULT auth.uid())
RETURNS boolean AS $$
DECLARE
    user_role_level INTEGER;
    required_role_level INTEGER;
BEGIN
    -- Role hierarchy levels (lower number = higher privilege)
    SELECT CASE get_user_role(user_uuid)
        WHEN 'super_admin' THEN 1
        WHEN 'admin' THEN 2
        WHEN 'pastor' THEN 3
        WHEN 'group_leader' THEN 4
        WHEN 'member' THEN 5
        ELSE 6
    END INTO user_role_level;
    
    SELECT CASE required_role
        WHEN 'super_admin' THEN 1
        WHEN 'admin' THEN 2
        WHEN 'pastor' THEN 3
        WHEN 'group_leader' THEN 4
        WHEN 'member' THEN 5
    END INTO required_role_level;
    
    RETURN user_role_level <= required_role_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is group leader/co-leader
CREATE OR REPLACE FUNCTION is_group_leader(group_uuid UUID, user_uuid UUID DEFAULT auth.uid())
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM small_groups sg
        WHERE sg.id = group_uuid 
        AND (sg.leader_id = user_uuid OR user_uuid = ANY(sg.co_leaders))
    ) OR EXISTS (
        SELECT 1 FROM group_memberships gm
        WHERE gm.group_id = group_uuid 
        AND gm.user_id = user_uuid 
        AND gm.role IN ('leader', 'co_leader')
        AND gm.status = 'active'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can access private data
CREATE OR REPLACE FUNCTION can_access_private_data(target_user_uuid UUID, accessor_uuid UUID DEFAULT auth.uid())
RETURNS boolean AS $$
BEGIN
    -- Self access
    IF target_user_uuid = accessor_uuid THEN
        RETURN true;
    END IF;
    
    -- Admin and pastor access
    IF has_role_or_higher('pastor', accessor_uuid) THEN
        RETURN true;
    END IF;
    
    -- Group leaders can access their members' data
    IF EXISTS (
        SELECT 1 FROM group_memberships gm1
        JOIN group_memberships gm2 ON gm1.group_id = gm2.group_id
        WHERE gm1.user_id = target_user_uuid 
        AND gm2.user_id = accessor_uuid
        AND gm2.role IN ('leader', 'co_leader')
        AND gm1.status = 'active' AND gm2.status = 'active'
    ) THEN
        RETURN true;
    END IF;
    
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================================================
-- PROFILES TABLE RLS POLICIES
-- ==================================================

-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Policy 2: Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Policy 3: Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy 4: Admins and pastors can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (has_role_or_higher('pastor'));

-- Policy 5: Admins can update any profile
CREATE POLICY "Admins can update profiles" ON profiles
    FOR UPDATE USING (has_role_or_higher('admin'));

-- Policy 6: Group leaders can view their members' basic profiles
CREATE POLICY "Group leaders can view member profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM group_memberships gm1
            JOIN group_memberships gm2 ON gm1.group_id = gm2.group_id
            WHERE gm1.user_id = profiles.id 
            AND gm2.user_id = auth.uid()
            AND gm2.role IN ('leader', 'co_leader')
            AND gm1.status = 'active' AND gm2.status = 'active'
        )
    );

-- Policy 7: Prevent access to deleted profiles
CREATE POLICY "No access to deleted profiles" ON profiles
    FOR ALL USING (data_deleted = false OR auth.uid() = id OR has_role_or_higher('admin'));

-- ==================================================
-- USER ROLES TABLE RLS POLICIES
-- ==================================================

-- Policy 8: Users can view their own roles
CREATE POLICY "Users can view own roles" ON user_roles
    FOR SELECT USING (auth.uid() = user_id);

-- Policy 9: Admins can manage all roles
CREATE POLICY "Admins can manage roles" ON user_roles
    FOR ALL USING (has_role_or_higher('admin'));

-- Policy 10: Pastors can view all roles but not modify super_admin
CREATE POLICY "Pastors can view roles" ON user_roles
    FOR SELECT USING (has_role_or_higher('pastor'));

-- Policy 11: Pastors can assign non-admin roles
CREATE POLICY "Pastors can assign roles" ON user_roles
    FOR INSERT WITH CHECK (
        has_role_or_higher('pastor') AND 
        role NOT IN ('super_admin', 'admin')
    );

-- Policy 12: Only super_admins can assign admin roles
CREATE POLICY "Super admins can assign admin roles" ON user_roles
    FOR INSERT WITH CHECK (
        has_role_or_higher('super_admin') AND 
        role IN ('admin', 'super_admin')
    );

-- ==================================================
-- SECURITY EVENTS TABLE RLS POLICIES
-- ==================================================

-- Policy 13: Users can view their own security events
CREATE POLICY "Users can view own security events" ON security_events
    FOR SELECT USING (auth.uid() = user_id);

-- Policy 14: Admins can view all security events
CREATE POLICY "Admins can view all security events" ON security_events
    FOR SELECT USING (has_role_or_higher('admin'));

-- Policy 15: System can insert security events
CREATE POLICY "System can insert security events" ON security_events
    FOR INSERT WITH CHECK (true);

-- Policy 16: Admins can update security event investigation status
CREATE POLICY "Admins can update security events" ON security_events
    FOR UPDATE USING (has_role_or_higher('admin'));

-- ==================================================
-- USER CONSENT TABLE RLS POLICIES
-- ==================================================

-- Policy 17: Users can view their own consent records
CREATE POLICY "Users can view own consent" ON user_consent
    FOR SELECT USING (auth.uid() = user_id);

-- Policy 18: Users can insert their own consent
CREATE POLICY "Users can insert own consent" ON user_consent
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy 19: Admins can view all consent records
CREATE POLICY "Admins can view all consent" ON user_consent
    FOR SELECT USING (has_role_or_higher('admin'));

-- ==================================================
-- DEVOTIONS TABLE RLS POLICIES
-- ==================================================

-- Policy 20: Everyone can view published devotions
CREATE POLICY "Anyone can view published devotions" ON devotions
    FOR SELECT USING (is_published = true);

-- Policy 21: Pastors and admins can view all devotions
CREATE POLICY "Pastors can view all devotions" ON devotions
    FOR SELECT USING (has_role_or_higher('pastor'));

-- Policy 22: Pastors can create devotions
CREATE POLICY "Pastors can create devotions" ON devotions
    FOR INSERT WITH CHECK (has_role_or_higher('pastor'));

-- Policy 23: Pastors can update devotions
CREATE POLICY "Pastors can update devotions" ON devotions
    FOR UPDATE USING (has_role_or_higher('pastor'));

-- Policy 24: Only admins can delete devotions
CREATE POLICY "Admins can delete devotions" ON devotions
    FOR DELETE USING (has_role_or_higher('admin'));

-- ==================================================
-- USER DEVOTION PROGRESS TABLE RLS POLICIES
-- ==================================================

-- Policy 25: Users can view their own progress
CREATE POLICY "Users can view own devotion progress" ON user_devotion_progress
    FOR SELECT USING (auth.uid() = user_id);

-- Policy 26: Users can insert their own progress
CREATE POLICY "Users can insert own devotion progress" ON user_devotion_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy 27: Users can update their own progress
CREATE POLICY "Users can update own devotion progress" ON user_devotion_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy 28: Group leaders can view their members' progress
CREATE POLICY "Group leaders can view member progress" ON user_devotion_progress
    FOR SELECT USING (can_access_private_data(user_id));

-- Policy 29: Pastors can view all progress for pastoral care
CREATE POLICY "Pastors can view all devotion progress" ON user_devotion_progress
    FOR SELECT USING (has_role_or_higher('pastor'));

-- ==================================================
-- BIBLE BOOKMARKS TABLE RLS POLICIES
-- ==================================================

-- Policy 30: Users can manage their own bookmarks
CREATE POLICY "Users can manage own bookmarks" ON bible_bookmarks
    FOR ALL USING (auth.uid() = user_id);

-- Policy 31: Group leaders can view members' shared bookmarks
CREATE POLICY "Group leaders can view member bookmarks" ON bible_bookmarks
    FOR SELECT USING (can_access_private_data(user_id));

-- ==================================================
-- READING STREAKS TABLE RLS POLICIES
-- ==================================================

-- Policy 32: Users can view their own reading streaks
CREATE POLICY "Users can view own reading streaks" ON reading_streaks
    FOR SELECT USING (auth.uid() = user_id);

-- Policy 33: Users can update their own reading streaks
CREATE POLICY "Users can update own reading streaks" ON reading_streaks
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy 34: System can insert reading streaks
CREATE POLICY "System can insert reading streaks" ON reading_streaks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy 35: Group leaders can view members' streaks
CREATE POLICY "Group leaders can view member streaks" ON reading_streaks
    FOR SELECT USING (can_access_private_data(user_id));

-- ==================================================
-- PRAYER REQUESTS TABLE RLS POLICIES
-- ==================================================

-- Policy 36: Users can view public prayer requests
CREATE POLICY "Anyone can view public prayer requests" ON prayer_requests
    FOR SELECT USING (is_public = true);

-- Policy 37: Users can view their own prayer requests
CREATE POLICY "Users can view own prayer requests" ON prayer_requests
    FOR SELECT USING (auth.uid() = user_id);

-- Policy 38: Users can create prayer requests
CREATE POLICY "Users can create prayer requests" ON prayer_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy 39: Users can update their own prayer requests
CREATE POLICY "Users can update own prayer requests" ON prayer_requests
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy 40: Users can delete their own prayer requests
CREATE POLICY "Users can delete own prayer requests" ON prayer_requests
    FOR DELETE USING (auth.uid() = user_id);

-- Policy 41: Group members can view group prayer requests
CREATE POLICY "Group members can view group prayers" ON prayer_requests
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM group_memberships gm1
            JOIN group_memberships gm2 ON gm1.group_id = gm2.group_id
            WHERE gm1.user_id = prayer_requests.user_id 
            AND gm2.user_id = auth.uid()
            AND gm1.status = 'active' AND gm2.status = 'active'
        )
    );

-- Policy 42: Pastors can view all prayer requests
CREATE POLICY "Pastors can view all prayer requests" ON prayer_requests
    FOR SELECT USING (has_role_or_higher('pastor'));

-- ==================================================
-- PRAYER INTERACTIONS TABLE RLS POLICIES
-- ==================================================

-- Policy 43: Users can view interactions on public prayers
CREATE POLICY "Users can view public prayer interactions" ON prayer_interactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM prayer_requests pr
            WHERE pr.id = prayer_interactions.prayer_request_id
            AND pr.is_public = true
        )
    );

-- Policy 44: Users can create prayer interactions
CREATE POLICY "Users can create prayer interactions" ON prayer_interactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy 45: Users can view their own prayer interactions
CREATE POLICY "Users can view own prayer interactions" ON prayer_interactions
    FOR SELECT USING (auth.uid() = user_id);

-- Policy 46: Prayer request owners can view all interactions
CREATE POLICY "Prayer owners can view interactions" ON prayer_interactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM prayer_requests pr
            WHERE pr.id = prayer_interactions.prayer_request_id
            AND pr.user_id = auth.uid()
        )
    );

-- ==================================================
-- EVENTS TABLE RLS POLICIES
-- ==================================================

-- Policy 47: Everyone can view public events
CREATE POLICY "Anyone can view public events" ON events
    FOR SELECT USING (is_public = true);

-- Policy 48: Organizers can view their own events
CREATE POLICY "Organizers can view own events" ON events
    FOR SELECT USING (auth.uid() = organizer_id);

-- Policy 49: Event organizers can create events
CREATE POLICY "Users can create events" ON events
    FOR INSERT WITH CHECK (auth.uid() = organizer_id);

-- Policy 50: Event organizers can update their events
CREATE POLICY "Organizers can update own events" ON events
    FOR UPDATE USING (auth.uid() = organizer_id);

-- Policy 51: Pastors can view all events
CREATE POLICY "Pastors can view all events" ON events
    FOR SELECT USING (has_role_or_higher('pastor'));

-- Policy 52: Pastors can update any event
CREATE POLICY "Pastors can update any event" ON events
    FOR UPDATE USING (has_role_or_higher('pastor'));

-- Policy 53: Group leaders can create group events
CREATE POLICY "Group leaders can create events" ON events
    FOR INSERT WITH CHECK (has_role_or_higher('group_leader'));

-- ==================================================
-- EVENT REGISTRATIONS TABLE RLS POLICIES
-- ==================================================

-- Policy 54: Users can view their own registrations
CREATE POLICY "Users can view own registrations" ON event_registrations
    FOR SELECT USING (auth.uid() = user_id);

-- Policy 55: Users can register for events
CREATE POLICY "Users can register for events" ON event_registrations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy 56: Users can update their own registrations
CREATE POLICY "Users can update own registrations" ON event_registrations
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy 57: Event organizers can view all registrations
CREATE POLICY "Organizers can view event registrations" ON event_registrations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM events e
            WHERE e.id = event_registrations.event_id
            AND e.organizer_id = auth.uid()
        )
    );

-- Policy 58: Pastors can view all event registrations
CREATE POLICY "Pastors can view all registrations" ON event_registrations
    FOR SELECT USING (has_role_or_higher('pastor'));

-- ==================================================
-- SMALL GROUPS TABLE RLS POLICIES
-- ==================================================

-- Policy 59: Everyone can view public groups
CREATE POLICY "Anyone can view public groups" ON small_groups
    FOR SELECT USING (is_public = true);

-- Policy 60: Group leaders can view their groups
CREATE POLICY "Leaders can view own groups" ON small_groups
    FOR SELECT USING (
        auth.uid() = leader_id OR 
        auth.uid() = ANY(co_leaders)
    );

-- Policy 61: Group leaders can create groups
CREATE POLICY "Group leaders can create groups" ON small_groups
    FOR INSERT WITH CHECK (
        has_role_or_higher('group_leader') AND 
        auth.uid() = leader_id
    );

-- Policy 62: Group leaders can update their groups
CREATE POLICY "Leaders can update own groups" ON small_groups
    FOR UPDATE USING (
        auth.uid() = leader_id OR 
        auth.uid() = ANY(co_leaders)
    );

-- Policy 63: Pastors can view all groups
CREATE POLICY "Pastors can view all groups" ON small_groups
    FOR SELECT USING (has_role_or_higher('pastor'));

-- Policy 64: Group members can view their groups
CREATE POLICY "Members can view their groups" ON small_groups
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM group_memberships gm
            WHERE gm.group_id = small_groups.id
            AND gm.user_id = auth.uid()
            AND gm.status = 'active'
        )
    );

-- ==================================================
-- GROUP MEMBERSHIPS TABLE RLS POLICIES
-- ==================================================

-- Policy 65: Users can view their own memberships
CREATE POLICY "Users can view own memberships" ON group_memberships
    FOR SELECT USING (auth.uid() = user_id);

-- Policy 66: Users can join groups
CREATE POLICY "Users can join groups" ON group_memberships
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy 67: Users can update their own memberships
CREATE POLICY "Users can update own memberships" ON group_memberships
    FOR UPDATE USING (auth.uid() = user_id);

-- Policy 68: Group leaders can view all group memberships
CREATE POLICY "Leaders can view group memberships" ON group_memberships
    FOR SELECT USING (is_group_leader(group_id));

-- Policy 69: Group leaders can manage memberships
CREATE POLICY "Leaders can manage memberships" ON group_memberships
    FOR UPDATE USING (is_group_leader(group_id));

-- Policy 70: Group leaders can approve memberships
CREATE POLICY "Leaders can approve memberships" ON group_memberships
    FOR UPDATE USING (
        is_group_leader(group_id) AND 
        auth.uid() = approved_by
    );

-- ==================================================
-- GROUP ACTIVITIES TABLE RLS POLICIES
-- ==================================================

-- Policy 71: Group members can view group activities
CREATE POLICY "Members can view group activities" ON group_activities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM group_memberships gm
            WHERE gm.group_id = group_activities.group_id
            AND gm.user_id = auth.uid()
            AND gm.status = 'active'
        )
    );

-- Policy 72: Group leaders can create activities
CREATE POLICY "Leaders can create activities" ON group_activities
    FOR INSERT WITH CHECK (
        is_group_leader(group_id) AND 
        auth.uid() = created_by
    );

-- Policy 73: Activity creators can update their activities
CREATE POLICY "Creators can update activities" ON group_activities
    FOR UPDATE USING (auth.uid() = created_by);

-- Policy 74: Group leaders can update any group activity
CREATE POLICY "Leaders can update group activities" ON group_activities
    FOR UPDATE USING (is_group_leader(group_id));

-- ==================================================
-- AUDIT LOGS TABLE RLS POLICIES
-- ==================================================

-- Policy 75: Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON audit_logs
    FOR SELECT USING (has_role_or_higher('admin'));

-- Policy 76: System can insert audit logs
CREATE POLICY "System can insert audit logs" ON audit_logs
    FOR INSERT WITH CHECK (true);

-- ==================================================
-- QUERY PERFORMANCE LOG RLS POLICIES
-- ==================================================

-- Policy 77: Only admins can view performance logs
CREATE POLICY "Admins can view performance logs" ON query_performance_log
    FOR SELECT USING (has_role_or_higher('admin'));

-- Policy 78: System can insert performance logs
CREATE POLICY "System can insert performance logs" ON query_performance_log
    FOR INSERT WITH CHECK (true);

-- ==================================================
-- SECURITY AUDIT FUNCTIONS
-- ==================================================

-- Audit trigger function for sensitive data changes
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (table_name, operation, old_data, user_id)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), auth.uid());
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (table_name, operation, old_data, new_data, user_id)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), row_to_json(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (table_name, operation, new_data, user_id)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(NEW), auth.uid());
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to sensitive tables
CREATE TRIGGER audit_profiles AFTER INSERT OR UPDATE OR DELETE ON profiles
    FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_user_roles AFTER INSERT OR UPDATE OR DELETE ON user_roles
    FOR EACH ROW EXECUTE FUNCTION audit_trigger();

CREATE TRIGGER audit_user_consent AFTER INSERT OR UPDATE OR DELETE ON user_consent
    FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- Security event logging function
CREATE OR REPLACE FUNCTION log_security_event(
    event_type TEXT,
    severity TEXT,
    details JSONB DEFAULT '{}',
    target_user_id UUID DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    INSERT INTO security_events (
        event_type, 
        severity, 
        user_id, 
        ip_address, 
        user_agent, 
        details
    ) VALUES (
        event_type,
        severity,
        COALESCE(target_user_id, auth.uid()),
        COALESCE(current_setting('request.headers', true)::json->>'x-forwarded-for', '127.0.0.1')::inet,
        COALESCE(current_setting('request.headers', true)::json->>'user-agent', 'Unknown'),
        details
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================================================
-- SECURITY VALIDATION FUNCTIONS
-- ==================================================

-- Function to validate Hong Kong phone numbers
CREATE OR REPLACE FUNCTION is_valid_hk_phone(phone_number TEXT)
RETURNS boolean AS $$
BEGIN
    -- Hong Kong phone number patterns
    RETURN phone_number ~ '^(\+852|852)?[2-9][0-9]{7}$';
END;
$$ LANGUAGE plpgsql;

-- Function to sanitize user input
CREATE OR REPLACE FUNCTION sanitize_text(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
    -- Remove potentially dangerous characters and scripts
    RETURN regexp_replace(
        trim(input_text),
        '<[^>]*>|javascript:|vbscript:|on\w+\s*=',
        '',
        'gi'
    );
END;
$$ LANGUAGE plpgsql;

-- Function to check password strength
CREATE OR REPLACE FUNCTION check_password_strength(password TEXT)
RETURNS TABLE(
    is_strong boolean,
    score integer,
    feedback text[]
) AS $$
DECLARE
    feedback_array text[] := '{}';
    strength_score integer := 0;
BEGIN
    -- Length check
    IF length(password) >= 8 THEN
        strength_score := strength_score + 1;
    ELSE
        feedback_array := array_append(feedback_array, 'Password must be at least 8 characters long');
    END IF;
    
    -- Uppercase check
    IF password ~ '[A-Z]' THEN
        strength_score := strength_score + 1;
    ELSE
        feedback_array := array_append(feedback_array, 'Password must contain at least one uppercase letter');
    END IF;
    
    -- Lowercase check
    IF password ~ '[a-z]' THEN
        strength_score := strength_score + 1;
    ELSE
        feedback_array := array_append(feedback_array, 'Password must contain at least one lowercase letter');
    END IF;
    
    -- Number check
    IF password ~ '[0-9]' THEN
        strength_score := strength_score + 1;
    ELSE
        feedback_array := array_append(feedback_array, 'Password must contain at least one number');
    END IF;
    
    -- Special character check
    IF password ~ '[^A-Za-z0-9]' THEN
        strength_score := strength_score + 1;
    ELSE
        feedback_array := array_append(feedback_array, 'Password must contain at least one special character');
    END IF;
    
    RETURN QUERY SELECT 
        strength_score >= 4,
        strength_score,
        feedback_array;
END;
$$ LANGUAGE plpgsql;

-- ==================================================
-- SECURITY MONITORING VIEWS
-- ==================================================

-- View for security dashboard
CREATE VIEW security_dashboard AS
SELECT 
    event_type,
    severity,
    COUNT(*) as event_count,
    COUNT(DISTINCT user_id) as affected_users,
    MAX(created_at) as last_occurrence,
    COUNT(CASE WHEN investigated = false THEN 1 END) as uninvestigated_count
FROM security_events
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY event_type, severity
ORDER BY 
    CASE severity 
        WHEN 'critical' THEN 1 
        WHEN 'high' THEN 2 
        WHEN 'medium' THEN 3 
        WHEN 'low' THEN 4 
    END,
    event_count DESC;

-- View for failed login attempts
CREATE VIEW failed_login_monitoring AS
SELECT 
    user_id,
    ip_address,
    COUNT(*) as attempt_count,
    MIN(created_at) as first_attempt,
    MAX(created_at) as last_attempt
FROM security_events
WHERE event_type = 'failed_login'
    AND created_at >= NOW() - INTERVAL '1 hour'
GROUP BY user_id, ip_address
HAVING COUNT(*) >= 3
ORDER BY attempt_count DESC, last_attempt DESC;

-- ==================================================
-- COMPLETION NOTIFICATION
-- ==================================================

DO $$
DECLARE
    policy_count INTEGER;
    function_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public';
    
    SELECT COUNT(*) INTO function_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname LIKE '%security%' OR p.proname LIKE '%audit%' OR p.proname LIKE '%role%';
    
    RAISE NOTICE 'Hong Kong Church PWA - Security Implementation Complete!';
    RAISE NOTICE 'Created: % RLS policies for comprehensive data protection', policy_count;
    RAISE NOTICE 'Created: % security and audit functions', function_count;
    RAISE NOTICE 'Next Step: Execute 004_seed_data.sql';
END $$;