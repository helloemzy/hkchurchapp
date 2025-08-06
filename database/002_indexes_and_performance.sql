-- Hong Kong Church PWA - Performance Indexes and Optimization
-- Production Deployment Script - Execute after 001_initial_schema.sql
-- Part 2: Performance Indexes, Materialized Views, and Query Optimization

-- ==================================================
-- PRIMARY PERFORMANCE INDEXES
-- ==================================================

-- User management indexes for fast authentication and lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_phone ON profiles(phone);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_language ON profiles(language);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_last_seen_at ON profiles(last_seen_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- User roles indexes for permission checks
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_roles_assigned_by ON user_roles(assigned_by);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_roles_expires_at ON user_roles(expires_at) WHERE expires_at IS NOT NULL;

-- Security and audit indexes for monitoring
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_events_created_at ON security_events(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_events_event_type ON security_events(event_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_events_investigated ON security_events(investigated);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_operation ON audit_logs(operation);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_consent_user_id ON user_consent(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_consent_purpose ON user_consent(purpose);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_consent_granted ON user_consent(granted);

-- ==================================================
-- DEVOTIONS AND SPIRITUAL CONTENT INDEXES
-- ==================================================

-- Devotions indexes for daily content delivery
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_devotions_date ON devotions(date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_devotions_is_published ON devotions(is_published);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_devotions_featured ON devotions(featured);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_devotions_author ON devotions(author);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_devotions_created_at ON devotions(created_at);

-- Full-text search indexes for devotions
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_devotions_title_search ON devotions USING gin(to_tsvector('english', title));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_devotions_content_search ON devotions USING gin(to_tsvector('english', content));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_devotions_tags ON devotions USING gin(tags);

-- User devotion progress indexes for streak tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_devotion_progress_user_id ON user_devotion_progress(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_devotion_progress_devotion_id ON user_devotion_progress(devotion_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_devotion_progress_completed_at ON user_devotion_progress(completed_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_devotion_progress_bookmarked ON user_devotion_progress(bookmarked) WHERE bookmarked = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_devotion_progress_shared ON user_devotion_progress(shared) WHERE shared = true;

-- Bible bookmarks indexes for quick access
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bible_bookmarks_user_id ON bible_bookmarks(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bible_bookmarks_book ON bible_bookmarks(book);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bible_bookmarks_book_chapter ON bible_bookmarks(book, chapter);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bible_bookmarks_created_at ON bible_bookmarks(created_at);

-- Full-text search for bible bookmark notes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bible_bookmarks_notes_search ON bible_bookmarks USING gin(to_tsvector('english', notes)) WHERE notes IS NOT NULL;

-- Reading streaks indexes for achievement system
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reading_streaks_user_id ON reading_streaks(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reading_streaks_current_streak ON reading_streaks(current_streak);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reading_streaks_longest_streak ON reading_streaks(longest_streak);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reading_streaks_last_read_date ON reading_streaks(last_read_date);

-- ==================================================
-- PRAYER SYSTEM INDEXES
-- ==================================================

-- Prayer requests indexes for community prayer wall
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_prayer_requests_user_id ON prayer_requests(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_prayer_requests_category ON prayer_requests(category);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_prayer_requests_is_public ON prayer_requests(is_public);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_prayer_requests_is_answered ON prayer_requests(is_answered);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_prayer_requests_created_at ON prayer_requests(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_prayer_requests_prayer_count ON prayer_requests(prayer_count);

-- Full-text search for prayer requests
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_prayer_requests_title_search ON prayer_requests USING gin(to_tsvector('english', title));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_prayer_requests_description_search ON prayer_requests USING gin(to_tsvector('english', description));

-- Prayer interactions indexes for engagement tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_prayer_interactions_prayer_request_id ON prayer_interactions(prayer_request_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_prayer_interactions_user_id ON prayer_interactions(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_prayer_interactions_action ON prayer_interactions(action);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_prayer_interactions_created_at ON prayer_interactions(created_at);

-- ==================================================
-- EVENTS MANAGEMENT INDEXES
-- ==================================================

-- Events indexes for calendar and discovery
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_start_datetime ON events(start_datetime);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_end_datetime ON events(end_datetime);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_organizer_id ON events(organizer_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_is_public ON events(is_public);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_is_featured ON events(is_featured);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_is_cancelled ON events(is_cancelled);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_requires_registration ON events(requires_registration);

-- Events date range queries optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_date_range ON events(start_datetime, end_datetime);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_upcoming ON events(start_datetime) WHERE start_datetime > NOW() AND is_cancelled = false;

-- Full-text search for events
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_title_search ON events USING gin(to_tsvector('english', title));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_description_search ON events USING gin(to_tsvector('english', description));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_tags ON events USING gin(tags);

-- Event registrations indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_event_registrations_user_id ON event_registrations(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_event_registrations_status ON event_registrations(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_event_registrations_registered_at ON event_registrations(registered_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_event_registrations_attendance_confirmed ON event_registrations(attendance_confirmed);

-- ==================================================
-- SMALL GROUPS INDEXES
-- ==================================================

-- Small groups indexes for discovery and management
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_small_groups_leader_id ON small_groups(leader_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_small_groups_category ON small_groups(category);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_small_groups_is_open_to_join ON small_groups(is_open_to_join);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_small_groups_is_public ON small_groups(is_public);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_small_groups_requires_approval ON small_groups(requires_approval);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_small_groups_language_primary ON small_groups(language_primary);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_small_groups_gender_preference ON small_groups(gender_preference);

-- Full-text search for small groups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_small_groups_name_search ON small_groups USING gin(to_tsvector('english', name));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_small_groups_description_search ON small_groups USING gin(to_tsvector('english', description));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_small_groups_tags ON small_groups USING gin(tags);

-- Group memberships indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_group_memberships_group_id ON group_memberships(group_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_group_memberships_user_id ON group_memberships(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_group_memberships_role ON group_memberships(role);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_group_memberships_status ON group_memberships(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_group_memberships_joined_at ON group_memberships(joined_at);

-- Group activities indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_group_activities_group_id ON group_activities(group_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_group_activities_created_by ON group_activities(created_by);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_group_activities_activity_type ON group_activities(activity_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_group_activities_scheduled_for ON group_activities(scheduled_for);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_group_activities_created_at ON group_activities(created_at);

-- ==================================================
-- COMPOSITE INDEXES FOR COMPLEX QUERIES
-- ==================================================

-- User activity composite indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_activity_composite ON user_devotion_progress(user_id, completed_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_prayer_activity ON prayer_interactions(user_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_event_activity ON event_registrations(user_id, registered_at DESC);

-- Content discovery composite indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_devotions_published_date ON devotions(is_published, date DESC) WHERE is_published = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_public_upcoming ON events(is_public, start_datetime) WHERE is_public = true AND is_cancelled = false;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_groups_open_public ON small_groups(is_open_to_join, is_public) WHERE is_open_to_join = true AND is_public = true;

-- Prayer community composite indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_prayers_public_category ON prayer_requests(is_public, category, created_at DESC) WHERE is_public = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_prayers_answered_public ON prayer_requests(is_answered, is_public, answered_at DESC) WHERE is_answered = true AND is_public = true;

-- ==================================================
-- MATERIALIZED VIEWS FOR ANALYTICS
-- ==================================================

-- Daily devotion completion statistics
CREATE MATERIALIZED VIEW daily_devotion_stats AS
SELECT 
    d.date,
    d.title,
    COUNT(udp.id) as completions,
    COUNT(CASE WHEN udp.shared = true THEN 1 END) as shares,
    COUNT(CASE WHEN udp.bookmarked = true THEN 1 END) as bookmarks,
    AVG(CASE WHEN udp.reflection_notes IS NOT NULL THEN 1.0 ELSE 0.0 END) as reflection_rate
FROM devotions d
LEFT JOIN user_devotion_progress udp ON d.id = udp.devotion_id
WHERE d.is_published = true
GROUP BY d.date, d.title, d.id
ORDER BY d.date DESC;

CREATE UNIQUE INDEX ON daily_devotion_stats (date);

-- User engagement summary
CREATE MATERIALIZED VIEW user_engagement_summary AS
SELECT 
    p.id as user_id,
    p.full_name,
    p.language,
    rs.current_streak,
    rs.longest_streak,
    rs.total_devotions_read,
    COUNT(DISTINCT pr.id) as prayer_requests_count,
    COUNT(DISTINCT pi.id) as prayers_offered_count,
    COUNT(DISTINCT er.id) as events_registered_count,
    COUNT(DISTINCT gm.id) as groups_joined_count,
    p.last_seen_at
FROM profiles p
LEFT JOIN reading_streaks rs ON p.id = rs.user_id
LEFT JOIN prayer_requests pr ON p.id = pr.user_id
LEFT JOIN prayer_interactions pi ON p.id = pi.user_id
LEFT JOIN event_registrations er ON p.id = er.user_id
LEFT JOIN group_memberships gm ON p.id = gm.user_id AND gm.status = 'active'
WHERE p.is_active = true
GROUP BY p.id, p.full_name, p.language, rs.current_streak, rs.longest_streak, rs.total_devotions_read, p.last_seen_at;

CREATE UNIQUE INDEX ON user_engagement_summary (user_id);

-- Weekly church activity overview
CREATE MATERIALIZED VIEW weekly_activity_overview AS
SELECT 
    date_trunc('week', created_at) as week_start,
    'devotion_completion' as activity_type,
    COUNT(*) as activity_count
FROM user_devotion_progress
WHERE created_at >= NOW() - INTERVAL '12 weeks'
GROUP BY date_trunc('week', created_at)

UNION ALL

SELECT 
    date_trunc('week', created_at) as week_start,
    'prayer_request' as activity_type,
    COUNT(*) as activity_count
FROM prayer_requests
WHERE created_at >= NOW() - INTERVAL '12 weeks'
GROUP BY date_trunc('week', created_at)

UNION ALL

SELECT 
    date_trunc('week', registered_at) as week_start,
    'event_registration' as activity_type,
    COUNT(*) as activity_count
FROM event_registrations
WHERE registered_at >= NOW() - INTERVAL '12 weeks'
GROUP BY date_trunc('week', registered_at)

ORDER BY week_start DESC, activity_type;

CREATE INDEX ON weekly_activity_overview (week_start, activity_type);

-- ==================================================
-- PERFORMANCE FUNCTIONS
-- ==================================================

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY daily_devotion_stats;
    REFRESH MATERIALIZED VIEW CONCURRENTLY user_engagement_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY weekly_activity_overview;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's reading streak
CREATE OR REPLACE FUNCTION get_user_reading_streak(user_uuid UUID)
RETURNS TABLE(
    current_streak INTEGER,
    longest_streak INTEGER,
    days_since_last_read INTEGER,
    next_achievement_target INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rs.current_streak,
        rs.longest_streak,
        COALESCE(EXTRACT(DAY FROM NOW() - rs.last_read_date)::INTEGER, 0) as days_since_last_read,
        CASE 
            WHEN rs.current_streak < 3 THEN 3
            WHEN rs.current_streak < 7 THEN 7
            WHEN rs.current_streak < 30 THEN 30
            WHEN rs.current_streak < 100 THEN 100
            ELSE ((rs.current_streak / 100) + 1) * 100
        END as next_achievement_target
    FROM reading_streaks rs
    WHERE rs.user_id = user_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to get trending prayer categories
CREATE OR REPLACE FUNCTION get_trending_prayer_categories(days_back INTEGER DEFAULT 7)
RETURNS TABLE(
    category TEXT,
    request_count BIGINT,
    prayer_count BIGINT,
    answered_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pr.category,
        COUNT(pr.id) as request_count,
        COALESCE(SUM(pr.prayer_count), 0) as prayer_count,
        COUNT(CASE WHEN pr.is_answered THEN 1 END) as answered_count
    FROM prayer_requests pr
    WHERE pr.created_at >= NOW() - INTERVAL '1 day' * days_back
        AND pr.is_public = true
    GROUP BY pr.category
    ORDER BY request_count DESC, prayer_count DESC;
END;
$$ LANGUAGE plpgsql;

-- ==================================================
-- PERFORMANCE MONITORING
-- ==================================================

-- Create table for query performance monitoring
CREATE TABLE IF NOT EXISTS query_performance_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query_type TEXT NOT NULL,
    execution_time_ms REAL NOT NULL,
    rows_affected INTEGER,
    user_id UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_query_performance_log_query_type ON query_performance_log(query_type);
CREATE INDEX idx_query_performance_log_created_at ON query_performance_log(created_at);
CREATE INDEX idx_query_performance_log_execution_time ON query_performance_log(execution_time_ms);

-- ==================================================
-- COMPLETION NOTIFICATION
-- ==================================================

DO $$
DECLARE
    index_count INTEGER;
    view_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND indexname LIKE 'idx_%';
    
    SELECT COUNT(*) INTO view_count
    FROM pg_matviews 
    WHERE schemaname = 'public';
    
    RAISE NOTICE 'Hong Kong Church PWA - Performance Optimization Complete!';
    RAISE NOTICE 'Created: % performance indexes', index_count;
    RAISE NOTICE 'Created: % materialized views for analytics', view_count;
    RAISE NOTICE 'Next Step: Execute 003_security_and_rls.sql';
END $$;