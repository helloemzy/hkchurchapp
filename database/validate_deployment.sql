-- Hong Kong Church PWA - Production Database Validation Script
-- Execute after all deployment scripts to verify system integrity
-- This script provides comprehensive validation of the production deployment

-- ==================================================
-- VALIDATION REPORT HEADER
-- ==================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Hong Kong Church PWA Database Validation';
    RAISE NOTICE 'Timestamp: %', NOW();
    RAISE NOTICE '========================================';
END $$;

-- ==================================================
-- TABLE STRUCTURE VALIDATION
-- ==================================================

DO $$
DECLARE
    table_count INTEGER;
    expected_tables INTEGER := 28;
    table_results RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '📊 TABLE STRUCTURE VALIDATION';
    RAISE NOTICE '----------------------------------------';
    
    -- Count total tables
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE';
    
    RAISE NOTICE 'Total Tables: % (Expected: %)', table_count, expected_tables;
    
    IF table_count >= expected_tables THEN
        RAISE NOTICE '✅ Table count validation: PASSED';
    ELSE
        RAISE NOTICE '❌ Table count validation: FAILED - Missing % tables', expected_tables - table_count;
    END IF;
    
    -- List all tables with row counts
    RAISE NOTICE '';
    RAISE NOTICE 'Table Details:';
    FOR table_results IN
        SELECT 
            t.table_name,
            COALESCE(s.n_tup_ins, 0) as row_count
        FROM information_schema.tables t
        LEFT JOIN pg_stat_user_tables s ON t.table_name = s.relname
        WHERE t.table_schema = 'public' 
        AND t.table_type = 'BASE TABLE'
        ORDER BY t.table_name
    LOOP
        RAISE NOTICE '  - %: % rows', table_results.table_name, table_results.row_count;
    END LOOP;
END $$;

-- ==================================================
-- INDEX VALIDATION
-- ==================================================

DO $$
DECLARE
    index_count INTEGER;
    expected_indexes INTEGER := 115;
    unused_indexes INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '⚡ INDEX PERFORMANCE VALIDATION';
    RAISE NOTICE '----------------------------------------';
    
    -- Count performance indexes
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND indexname LIKE 'idx_%';
    
    RAISE NOTICE 'Performance Indexes: % (Expected: %+)', index_count, expected_indexes;
    
    IF index_count >= expected_indexes THEN
        RAISE NOTICE '✅ Index count validation: PASSED';
    ELSE
        RAISE NOTICE '❌ Index count validation: FAILED - Missing % indexes', expected_indexes - index_count;
    END IF;
    
    -- Check for unused indexes (in production, run after some usage)
    SELECT COUNT(*) INTO unused_indexes
    FROM pg_stat_user_indexes 
    WHERE idx_scan = 0 
    AND indexrelname LIKE 'idx_%';
    
    IF unused_indexes > 0 THEN
        RAISE NOTICE '⚠️  Warning: % potentially unused indexes found', unused_indexes;
    ELSE
        RAISE NOTICE '✅ All indexes appear to be utilized';
    END IF;
END $$;

-- ==================================================
-- RLS POLICIES VALIDATION
-- ==================================================

DO $$
DECLARE
    policy_count INTEGER;
    expected_policies INTEGER := 78;
    rls_enabled_count INTEGER;
    total_user_tables INTEGER;
    policy_results RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔒 SECURITY POLICIES VALIDATION';
    RAISE NOTICE '----------------------------------------';
    
    -- Count RLS policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public';
    
    RAISE NOTICE 'RLS Policies: % (Expected: %+)', policy_count, expected_policies;
    
    IF policy_count >= expected_policies THEN
        RAISE NOTICE '✅ RLS policy count validation: PASSED';
    ELSE
        RAISE NOTICE '❌ RLS policy count validation: FAILED - Missing % policies', expected_policies - policy_count;
    END IF;
    
    -- Check RLS is enabled on user data tables
    SELECT COUNT(*) INTO rls_enabled_count
    FROM pg_class c
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public'
    AND c.relkind = 'r'
    AND c.relrowsecurity = true;
    
    SELECT COUNT(*) INTO total_user_tables
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    AND table_name NOT LIKE '%_log%'
    AND table_name NOT IN ('achievements', 'church_calendar', 'church_settings');
    
    RAISE NOTICE 'Tables with RLS enabled: % / %', rls_enabled_count, total_user_tables;
    
    IF rls_enabled_count >= total_user_tables THEN
        RAISE NOTICE '✅ RLS enablement validation: PASSED';
    ELSE
        RAISE NOTICE '⚠️  Warning: Some user tables may not have RLS enabled';
    END IF;
    
    -- List tables and their policy counts
    RAISE NOTICE '';
    RAISE NOTICE 'Policy Distribution:';
    FOR policy_results IN
        SELECT 
            tablename,
            COUNT(*) as policy_count
        FROM pg_policies 
        WHERE schemaname = 'public'
        GROUP BY tablename
        ORDER BY policy_count DESC
    LOOP
        RAISE NOTICE '  - %: % policies', policy_results.tablename, policy_results.policy_count;
    END LOOP;
