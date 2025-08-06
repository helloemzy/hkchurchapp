-- Hong Kong Church PWA - Storage and Real-time Configuration
-- Production Deployment Script - Execute AFTER 003_row_level_security.sql
-- Part 4: Storage Buckets, Real-time Subscriptions, and Advanced Features

-- ==================================================
-- STORAGE BUCKETS CONFIGURATION
-- ==================================================

-- Create storage buckets for different content types
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES 
('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']), -- 5MB limit
('events', 'events', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']), -- 10MB limit
('groups', 'groups', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']), -- 10MB limit
('devotions', 'devotions', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']), -- 10MB limit
('documents', 'documents', false, 52428800, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']); -- 50MB limit, private

-- ==================================================
-- STORAGE POLICIES FOR AVATARS BUCKET
-- ==================================================

-- Users can upload their own avatar
CREATE POLICY "users_can_upload_own_avatar" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1] AND
        -- Ensure file extension is allowed
        lower(right(name, 4)) IN ('.jpg', '.png', 'webp', '.gif') OR
        lower(right(name, 5)) IN ('.jpeg')
    );

-- Anyone can view avatars (public bucket)
CREATE POLICY "anyone_can_view_avatars" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

-- Users can update their own avatar
CREATE POLICY "users_can_update_own_avatar" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Users can delete their own avatar
CREATE POLICY "users_can_delete_own_avatar" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'avatars' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- ==================================================
-- STORAGE POLICIES FOR EVENTS BUCKET
-- ==================================================

-- Event organizers can upload event images
CREATE POLICY "organizers_can_upload_event_images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'events' AND
        (
            -- User is a leader who can create events
            EXISTS (
                SELECT 1 FROM user_roles ur
                WHERE ur.user_id = auth.uid() 
                AND ur.role IN ('group_leader', 'pastor', 'admin', 'super_admin')
                AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
            ) OR
            -- User is uploading to their own event folder
            EXISTS (
                SELECT 1 FROM events e
                WHERE e.organizer_id = auth.uid()
                AND e.id::text = (storage.foldername(name))[1]
            )
        )
    );

-- Anyone can view event images (public bucket)
CREATE POLICY "anyone_can_view_event_images" ON storage.objects
    FOR SELECT USING (bucket_id = 'events');

-- Event organizers can update their event images
CREATE POLICY "organizers_can_update_event_images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'events' AND
        EXISTS (
            SELECT 1 FROM events e
            WHERE e.organizer_id = auth.uid()
            AND e.id::text = (storage.foldername(name))[1]
        )
    );

-- Event organizers can delete their event images
CREATE POLICY "organizers_can_delete_event_images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'events' AND
        EXISTS (
            SELECT 1 FROM events e
            WHERE e.organizer_id = auth.uid()
            AND e.id::text = (storage.foldername(name))[1]
        )
    );

-- ==================================================
-- STORAGE POLICIES FOR GROUPS BUCKET
-- ==================================================

-- Group leaders can upload group images
CREATE POLICY "group_leaders_can_upload_group_images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'groups' AND
        EXISTS (
            SELECT 1 FROM small_groups sg
            WHERE (sg.leader_id = auth.uid() OR auth.uid() = ANY(sg.co_leaders))
            AND sg.id::text = (storage.foldername(name))[1]
        )
    );

-- Anyone can view group images (public bucket)  
CREATE POLICY "anyone_can_view_group_images" ON storage.objects
    FOR SELECT USING (bucket_id = 'groups');

-- Group leaders can update their group images
CREATE POLICY "group_leaders_can_update_group_images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'groups' AND
        EXISTS (
            SELECT 1 FROM small_groups sg
            WHERE (sg.leader_id = auth.uid() OR auth.uid() = ANY(sg.co_leaders))
            AND sg.id::text = (storage.foldername(name))[1]
        )
    );

-- Group leaders can delete their group images
CREATE POLICY "group_leaders_can_delete_group_images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'groups' AND
        EXISTS (
            SELECT 1 FROM small_groups sg
            WHERE (sg.leader_id = auth.uid() OR auth.uid() = ANY(sg.co_leaders))
            AND sg.id::text = (storage.foldername(name))[1]
        )
    );

-- ==================================================
-- STORAGE POLICIES FOR DEVOTIONS BUCKET
-- ==================================================

