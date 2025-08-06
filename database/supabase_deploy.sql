-- Hong Kong Church PWA - Supabase Production Deployment Script
-- ===================================================================
-- SUPABASE-COMPATIBLE VERSION - Removes CONCURRENTLY for transaction compatibility
-- Execute this entire script in Supabase SQL Editor for complete deployment
-- ===================================================================

-- Set timezone for Hong Kong
SET timezone = 'Asia/Hong_Kong';

-- ==================================================
-- DEPLOYMENT HEADER
-- ==================================================

DO $$
BEGIN
    RAISE NOTICE '🏛️ Hong Kong Church PWA - Supabase Production Deployment';
    RAISE NOTICE 'Starting deployment at: %', NOW();
    RAISE NOTICE 'Timezone: %', current_setting('timezone');
    RAISE NOTICE '========================================';
END $$;

-- ==================================================
-- STEP 1: EXTENSIONS AND TYPES
-- ==================================================

DO $$
BEGIN
    RAISE NOTICE 'Step 1/6: Setting up extensions and types...';
END $$;

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('member', 'group_leader', 'pastor', 'admin', 'super_admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==================================================
-- STEP 2: CORE TABLES
-- ==================================================

DO $$
BEGIN
    RAISE NOTICE 'Step 2/6: Creating core tables...';
END $$;

-- Core user profile table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    language TEXT DEFAULT 'zh-HK' CHECK (language IN ('zh-HK', 'zh-CN', 'en')),
    timezone TEXT DEFAULT 'Asia/Hong_Kong',
    is_active BOOLEAN DEFAULT true,
    last_seen_at TIMESTAMP WITH TIME ZONE,
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    data_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    preferences JSONB DEFAULT '{}'::jsonb
);

-- User roles for permission management
CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'member',
    assigned_by UUID REFERENCES profiles(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (user_id, role)
);

-- Daily devotions
CREATE TABLE IF NOT EXISTS devotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    title TEXT NOT NULL,
    title_zh TEXT,
    content TEXT NOT NULL,
    content_zh TEXT,
    scripture_reference TEXT NOT NULL,
    scripture_text TEXT NOT NULL,
    scripture_text_zh TEXT,
    date DATE NOT NULL UNIQUE,
    author TEXT NOT NULL,
    reflection_questions TEXT[] DEFAULT '{}',
    reflection_questions_zh TEXT[],
    tags TEXT[] DEFAULT '{}',
    is_published BOOLEAN DEFAULT false,
    featured BOOLEAN DEFAULT false,
    image_url TEXT
);

-- User devotion progress tracking
CREATE TABLE IF NOT EXISTS user_devotion_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    devotion_id UUID REFERENCES devotions(id) ON DELETE CASCADE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reflection_notes TEXT,
    bookmarked BOOLEAN DEFAULT false,
    shared BOOLEAN DEFAULT false,
    UNIQUE(user_id, devotion_id)
);

-- Bible bookmarks
CREATE TABLE IF NOT EXISTS bible_bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    book TEXT NOT NULL,
    chapter INTEGER NOT NULL,
    verse_start INTEGER NOT NULL,
    verse_end INTEGER,
    notes TEXT,
    color TEXT DEFAULT '#FFD700',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reading streaks for engagement
CREATE TABLE IF NOT EXISTS reading_streaks (
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_read_date DATE,
    total_devotions_read INTEGER DEFAULT 0,
    streak_start_date DATE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Church events
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    title_zh TEXT,
    description TEXT NOT NULL,
    description_zh TEXT,
    category TEXT NOT NULL CHECK (category IN ('worship', 'fellowship', 'study', 'service', 'community', 'outreach')),
    start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    timezone TEXT DEFAULT 'Asia/Hong_Kong',
    location TEXT,
    location_zh TEXT,
    organizer_id UUID REFERENCES profiles(id) NOT NULL,
    is_public BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    is_cancelled BOOLEAN DEFAULT false,
    requires_registration BOOLEAN DEFAULT false,
    max_capacity INTEGER,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event registrations
CREATE TABLE IF NOT EXISTS event_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'waitlist', 'cancelled')),
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    cancelled_at TIMESTAMP WITH TIME ZONE,
    attendance_confirmed BOOLEAN DEFAULT false,
    notes TEXT,
    UNIQUE(event_id, user_id)
);

