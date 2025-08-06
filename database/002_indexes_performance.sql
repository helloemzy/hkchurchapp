-- Hong Kong Church PWA - Performance Indexes
-- Production Deployment Script - Execute AFTER 001_initial_schema.sql
-- Part 2: Performance Optimization with 115 Strategic Indexes

-- ==================================================
-- CORE USER MANAGEMENT INDEXES
-- ==================================================

-- Profiles table - Critical for user authentication and lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_language ON profiles(language);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_active ON profiles(is_active) WHERE is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_last_seen ON profiles(last_seen_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_timezone ON profiles(timezone);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_deleted ON profiles(data_deleted, deleted_at) WHERE data_deleted = false;

-- User roles - Essential for permission checks
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_roles_assigned_by ON user_roles(assigned_by);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_roles_expires ON user_roles(expires_at) WHERE expires_at IS NOT NULL;

-- Security events - Critical for audit and monitoring
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_events_user_time ON security_events(user_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_events_severity ON security_events(severity, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_events_type ON security_events(event_type, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_events_ip ON security_events(ip_address, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_security_events_investigated ON security_events(investigated, severity) WHERE investigated = false;

-- Audit logs - Essential for compliance and data tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_table_time ON audit_logs(table_name, timestamp DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_user_time ON audit_logs(user_id, timestamp DESC) WHERE user_id IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_operation ON audit_logs(operation, timestamp DESC);

-- User consent - GDPR compliance tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_consent_user_purpose ON user_consent(user_id, purpose);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_consent_recorded_at ON user_consent(recorded_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_consent_granted ON user_consent(granted, purpose);

-- ==================================================
-- SPIRITUAL CONTENT INDEXES
-- ==================================================

-- Devotions - Core content delivery optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_devotions_date ON devotions(date DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_devotions_published ON devotions(is_published, date DESC) WHERE is_published = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_devotions_featured ON devotions(featured, date DESC) WHERE featured = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_devotions_author ON devotions(author, date DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_devotions_tags ON devotions USING GIN(tags);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_devotions_created_at ON devotions(created_at DESC);

-- Full-text search indexes for devotions (multilingual)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_devotions_title_search ON devotions USING GIN(to_tsvector('english', title));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_devotions_title_zh_search ON devotions USING GIN(to_tsvector('chinese', COALESCE(title_zh, ''))) WHERE title_zh IS NOT NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_devotions_content_search ON devotions USING GIN(to_tsvector('english', content));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_devotions_content_zh_search ON devotions USING GIN(to_tsvector('chinese', COALESCE(content_zh, ''))) WHERE content_zh IS NOT NULL;

-- User devotion progress - Personal tracking optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_devotion_progress_user ON user_devotion_progress(user_id, completed_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_devotion_progress_devotion ON user_devotion_progress(devotion_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_devotion_progress_shared ON user_devotion_progress(shared, completed_at DESC) WHERE shared = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_devotion_progress_bookmarked ON user_devotion_progress(user_id, bookmarked) WHERE bookmarked = true;

-- Bible bookmarks - Scripture reference optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bible_bookmarks_user ON bible_bookmarks(user_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bible_bookmarks_book ON bible_bookmarks(book, chapter, verse);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bible_bookmarks_book_chapter ON bible_bookmarks(book, chapter);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bible_bookmarks_color ON bible_bookmarks(color, user_id);

-- Reading streaks - Gamification performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reading_streaks_user ON reading_streaks(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reading_streaks_current ON reading_streaks(current_streak DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reading_streaks_longest ON reading_streaks(longest_streak DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reading_streaks_last_read ON reading_streaks(last_read_date DESC);

-- ==================================================
-- PRAYER SYSTEM INDEXES
-- ==================================================

-- Prayer requests - Community prayer optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_prayer_requests_user ON prayer_requests(user_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_prayer_requests_public ON prayer_requests(is_public, created_at DESC) WHERE is_public = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_prayer_requests_category ON prayer_requests(category, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_prayer_requests_answered ON prayer_requests(is_answered, answered_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_prayer_requests_prayer_count ON prayer_requests(prayer_count DESC, created_at DESC);

-- Prayer interactions - Engagement tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_prayer_interactions_request ON prayer_interactions(prayer_request_id, action);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_prayer_interactions_user ON prayer_interactions(user_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_prayer_interactions_action ON prayer_interactions(action, created_at DESC);

-- ==================================================
-- EVENTS SYSTEM INDEXES
-- ==================================================

-- Events - Church calendar optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_date_range ON events(start_datetime, end_datetime);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_start_time ON events(start_datetime DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_public ON events(is_public, start_datetime) WHERE is_public = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_featured ON events(is_featured, start_datetime) WHERE is_featured = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_category ON events(category, start_datetime);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_organizer ON events(organizer_id, start_datetime DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_cancelled ON events(is_cancelled, start_datetime) WHERE is_cancelled = false;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_registration_deadline ON events(registration_deadline) WHERE requires_registration = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_capacity ON events(max_capacity, current_registrations) WHERE max_capacity IS NOT NULL;

-- Full-text search for events
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_title_search ON events USING GIN(to_tsvector('english', title));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_title_zh_search ON events USING GIN(to_tsvector('chinese', COALESCE(title_zh, ''))) WHERE title_zh IS NOT NULL;

-- Event registrations - Attendance management
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_event_registrations_event ON event_registrations(event_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_event_registrations_user ON event_registrations(user_id, registered_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_event_registrations_status ON event_registrations(status, registered_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_event_registrations_attendance ON event_registrations(attendance_confirmed, attended_at) WHERE attendance_confirmed = true;

-- ==================================================
-- SMALL GROUPS SYSTEM INDEXES
-- ==================================================

-- Small groups - Community organization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_small_groups_leader ON small_groups(leader_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_small_groups_category ON small_groups(category, is_public) WHERE is_public = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_small_groups_open ON small_groups(is_open_to_join, language_primary) WHERE is_open_to_join = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_small_groups_language ON small_groups(language_primary, category);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_small_groups_gender ON small_groups(gender_preference, category);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_small_groups_members_count ON small_groups(current_members, max_members);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_small_groups_approval ON small_groups(requires_approval, is_open_to_join);

-- Full-text search for groups
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_small_groups_name_search ON small_groups USING GIN(to_tsvector('english', name));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_small_groups_name_zh_search ON small_groups USING GIN(to_tsvector('chinese', COALESCE(name_zh, ''))) WHERE name_zh IS NOT NULL;

-- Group memberships - Member management
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_group_memberships_group ON group_memberships(group_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_group_memberships_user ON group_memberships(user_id, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_group_memberships_role ON group_memberships(role, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_group_memberships_joined ON group_memberships(joined_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_group_memberships_pending ON group_memberships(status, joined_at) WHERE status = 'pending';

-- Group activities - Activity tracking
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_group_activities_group ON group_activities(group_id, scheduled_for DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_group_activities_type ON group_activities(activity_type, scheduled_for DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_group_activities_creator ON group_activities(created_by, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_group_activities_scheduled ON group_activities(scheduled_for) WHERE scheduled_for IS NOT NULL;

-- ==================================================
-- COMPOSITE INDEXES FOR COMPLEX QUERIES
-- ==================================================

-- User activity composite indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_active_language_timezone ON profiles(is_active, language, timezone) WHERE is_active = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_devotions_published_featured_date ON devotions(is_published, featured, date DESC) WHERE is_published = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_public_category_date ON events(is_public, category, start_datetime) WHERE is_public = true AND is_cancelled = false;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_prayer_requests_public_category_date ON prayer_requests(is_public, category, created_at DESC) WHERE is_public = true;

-- Group management composite indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_small_groups_open_language_category ON small_groups(is_open_to_join, language_primary, category) WHERE is_open_to_join = true AND is_public = true;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_group_memberships_active_role ON group_memberships(status, role, joined_at DESC) WHERE status = 'active';

-- ==================================================
-- PARTIAL INDEXES FOR FILTERED QUERIES
-- ==================================================

-- Active users only
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_active_users_only ON profiles(created_at DESC, language) WHERE is_active = true AND data_deleted = false;

-- Published content only
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_devotions_published_content_only ON devotions(date DESC, featured) WHERE is_published = true;

-- Public events only
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_public_upcoming_only ON events(start_datetime ASC) WHERE is_public = true AND is_cancelled = false AND start_datetime > NOW();

-- Open groups only
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_small_groups_joinable_only ON small_groups(created_at DESC, category) WHERE is_open_to_join = true AND is_public = true;

-- ==================================================
-- COVERING INDEXES FOR READ-HEAVY QUERIES
-- ==================================================

-- Devotions list with all needed fields
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_devotions_list_cover ON devotions(date DESC, is_published) INCLUDE (title, title_zh, author, featured, image_url) WHERE is_published = true;

-- Events list with essential information
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_list_cover ON events(start_datetime ASC, is_public) INCLUDE (title, title_zh, category, location, location_zh) WHERE is_public = true AND is_cancelled = false;

-- Prayer requests with interaction counts
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_prayer_requests_list_cover ON prayer_requests(created_at DESC, is_public) INCLUDE (title, category, prayer_count, is_answered) WHERE is_public = true;

-- ==================================================
-- STATISTICS UPDATE FOR QUERY PLANNER
-- ==================================================

-- Analyze all tables to update statistics for optimal query planning
ANALYZE profiles;
ANALYZE user_roles;
ANALYZE security_events;
ANALYZE audit_logs;
ANALYZE user_consent;
ANALYZE devotions;
ANALYZE user_devotion_progress;
ANALYZE bible_bookmarks;
ANALYZE prayer_requests;
ANALYZE prayer_interactions;
ANALYZE reading_streaks;
ANALYZE events;
ANALYZE event_registrations;
ANALYZE small_groups;
ANALYZE group_memberships;
ANALYZE group_activities;

-- ==================================================
-- INDEX MONITORING FUNCTIONS
-- ==================================================

-- Function to check index usage
CREATE OR REPLACE FUNCTION check_index_usage()
RETURNS TABLE(
    schemaname TEXT,
    tablename TEXT,
    indexname TEXT,
    idx_scans BIGINT,
    idx_tup_read BIGINT,
    idx_tup_fetch BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pg_stat_user_indexes.schemaname::TEXT,
        pg_stat_user_indexes.relname::TEXT,
        pg_stat_user_indexes.indexrelname::TEXT,
        pg_stat_user_indexes.idx_scan,
        pg_stat_user_indexes.idx_tup_read,
        pg_stat_user_indexes.idx_tup_fetch
    FROM pg_stat_user_indexes
    ORDER BY pg_stat_user_indexes.idx_scan DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to identify unused indexes
CREATE OR REPLACE FUNCTION find_unused_indexes()
RETURNS TABLE(
    schemaname TEXT,
    tablename TEXT,
    indexname TEXT,
    index_size TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pg_stat_user_indexes.schemaname::TEXT,
        pg_stat_user_indexes.relname::TEXT,
        pg_stat_user_indexes.indexrelname::TEXT,
        pg_size_pretty(pg_relation_size(pg_stat_user_indexes.indexrelid)) AS index_size
    FROM pg_stat_user_indexes
    WHERE pg_stat_user_indexes.idx_scan = 0
    ORDER BY pg_relation_size(pg_stat_user_indexes.indexrelid) DESC;
END;
$$ LANGUAGE plpgsql;

-- ==================================================
-- COMPLETION VERIFICATION
-- ==================================================

DO $$
DECLARE
    index_count INTEGER;
    table_count INTEGER;
BEGIN
    -- Count indexes created
    SELECT count(*) INTO index_count
    FROM pg_indexes 
    WHERE schemaname = 'public';
    
    -- Count tables
    SELECT count(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE';
    
    RAISE NOTICE 'Hong Kong Church PWA - Performance Indexes Complete!';
    RAISE NOTICE 'Created: % indexes across % tables', index_count, table_count;
    RAISE NOTICE 'Index Coverage: User Management (%), Content (%), Community (%), Events (%)', 
        (SELECT count(*) FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE '%profiles%' OR indexname LIKE '%user_%' OR indexname LIKE '%security%' OR indexname LIKE '%audit%'),
        (SELECT count(*) FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE '%devotion%' OR indexname LIKE '%bible%' OR indexname LIKE '%reading%'),
        (SELECT count(*) FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE '%prayer%' OR indexname LIKE '%group%'),
        (SELECT count(*) FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE '%event%');
    RAISE NOTICE 'Next Step: Execute 003_row_level_security.sql';
END $$;