-- Hong Kong Church PWA - Supabase Deployment Validation Script
-- ================================================================
-- Run this script after deploying supabase_deploy.sql to verify everything is working correctly
-- ================================================================

-- Set timezone
SET timezone = 'Asia/Hong_Kong';

DO $$
BEGIN
    RAISE NOTICE '🔍 Hong Kong Church PWA - Deployment Validation';
    RAISE NOTICE 'Validation started at: %', NOW();
    RAISE NOTICE 'Timezone: %', current_setting('timezone');
    RAISE NOTICE '========================================';
END $$;

-- ================================================================
-- SECTION 1: BASIC INFRASTRUCTURE VALIDATION
-- ================================================================

DO $$
DECLARE
    extension_count INTEGER;
    type_count INTEGER;
BEGIN
    RAISE NOTICE '📋 Section 1: Infrastructure Validation';
    
    -- Check extensions
    SELECT COUNT(*) INTO extension_count 
    FROM pg_extension 
    WHERE extname IN ('uuid-ossp', 'pgcrypto', 'pg_trgm');
    
    -- Check custom types
    SELECT COUNT(*) INTO type_count 
    FROM pg_type 
    WHERE typname = 'user_role';
    
    RAISE NOTICE '  ✓ Extensions installed: % of 3', extension_count;
    RAISE NOTICE '  ✓ Custom types created: % of 1', type_count;
    
    IF extension_count < 3 THEN
        RAISE WARNING '  ⚠️  Missing extensions! Expected 3, found %', extension_count;
    END IF;
    
    IF type_count < 1 THEN
        RAISE WARNING '  ⚠️  Missing user_role type!';
    END IF;
END $$;

-- ================================================================
-- SECTION 2: TABLE STRUCTURE VALIDATION
-- ================================================================

DO $$
DECLARE
    table_count INTEGER;
    expected_tables TEXT[] := ARRAY[
        'profiles', 'user_roles', 'devotions', 'user_devotion_progress', 
        'bible_bookmarks', 'reading_streaks', 'events', 'event_registrations',
        'prayer_requests', 'prayer_interactions', 'small_groups', 'group_memberships',
        'group_activities', 'security_events', 'audit_logs', 'user_consent', 
        'church_settings'
    ];
    missing_tables TEXT[] := '{}';
    table_name TEXT;
BEGIN
    RAISE NOTICE '📊 Section 2: Table Structure Validation';
    
    -- Count total tables
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    
    -- Check for missing tables
    FOREACH table_name IN ARRAY expected_tables
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = table_name
        ) THEN
            missing_tables := missing_tables || table_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE '  ✓ Total tables created: %', table_count;
    RAISE NOTICE '  ✓ Expected core tables: % of %', array_length(expected_tables, 1) - array_length(missing_tables, 1), array_length(expected_tables, 1);
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE WARNING '  ⚠️  Missing tables: %', array_to_string(missing_tables, ', ');
    END IF;
END $$;

-- ================================================================
-- SECTION 3: INDEX VALIDATION
-- ================================================================

DO $$
DECLARE
    index_count INTEGER;
    critical_indexes TEXT[] := ARRAY[
        'idx_profiles_email', 'idx_devotions_date', 'idx_events_start_datetime',
        'idx_prayer_requests_is_public', 'idx_small_groups_is_open_to_join'
    ];
    missing_indexes TEXT[] := '{}';
    index_name TEXT;
BEGIN
    RAISE NOTICE '⚡ Section 3: Index Validation';
    
    -- Count total indexes
    SELECT COUNT(*) INTO index_count 
    FROM pg_indexes 
    WHERE schemaname = 'public' AND indexname LIKE 'idx_%';
    
    -- Check critical indexes
    FOREACH index_name IN ARRAY critical_indexes
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE schemaname = 'public' 
            AND indexname = index_name
        ) THEN
            missing_indexes := missing_indexes || index_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE '  ✓ Performance indexes created: %', index_count;
    RAISE NOTICE '  ✓ Critical indexes present: % of %', array_length(critical_indexes, 1) - array_length(missing_indexes, 1), array_length(critical_indexes, 1);
    
    IF array_length(missing_indexes, 1) > 0 THEN
        RAISE WARNING '  ⚠️  Missing critical indexes: %', array_to_string(missing_indexes, ', ');
    END IF;
END $$;

-- ================================================================
-- SECTION 4: SECURITY VALIDATION (RLS)
-- ================================================================

DO $$
DECLARE
    rls_enabled_count INTEGER;
    policy_count INTEGER;
    critical_policies TEXT[] := ARRAY[
        'Users can view own profile', 'Anyone can view published devotions',
        'Anyone can view public events', 'Anyone can view public prayer requests',
        'Anyone can view public groups'
    ];
    missing_policies TEXT[] := '{}';
    policy_name TEXT;