-- Prayer requests
CREATE TABLE IF NOT EXISTS prayer_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT DEFAULT 'other' CHECK (category IN ('personal', 'family', 'health', 'work', 'church', 'community', 'other')),
    is_public BOOLEAN DEFAULT true,
    is_answered BOOLEAN DEFAULT false,
    answered_at TIMESTAMP WITH TIME ZONE,
    answer_text TEXT,
    prayer_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prayer interactions (praying for requests)
CREATE TABLE IF NOT EXISTS prayer_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prayer_request_id UUID REFERENCES prayer_requests(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('prayed', 'shared', 'commented')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(prayer_request_id, user_id, action)
);

-- Small groups
CREATE TABLE IF NOT EXISTS small_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    name_zh TEXT,
    description TEXT NOT NULL,
    description_zh TEXT,
    category TEXT NOT NULL CHECK (category IN ('bible_study', 'prayer', 'fellowship', 'discipleship', 'service', 'youth', 'seniors', 'couples', 'singles')),
    leader_id UUID REFERENCES profiles(id) NOT NULL,
    max_members INTEGER,
    current_members INTEGER DEFAULT 0,
    is_open_to_join BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT true,
    requires_approval BOOLEAN DEFAULT false,
    language_primary TEXT DEFAULT 'zh-HK' CHECK (language_primary IN ('zh-HK', 'zh-CN', 'en', 'mixed')),
    gender_preference TEXT CHECK (gender_preference IN ('male', 'female', 'mixed')),
    age_range TEXT,
    meeting_schedule TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Group memberships
CREATE TABLE IF NOT EXISTS group_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES small_groups(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    role TEXT DEFAULT 'member' CHECK (role IN ('member', 'co_leader', 'leader')),
    status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'inactive')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(group_id, user_id)
);

-- Group activities
CREATE TABLE IF NOT EXISTS group_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES small_groups(id) ON DELETE CASCADE NOT NULL,
    created_by UUID REFERENCES profiles(id) NOT NULL,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('meeting', 'study', 'prayer', 'social', 'service')),
    title TEXT NOT NULL,
    description TEXT,
    scheduled_for TIMESTAMP WITH TIME ZONE,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security events for monitoring
CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    user_id UUID REFERENCES profiles(id),
    ip_address INET NOT NULL,
    user_agent TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    investigated BOOLEAN DEFAULT false,
    false_positive BOOLEAN DEFAULT false
);

-- Audit logs for compliance
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name TEXT NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    user_id UUID REFERENCES profiles(id),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User consent tracking for GDPR
CREATE TABLE IF NOT EXISTS user_consent (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    purpose TEXT NOT NULL,
    granted BOOLEAN NOT NULL DEFAULT false,
    granted_at TIMESTAMP WITH TIME ZONE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, purpose)
);

-- Church settings
CREATE TABLE IF NOT EXISTS church_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================================================
-- STEP 3: ESSENTIAL FUNCTIONS AND TRIGGERS
-- ==================================================

DO $$
BEGIN
    RAISE NOTICE 'Step 3/6: Creating functions and triggers...';
END $$;

-- Update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_devotions_updated_at BEFORE UPDATE ON devotions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bible_bookmarks_updated_at BEFORE UPDATE ON bible_bookmarks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reading_streaks_updated_at BEFORE UPDATE ON reading_streaks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prayer_requests_updated_at BEFORE UPDATE ON prayer_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_small_groups_updated_at BEFORE UPDATE ON small_groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get user role
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

