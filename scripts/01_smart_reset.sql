-- SMART DATABASE RESET
-- This automatically detects which tables exist before trying to delete
-- No manual editing needed!

DO $$ 
DECLARE
    table_record RECORD;
    delete_query TEXT;
BEGIN
    -- List of all possible tables in order (child tables first due to foreign keys)
    FOR table_record IN 
        SELECT unnest(ARRAY[
            'messages',
            'conversations', 
            'applications',
            'job_applications',
            'referrals',
            'notification_preferences',
            'availability_slots',
            'cover_requests',
            'casual_postings',
            'jobs',
            'instructor_profiles',
            'studio_profiles',
            'profiles'
        ]) AS table_name
    LOOP
        -- Check if table exists
        IF EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = table_record.table_name
        ) THEN
            -- Disable RLS
            EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', table_record.table_name);
            
            -- Delete all data
            EXECUTE format('DELETE FROM %I', table_record.table_name);
            
            -- Re-enable RLS
            EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_record.table_name);
            
            RAISE NOTICE 'Cleared table: %', table_record.table_name;
        ELSE
            RAISE NOTICE 'Skipped (does not exist): %', table_record.table_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Reset complete!';
END $$;

-- Show what tables actually exist and their record counts
SELECT 
    table_name,
    (xpath('/row/count/text()', 
        query_to_xml(format('SELECT COUNT(*) as count FROM %I', table_name), false, true, ''))
    )[1]::text::int AS record_count
FROM information_schema.tables
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    AND table_name NOT LIKE 'pg_%'
    AND table_name NOT LIKE 'sql_%'
ORDER BY table_name;