BEGIN
    RAISE NOTICE '🔒 Section 4: Security Validation (RLS)';
    
    -- Count RLS enabled tables
    SELECT COUNT(*) INTO rls_enabled_count
    FROM pg_class c
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public' 
    AND c.relkind = 'r' 
    AND c.relrowsecurity = true;
    
    -- Count total policies
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE schemaname = 'public';
    
    -- Check critical policies exist
    FOREACH policy_name IN ARRAY critical_policies
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND policyname = policy_name
        ) THEN
            missing_policies := missing_policies || policy_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE '  ✓ Tables with RLS enabled: %', rls_enabled_count;
    RAISE NOTICE '  ✓ Security policies created: %', policy_count;
    RAISE NOTICE '  ✓ Critical policies present: % of %', array_length(critical_policies, 1) - array_length(missing_policies, 1), array_length(critical_policies, 1);
    
    IF array_length(missing_policies, 1) > 0 THEN
        RAISE WARNING '  ⚠️  Missing critical policies: %', array_to_string(missing_policies, ', ');
    END IF;
END $$;

-- ================================================================
-- SECTION 5: FUNCTION VALIDATION
-- ================================================================

DO $$
DECLARE
    function_count INTEGER;
    critical_functions TEXT[] := ARRAY[
        'update_updated_at_column', 'get_user_role', 'has_role_or_higher', 'update_reading_streak'
    ];
    missing_functions TEXT[] := '{}';
    function_name TEXT;
BEGIN
    RAISE NOTICE '⚙️ Section 5: Function Validation';
    
    -- Count total functions
    SELECT COUNT(*) INTO function_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public';
    
    -- Check critical functions
    FOREACH function_name IN ARRAY critical_functions
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public' 
            AND p.proname = function_name
        ) THEN
            missing_functions := missing_functions || function_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE '  ✓ Functions created: %', function_count;
    RAISE NOTICE '  ✓ Critical functions present: % of %', array_length(critical_functions, 1) - array_length(missing_functions, 1), array_length(critical_functions, 1);
    
    IF array_length(missing_functions, 1) > 0 THEN
        RAISE WARNING '  ⚠️  Missing critical functions: %', array_to_string(missing_functions, ', ');
    END IF;
END $$;

-- ================================================================
-- SECTION 6: DATA VALIDATION
-- ================================================================

DO $$
DECLARE
    devotion_count INTEGER;
    event_count INTEGER;
    prayer_count INTEGER;
    group_count INTEGER;
    settings_count INTEGER;
BEGIN
    RAISE NOTICE '📚 Section 6: Sample Data Validation';
    
    SELECT COUNT(*) INTO devotion_count FROM devotions WHERE is_published = true;
    SELECT COUNT(*) INTO event_count FROM events WHERE is_public = true;
    SELECT COUNT(*) INTO prayer_count FROM prayer_requests WHERE is_public = true;
    SELECT COUNT(*) INTO group_count FROM small_groups WHERE is_public = true;
    SELECT COUNT(*) INTO settings_count FROM church_settings;
    
    RAISE NOTICE '  ✓ Published devotions loaded: %', devotion_count;
    RAISE NOTICE '  ✓ Public events created: %', event_count;
    RAISE NOTICE '  ✓ Public prayer requests: %', prayer_count;
    RAISE NOTICE '  ✓ Public small groups: %', group_count;
    RAISE NOTICE '  ✓ Church settings configured: %', settings_count;
    
    IF devotion_count = 0 THEN
        RAISE WARNING '  ⚠️  No devotions found! App will have empty devotional content.';
    END IF;
    
    IF settings_count = 0 THEN
        RAISE WARNING '  ⚠️  No church settings found! App may not be properly configured.';
    END IF;
END $$;

-- ================================================================
-- SECTION 7: FEATURE-SPECIFIC VALIDATION
-- ================================================================

DO $$
DECLARE
    devotion_with_chinese INTEGER;
    event_with_chinese INTEGER;
    timezone_setting TEXT;
    default_language TEXT;
BEGIN
    RAISE NOTICE '🌏 Section 7: Hong Kong Localization Validation';
    
    -- Check Chinese content
    SELECT COUNT(*) INTO devotion_with_chinese FROM devotions WHERE title_zh IS NOT NULL;
    SELECT COUNT(*) INTO event_with_chinese FROM events WHERE title_zh IS NOT NULL;
    
    -- Check localization settings
    SELECT value->>'timezone' INTO timezone_setting FROM church_settings WHERE key = 'localization';
    SELECT value->>'default_language' INTO default_language FROM church_settings WHERE key = 'localization';
    
    RAISE NOTICE '  ✓ Devotions with Chinese content: %', devotion_with_chinese;
    RAISE NOTICE '  ✓ Events with Chinese content: %', event_with_chinese;
    RAISE NOTICE '  ✓ Configured timezone: %', COALESCE(timezone_setting, 'NOT SET');
    RAISE NOTICE '  ✓ Default language: %', COALESCE(default_language, 'NOT SET');
    
    IF timezone_setting != 'Asia/Hong_Kong' THEN
        RAISE WARNING '  ⚠️  Timezone not set to Asia/Hong_Kong!';
    END IF;
    
    IF default_language != 'zh-HK' THEN
        RAISE WARNING '  ⚠️  Default language not set to zh-HK!';
    END IF;