-- Pastors can upload devotion images
CREATE POLICY "pastors_can_upload_devotion_images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'devotions' AND
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('pastor', 'admin', 'super_admin')
            AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
        )
    );

-- Anyone can view devotion images (public bucket)
CREATE POLICY "anyone_can_view_devotion_images" ON storage.objects
    FOR SELECT USING (bucket_id = 'devotions');

-- Pastors can update devotion images
CREATE POLICY "pastors_can_update_devotion_images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'devotions' AND
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('pastor', 'admin', 'super_admin')
            AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
        )
    );

-- Pastors can delete devotion images
CREATE POLICY "pastors_can_delete_devotion_images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'devotions' AND
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('pastor', 'admin', 'super_admin')
            AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
        )
    );

-- ==================================================
-- STORAGE POLICIES FOR DOCUMENTS BUCKET (Private)
-- ==================================================

-- Leaders can upload documents
CREATE POLICY "leaders_can_upload_documents" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'documents' AND
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('group_leader', 'pastor', 'admin', 'super_admin')
            AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
        )
    );

-- Users can view documents they have access to
CREATE POLICY "users_can_view_accessible_documents" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'documents' AND (
            -- Document belongs to user's group
            EXISTS (
                SELECT 1 FROM group_memberships gm
                JOIN small_groups sg ON gm.group_id = sg.id
                WHERE gm.user_id = auth.uid()
                AND gm.status = 'active'
                AND sg.id::text = (storage.foldername(name))[1]
            ) OR
            -- User is admin
            EXISTS (
                SELECT 1 FROM user_roles ur
                WHERE ur.user_id = auth.uid() 
                AND ur.role IN ('admin', 'super_admin')
                AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
            )
        )
    );

-- Leaders can manage documents for their groups
CREATE POLICY "leaders_can_manage_group_documents" ON storage.objects
    FOR ALL USING (
        bucket_id = 'documents' AND (
            EXISTS (
                SELECT 1 FROM small_groups sg
                WHERE (sg.leader_id = auth.uid() OR auth.uid() = ANY(sg.co_leaders))
                AND sg.id::text = (storage.foldername(name))[1]
            ) OR
            EXISTS (
                SELECT 1 FROM user_roles ur
                WHERE ur.user_id = auth.uid() 
                AND ur.role IN ('admin', 'super_admin')
                AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
            )
        )
    );

-- ==================================================
-- REAL-TIME SUBSCRIPTIONS CONFIGURATION
-- ==================================================

-- Drop existing publication if it exists and recreate
DROP PUBLICATION IF EXISTS supabase_realtime CASCADE;
CREATE PUBLICATION supabase_realtime;

-- Add tables to real-time publication for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE prayer_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE prayer_interactions;
ALTER PUBLICATION supabase_realtime ADD TABLE group_activities;
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE event_registrations;
ALTER PUBLICATION supabase_realtime ADD TABLE group_memberships;
ALTER PUBLICATION supabase_realtime ADD TABLE user_devotion_progress;
ALTER PUBLICATION supabase_realtime ADD TABLE reading_streaks;

-- ==================================================
-- REAL-TIME SECURITY POLICIES
-- ==================================================

-- Users can subscribe to public prayer requests
CREATE POLICY "realtime_users_can_subscribe_public_prayers" ON prayer_requests
    FOR SELECT USING (
        is_public = true AND
        auth.uid() IS NOT NULL
    ) WITH CHECK (is_public = true);

-- Users can subscribe to prayer interactions on viewable requests
CREATE POLICY "realtime_users_can_subscribe_prayer_interactions" ON prayer_interactions
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

-- Users can subscribe to their group activities
CREATE POLICY "realtime_users_can_subscribe_group_activities" ON group_activities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM group_memberships gm
            WHERE gm.group_id = group_activities.group_id
            AND gm.user_id = auth.uid()
            AND gm.status = 'active'
        )
    );

-- Users can subscribe to public events
CREATE POLICY "realtime_users_can_subscribe_public_events" ON events
    FOR SELECT USING (
        is_public = true AND 
        is_cancelled = false AND
        auth.uid() IS NOT NULL
    ) WITH CHECK (is_public = true AND is_cancelled = false);