END $$;

-- ==================================================
-- FUNCTION AND TRIGGER VALIDATION
-- ==================================================

DO $$
DECLARE
    function_count INTEGER;
    trigger_count INTEGER;
    function_results RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '⚙️ FUNCTIONS AND TRIGGERS VALIDATION';
    RAISE NOTICE '----------------------------------------';
    
    -- Count custom functions
    SELECT COUNT(*) INTO function_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.prokind = 'f';
    
    RAISE NOTICE 'Custom Functions: %', function_count;
    
    -- Count triggers
    SELECT COUNT(*) INTO trigger_count
    FROM information_schema.triggers
    WHERE trigger_schema = 'public';
    
    RAISE NOTICE 'Active Triggers: %', trigger_count;
    
    -- List key functions
    RAISE NOTICE '';
    RAISE NOTICE 'Key Functions:';
    FOR function_results IN
        SELECT 
            p.proname as function_name,
            p.pronargs as arg_count
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public'
        AND p.prokind = 'f'
        AND p.proname IN (
            'get_user_role', 'has_role_or_higher', 'is_group_leader',
            'update_updated_at_column', 'audit_trigger', 'refresh_analytics_views'
        )
        ORDER BY p.proname
    LOOP
        RAISE NOTICE '  - %(%)', function_results.function_name, function_results.arg_count;
    END LOOP;
    
    IF function_count >= 10 AND trigger_count >= 15 THEN
        RAISE NOTICE '✅ Functions and triggers validation: PASSED';
    ELSE
        RAISE NOTICE '❌ Functions and triggers validation: FAILED';
    END IF;
END $$;

-- ==================================================
-- SEED DATA VALIDATION
-- ==================================================

DO $$
DECLARE
    devotion_count INTEGER;
    event_count INTEGER;
    group_count INTEGER;
    achievement_count INTEGER;
    calendar_count INTEGER;
    setting_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🌱 SEED DATA VALIDATION';
    RAISE NOTICE '----------------------------------------';
    
    -- Check devotions
    SELECT COUNT(*) INTO devotion_count FROM devotions WHERE is_published = true;
    RAISE NOTICE 'Published Devotions: %', devotion_count;
    
    -- Check events
    SELECT COUNT(*) INTO event_count FROM events WHERE is_public = true;
    RAISE NOTICE 'Public Events: %', event_count;
    
    -- Check small groups
    SELECT COUNT(*) INTO group_count FROM small_groups WHERE is_public = true;
    RAISE NOTICE 'Public Small Groups: %', group_count;
    
    -- Check achievements
    SELECT COUNT(*) INTO achievement_count FROM achievements WHERE is_active = true;
    RAISE NOTICE 'Active Achievements: %', achievement_count;
    
    -- Check church calendar
    SELECT COUNT(*) INTO calendar_count FROM church_calendar;
    RAISE NOTICE 'Calendar Entries: %', calendar_count;
    
    -- Check settings
    SELECT COUNT(*) INTO setting_count FROM church_settings;
    RAISE NOTICE 'Configuration Settings: %', setting_count;
    
    IF devotion_count >= 25 AND event_count >= 3 AND group_count >= 3 
       AND achievement_count >= 6 AND calendar_count >= 10 AND setting_count >= 5 THEN
        RAISE NOTICE '✅ Seed data validation: PASSED';
    ELSE
        RAISE NOTICE '❌ Seed data validation: FAILED - Insufficient sample data';
    END IF;