END $$;

-- ================================================================
-- SECTION 8: PERFORMANCE VALIDATION
-- ================================================================

DO $$
DECLARE
    full_text_indexes INTEGER;
    composite_indexes INTEGER;
BEGIN
    RAISE NOTICE '🚀 Section 8: Performance Features Validation';
    
    -- Count full-text search indexes
    SELECT COUNT(*) INTO full_text_indexes
    FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND indexdef LIKE '%gin%tsvector%';
    
    -- Count composite indexes
    SELECT COUNT(*) INTO composite_indexes
    FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND indexname LIKE 'idx_%'
    AND indexdef LIKE '%,%';
    
    RAISE NOTICE '  ✓ Full-text search indexes: %', full_text_indexes;
    RAISE NOTICE '  ✓ Composite performance indexes: %', composite_indexes;
    
    IF full_text_indexes = 0 THEN
        RAISE WARNING '  ⚠️  No full-text search indexes found! Search functionality may be slow.';
    END IF;
END $$;

-- ================================================================
-- FINAL VALIDATION SUMMARY
-- ================================================================

DO $$
DECLARE
    total_tables INTEGER;
    total_indexes INTEGER;
    total_policies INTEGER;
    total_functions INTEGER;
    published_devotions INTEGER;
    validation_score INTEGER := 0;
    max_score INTEGER := 8;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '📊 FINAL VALIDATION SUMMARY';
    RAISE NOTICE '========================================';
    
    -- Get counts
    SELECT COUNT(*) INTO total_tables FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    SELECT COUNT(*) INTO total_indexes FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE 'idx_%';
    SELECT COUNT(*) INTO total_policies FROM pg_policies WHERE schemaname = 'public';
    SELECT COUNT(*) INTO total_functions FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public';
    SELECT COUNT(*) INTO published_devotions FROM devotions WHERE is_published = true;
    
    -- Calculate validation score
    IF total_tables >= 15 THEN validation_score := validation_score + 1; END IF;
    IF total_indexes >= 30 THEN validation_score := validation_score + 1; END IF;
    IF total_policies >= 15 THEN validation_score := validation_score + 1; END IF;
    IF total_functions >= 4 THEN validation_score := validation_score + 1; END IF;
    IF published_devotions >= 3 THEN validation_score := validation_score + 1; END IF;
    IF EXISTS (SELECT 1 FROM church_settings WHERE key = 'localization') THEN validation_score := validation_score + 1; END IF;
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') THEN validation_score := validation_score + 1; END IF;
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN validation_score := validation_score + 1; END IF;
    
    RAISE NOTICE 'Database Infrastructure:';
    RAISE NOTICE '  📊 Tables: %', total_tables;
    RAISE NOTICE '  ⚡ Indexes: %', total_indexes;
    RAISE NOTICE '  🔒 Security Policies: %', total_policies;
    RAISE NOTICE '  ⚙️  Functions: %', total_functions;
    RAISE NOTICE '';
    RAISE NOTICE 'Content & Configuration:';
    RAISE NOTICE '  📖 Published Devotions: %', published_devotions;
    RAISE NOTICE '  ⏰ Timezone: %', current_setting('timezone');
    RAISE NOTICE '  🌏 Localization: Hong Kong Ready';
    RAISE NOTICE '';
    RAISE NOTICE 'Validation Score: % / % (%)', validation_score, max_score, ROUND((validation_score::DECIMAL / max_score * 100), 1);
    
    IF validation_score = max_score THEN
        RAISE NOTICE '🎉 EXCELLENT! All validation checks passed.';
        RAISE NOTICE '✅ Your Hong Kong Church PWA database is ready for production!';
    ELSIF validation_score >= 6 THEN
        RAISE NOTICE '✅ GOOD! Most validation checks passed.';
        RAISE NOTICE 'ℹ️  Review warnings above and fix minor issues.';
    ELSE
        RAISE WARNING '⚠️  ISSUES DETECTED! Review warnings above before production deployment.';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '📱 Ready PWA Features:';
    RAISE NOTICE '  📖 Daily Devotions with Reading Streaks';
    RAISE NOTICE '  📚 Bible Reader with Bookmarks';
    RAISE NOTICE '  🙏 Prayer Community Wall';
    RAISE NOTICE '  👥 Small Groups Directory';
    RAISE NOTICE '  📅 Church Events Calendar';
    RAISE NOTICE '  🔐 User Authentication & Roles';
    RAISE NOTICE '  🌏 Chinese/English Bilingual Support';
    RAISE NOTICE '========================================';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ VALIDATION ERROR: %', SQLERRM;
        RAISE NOTICE 'Please check your deployment and try again.';
END $$;