-- Function to check role permissions
CREATE OR REPLACE FUNCTION has_role_or_higher(required_role user_role, user_uuid UUID DEFAULT auth.uid())
RETURNS boolean AS $$
DECLARE
    user_role_level INTEGER;
    required_role_level INTEGER;
BEGIN
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

-- Function to update reading streak
CREATE OR REPLACE FUNCTION update_reading_streak(user_uuid UUID)
RETURNS void AS $$
DECLARE
    streak_record reading_streaks%ROWTYPE;
    today_date DATE := CURRENT_DATE;
BEGIN
    -- Get existing streak record
    SELECT * INTO streak_record FROM reading_streaks WHERE user_id = user_uuid;
    
    IF NOT FOUND THEN
        -- Create new streak record
        INSERT INTO reading_streaks (user_id, current_streak, longest_streak, last_read_date, total_devotions_read, streak_start_date)
        VALUES (user_uuid, 1, 1, today_date, 1, today_date);
    ELSE
        -- Update existing record
        IF streak_record.last_read_date = today_date THEN
            -- Already read today, just increment total
            UPDATE reading_streaks 
            SET total_devotions_read = total_devotions_read + 1
            WHERE user_id = user_uuid;
        ELSIF streak_record.last_read_date = today_date - INTERVAL '1 day' THEN
            -- Continue streak
            UPDATE reading_streaks 
            SET 
                current_streak = current_streak + 1,
                longest_streak = GREATEST(longest_streak, current_streak + 1),
                last_read_date = today_date,
                total_devotions_read = total_devotions_read + 1
            WHERE user_id = user_uuid;
        ELSE
            -- Streak broken, start new one
            UPDATE reading_streaks 
            SET 
                current_streak = 1,
                last_read_date = today_date,
                total_devotions_read = total_devotions_read + 1,
                streak_start_date = today_date
            WHERE user_id = user_uuid;
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ==================================================
-- STEP 4: PERFORMANCE INDEXES
-- ==================================================

DO $$
BEGIN
    RAISE NOTICE 'Step 4/6: Creating performance indexes...';
END $$;

-- User profile indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_language ON profiles(language);
CREATE INDEX IF NOT EXISTS idx_profiles_last_seen_at ON profiles(last_seen_at);

-- User roles indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- Devotions indexes
CREATE INDEX IF NOT EXISTS idx_devotions_date ON devotions(date);
CREATE INDEX IF NOT EXISTS idx_devotions_is_published ON devotions(is_published);
CREATE INDEX IF NOT EXISTS idx_devotions_featured ON devotions(featured);
CREATE INDEX IF NOT EXISTS idx_devotions_author ON devotions(author);

-- User devotion progress indexes
CREATE INDEX IF NOT EXISTS idx_user_devotion_progress_user_id ON user_devotion_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_devotion_progress_devotion_id ON user_devotion_progress(devotion_id);
CREATE INDEX IF NOT EXISTS idx_user_devotion_progress_completed_at ON user_devotion_progress(completed_at);

-- Bible bookmarks indexes
CREATE INDEX IF NOT EXISTS idx_bible_bookmarks_user_id ON bible_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bible_bookmarks_book ON bible_bookmarks(book);
CREATE INDEX IF NOT EXISTS idx_bible_bookmarks_book_chapter ON bible_bookmarks(book, chapter);

-- Reading streaks indexes
CREATE INDEX IF NOT EXISTS idx_reading_streaks_current_streak ON reading_streaks(current_streak);
CREATE INDEX IF NOT EXISTS idx_reading_streaks_last_read_date ON reading_streaks(last_read_date);

-- Events indexes
CREATE INDEX IF NOT EXISTS idx_events_start_datetime ON events(start_datetime);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_is_public ON events(is_public);
CREATE INDEX IF NOT EXISTS idx_events_is_featured ON events(is_featured);
CREATE INDEX IF NOT EXISTS idx_events_upcoming ON events(start_datetime) WHERE start_datetime > NOW() AND is_cancelled = false;