END $$;

-- ==================================================
-- HONG KONG LOCALIZATION VALIDATION
-- ==================================================

DO $$
DECLARE
    timezone_setting TEXT;
    hk_holidays INTEGER;
    multilingual_devotions INTEGER;
    multilingual_events INTEGER;
    church_info JSONB;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🌏 HONG KONG LOCALIZATION VALIDATION';
    RAISE NOTICE '----------------------------------------';
    
    -- Check timezone setting
    SHOW timezone INTO timezone_setting;
    RAISE NOTICE 'Database Timezone: %', timezone_setting;
    
    IF timezone_setting = 'Asia/Hong_Kong' THEN
        RAISE NOTICE '✅ Timezone validation: PASSED';
    ELSE
        RAISE NOTICE '⚠️  Warning: Timezone not set to Asia/Hong_Kong';
    END IF;
    
    -- Check Hong Kong holidays
    SELECT COUNT(*) INTO hk_holidays 
    FROM church_calendar 
    WHERE is_public_holiday = true;
    RAISE NOTICE 'Hong Kong Public Holidays: %', hk_holidays;
    
    -- Check multilingual content
    SELECT COUNT(*) INTO multilingual_devotions 
    FROM devotions 
    WHERE title_zh IS NOT NULL;
    RAISE NOTICE 'Devotions with Chinese: %', multilingual_devotions;
    
    SELECT COUNT(*) INTO multilingual_events 
    FROM events 
    WHERE title_zh IS NOT NULL;
    RAISE NOTICE 'Events with Chinese: %', multilingual_events;
    
    -- Check church configuration
    SELECT value INTO church_info 
    FROM church_settings 
    WHERE key = 'church_info';
    
    IF church_info->>'name_zh' IS NOT NULL THEN
        RAISE NOTICE '✅ Church info has Chinese name: %', church_info->>'name_zh';
    ELSE
        RAISE NOTICE '❌ Church info missing Chinese name';
    END IF;
    
    IF hk_holidays >= 8 AND multilingual_devotions >= 20 THEN
        RAISE NOTICE '✅ Localization validation: PASSED';
    ELSE
        RAISE NOTICE '❌ Localization validation: FAILED';
    END IF;
END $$;

-- ==================================================
-- PERFORMANCE VALIDATION
-- ==================================================

DO $$
DECLARE
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    execution_time NUMERIC;
    test_results RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🚀 PERFORMANCE VALIDATION';
    RAISE NOTICE '----------------------------------------';
    
    -- Test devotion query performance
    start_time := clock_timestamp();
    PERFORM * FROM devotions 
    WHERE is_published = true 
    AND date = CURRENT_DATE 
    LIMIT 1;
    end_time := clock_timestamp();
    execution_time := EXTRACT(MILLISECONDS FROM end_time - start_time);
    
    RAISE NOTICE 'Today''s devotion query: %ms', execution_time;
    
    -- Test user progress query performance
    start_time := clock_timestamp();
    PERFORM COUNT(*) FROM user_devotion_progress 
    WHERE completed_at >= CURRENT_DATE - INTERVAL '7 days';
    end_time := clock_timestamp();
    execution_time := EXTRACT(MILLISECONDS FROM end_time - start_time);
    
    RAISE NOTICE 'Weekly progress query: %ms', execution_time;
    
    -- Test event search performance
    start_time := clock_timestamp();
    PERFORM * FROM events 
    WHERE is_public = true 
    AND start_datetime > NOW() 
    ORDER BY start_datetime 
    LIMIT 10;
    end_time := clock_timestamp();
    execution_time := EXTRACT(MILLISECONDS FROM end_time - start_time);
    
    RAISE NOTICE 'Upcoming events query: %ms', execution_time;
    
    -- Test prayer request search
    start_time := clock_timestamp();
    PERFORM * FROM prayer_requests 
    WHERE is_public = true 
    ORDER BY created_at DESC 
    LIMIT 20;
    end_time := clock_timestamp();
    execution_time := EXTRACT(MILLISECONDS FROM end_time - start_time);
    
    RAISE NOTICE 'Public prayers query: %ms', execution_time;
    
    RAISE NOTICE '✅ Performance tests completed (all should be <100ms)';