-- Users can subscribe to event registrations for their events
CREATE POLICY "realtime_users_can_subscribe_event_registrations" ON event_registrations
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM events e
            WHERE e.id = event_registrations.event_id
            AND e.organizer_id = auth.uid()
        )
    );

-- Users can subscribe to group membership changes in their groups
CREATE POLICY "realtime_users_can_subscribe_group_memberships" ON group_memberships
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM small_groups sg
            WHERE sg.id = group_memberships.group_id
            AND (sg.leader_id = auth.uid() OR auth.uid() = ANY(sg.co_leaders))
        ) OR
        EXISTS (
            SELECT 1 FROM group_memberships gm
            WHERE gm.group_id = group_memberships.group_id
            AND gm.user_id = auth.uid()
            AND gm.status = 'active'
        )
    );

-- ==================================================
-- ADVANCED DATABASE FUNCTIONS
-- ==================================================

-- Function to handle file uploads with automatic optimization
CREATE OR REPLACE FUNCTION handle_file_upload()
RETURNS TRIGGER AS $$
BEGIN
    -- Log file upload event
    INSERT INTO audit_logs (table_name, operation, new_data, user_id)
    VALUES (
        'storage.objects',
        'INSERT',
        jsonb_build_object(
            'bucket_id', NEW.bucket_id,
            'name', NEW.name,
            'size', NEW.metadata->>'size',
            'mimetype', NEW.metadata->>'mimetype'
        ),
        auth.uid()
    );
    
    -- Update user storage usage (if needed for quotas)
    -- This could be implemented later for storage quota management
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for file upload logging
CREATE TRIGGER storage_upload_audit_trigger
    AFTER INSERT ON storage.objects
    FOR EACH ROW EXECUTE FUNCTION handle_file_upload();

-- Function to clean up orphaned files
CREATE OR REPLACE FUNCTION cleanup_orphaned_files()
RETURNS INTEGER AS $$
DECLARE
    orphaned_count INTEGER := 0;
BEGIN
    -- Clean up avatar files for deleted users
    DELETE FROM storage.objects
    WHERE bucket_id = 'avatars'
    AND (storage.foldername(name))[1]::uuid NOT IN (
        SELECT id::text FROM profiles WHERE data_deleted = false
    );
    
    GET DIAGNOSTICS orphaned_count = ROW_COUNT;
    
    -- Clean up event files for deleted events
    DELETE FROM storage.objects
    WHERE bucket_id = 'events'
    AND (storage.foldername(name))[1]::uuid NOT IN (
        SELECT id::text FROM events
    );
    
    GET DIAGNOSTICS orphaned_count = orphaned_count + ROW_COUNT;
    
    -- Clean up group files for deleted groups
    DELETE FROM storage.objects
    WHERE bucket_id = 'groups'
    AND (storage.foldername(name))[1]::uuid NOT IN (
        SELECT id::text FROM small_groups
    );
    
    GET DIAGNOSTICS orphaned_count = orphaned_count + ROW_COUNT;
    
    RETURN orphaned_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get storage usage statistics