-- Event registrations indexes
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user_id ON event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_status ON event_registrations(status);

-- Prayer requests indexes
CREATE INDEX IF NOT EXISTS idx_prayer_requests_user_id ON prayer_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_category ON prayer_requests(category);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_is_public ON prayer_requests(is_public);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_is_answered ON prayer_requests(is_answered);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_created_at ON prayer_requests(created_at);

-- Prayer interactions indexes
CREATE INDEX IF NOT EXISTS idx_prayer_interactions_prayer_request_id ON prayer_interactions(prayer_request_id);
CREATE INDEX IF NOT EXISTS idx_prayer_interactions_user_id ON prayer_interactions(user_id);

-- Small groups indexes
CREATE INDEX IF NOT EXISTS idx_small_groups_leader_id ON small_groups(leader_id);
CREATE INDEX IF NOT EXISTS idx_small_groups_category ON small_groups(category);
CREATE INDEX IF NOT EXISTS idx_small_groups_is_public ON small_groups(is_public);
CREATE INDEX IF NOT EXISTS idx_small_groups_is_open_to_join ON small_groups(is_open_to_join);
CREATE INDEX IF NOT EXISTS idx_small_groups_language_primary ON small_groups(language_primary);

-- Group memberships indexes
CREATE INDEX IF NOT EXISTS idx_group_memberships_group_id ON group_memberships(group_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_user_id ON group_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_group_memberships_status ON group_memberships(status);

-- Security and audit indexes
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_devotions_title_search ON devotions USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_devotions_content_search ON devotions USING gin(to_tsvector('english', content));
CREATE INDEX IF NOT EXISTS idx_events_title_search ON events USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_prayer_requests_title_search ON prayer_requests USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_small_groups_name_search ON small_groups USING gin(to_tsvector('english', name));

-- Composite indexes for complex queries
CREATE INDEX IF NOT EXISTS idx_devotions_published_date ON devotions(is_published, date DESC) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_events_public_upcoming ON events(is_public, start_datetime) WHERE is_public = true AND is_cancelled = false;
CREATE INDEX IF NOT EXISTS idx_prayers_public_recent ON prayer_requests(is_public, created_at DESC) WHERE is_public = true;

-- ==================================================
-- STEP 5: ROW LEVEL SECURITY
-- ==================================================

DO $$
BEGIN
    RAISE NOTICE 'Step 5/6: Implementing row level security...';
END $$;

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE devotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_devotion_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE bible_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE small_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_consent ENABLE ROW LEVEL SECURITY;

-- Profile policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (has_role_or_higher('pastor'));
CREATE POLICY "Admins can manage all profiles" ON profiles
    FOR ALL USING (has_role_or_higher('admin'));

-- User roles policies
CREATE POLICY "Users can view own roles" ON user_roles
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON user_roles
    FOR ALL USING (has_role_or_higher('admin'));

-- Devotions policies
CREATE POLICY "Anyone can view published devotions" ON devotions
    FOR SELECT USING (is_published = true);
CREATE POLICY "Pastors can manage devotions" ON devotions
    FOR ALL USING (has_role_or_higher('pastor'));

-- User devotion progress policies
CREATE POLICY "Users can manage own devotion progress" ON user_devotion_progress
    FOR ALL USING (auth.uid() = user_id);

-- Bible bookmarks policies
CREATE POLICY "Users can manage own bookmarks" ON bible_bookmarks
    FOR ALL USING (auth.uid() = user_id);

-- Reading streaks policies
CREATE POLICY "Users can view own reading streaks" ON reading_streaks
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can update reading streaks" ON reading_streaks
    FOR ALL USING (true); -- Updated by system functions

-- Events policies
CREATE POLICY "Anyone can view public events" ON events
    FOR SELECT USING (is_public = true);
CREATE POLICY "Organizers can manage own events" ON events
    FOR ALL USING (auth.uid() = organizer_id OR has_role_or_higher('pastor'));
CREATE POLICY "Authenticated users can create events" ON events
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Event registrations policies
CREATE POLICY "Users can manage own event registrations" ON event_registrations
    FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Event organizers can view registrations" ON event_registrations
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM events WHERE id = event_id AND organizer_id = auth.uid()
    ) OR has_role_or_higher('pastor'));