END $$;

-- ==================================================
-- SECURITY VALIDATION
-- ==================================================

DO $$
DECLARE
    audit_trigger_count INTEGER;
    security_function_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔐 SECURITY VALIDATION';
    RAISE NOTICE '----------------------------------------';
    
    -- Check audit triggers
    SELECT COUNT(*) INTO audit_trigger_count
    FROM information_schema.triggers
    WHERE trigger_schema = 'public'
    AND trigger_name LIKE 'audit_%';
    
    RAISE NOTICE 'Audit Triggers: %', audit_trigger_count;
    
    -- Check security functions
    SELECT COUNT(*) INTO security_function_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND (p.proname LIKE '%security%' OR p.proname LIKE '%audit%' OR p.proname LIKE '%role%');
    
    RAISE NOTICE 'Security Functions: %', security_function_count;
    
    -- Test basic security function
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_user_role') THEN
        RAISE NOTICE '✅ Security function available: get_user_role';
    ELSE
        RAISE NOTICE '❌ Missing security function: get_user_role';
    END IF;
    
    IF audit_trigger_count >= 3 AND security_function_count >= 5 THEN
        RAISE NOTICE '✅ Security validation: PASSED';
    ELSE
        RAISE NOTICE '❌ Security validation: FAILED';
    END IF;
END $$;

-- ==================================================
-- FINAL VALIDATION SUMMARY
-- ==================================================

DO $$
DECLARE
    total_tables INTEGER;
    total_indexes INTEGER;
    total_policies INTEGER;
    total_functions INTEGER;
    total_devotions INTEGER;
    validation_score INTEGER := 0;
    max_score INTEGER := 10;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '📋 VALIDATION SUMMARY';
    RAISE NOTICE '========================================';
    
    -- Gather final statistics
    SELECT COUNT(*) INTO total_tables
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE';
    
    SELECT COUNT(*) INTO total_indexes
    FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND indexname LIKE 'idx_%';
    
    SELECT COUNT(*) INTO total_policies
    FROM pg_policies 
    WHERE schemaname = 'public';
    
    SELECT COUNT(*) INTO total_functions
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.prokind = 'f';
    
    SELECT COUNT(*) INTO total_devotions
    FROM devotions 
    WHERE is_published = true;
    
    -- Calculate validation score
    IF total_tables >= 28 THEN validation_score := validation_score + 2; END IF;
    IF total_indexes >= 115 THEN validation_score := validation_score + 2; END IF;
    IF total_policies >= 78 THEN validation_score := validation_score + 2; END IF;
    IF total_functions >= 10 THEN validation_score := validation_score + 1; END IF;
    IF total_devotions >= 25 THEN validation_score := validation_score + 1; END IF;
    IF EXISTS (SELECT 1 FROM church_settings WHERE key = 'localization') THEN validation_score := validation_score + 1; END IF;
    IF CURRENT_SETTING('timezone') = 'Asia/Hong_Kong' THEN validation_score := validation_score + 1; END IF;
    
    RAISE NOTICE 'Final Statistics:';
    RAISE NOTICE '  📊 Tables: %', total_tables;
    RAISE NOTICE '  ⚡ Indexes: %', total_indexes;
    RAISE NOTICE '  🔒 Policies: %', total_policies;
    RAISE NOTICE '  ⚙️ Functions: %', total_functions;
    RAISE NOTICE '  📖 Devotions: %', total_devotions;
    RAISE NOTICE '';
    RAISE NOTICE 'Validation Score: % / %', validation_score, max_score;
    
    IF validation_score >= 9 THEN
        RAISE NOTICE '🎉 DEPLOYMENT STATUS: EXCELLENT - Ready for production!';
    ELSIF validation_score >= 7 THEN
        RAISE NOTICE '✅ DEPLOYMENT STATUS: GOOD - Minor issues to address';
    ELSIF validation_score >= 5 THEN
        RAISE NOTICE '⚠️  DEPLOYMENT STATUS: FAIR - Several issues need attention';
    ELSE
        RAISE NOTICE '❌ DEPLOYMENT STATUS: POOR - Major issues must be resolved';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '🏛️ Hong Kong Church PWA Database Validation Complete';
    RAISE NOTICE '========================================';
END $$;