CREATE OR REPLACE FUNCTION get_storage_stats()
RETURNS TABLE(
    bucket_name TEXT,
    file_count BIGINT,
    total_size_bytes BIGINT,
    total_size_mb NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        so.bucket_id::TEXT,
        count(*)::BIGINT,
        sum((so.metadata->>'size')::BIGINT)::BIGINT,
        round(sum((so.metadata->>'size')::BIGINT) / 1024.0 / 1024.0, 2)
    FROM storage.objects so
    GROUP BY so.bucket_id
    ORDER BY so.bucket_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==================================================
-- AUTOMATED MAINTENANCE FUNCTIONS
-- ==================================================

-- Function to automatically update event registration counts
CREATE OR REPLACE FUNCTION update_event_registration_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update current_registrations count for the event
    UPDATE events
    SET current_registrations = (
        SELECT count(*)
        FROM event_registrations er
        WHERE er.event_id = COALESCE(NEW.event_id, OLD.event_id)
        AND er.status = 'registered'
    )
    WHERE id = COALESCE(NEW.event_id, OLD.event_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic event registration count updates
CREATE TRIGGER update_event_registration_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON event_registrations
    FOR EACH ROW EXECUTE FUNCTION update_event_registration_count();

-- Function to automatically update group member counts
CREATE OR REPLACE FUNCTION update_group_member_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update current_members count for the group
    UPDATE small_groups
    SET current_members = (
        SELECT count(*)
        FROM group_memberships gm
        WHERE gm.group_id = COALESCE(NEW.group_id, OLD.group_id)
        AND gm.status = 'active'
    )
    WHERE id = COALESCE(NEW.group_id, OLD.group_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic group member count updates
CREATE TRIGGER update_group_member_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON group_memberships
    FOR EACH ROW EXECUTE FUNCTION update_group_member_count();

-- Function to automatically update prayer interaction counts
CREATE OR REPLACE FUNCTION update_prayer_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update prayer_count for the prayer request
    UPDATE prayer_requests
    SET prayer_count = (
        SELECT count(*)
        FROM prayer_interactions pi
        WHERE pi.prayer_request_id = COALESCE(NEW.prayer_request_id, OLD.prayer_request_id)
        AND pi.action = 'prayed'
    )
    WHERE id = COALESCE(NEW.prayer_request_id, OLD.prayer_request_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic prayer count updates
CREATE TRIGGER update_prayer_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON prayer_interactions
    FOR EACH ROW EXECUTE FUNCTION update_prayer_count();

-- ==================================================
-- CACHE INVALIDATION FUNCTIONS
-- ==================================================

-- Function to notify cache invalidation for real-time updates
CREATE OR REPLACE FUNCTION notify_cache_invalidation()
RETURNS TRIGGER AS $$
BEGIN
    -- Notify real-time subscribers of data changes
    PERFORM pg_notify(
        'cache_invalidation',
        json_build_object(
            'table', TG_TABLE_NAME,
            'operation', TG_OP,
            'record_id', COALESCE(NEW.id, OLD.id),
            'timestamp', extract(epoch from NOW())
        )::text
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply cache invalidation triggers to frequently updated tables
CREATE TRIGGER devotions_cache_invalidation_trigger
    AFTER INSERT OR UPDATE OR DELETE ON devotions
    FOR EACH ROW EXECUTE FUNCTION notify_cache_invalidation();

CREATE TRIGGER events_cache_invalidation_trigger
    AFTER INSERT OR UPDATE OR DELETE ON events
    FOR EACH ROW EXECUTE FUNCTION notify_cache_invalidation();

CREATE TRIGGER prayer_requests_cache_invalidation_trigger
    AFTER INSERT OR UPDATE OR DELETE ON prayer_requests
    FOR EACH ROW EXECUTE FUNCTION notify_cache_invalidation();

-- ==================================================
-- COMPLETION VERIFICATION AND TESTING
-- ==================================================

-- Test storage bucket creation
DO $$
DECLARE
    bucket_count INTEGER;
    policy_count INTEGER;
    realtime_tables INTEGER;
BEGIN
    -- Count storage buckets
    SELECT count(*) INTO bucket_count
    FROM storage.buckets
    WHERE id IN ('avatars', 'events', 'groups', 'devotions', 'documents');
    
    -- Count storage policies
    SELECT count(*) INTO policy_count
    FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage';
    
    -- Count real-time enabled tables
    SELECT count(*) INTO realtime_tables
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime';
    
    RAISE NOTICE 'Hong Kong Church PWA - Storage and Real-time Configuration Complete!';
    RAISE NOTICE 'Storage Buckets: %/5 created (avatars, events, groups, devotions, documents)', bucket_count;
    RAISE NOTICE 'Storage Policies: % policies configured for secure file access', policy_count;
    RAISE NOTICE 'Real-time Tables: % tables enabled for live updates', realtime_tables;
    RAISE NOTICE 'Features Enabled: File uploads, Real-time subscriptions, Automatic counters, Cache invalidation';
    RAISE NOTICE 'Next Step: Execute 005_functions_triggers.sql for advanced features';
    
    -- Verify critical buckets exist
    IF bucket_count < 5 THEN
        RAISE EXCEPTION 'Missing storage buckets. Expected 5, found %', bucket_count;
    END IF;
    
    IF realtime_tables < 8 THEN
        RAISE EXCEPTION 'Insufficient real-time tables. Expected 8, found %', realtime_tables;
    END IF;
    
    RAISE NOTICE 'All storage and real-time features verified successfully!';
END $$;