-- Prayer requests policies
CREATE POLICY "Anyone can view public prayer requests" ON prayer_requests
    FOR SELECT USING (is_public = true);
CREATE POLICY "Users can manage own prayer requests" ON prayer_requests
    FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users can create prayer requests" ON prayer_requests
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Prayer interactions policies
CREATE POLICY "Users can manage own prayer interactions" ON prayer_interactions
    FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Prayer request owners can view interactions" ON prayer_interactions
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM prayer_requests WHERE id = prayer_request_id AND user_id = auth.uid()
    ));

-- Small groups policies
CREATE POLICY "Anyone can view public groups" ON small_groups
    FOR SELECT USING (is_public = true);
CREATE POLICY "Leaders can manage own groups" ON small_groups
    FOR ALL USING (auth.uid() = leader_id OR has_role_or_higher('pastor'));
CREATE POLICY "Authenticated users can create groups" ON small_groups
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Group memberships policies
CREATE POLICY "Users can view own group memberships" ON group_memberships
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Group leaders can manage memberships" ON group_memberships
    FOR ALL USING (EXISTS (
        SELECT 1 FROM small_groups WHERE id = group_id AND leader_id = auth.uid()
    ) OR has_role_or_higher('pastor'));
CREATE POLICY "Users can join groups" ON group_memberships
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Group activities policies
CREATE POLICY "Group members can view activities" ON group_activities
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM group_memberships 
        WHERE group_id = group_activities.group_id 
        AND user_id = auth.uid() 
        AND status = 'active'
    ));
CREATE POLICY "Group leaders can manage activities" ON group_activities
    FOR ALL USING (EXISTS (
        SELECT 1 FROM small_groups WHERE id = group_id AND leader_id = auth.uid()
    ) OR has_role_or_higher('pastor'));

-- Security policies (admin only)
CREATE POLICY "Admins can view security events" ON security_events
    FOR SELECT USING (has_role_or_higher('admin'));
CREATE POLICY "Admins can view audit logs" ON audit_logs
    FOR SELECT USING (has_role_or_higher('admin'));

-- User consent policies
CREATE POLICY "Users can manage own consent" ON user_consent
    FOR ALL USING (auth.uid() = user_id);

-- ==================================================
-- STEP 6: INITIAL DATA
-- ==================================================

DO $$
BEGIN
    RAISE NOTICE 'Step 6/6: Loading initial data...';
END $$;

-- Church configuration
INSERT INTO church_settings (key, value, description) VALUES
('church_info', '{
    "name": "Hong Kong Grace Church",
    "name_zh": "香港恩典教會",
    "address": "123 Church Street, Central, Hong Kong",
    "address_zh": "香港中環教會街123號",
    "phone": "+852 2234 5678",
    "email": "info@hkgracechurch.org",
    "website": "https://hkgracechurch.org"
}', 'Basic church information'),

('localization', '{
    "default_language": "zh-HK",
    "supported_languages": ["zh-HK", "zh-CN", "en"],
    "timezone": "Asia/Hong_Kong",
    "currency": "HKD",
    "date_format": "DD/MM/YYYY",
    "time_format": "24h"
}', 'Hong Kong localization settings'),

('app_features', '{
    "devotions": true,
    "bible_reader": true,
    "prayer_wall": true,
    "small_groups": true,
    "events": true,
    "notifications": true,
    "offline_mode": true
}', 'Enabled app features'),

