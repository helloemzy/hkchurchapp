-- Hong Kong Church PWA - Quick Production Deployment Script
-- This script combines all deployment files for single execution
-- Execute this in Supabase SQL Editor for complete deployment

-- ==================================================
-- DEPLOYMENT HEADER
-- ==================================================

DO $$
BEGIN
    RAISE NOTICE '🏛️ Hong Kong Church PWA - Production Database Deployment';
    RAISE NOTICE 'Starting complete deployment at: %', NOW();
    RAISE NOTICE '========================================';
END $$;

-- ==================================================
-- STEP 1: CORE SCHEMA (from 001_initial_schema.sql)
-- ==================================================

DO $$
BEGIN
    RAISE NOTICE 'Step 1/4: Deploying Core Schema...';
END $$;

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types
CREATE TYPE user_role AS ENUM ('member', 'group_leader', 'pastor', 'admin', 'super_admin');

-- Core tables (condensed version - key tables only for quick deployment)
CREATE TABLE profiles (
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
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE user_roles (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'member',
  assigned_by UUID REFERENCES profiles(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY (user_id, role)
);

CREATE TABLE devotions (
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

CREATE TABLE events (
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
  requires_registration BOOLEAN DEFAULT false,
  max_capacity INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE prayer_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT DEFAULT 'other' CHECK (category IN ('personal', 'family', 'health', 'work', 'church', 'community', 'other')),
  is_public BOOLEAN DEFAULT true,
  is_answered BOOLEAN DEFAULT false,
  answered_at TIMESTAMP WITH TIME ZONE,
  prayer_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE small_groups (
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
  language_primary TEXT DEFAULT 'zh-HK' CHECK (language_primary IN ('zh-HK', 'zh-CN', 'en', 'mixed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security and audit tables
CREATE TABLE security_events (
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

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB,
  user_id UUID REFERENCES profiles(id),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_devotions_updated_at BEFORE UPDATE ON devotions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prayer_requests_updated_at BEFORE UPDATE ON prayer_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_small_groups_updated_at BEFORE UPDATE ON small_groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================================================
-- STEP 2: ESSENTIAL INDEXES (from 002_indexes_and_performance.sql)
-- ==================================================

DO $$
BEGIN
    RAISE NOTICE 'Step 2/4: Creating Essential Indexes...';
END $$;

-- Essential indexes for core functionality
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_devotions_date ON devotions(date);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_devotions_is_published ON devotions(is_published);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_start_datetime ON events(start_datetime);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_is_public ON events(is_public);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_prayer_requests_is_public ON prayer_requests(is_public);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_prayer_requests_created_at ON prayer_requests(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_small_groups_is_public ON small_groups(is_public);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_small_groups_is_open_to_join ON small_groups(is_open_to_join);

-- Full-text search indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_devotions_title_search ON devotions USING gin(to_tsvector('english', title));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_title_search ON events USING gin(to_tsvector('english', title));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_prayer_requests_title_search ON prayer_requests USING gin(to_tsvector('english', title));

-- ==================================================
-- STEP 3: ESSENTIAL SECURITY (from 003_security_and_rls.sql)
-- ==================================================

DO $$
BEGIN
    RAISE NOTICE 'Step 3/4: Implementing Essential Security...';
END $$;

-- Enable RLS on core tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE devotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE small_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Essential security functions
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

-- Essential RLS policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (has_role_or_higher('pastor'));

CREATE POLICY "Anyone can view published devotions" ON devotions
    FOR SELECT USING (is_published = true);
CREATE POLICY "Pastors can manage devotions" ON devotions
    FOR ALL USING (has_role_or_higher('pastor'));

CREATE POLICY "Anyone can view public events" ON events
    FOR SELECT USING (is_public = true);
CREATE POLICY "Organizers can manage own events" ON events
    FOR ALL USING (auth.uid() = organizer_id OR has_role_or_higher('pastor'));

CREATE POLICY "Anyone can view public prayer requests" ON prayer_requests
    FOR SELECT USING (is_public = true);
CREATE POLICY "Users can manage own prayer requests" ON prayer_requests
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public groups" ON small_groups
    FOR SELECT USING (is_public = true);
CREATE POLICY "Leaders can manage own groups" ON small_groups
    FOR ALL USING (auth.uid() = leader_id OR has_role_or_higher('pastor'));

-- ==================================================
-- STEP 4: ESSENTIAL DATA (from 004_seed_data.sql)
-- ==================================================

DO $$
BEGIN
    RAISE NOTICE 'Step 4/4: Loading Essential Data...';
END $$;

-- Set timezone
SET timezone = 'Asia/Hong_Kong';

-- Sample devotions (7 days)
INSERT INTO devotions (title, title_zh, content, content_zh, scripture_reference, scripture_text, scripture_text_zh, date, author, is_published, featured) VALUES
('Walking by Faith', '憑信心而行', 'Faith is not about having all the answers, but trusting God even when we cannot see the path ahead.', '信心不是擁有所有答案，而是即使看不見前路也信靠神。', 'Hebrews 11:1', 'Now faith is confidence in what we hope for and assurance about what we do not see.', '信就是所望之事的實底，是未見之事的確據。', CURRENT_DATE, 'Pastor Chen', true, true),
('God''s Love', '神的愛', 'God''s love is unconditional and transforming.', '神的愛是無條件的和改變人心的。', 'Romans 8:38-39', 'Nothing can separate us from the love of God.', '沒有什麼能使我們與神的愛隔絕。', CURRENT_DATE + 1, 'Pastor Wong', true, false),
('Prayer Power', '禱告的能力', 'Prayer connects us directly with God.', '禱告使我們直接與神連接。', 'Philippians 4:6-7', 'Present your requests to God with thanksgiving.', '將你們所要的告訴神。', CURRENT_DATE + 2, 'Pastor Liu', true, false),
('Hope in Trials', '試煉中的盼望', 'God is our refuge in difficult times.', '神是我們在困難時的避難所。', 'Psalm 46:1', 'God is our refuge and strength.', '神是我們的避難所和力量。', CURRENT_DATE + 3, 'Pastor Chen', true, false),
('Joy in Worship', '敬拜中的喜樂', 'Worship brings us joy and connects us with God.', '敬拜帶給我們喜樂並與神連接。', 'Psalm 100:2', 'Worship the Lord with gladness.', '你們當樂意事奉耶和華。', CURRENT_DATE + 4, 'Pastor Wong', true, false),
('Serving Others', '服事他人', 'We are called to serve one another in love.', '我們被呼召以愛心彼此服事。', 'Galatians 5:13', 'Serve one another humbly in love.', '用愛心互相服事。', CURRENT_DATE + 5, 'Pastor Liu', true, false),
('Growing in Faith', '信心成長', 'Our faith grows through relationship with God.', '我們的信心通過與神的關係而成長。', '2 Peter 3:18', 'Grow in the grace and knowledge of our Lord.', '在恩典和知識上長進。', CURRENT_DATE + 6, 'Pastor Chen', true, false);

-- Church settings
CREATE TABLE IF NOT EXISTS church_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO church_settings (key, value, description) VALUES
('church_info', '{
    "name": "Hong Kong Grace Church",
    "name_zh": "香港恩典教會",
    "address": "123 Church Street, Central, Hong Kong",
    "address_zh": "香港中環教會街123號",
    "phone": "+852 2234 5678",
    "email": "info@hkgracechurch.org"
}', 'Basic church information'),
('localization', '{
    "default_language": "zh-HK",
    "supported_languages": ["zh-HK", "zh-CN", "en"],
    "timezone": "Asia/Hong_Kong",
    "currency": "HKD"
}', 'Hong Kong localization settings');

-- Sample events
INSERT INTO events (title, title_zh, description, description_zh, category, start_datetime, end_datetime, organizer_id, is_public, is_featured) VALUES
('Sunday Morning Worship', '主日晨更崇拜', 'Weekly Sunday morning worship service.', '每週主日晨更崇拜。', 'worship', date_trunc('week', CURRENT_DATE) + INTERVAL '6 days' + TIME '09:00', date_trunc('week', CURRENT_DATE) + INTERVAL '6 days' + TIME '11:00', (SELECT id FROM profiles LIMIT 1), true, true);

-- Sample prayer requests
INSERT INTO prayer_requests (user_id, title, description, category, is_public) VALUES
((SELECT id FROM profiles LIMIT 1), 'Pray for Hong Kong', 'Please pray for peace and unity in our city.', 'community', true),
((SELECT id FROM profiles LIMIT 1), 'Church Growth', 'Pray for our church to grow in faith and numbers.', 'church', true);

-- Sample small group
INSERT INTO small_groups (name, name_zh, description, description_zh, category, leader_id, is_public, is_open_to_join) VALUES
('Tuesday Bible Study', '週二查經班', 'Weekly Bible study group.', '每週查經小組。', 'bible_study', (SELECT id FROM profiles LIMIT 1), true, true);

-- ==================================================
-- DEPLOYMENT COMPLETION
-- ==================================================

DO $$
DECLARE
    table_count INTEGER;
    index_count INTEGER;
    policy_count INTEGER;
    devotion_count INTEGER;
BEGIN
    -- Get final counts
    SELECT COUNT(*) INTO table_count FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    SELECT COUNT(*) INTO index_count FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE 'idx_%';
    SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE schemaname = 'public';
    SELECT COUNT(*) INTO devotion_count FROM devotions WHERE is_published = true;
    
    RAISE NOTICE '';
    RAISE NOTICE '🎉 QUICK DEPLOYMENT COMPLETE!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Deployment Summary:';
    RAISE NOTICE '  📊 Tables Created: %', table_count;
    RAISE NOTICE '  ⚡ Indexes Created: %', index_count;
    RAISE NOTICE '  🔒 Security Policies: %', policy_count;
    RAISE NOTICE '  📖 Devotions Ready: %', devotion_count;
    RAISE NOTICE '';
    RAISE NOTICE '🌏 Hong Kong Localization: ACTIVE';
    RAISE NOTICE '⏰ Timezone: Asia/Hong_Kong';
    RAISE NOTICE '🔐 Security: RLS ENABLED';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Your Hong Kong Church PWA database is ready!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '1. Run validate_deployment.sql for full verification';
    RAISE NOTICE '2. Create your first admin user through Supabase Auth';
    RAISE NOTICE '3. Configure your application environment variables';
    RAISE NOTICE '4. Test the application functionality';
    RAISE NOTICE '========================================';
END $$;