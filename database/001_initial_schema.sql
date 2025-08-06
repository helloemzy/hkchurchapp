-- Hong Kong Church PWA - Initial Database Schema
-- Production Deployment Script - Execute in Supabase SQL Editor
-- Part 1: Core Tables and Extensions

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types
CREATE TYPE user_role AS ENUM ('member', 'group_leader', 'pastor', 'admin', 'super_admin');

-- ==================================================
-- CORE USER MANAGEMENT TABLES
-- ==================================================

-- Profiles table with Hong Kong specific localization
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

-- User roles for church hierarchy management
CREATE TABLE user_roles (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'member',
  assigned_by UUID REFERENCES profiles(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY (user_id, role)
);

-- Security events for comprehensive audit trail
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

-- Audit logs for complete data change tracking
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB,
  user_id UUID REFERENCES profiles(id),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User consent tracking for GDPR/privacy compliance
CREATE TABLE user_consent (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  purpose TEXT NOT NULL,
  granted BOOLEAN NOT NULL,
  consent_method TEXT NOT NULL CHECK (consent_method IN ('explicit', 'implicit')),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET NOT NULL,
  user_agent TEXT NOT NULL
);

-- ==================================================
-- SPIRITUAL CONTENT TABLES
-- ==================================================

-- Daily devotions with full Chinese translation support
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

-- User devotion progress and achievement tracking
CREATE TABLE user_devotion_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  devotion_id UUID REFERENCES devotions(id) ON DELETE CASCADE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reflection_notes TEXT,
  shared BOOLEAN DEFAULT false,
  bookmarked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, devotion_id)
);

-- Bible bookmarks with Chinese text support
CREATE TABLE bible_bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL CHECK (chapter > 0),
  verse INTEGER NOT NULL CHECK (verse > 0),
  verse_text TEXT NOT NULL,
  verse_text_zh TEXT,
  notes TEXT,
  color TEXT DEFAULT '#FFD700',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reading streaks and spiritual achievements
CREATE TABLE reading_streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_read_date DATE,
  total_devotions_read INTEGER DEFAULT 0,
  total_verses_read INTEGER DEFAULT 0,
  achievements TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================================================
-- COMMUNITY PRAYER SYSTEM
-- ==================================================

-- Prayer requests with category organization
CREATE TABLE prayer_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT DEFAULT 'other' CHECK (category IN ('personal', 'family', 'health', 'work', 'church', 'community', 'other')),
  is_public BOOLEAN DEFAULT true,
  is_answered BOOLEAN DEFAULT false,
  answered_at TIMESTAMP WITH TIME ZONE,
  answered_description TEXT,
  prayer_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prayer interactions and community engagement
CREATE TABLE prayer_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prayer_request_id UUID REFERENCES prayer_requests(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('prayed', 'amen', 'support')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(prayer_request_id, user_id, action)
);

-- ==================================================
-- CHURCH EVENTS MANAGEMENT
-- ==================================================

-- Church events with comprehensive multilingual support
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
  location_address TEXT,
  max_capacity INTEGER,
  current_registrations INTEGER DEFAULT 0,
  requires_registration BOOLEAN DEFAULT false,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  image_url TEXT,
  organizer_id UUID REFERENCES profiles(id) NOT NULL,
  is_public BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_cancelled BOOLEAN DEFAULT false,
  cancellation_reason TEXT,
  cost DECIMAL(10,2),
  cost_currency TEXT DEFAULT 'HKD',
  contact_email TEXT,
  contact_phone TEXT,
  recurring_pattern TEXT,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (end_datetime > start_datetime)
);

-- Event registrations and attendance tracking
CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'waitlisted', 'cancelled')),
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  attendance_confirmed BOOLEAN DEFAULT false,
  attended_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- ==================================================
-- SMALL GROUPS SYSTEM
-- ==================================================

-- Small groups with detailed categorization
CREATE TABLE small_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_zh TEXT,
  description TEXT NOT NULL,
  description_zh TEXT,
  category TEXT NOT NULL CHECK (category IN ('bible_study', 'prayer', 'fellowship', 'discipleship', 'service', 'youth', 'seniors', 'couples', 'singles')),
  max_members INTEGER,
  current_members INTEGER DEFAULT 0,
  leader_id UUID REFERENCES profiles(id) NOT NULL,
  co_leaders UUID[] DEFAULT '{}',
  meeting_schedule TEXT,
  meeting_location TEXT,
  meeting_location_zh TEXT,
  is_open_to_join BOOLEAN DEFAULT true,
  requires_approval BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  image_url TEXT,
  contact_method TEXT DEFAULT 'app_only' CHECK (contact_method IN ('whatsapp', 'email', 'phone', 'app_only')),
  contact_details TEXT,
  age_range TEXT,
  gender_preference TEXT DEFAULT 'mixed' CHECK (gender_preference IN ('mixed', 'male_only', 'female_only')),
  language_primary TEXT DEFAULT 'zh-HK' CHECK (language_primary IN ('zh-HK', 'zh-CN', 'en', 'mixed')),
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Group memberships with role management
CREATE TABLE group_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES small_groups(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('member', 'co_leader', 'leader')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'inactive', 'removed')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- Group activities and communication tracking
CREATE TABLE group_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES small_groups(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('meeting', 'study', 'prayer', 'fellowship', 'service', 'announcement')),
  title TEXT NOT NULL,
  title_zh TEXT,
  description TEXT,
  description_zh TEXT,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  participants UUID[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==================================================
-- TRIGGERS FOR AUTOMATED UPDATES
-- ==================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_devotions_updated_at BEFORE UPDATE ON devotions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_devotion_progress_updated_at BEFORE UPDATE ON user_devotion_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bible_bookmarks_updated_at BEFORE UPDATE ON bible_bookmarks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prayer_requests_updated_at BEFORE UPDATE ON prayer_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reading_streaks_updated_at BEFORE UPDATE ON reading_streaks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_registrations_updated_at BEFORE UPDATE ON event_registrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_small_groups_updated_at BEFORE UPDATE ON small_groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_group_memberships_updated_at BEFORE UPDATE ON group_memberships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_group_activities_updated_at BEFORE UPDATE ON group_activities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================================================
-- COMPLETION NOTIFICATION
-- ==================================================

-- Create a completion log entry
DO $$
BEGIN
    RAISE NOTICE 'Hong Kong Church PWA - Initial Schema Deployment Complete!';
    RAISE NOTICE 'Created: % tables with full schema', (
        SELECT count(*) 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
    );
    RAISE NOTICE 'Next Step: Execute 002_indexes_and_performance.sql';
END $$;