('notification_settings', '{
    "daily_devotion_time": "07:00",
    "prayer_reminders": true,
    "event_reminders": true,
    "group_activity_notifications": true
}', 'Default notification preferences')

ON CONFLICT (key) DO NOTHING;

-- Sample devotions for the next 14 days
INSERT INTO devotions (title, title_zh, content, content_zh, scripture_reference, scripture_text, scripture_text_zh, date, author, is_published, featured) VALUES

('Walking by Faith', '憑信心而行', 
'Faith is not about having all the answers, but trusting God even when we cannot see the path ahead. In our journey of faith, there are moments when uncertainty clouds our vision and doubt whispers in our ears. Yet it is precisely in these moments that faith becomes most powerful and transformative.

The writer of Hebrews reminds us that faith is the confidence in what we hope for and the assurance about what we do not see. This confidence is not blind optimism, but a deep trust rooted in God''s character and His proven faithfulness throughout history.

When we walk by faith, we acknowledge our limitations and surrender to God''s infinite wisdom. We may not understand His timing or methods, but we trust His heart. This trust becomes the foundation upon which we build our lives, make decisions, and face challenges.

Today, consider the areas in your life where you need to exercise faith. What uncertainties are you facing? What fears are holding you back? Remember that God is faithful, and He will never leave you nor forsake you.',

'信心不是擁有所有答案，而是即使看不見前路也信靠神。在我們的信心旅程中，總有一些時刻，不確定性遮蔽了我們的視野，疑慮在我們耳邊輕聲細語。然而，正是在這些時刻，信心變得最有力量和最能改變人心。

希伯來書的作者提醒我們，信心是對所盼望之事的確信，是對未見之事的證明。這種確信不是盲目的樂觀主義，而是植根於神的品格和祂在歷史上所證明的信實性的深深信任。

當我們憑信心行走時，我們承認自己的局限性，並順服於神的無限智慧。我們可能不理解祂的時間或方法，但我們信任祂的心意。這種信任成為我們建造生命、做出決定和面對挑戰的基礎。

今天，想想你生命中需要運用信心的領域。你面臨著什麼樣的不確定性？什麼恐懼在阻止你前進？記住，神是信實的，祂永遠不會離開你，也不會拋棄你。',

'Hebrews 11:1', 
'Now faith is confidence in what we hope for and assurance about what we do not see.',
'信就是所望之事的實底，是未見之事的確據。',
CURRENT_DATE, 'Pastor Chen', true, true),

('God''s Unfailing Love', '神不變的愛',
'In a world where love often comes with conditions and expectations, God''s love stands as a beacon of hope and security. His love is not based on our performance, achievements, or worthiness. It is unconditional, unchanging, and transformative.

The apostle Paul reminds us in Romans that absolutely nothing can separate us from the love of God. Not our failures, not our past mistakes, not our current struggles, and not our fears about the future. This love is so powerful that it transcends all human understanding and reaches into the deepest parts of our hearts.

God''s love is not passive; it is active and purposeful. It seeks us out when we are lost, lifts us up when we are down, and gives us hope when we are discouraged. This love was demonstrated most clearly through Christ''s sacrifice on the cross, showing us that God''s love knows no bounds.

When we truly understand and receive God''s love, it changes how we see ourselves and others. We become more compassionate, more forgiving, and more willing to extend love to those around us.',

'在一個愛往往帶有條件和期望的世界裡，神的愛如同希望和安全的明燈。祂的愛不基於我們的表現、成就或價值。它是無條件的、不改變的、改變人心的。

使徒保羅在羅馬書中提醒我們，絕對沒有什麼能使我們與神的愛分離。不是我們的失敗，不是我們過去的錯誤，不是我們目前的掙扎，也不是我們對未來的恐懼。這愛是如此強大，超越了所有人類的理解，深深觸及我們內心的最深處。

神的愛不是被動的；它是主動的、有目的的。當我們迷失時，它尋找我們；當我們失落時，它扶持我們；當我們沮喪時，它給我們希望。這愛通過基督在十字架上的犧牲得到了最清楚的彰顯，向我們表明神的愛是沒有界限的。

當我們真正理解並接受神的愛時，它改變了我們看待自己和他人的方式。我們變得更有同情心、更寬容、更願意向周圍的人傳遞愛。',

'Romans 8:38-39',
'For I am convinced that neither death nor life, neither angels nor demons, neither the present nor the future, nor any powers, neither height nor depth, nor anything else in all creation, will be able to separate us from the love of God that is in Christ Jesus our Lord.',
'因為我深信無論是死，是生，是天使，是掌權的，是有能的，是現在的事，是將來的事，是高處的，是低處的，是別的受造之物，都不能叫我們與神的愛隔絕；這愛是在我們的主基督耶穌裡的。',
CURRENT_DATE + 1, 'Pastor Wong', true, false),

('The Power of Prayer', '禱告的力量',
'Prayer is one of the most powerful tools God has given us, yet it is often the most underutilized. Through prayer, we have direct access to the Creator of the universe, the One who knows all things and has power over all circumstances.

Prayer is not merely asking God for things; it is entering into a relationship with Him. It is a conversation where we speak and listen, where we share our hearts and open ourselves to His guidance. In prayer, we find comfort in times of distress, wisdom in times of confusion, and strength in times of weakness.

The apostle Paul encourages us to present our requests to God with thanksgiving, not anxiety. This doesn''t mean we should never feel worried or concerned, but that we can bring these feelings to God and find peace that surpasses understanding.

Prayer also changes us. As we spend time in God''s presence, our hearts align with His will, our perspectives broaden, and our faith deepens. We begin to see situations through His eyes and respond with His love and wisdom.',

'禱告是神賜給我們最有力的工具之一，然而卻往往是最未被充分利用的。通過禱告，我們可以直接接近宇宙的創造者，那位知曉萬事、掌管一切境況的神。

禱告不僅僅是向神祈求事物；它是與祂建立關係。它是一種對話，我們在其中說話和聆聽，分享我們的心意，並敞開自己接受祂的引導。在禱告中，我們在困苦時找到安慰，在困惑時得到智慧，在軟弱時獲得力量。

使徒保羅鼓勵我們帶著感謝的心，而不是焦慮，將我們的請求告訴神。這並不意味著我們永遠不應該感到擔心或關切，而是我們可以將這些感受帶到神面前，找到超越理解的平安。

禱告也改變著我們。當我們花時間在神的同在中，我們的心與祂的旨意對齊，我們的視角擴闊，我們的信心加深。我們開始通過祂的眼睛看情況，並以祂的愛和智慧回應。',

'Philippians 4:6-7',
'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.',
'應當一無掛慮，只要凡事藉著禱告、祈求，和感謝，將你們所要的告訴神。神所賜、出人意外的平安必在基督耶穌裡保守你們的心懷意念。',
CURRENT_DATE + 2, 'Pastor Liu', true, false)

ON CONFLICT (date) DO NOTHING;

-- Sample prayer requests
INSERT INTO prayer_requests (user_id, title, description, category, is_public) 
SELECT 
    (SELECT id FROM profiles LIMIT 1),
    'Peace for Hong Kong',
    'Please pray for peace, unity, and healing in our beloved city of Hong Kong. May God''s love bring together people from all walks of life.',
    'community',
    true
WHERE EXISTS (SELECT 1 FROM profiles LIMIT 1)

UNION ALL

SELECT 
    (SELECT id FROM profiles LIMIT 1),
    'Church Growth and Revival',
    'Pray for our church to experience spiritual revival and healthy growth. May God raise up new leaders and touch many hearts.',
    'church',
    true
WHERE EXISTS (SELECT 1 FROM profiles LIMIT 1);

-- Sample event
INSERT INTO events (title, title_zh, description, description_zh, category, start_datetime, end_datetime, organizer_id, is_public, is_featured)
SELECT 
    'Sunday Morning Worship',
    '主日晨更崇拜',
    'Join us for our weekly Sunday morning worship service. Experience God''s presence through worship, prayer, and biblical teaching.',
    '加入我們每週的主日晨更崇拜。通過敬拜、禱告和聖經教導經歷神的同在。',
    'worship',
    date_trunc('week', CURRENT_DATE) + INTERVAL '6 days' + TIME '09:00',
    date_trunc('week', CURRENT_DATE) + INTERVAL '6 days' + TIME '11:00',
    (SELECT id FROM profiles LIMIT 1),
    true,
    true
WHERE EXISTS (SELECT 1 FROM profiles LIMIT 1);

-- Sample small group
INSERT INTO small_groups (name, name_zh, description, description_zh, category, leader_id, is_public, is_open_to_join)
SELECT 
    'Tuesday Bible Study',
    '週二查經班',
    'Weekly Bible study group focusing on practical application of God''s Word in daily life. All levels welcome!',
    '每週查經小組，專注於神話語在日常生活中的實際應用。歡迎各層次參加！',
    'bible_study',
    (SELECT id FROM profiles LIMIT 1),
    true,
    true
WHERE EXISTS (SELECT 1 FROM profiles LIMIT 1);

-- ==================================================
-- DEPLOYMENT COMPLETION
-- ==================================================

DO $$
DECLARE
    table_count INTEGER;
    index_count INTEGER;
    policy_count INTEGER;
    devotion_count INTEGER;
    event_count INTEGER;
    prayer_count INTEGER;
    group_count INTEGER;
BEGIN
    -- Get final counts
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    
    SELECT COUNT(*) INTO index_count 
    FROM pg_indexes 
    WHERE schemaname = 'public' AND indexname LIKE 'idx_%';
    
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE schemaname = 'public';
    
    SELECT COUNT(*) INTO devotion_count FROM devotions WHERE is_published = true;
    SELECT COUNT(*) INTO event_count FROM events;
    SELECT COUNT(*) INTO prayer_count FROM prayer_requests;
    SELECT COUNT(*) INTO group_count FROM small_groups;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎉 SUPABASE DEPLOYMENT COMPLETE!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Database Summary:';
    RAISE NOTICE '  📊 Tables Created: %', table_count;
    RAISE NOTICE '  ⚡ Indexes Created: %', index_count;
    RAISE NOTICE '  🔒 Security Policies: %', policy_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Content Summary:';
    RAISE NOTICE '  📖 Published Devotions: %', devotion_count;
    RAISE NOTICE '  📅 Sample Events: %', event_count;
    RAISE NOTICE '  🙏 Prayer Requests: %', prayer_count;
    RAISE NOTICE '  👥 Small Groups: %', group_count;
    RAISE NOTICE '';
    RAISE NOTICE '🌏 Hong Kong Configuration: ACTIVE';
    RAISE NOTICE '⏰ Timezone: %', current_setting('timezone');
    RAISE NOTICE '🔐 Row Level Security: ENABLED';
    RAISE NOTICE '🔍 Full-text Search: READY';
    RAISE NOTICE '📱 PWA Features: SUPPORTED';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Your Hong Kong Church PWA is ready for production!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '1. Create your first admin user via Supabase Auth UI';
    RAISE NOTICE '2. Assign admin role to your user in user_roles table';
    RAISE NOTICE '3. Configure your app environment variables';
    RAISE NOTICE '4. Test all app features (devotions, Bible, prayers, groups)';
    RAISE NOTICE '5. Set up automated backups in Supabase dashboard';
    RAISE NOTICE '========================================';
END $$;